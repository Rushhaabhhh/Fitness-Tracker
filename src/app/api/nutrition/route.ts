import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongoose";
import { MealEntry } from "@/lib/models";
import { MealSchema } from "@/lib/validations";
import { getTodayUTC } from "@/lib/utils";
import { XP_REWARDS } from "@/lib/gamification";
import { addXpToUser } from "@/lib/gamification-server";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || getTodayUTC();

    await connectDB();
    const entry = await MealEntry.findOne({ userId: session.user.id, date });
    return NextResponse.json({ success: true, data: entry?.meals || [] });
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
    const parsed = MealSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    const date = body.date || getTodayUTC();
    await connectDB();

    const entry = await MealEntry.findOneAndUpdate(
      { userId: session.user.id, date },
      { $push: { meals: { ...parsed.data, loggedAt: new Date() } } },
      { upsert: true, new: true }
    );

    const xpResult = await addXpToUser(session.user.id, XP_REWARDS.MEAL_LOGGED);

    return NextResponse.json({ success: true, data: entry.meals, gamification: xpResult });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
