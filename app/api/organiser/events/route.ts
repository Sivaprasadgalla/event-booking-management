import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Event, Booking, Category } from "@/models";
import { getUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || (user.role !== "organiser" && user.role !== "admin")) {
      return NextResponse.json(
        { error: "Unauthorized: Organiser access required" },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim();
    const status = searchParams.get("status");
    const category = searchParams.get("category");

    // Filter by organiser (or all if admin)
    const filter: Record<string, any> = {};
    if (user.role !== "admin") {
      filter.organiser = user.id;
    }

    if (status && status !== "all") {
      filter.status = status;
    }

    if (category && category !== "all") {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { shortDescription: { $regex: search, $options: "i" } },
        { "venue.name": { $regex: search, $options: "i" } },
        { "venue.city": { $regex: search, $options: "i" } },
        { venueType: { $regex: search, $options: "i" } },
      ];
    }

    const events = await Event.find(filter)
      .populate("category", "name slug icon")
      .populate("organiser", "name companyName email phone avatar isVerified")
      .sort({ createdAt: -1 })
      .lean();

    const eventIds = events.map((e) => e._id);

    // Fetch booking aggregate data for these events
    const bookings = await Booking.find({
      event: { $in: eventIds },
      status: { $in: ["confirmed", "attended"] },
    })
      .select("event totalAmount guestsCount checkInStatus")
      .lean();

    // Map bookings and metrics per event
    const bookingStatsMap = new Map<
      string,
      { count: number; revenue: number; guests: number; checkedIn: number }
    >();

    for (const b of bookings) {
      const eid = b.event.toString();
      const prev = bookingStatsMap.get(eid) || { count: 0, revenue: 0, guests: 0, checkedIn: 0 };
      prev.count += 1;
      prev.revenue += b.totalAmount || 0;
      prev.guests += b.guestsCount || 1;
      if (b.checkInStatus === "checked_in") {
        prev.checkedIn += 1;
      }
      bookingStatsMap.set(eid, prev);
    }

    // Enhance events with computed statistics
    const enhancedEvents = events.map((evt) => {
      const stats = bookingStatsMap.get(evt._id.toString()) || {
        count: 0,
        revenue: 0,
        guests: 0,
        checkedIn: 0,
      };

      const prices = (evt.packages || []).map((p: any) => p.price);
      const startingPrice = prices.length ? Math.min(...prices) : 0;

      return {
        ...evt,
        totalBookings: stats.count,
        totalRevenue: stats.revenue,
        totalGuests: stats.guests,
        checkedInGuests: stats.checkedIn,
        packagesCount: (evt.packages || []).length,
        shiftsCount: (evt.dailyTimeSlots || []).length,
        startingPrice,
      };
    });

    // Summary calculations across all organiser's events (ignoring search filters for stats bar)
    const allOrgEvents = await Event.find(user.role === "admin" ? {} : { organiser: user.id })
      .select("status")
      .lean();

    const totalRevenueSum = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const totalBookingsCount = bookings.length;

    const stats = {
      totalVenues: allOrgEvents.length,
      publishedCount: allOrgEvents.filter((e) => e.status === "published").length,
      pendingCount: allOrgEvents.filter((e) => e.status === "pending_approval").length,
      rejectedCount: allOrgEvents.filter((e) => e.status === "rejected").length,
      draftCount: allOrgEvents.filter((e) => e.status === "draft").length,
      totalRevenue: totalRevenueSum,
      totalBookings: totalBookingsCount,
    };

    return NextResponse.json({
      events: enhancedEvents,
      totalCount: enhancedEvents.length,
      stats,
    });
  } catch (error: any) {
    console.error("Organiser get events error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
