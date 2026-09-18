import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User, Event, Booking } from "@/models";
import { getUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

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
    if (
      (targetUser.email === "admin@eventhub.com" || targetUser.email === "admin@celebratehub.com") &&
      body.status === "suspended"
    ) {
      return NextResponse.json({ error: "Cannot suspend primary admin account" }, { status: 400 });
    }

    let cascadeMessage = "";

    // Cascading event suspension / reactivation
    if (body.status && body.status !== targetUser.status) {
      targetUser.status = body.status;

      if (body.status === "suspended") {
        const res = await Event.updateMany(
          { organiser: targetUser._id, status: "published" },
          { status: "unpublished" }
        );
        cascadeMessage = ` (${res.modifiedCount} active event(s) unpublished)`;
      } else if (body.status === "active") {
        const res = await Event.updateMany(
          { organiser: targetUser._id, status: "unpublished" },
          { status: "published" }
        );
        cascadeMessage = ` (${res.modifiedCount} event(s) restored to published)`;
      }
    }

    if (body.isVerified !== undefined) targetUser.isVerified = Boolean(body.isVerified);
    if (body.role) targetUser.role = body.role;

    await targetUser.save();

    return NextResponse.json({
      success: true,
      message: `User ${targetUser.name} updated${cascadeMessage}`,
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

export async function DELETE(
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
    const force = req.nextUrl.searchParams.get("force") === "true";

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (
      targetUser.email === "admin@eventhub.com" ||
      targetUser.email === "admin@celebratehub.com"
    ) {
      return NextResponse.json({ error: "Cannot delete primary administrator" }, { status: 400 });
    }

    // Check for active upcoming bookings
    const activeBookingsCount = await Booking.countDocuments({
      organiser: targetUser._id,
      status: "confirmed",
    });

    if (activeBookingsCount > 0 && !force) {
      return NextResponse.json(
        {
          error: `This organizer has ${activeBookingsCount} active confirmed booking(s). Deleting will affect confirmed guest celebrations. Use force deletion to override.`,
          hasActiveBookings: true,
          activeBookingsCount,
        },
        { status: 409 }
      );
    }

    // Cascade delete all events belonging to this organizer
    const deletedEvents = await Event.deleteMany({ organiser: targetUser._id });

    // Delete user account
    await User.findByIdAndDelete(targetUser._id);

    return NextResponse.json({
      success: true,
      message: `User ${targetUser.name} and ${deletedEvents.deletedCount} associated event(s) were successfully deleted.`,
    });
  } catch (error: any) {
    console.error("Delete user error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete user" }, { status: 500 });
  }
}
