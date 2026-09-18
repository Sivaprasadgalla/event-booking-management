import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Booking } from "@/models";
import { getUserFromRequest } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(req);
    if (!user || (user.role !== "organiser" && user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();
    const { id } = params;

    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Verify ownership
    if (user.role !== "admin" && booking.organiser.toString() !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (booking.status === "cancelled") {
      return NextResponse.json(
        { error: "Cannot check in: This booking is cancelled" },
        { status: 400 }
      );
    }

    // Toggle check in status
    const isNowCheckedIn = booking.checkInStatus !== "checked_in";
    booking.checkInStatus = isNowCheckedIn ? "checked_in" : "pending";
    booking.checkedInAt = isNowCheckedIn ? new Date() : undefined;
    if (isNowCheckedIn) {
      booking.status = "attended";
    }

    await booking.save();

    return NextResponse.json({
      success: true,
      message: isNowCheckedIn
        ? `Attendee checked in successfully! (Ref: ${booking.bookingReference})`
        : `Check-in reverted to pending for ${booking.bookingReference}`,
      booking,
    });
  } catch (error: any) {
    console.error("Check-in error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
