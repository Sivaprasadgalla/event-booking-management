import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Booking, Event, Order } from "@/models";
import { getUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized: Please log in" }, { status: 401 });
    }

    await connectToDatabase();

    const bookings = await Booking.find({ customer: user.id })
      .populate("event", "title slug coverImage venue cancellationPolicy eventType")
      .populate("order", "orderNumber paymentStatus createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ bookings });
  } catch (error: any) {
    console.error("Fetch customer bookings error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
