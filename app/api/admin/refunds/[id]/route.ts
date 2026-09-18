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
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
    }

    await connectToDatabase();
    const { id } = params;
    const body = await req.json();
    const { action, adminNote } = body; // action: 'approved' | 'rejected'

    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (!["approved", "rejected"].includes(action)) {
      return NextResponse.json({ error: "Invalid action. Must be 'approved' or 'rejected'" }, { status: 400 });
    }

    booking.refundDetails.status = action;
    booking.refundDetails.processedAt = new Date();
    if (adminNote) {
      booking.refundDetails.adminNote = adminNote;
    }

    await booking.save();

    return NextResponse.json({
      success: true,
      message: `Refund request ${action === "approved" ? "approved and processed" : "declined"}.`,
      booking,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
