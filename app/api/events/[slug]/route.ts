import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Event, Review, Category, User, SlotHold } from "@/models";
import { getUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectToDatabase();
    const { slug } = params;

    // Search by slug or by ID
    const query = slug.match(/^[0-9a-fA-F]{24}$/)
      ? { $or: [{ slug }, { _id: slug }] }
      : { slug };

    const event = await Event.findOne(query)
      .populate("category", "name slug icon")
      .populate("organiser", "name companyName avatar bio phone isVerified")
      .lean();

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Fetch approved customer reviews
    const reviews = await Review.find({ event: event._id, isApproved: true })
      .populate("customer", "name avatar")
      .sort({ createdAt: -1 })
      .lean();

    // Fetch active slot holds (currently in other customers' carts)
    const now = new Date();
    const activeHolds = await SlotHold.find({
      eventId: event._id,
      expiresAt: { $gt: now },
    })
      .select("slotId date sessionId guestsCount expiresAt")
      .lean();

    return NextResponse.json({ event, reviews, activeHolds });
  } catch (error: any) {
    console.error("Get event error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch event" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const user = getUserFromRequest(req);
    if (!user || (user.role !== "organiser" && user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();
    const { slug } = params;
    const body = await req.json();

    const query = slug.match(/^[0-9a-fA-F]{24}$/)
      ? { $or: [{ slug }, { _id: slug }] }
      : { slug };

    const existing = await Event.findOne(query);
    if (!existing) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Only the event's organiser or admin can edit
    if (user.role !== "admin" && existing.organiser.toString() !== user.id) {
      return NextResponse.json({ error: "You cannot edit another organiser's event" }, { status: 403 });
    }

    // If an approved event was edited by organiser, return to pending_approval or keep draft
    if (user.role !== "admin" && body.submitForApproval) {
      body.status = "pending_approval";
    }

    const updated = await Event.findByIdAndUpdate(existing._id, { $set: body }, { new: true });

    return NextResponse.json({
      success: true,
      event: updated,
      message: "Event updated successfully",
    });
  } catch (error: any) {
    console.error("Update event error:", error);
    return NextResponse.json({ error: error.message || "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const user = getUserFromRequest(req);
    if (!user || (user.role !== "organiser" && user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();
    const { slug } = params;

    const query = slug.match(/^[0-9a-fA-F]{24}$/)
      ? { $or: [{ slug }, { _id: slug }] }
      : { slug };

    const existing = await Event.findOne(query);
    if (!existing) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (user.role !== "admin" && existing.organiser.toString() !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await Event.findByIdAndDelete(existing._id);

    return NextResponse.json({ success: true, message: "Event removed" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
