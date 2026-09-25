import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models";
import { setSessionCookie, hashPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json().catch(() => ({}));
    const requestedRole = (body.role || "customer").toLowerCase().trim();

    let targetEmail = "";
    if (requestedRole === "admin") {
      targetEmail = "admin@eventhub.com";
    } else if (requestedRole === "organiser") {
      targetEmail = "organiser@eventhub.com";
    } else {
      targetEmail = "customer@eventhub.com";
    }

    // Try finding by explicit demo email first
    let user = await User.findOne({ email: targetEmail });

    // If not found, try finding any active user with that role
    if (!user) {
      user = await User.findOne({ role: requestedRole, status: "active" });
    }

    // If still not found, create the demo account dynamically
    if (!user) {
      const defaultPassword = await hashPassword("password123");
      const names: Record<string, string> = {
        admin: "Platform Director",
        organiser: "Grand Estate Hospitality",
        customer: "Celebration Guest",
      };

      user = await User.create({
        name: names[requestedRole] || "Demo User",
        email: targetEmail,
        password: defaultPassword,
        role: requestedRole,
        isVerified: true,
        status: "active",
        companyName: requestedRole === "organiser" ? "Grand Estate Hospitality" : "",
        phone: "+91 98765 43210",
      });
    }

    const sessionPayload = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      companyName: user.companyName,
      isVerified: user.isVerified ?? true,
    };

    const response = NextResponse.json({
      success: true,
      user: sessionPayload,
      message: `Signed in as demo ${user.role}`,
    });

    return setSessionCookie(response, sessionPayload);
  } catch (error: any) {
    console.error("Demo login error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to complete demo login" },
      { status: 500 }
    );
  }
}

