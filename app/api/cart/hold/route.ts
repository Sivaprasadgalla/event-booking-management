import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { SlotHold, Booking, Event } from "@/models";
import { getUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

// 10 minutes in milliseconds
const HOLD_DURATION_MS = 10 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { eventId, slotId, date, sessionId, guestsCount = 1 } = body;

    if (!eventId || !slotId || !date || !sessionId) {
      return NextResponse.json(
        { error: "Missing required parameters (eventId, slotId, date, sessionId)" },
        { status: 400 }
      );
    }

    const now = new Date();

    // 1. Purge any expired holds across the system
    await SlotHold.deleteMany({ expiresAt: { $lte: now } });

    // 2. Check if another customer currently holds this exact slot
    const existingHold = await SlotHold.findOne({
      eventId,
      slotId,
      date,
      expiresAt: { $gt: now },
    });

    if (existingHold && existingHold.sessionId !== sessionId) {
      const remainingSeconds = Math.max(
        0,
        Math.ceil((existingHold.expiresAt.getTime() - now.getTime()) / 1000)
      );
      return NextResponse.json(
        {
          error: "This celebration time slot is currently reserved in another customer's cart. Please choose another shift or try again shortly.",
          isHeldByOther: true,
          remainingSeconds,
        },
        { status: 409 }
      );
    }

    // 3. Check if slot is already fully booked in confirmed bookings
    const event = await Event.findById(eventId).lean();
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check specific schedule slot capacity if present
    const scheduleSlot = (event.scheduleSlots || []).find(
      (s: any) => s.id === slotId && s.date === date
    );

    if (scheduleSlot) {
      const bookedCount = scheduleSlot.bookedCount || 0;
      if (bookedCount + guestsCount > scheduleSlot.capacity) {
        return NextResponse.json(
          { error: "This celebration slot is fully booked for this date.", isBooked: true },
          { status: 409 }
        );
      }
    }

    // 4. Create or extend the hold for 10 minutes
    const user = getUserFromRequest(req);
    const expiresAt = new Date(now.getTime() + HOLD_DURATION_MS);

    const hold = await SlotHold.findOneAndUpdate(
      { eventId, slotId, date, sessionId },
      {
        eventId,
        slotId,
        date,
        sessionId,
        userId: user ? user.id : undefined,
        guestsCount,
        expiresAt,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({
      success: true,
      holdId: hold._id,
      expiresAt: expiresAt.toISOString(),
      expiresAtTimestamp: expiresAt.getTime(),
      durationSeconds: 600,
    });
  } catch (error: any) {
    console.error("Error creating slot hold:", error);
    return NextResponse.json({ error: error.message || "Failed to hold slot" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");
    const eventId = searchParams.get("eventId");
    const slotId = searchParams.get("slotId");
    const date = searchParams.get("date");

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    const filter: Record<string, any> = { sessionId };
    if (eventId) filter.eventId = eventId;
    if (slotId) filter.slotId = slotId;
    if (date) filter.date = date;

    await SlotHold.deleteMany(filter);

    return NextResponse.json({ success: true, message: "Slot hold released" });
  } catch (error: any) {
    console.error("Error releasing slot hold:", error);
    return NextResponse.json({ error: error.message || "Failed to release hold" }, { status: 500 });
  }
}
