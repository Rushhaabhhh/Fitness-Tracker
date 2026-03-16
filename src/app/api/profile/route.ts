import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongoose";
import { User } from "@/lib/models";
import { ProfileSchema } from "@/lib/validations";
import { updateProfileBMI } from "@/lib/utils";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const user = await User.findById(session.user.id).select("-password");
    if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = ProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { name, email: _email, age, sex, height, weight, goalWeight, bodyFat, activityLevel } = parsed.data;

    const profile = updateProfileBMI({
      age: age ? Number(age) : undefined,
      sex: sex || undefined,
      height: height ? Number(height) : undefined,
      weight: weight ? Number(weight) : undefined,
      goalWeight: goalWeight ? Number(goalWeight) : undefined,
      bodyFat: bodyFat ? Number(bodyFat) : undefined,
      activityLevel: activityLevel || undefined,
    });

    await connectDB();
    const user = await User.findByIdAndUpdate(
      session.user.id,
      { $set: { name, profile } },
      { new: true }
    ).select("-password");

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
