import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Booking, Event } from "@/models";
import { getUserFromRequest } from "@/lib/auth";
import { calculateRefund } from "@/lib/utils";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = params;
    const body = await req.json().catch(() => ({}));
    const reason = body.reason || "Customer requested cancellation";

    const booking = await Booking.findById(id).populate("event");
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Verify ownership
    if (booking.customer.toString() !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (booking.status === "cancelled") {
      return NextResponse.json({ error: "This booking is already cancelled" }, { status: 400 });
    }

    const event = booking.event as any;
    const refundCalculation = calculateRefund({
      totalAmount: booking.totalAmount,
      eventDate: booking.selectedSlot.date,
      cancellationPolicy: event?.cancellationPolicy,
    });

    // Update booking status
    booking.status = "cancelled";
    booking.refundDetails = {
      status: refundCalculation.refundAmount > 0 ? "requested" : "none",
      amount: refundCalculation.refundAmount,
      reason,
      requestedAt: new Date(),
    };

    await booking.save();

    // Release slot capacity back to the event
    if (booking.selectedSlot?.slotId) {
      await Event.updateOne(
        { _id: event._id, "scheduleSlots.id": booking.selectedSlot.slotId },
        { $inc: { "scheduleSlots.$.bookedCount": -booking.guestsCount } }
      );
    }

    return NextResponse.json({
      success: true,
      message: refundCalculation.refundAmount > 0
        ? `Booking cancelled. A refund request of ₹${refundCalculation.refundAmount} (${refundCalculation.refundPercentage}%) has been initiated.`
        : "Booking cancelled. As per event policy, no refund is applicable.",
      refundCalculation,
      booking,
    });
  } catch (error: any) {
    console.error("Cancel booking error:", error);
    return NextResponse.json({ error: error.message || "Failed to cancel booking" }, { status: 500 });
  }
}
