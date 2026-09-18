import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models";
import { getUserFromRequest } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminUser = getUserFromRequest(req);
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();
    const { id } = params;
    const body = await req.json();

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Do not allow suspending the primary admin
    if (targetUser.email === "admin@eventhub.com" && body.status === "suspended") {
      return NextResponse.json({ error: "Cannot suspend primary admin account" }, { status: 400 });
    }

    if (body.status) targetUser.status = body.status;
    if (body.isVerified !== undefined) targetUser.isVerified = Boolean(body.isVerified);
    if (body.role) targetUser.role = body.role;

    await targetUser.save();

    return NextResponse.json({
      success: true,
      message: `User ${targetUser.name} updated`,
      user: {
        id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        status: targetUser.status,
        isVerified: targetUser.isVerified,
        role: targetUser.role,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
