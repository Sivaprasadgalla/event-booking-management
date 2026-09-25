import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models";
import { comparePassword, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (user.status === "suspended") {
      return NextResponse.json(
        { error: "Your account has been suspended by the platform administrator" },
        { status: 403 }
      );
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (!user.isVerified) {
      return NextResponse.json(
        {
          error: "Your email address has not been verified yet. Please enter the verification code sent to your inbox.",
          unverified: true,
          email: user.email,
        },
        { status: 403 }
      );
    }

    const sessionPayload = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      companyName: user.companyName,
      isVerified: user.isVerified ?? false,
    };

    const response = NextResponse.json({
      success: true,
      user: sessionPayload,
      message: "Logged in successfully",
    });

    return setSessionCookie(response, sessionPayload);
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to log in" },
      { status: 500 }
    );
  }
}
