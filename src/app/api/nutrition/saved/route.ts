import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongoose";
import { SavedMeal } from "@/lib/models";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const meals = await SavedMeal.find({ userId: session.user.id }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: meals });
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
    if (!body.name) return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });

    await connectDB();
    const newMeal = await SavedMeal.create({
      userId: session.user.id,
      name: body.name,
      calories: Number(body.calories) || 0,
      protein: Number(body.protein) || 0,
      carbs: Number(body.carbs) || 0,
      fats: Number(body.fats) || 0,
      fiber: Number(body.fiber) || 0,
      sodium: Number(body.sodium) || 0,
      sugar: Number(body.sugar) || 0,
    });

    return NextResponse.json({ success: true, data: newMeal });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
