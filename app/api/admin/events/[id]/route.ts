import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Event, Booking } from "@/models";
import { getUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
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

    const event = await Event.findById(id)
      .populate("organiser", "name companyName email phone")
      .populate("category", "name slug")
      .lean();

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ event });
  } catch (error: any) {
    console.error("Admin get event error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

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

    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Reassign host organiser if provided
    if (body.organiserId) {
      event.organiser = body.organiserId;
    } else if (body.organiser) {
      event.organiser = body.organiser;
    }

    // Basic Info
    if (body.title) event.title = body.title;
    if (body.slug) event.slug = body.slug;
    if (body.category) event.category = body.category;
    if (body.shortDescription !== undefined) event.shortDescription = body.shortDescription;
    if (body.fullDescription !== undefined) event.fullDescription = body.fullDescription;
    if (body.eventType) event.eventType = body.eventType;
    if (body.venueType) event.venueType = body.venueType;
    if (Array.isArray(body.celebrationTypes)) event.celebrationTypes = body.celebrationTypes;

    // Venue & Contact
    if (body.venue) event.venue = { ...event.venue, ...body.venue };
    if (body.contactInfo) event.contactInfo = { ...event.contactInfo, ...body.contactInfo };

    // Media
    if (body.coverImage) event.coverImage = body.coverImage;
    if (Array.isArray(body.gallery)) event.gallery = body.gallery;

    // Packages & AddOns
    if (Array.isArray(body.packages)) event.packages = body.packages;
    if (Array.isArray(body.addOns)) event.addOns = body.addOns;

    // Schedules & Shifts
    if (body.operatingDays) event.operatingDays = body.operatingDays;
    if (Array.isArray(body.customOperatingDays)) event.customOperatingDays = body.customOperatingDays;
    if (Array.isArray(body.dailyTimeSlots)) event.dailyTimeSlots = body.dailyTimeSlots;
    if (Array.isArray(body.scheduleSlots)) event.scheduleSlots = body.scheduleSlots;

    // Policies
    if (Array.isArray(body.termsAndConditions)) event.termsAndConditions = body.termsAndConditions;
    if (body.cancellationPolicy) event.cancellationPolicy = { ...event.cancellationPolicy, ...body.cancellationPolicy };
    if (body.policyText !== undefined) event.policyText = body.policyText;

    // Governance
    if (body.status) event.status = body.status;
    if (body.adminFeedback !== undefined) event.adminFeedback = body.adminFeedback;
    if (body.isFeatured !== undefined) event.isFeatured = Boolean(body.isFeatured);

    await event.save();

    const updatedEvent = await Event.findById(id)
      .populate("organiser", "name companyName email phone")
      .populate("category", "name slug")
      .lean();

    return NextResponse.json({
      success: true,
      message: "Venue listing updated successfully",
      event: updatedEvent,
    });
  } catch (error: any) {
    console.error("Admin update event error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
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

    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Cancel pending bookings associated with this event
    await Booking.updateMany(
      { event: id, status: { $in: ["pending", "confirmed"] } },
      { $set: { status: "cancelled", cancellationReason: "Venue removed by platform administration" } }
    );

    // Delete the event
    await Event.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Venue listing and associated reservations purged successfully",
    });
  } catch (error: any) {
    console.error("Admin delete event error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

