import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models";
import { setSessionCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { email, code, token } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
      "+verificationCode +verificationToken +verificationExpires"
    );

    if (!user) {
      return NextResponse.json({ error: "No account found with this email" }, { status: 404 });
    }

    if (user.isVerified) {
      // Already verified, generate session and return
      const sessionPayload = {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        companyName: user.companyName,
        isVerified: true,
      };

      const response = NextResponse.json({
        success: true,
        message: "Email is already verified.",
        user: sessionPayload,
      });

      return setSessionCookie(response, sessionPayload);
    }

    let isValid = false;

    // Check code if provided
    if (code && user.verificationCode) {
      if (
        user.verificationCode === code.toString().trim() &&
        user.verificationExpires &&
        new Date() < new Date(user.verificationExpires)
      ) {
        isValid = true;
      }
    }

    // Check token if provided
    if (!isValid && token && user.verificationToken) {
      const hashedToken = crypto.createHash("sha256").update(token.trim()).digest("hex");
      if (
        (user.verificationToken === token || user.verificationToken === hashedToken) &&
        user.verificationExpires &&
        new Date() < new Date(user.verificationExpires)
      ) {
        isValid = true;
      }
    }

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid or expired verification code. Please request a new one." },
        { status: 400 }
      );
    }

    // Mark as verified
    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();

    const sessionPayload = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      companyName: user.companyName,
      isVerified: true,
    };

    const response = NextResponse.json({
      success: true,
      message: "Email verified successfully! Welcome to CelebrateHub.",
      user: sessionPayload,
    });

    return setSessionCookie(response, sessionPayload);
  } catch (error: any) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify email" },
      { status: 500 }
    );
  }
}
