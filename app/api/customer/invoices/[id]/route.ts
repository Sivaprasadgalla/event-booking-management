import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Booking, Order, Event } from "@/models";
import { getUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized: Please sign in" }, { status: 401 });
    }

    await connectToDatabase();

    const bookingId = params.id;

    // Search by either MongoDB ObjectId or bookingReference (e.g. EVT-...)
    const query = bookingId.startsWith("EVT-")
      ? { bookingReference: bookingId }
      : { _id: bookingId };

    const booking = await Booking.findOne(query)
      .populate({
        path: "event",
        select: "title slug coverImage venue venueType cancellationPolicy",
      })
      .populate({
        path: "organiser",
        select: "name companyName email phone",
      })
      .populate({
        path: "order",
        select: "orderNumber customerDetails subtotal platformFee taxAmount discountAmount totalAmount paymentStatus razorpayPaymentId razorpayOrderId createdAt",
      })
      .populate({
        path: "customer",
        select: "name email phone",
      })
      .lean();

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Access control: only booking customer, event organiser, or admin can access
    const isCustomer = String(booking.customer?._id || booking.customer) === user.id;
    const isOrganiser = String(booking.organiser?._id || booking.organiser) === user.id;
    const isAdmin = user.role === "admin";

    if (!isCustomer && !isOrganiser && !isAdmin) {
      return NextResponse.json({ error: "Forbidden: You do not have permission to view this invoice" }, { status: 403 });
    }

    // Generate formal invoice number: INV-[YEAR]-[ORDER_NUMBER]-[REF]
    const invoiceYear = new Date(booking.createdAt).getFullYear();
    const invoiceNumber = `INV-${invoiceYear}-${(booking.order as any)?.orderNumber || "ORD"}-${booking.bookingReference.replace("EVT-", "")}`;

    return NextResponse.json({
      success: true,
      invoice: {
        invoiceNumber,
        invoiceDate: booking.createdAt,
        booking,
        order: booking.order,
        event: booking.event,
        organiser: booking.organiser,
        customer: booking.customer,
      },
    });
  } catch (error: any) {
    console.error("Invoice generation API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
