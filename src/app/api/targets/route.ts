import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongoose";
import { NutritionTarget } from "@/lib/models";
import { NutritionTargetSchema } from "@/lib/validations";
import { getTodayUTC } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || getTodayUTC();

    await connectDB();
    
    // Get the most recent target on or before this date
    const target = await NutritionTarget.findOne({
      userId: session.user.id,
      date: { $lte: date },
    }).sort({ date: -1 });

    return NextResponse.json({ success: true, data: target });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = NutritionTargetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    const date = body.date || getTodayUTC();
    await connectDB();

    const target = await NutritionTarget.findOneAndUpdate(
      { userId: session.user.id, date },
      { $set: { ...parsed.data, userId: session.user.id, date } },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, data: target });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
