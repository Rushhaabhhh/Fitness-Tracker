import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongoose";
import { WorkoutEntry, GymEntry } from "@/lib/models";
import { getTodayUTC } from "@/lib/utils";
import { XP_REWARDS } from "@/lib/gamification";
import { addXpToUser } from "@/lib/gamification-server";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const date = searchParams.get("date");

    await connectDB();
    
    // If a specific date is requested, get only workouts for that date
    const query: Record<string, unknown> = { userId: session.user.id };
    if (date) {
      query.date = date;
    }

    const workouts = await WorkoutEntry.find(query).sort({ createdAt: -1 }).limit(limit);
    return NextResponse.json({ success: true, data: workouts });
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
    const { name, duration, exercises, date } = body;
    const workoutDate = date || getTodayUTC();

    await connectDB();
    
    const workout = await WorkoutEntry.create({
      userId: session.user.id,
      date: workoutDate,
      name,
      duration,
      exercises,
    });

    // Automatically mark the Gym Entry as done for the day
    await GymEntry.findOneAndUpdate(
      { userId: session.user.id, date: workoutDate },
      { $set: { done: true, userId: session.user.id, date: workoutDate } },
      { upsert: true }
    );

    // Reward XP for logging a workout!
    const xpResult = await addXpToUser(session.user.id, XP_REWARDS.WORKOUT_LOGGED);

    return NextResponse.json({ success: true, data: workout, gamification: xpResult });
  } catch (error) {
    console.error("Workout POST error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
