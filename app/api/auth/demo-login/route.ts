import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models";
import { setSessionCookie } from "@/lib/auth";
import { seedDatabase } from "@/lib/seedData";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const role = body.role || "customer";

    const emailMap: Record<string, string> = {
      customer: "customer@eventhub.com",
      organiser: "organiser@eventhub.com",
      admin: "admin@eventhub.com",
    };

    const targetEmail = emailMap[role] || "customer@eventhub.com";
    let user = await User.findOne({ email: targetEmail });

    if (!user) {
      // Auto seed if empty
      await seedDatabase();
      user = await User.findOne({ email: targetEmail });
    }

    if (!user) {
      return NextResponse.json({ error: "Demo user not found" }, { status: 404 });
    }

    const sessionPayload = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      companyName: user.companyName,
    };

    const response = NextResponse.json({
      success: true,
      user: sessionPayload,
      message: `Switched to demo ${role} successfully!`,
    });

    return setSessionCookie(response, sessionPayload);
  } catch (error: any) {
    console.error("Demo login error:", error);
    return NextResponse.json({ error: error.message || "Failed demo login" }, { status: 500 });
  }
}
