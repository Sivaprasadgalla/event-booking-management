import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Event, Booking } from "@/models";
import { getUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(req);
    if (!user || (user.role !== "organiser" && user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized: Organiser access required" }, { status: 403 });
    }

    await connectToDatabase();
    const { id } = params;

    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json({ error: "Venue listing not found" }, { status: 404 });
    }

    // Verify ownership if not admin
    if (user.role !== "admin" && event.organiser.toString() !== user.id) {
      return NextResponse.json({ error: "You can only delete your own venue listings" }, { status: 403 });
    }

    // Check for active bookings
    const activeBookingsCount = await Booking.countDocuments({
      event: id,
      status: { $in: ["pending", "confirmed"] },
    });

    const { searchParams } = new URL(req.url);
    const force = searchParams.get("force") === "true";

    if (activeBookingsCount > 0 && !force) {
      return NextResponse.json(
        {
          error: `This venue currently has ${activeBookingsCount} active reservation(s). You must cancel or fulfill active guest bookings before deleting.`,
          hasActiveBookings: true,
          activeBookingsCount,
        },
        { status: 409 }
      );
    }

    // If forced or no active bookings, delete
    if (activeBookingsCount > 0 && force) {
      await Booking.updateMany(
        { event: id, status: { $in: ["pending", "confirmed"] } },
        { $set: { status: "cancelled", cancellationReason: "Venue removed by host partner" } }
      );
    }

    await Event.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: `Venue "${event.title}" has been permanently removed from CelebrateHub.`,
    });
  } catch (error: any) {
    console.error("Organiser delete event error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
