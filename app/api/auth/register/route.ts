import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models";
import { hashPassword } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { name, email, password, role = "customer", companyName, phone } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email address already exists" },
        { status: 409 }
      );
    }

    const validRole = ["customer", "organiser"].includes(role) ? role : "customer";
    const hashedPassword = await hashPassword(password);

    // Generate 6-digit verification code & crypto token
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const newUser = await User.create({
      name,
      email: cleanEmail,
      password: hashedPassword,
      role: validRole,
      companyName: companyName || "",
      phone: phone || "",
      isVerified: false,
      verificationCode,
      verificationToken: hashedToken,
      verificationExpires,
      status: "active",
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin || "http://localhost:3000";
    const verifyUrl = `${baseUrl}/verify-email?token=${rawToken}&email=${encodeURIComponent(cleanEmail)}`;

    // Dispatch verification email
    await sendVerificationEmail({
      toEmail: cleanEmail,
      name,
      code: verificationCode,
      verifyUrl,
    });

    return NextResponse.json({
      success: true,
      requiresVerification: true,
      email: cleanEmail,
      message: `Account created! We've sent a 6-digit verification code to ${cleanEmail}. Please verify your email to activate your account.`,
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to register" },
      { status: 500 }
    );
  }
}
