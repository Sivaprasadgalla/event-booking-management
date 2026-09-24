import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models";
import { sendVerificationEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return NextResponse.json({ error: "No account found with this email" }, { status: 404 });
    }

    if (user.isVerified) {
      return NextResponse.json({
        success: true,
        message: "This account is already verified. You can sign in directly.",
        alreadyVerified: true,
      });
    }

    // Generate new 6-digit code & token
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.verificationCode = code;
    user.verificationToken = hashedToken;
    user.verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await user.save();

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin || "http://localhost:3000";
    const verifyUrl = `${baseUrl}/verify-email?token=${rawToken}&email=${encodeURIComponent(user.email)}`;

    await sendVerificationEmail({
      toEmail: user.email,
      name: user.name,
      code,
      verifyUrl,
    });

    return NextResponse.json({
      success: true,
      message: `Verification code sent to ${user.email}`,
      demoCode: process.env.NODE_ENV !== "production" ? code : undefined,
    });
  } catch (error: any) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to resend verification code" },
      { status: 500 }
    );
  }
}
