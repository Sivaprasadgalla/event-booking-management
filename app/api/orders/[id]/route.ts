import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Order, Booking, Event } from "@/models";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const { id } = params;

    const query = id.match(/^[0-9a-fA-F]{24}$/)
      ? { $or: [{ _id: id }, { orderNumber: id }] }
      : { orderNumber: id };

    const order = await Order.findOne(query).lean();
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const bookings = await Booking.find({ order: order._id })
      .populate("event", "title slug coverImage venue cancellationPolicy eventType")
      .populate("organiser", "name companyName email phone")
      .lean();

    return NextResponse.json({ order, bookings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
