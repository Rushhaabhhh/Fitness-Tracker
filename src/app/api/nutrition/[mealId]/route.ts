import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongoose";
import { MealEntry } from "@/lib/models";
import { getTodayUTC } from "@/lib/utils";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ mealId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { mealId } = await params;
    const today = getTodayUTC();

    await connectDB();
    const entry = await MealEntry.findOneAndUpdate(
      { userId: session.user.id, date: today },
      { $pull: { meals: { _id: mealId } } },
      { new: true }
    );

    return NextResponse.json({ success: true, data: entry?.meals || [] });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
