import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongoose";
import { GymEntry } from "@/lib/models";
import { getTodayUTC } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || getTodayUTC();

    await connectDB();
    const entry = await GymEntry.findOne({ userId: session.user.id, date });
    return NextResponse.json({ success: true, data: entry });
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
    const { done, notes } = body;
    const today = getTodayUTC();

    await connectDB();
    const entry = await GymEntry.findOneAndUpdate(
      { userId: session.user.id, date: today },
      { $set: { done: Boolean(done), notes, userId: session.user.id, date: today } },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, data: entry });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
