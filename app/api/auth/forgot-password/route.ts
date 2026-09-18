import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.trim()) {
      return NextResponse.json({ error: "Email address is required." }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      // Return 404 or friendly message
      return NextResponse.json(
        { error: "No account found associated with this email address." },
        { status: 404 }
      );
    }

    if (user.status === "suspended") {
      return NextResponse.json(
        { error: "This account is suspended. Please contact support." },
        { status: 403 }
      );
    }

    // Generate random 64-char hex token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token with sha256 to store in database securely
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Set expiration to 1 hour
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      req.nextUrl.origin ||
      "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(
      user.email
    )}`;

    console.log(`[PASSWORD RESET] Generated reset link for ${user.email}: ${resetUrl}`);

    return NextResponse.json({
      success: true,
      message: "Password reset link generated successfully.",
      resetUrl,
      expiresInMinutes: 60,
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process forgot password request." },
      { status: 500 }
    );
  }
}
