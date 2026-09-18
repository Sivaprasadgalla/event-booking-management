import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Booking, Event } from "@/models";
import { getUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || (user.role !== "organiser" && user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");
    const checkInStatus = searchParams.get("checkInStatus");

    // Events owned by this organiser
    const eventFilter = user.role === "admin" ? {} : { organiser: user.id };
    const myEvents = await Event.find(eventFilter).select(
      "_id title packages dailyTimeSlots scheduleSlots venue addOns"
    ).lean();
    const myEventIds = myEvents.map((e) => e._id);

    const filter: Record<string, any> = {
      event: eventId ? eventId : { $in: myEventIds },
    };

    if (checkInStatus && checkInStatus !== "all") {
      filter.checkInStatus = checkInStatus;
    }

    const bookings = await Booking.find(filter)
      .populate("event", "title slug coverImage venue")
      .populate("customer", "name email phone")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ bookings, events: myEvents });
  } catch (error: any) {
    console.error("Fetch organiser bookings error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
