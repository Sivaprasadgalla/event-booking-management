import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Review, Event, Booking } from "@/models";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Please log in to submit a review" }, { status: 401 });
    }

    await connectToDatabase();
    const body = await req.json();
    const { eventId, bookingId, rating, comment } = body;

    if (!eventId || !rating || !comment) {
      return NextResponse.json({ error: "Event, rating, and comment are required" }, { status: 400 });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check if user already reviewed this event with this booking
    const existing = await Review.findOne({ event: eventId, customer: user.id });
    if (existing) {
      existing.rating = Number(rating);
      existing.comment = comment;
      await existing.save();
    } else {
      await Review.create({
        event: eventId,
        customer: user.id,
        booking: bookingId || undefined,
        rating: Number(rating),
        comment,
        isApproved: true,
      });
    }

    // Recalculate average rating for event
    const allReviews = await Review.find({ event: eventId, isApproved: true });
    const totalScore = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avg = allReviews.length > 0 ? Number((totalScore / allReviews.length).toFixed(1)) : 0;

    event.averageRating = avg;
    event.reviewCount = allReviews.length;
    await event.save();

    return NextResponse.json({
      success: true,
      message: "Review submitted successfully! Thank you for your feedback.",
      averageRating: avg,
      reviewCount: allReviews.length,
    });
  } catch (error: any) {
    console.error("Submit review error:", error);
    return NextResponse.json({ error: error.message || "Failed to submit review" }, { status: 500 });
  }
}
