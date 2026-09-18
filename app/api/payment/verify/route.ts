import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Order, Booking, Event, User } from "@/models";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { generateBookingReference } from "@/lib/utils";
import QRCode from "qrcode";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const {
      orderId,
      orderNumber,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      items,
      customerDetails,
    } = body;

    // Verify signature
    const isValid = verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!isValid) {
      return NextResponse.json(
        { error: "Payment verification failed: Invalid transaction signature" },
        { status: 400 }
      );
    }

    // Find the pending order
    let order = orderId
      ? await Order.findById(orderId)
      : await Order.findOne({ orderNumber });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Determine customer ID (from session or create/find by email)
    let customerId = order.customer;
    const sessionUser = getUserFromRequest(req);
    if (sessionUser) {
      customerId = sessionUser.id as any;
    } else if (!customerId) {
      let existingUser = await User.findOne({ email: customerDetails.email.toLowerCase() });
      if (!existingUser) {
        existingUser = await User.create({
          name: customerDetails.name,
          email: customerDetails.email.toLowerCase(),
          phone: customerDetails.phone,
          role: "customer",
          isVerified: true,
        });
      }
      customerId = existingUser._id;
    }

    // Create Booking records for each cart item
    const createdBookingIds: any[] = [];
    const createdBookingsData: any[] = [];

    for (const item of items) {
      const event = await Event.findById(item.eventId);
      if (!event) continue;

      const bookingRef = generateBookingReference();

      // Generate verifiable QR code
      const qrDataPayload = JSON.stringify({
        ref: bookingRef,
        event: event.title,
        customer: customerDetails.name,
        date: item.selectedSlot?.date,
        slot: `${item.selectedSlot?.startTime} - ${item.selectedSlot?.endTime}`,
        guests: item.guestsCount,
        package: item.packageDetails?.name,
      });

      const qrCodeDataUrl = await QRCode.toDataURL(qrDataPayload, {
        errorCorrectionLevel: "M",
        width: 300,
        margin: 2,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
      });

      // Calculate booking item total
      const pkgTotal = (item.packageDetails?.price || 0) * (item.guestsCount || 1);
      const addOnsTotal = (item.selectedAddOns || []).reduce(
        (sum: number, addOn: any) => sum + (addOn.total || addOn.unitPrice * addOn.quantity),
        0
      );
      const bookingTotal = pkgTotal + addOnsTotal;

      const newBooking = await Booking.create({
        bookingReference: bookingRef,
        order: order._id,
        event: event._id,
        customer: customerId,
        organiser: event.organiser,
        packageDetails: {
          packageId: item.packageDetails?.packageId || "pkg_default",
          name: item.packageDetails?.name || "General Admission",
          price: item.packageDetails?.price || 0,
        },
        guestsCount: item.guestsCount || 1,
        selectedSlot: {
          slotId: item.selectedSlot?.slotId || "slot_default",
          date: item.selectedSlot?.date || new Date().toISOString().split("T")[0],
          startTime: item.selectedSlot?.startTime || "18:00",
          endTime: item.selectedSlot?.endTime || "22:00",
        },
        selectedAddOns: (item.selectedAddOns || []).map((a: any) => ({
          addOnId: a.addOnId,
          name: a.name,
          unitPrice: a.unitPrice,
          quantity: a.quantity,
          total: a.total || a.unitPrice * a.quantity,
        })),
        subtotal: bookingTotal,
        totalAmount: bookingTotal,
        status: "confirmed",
        checkInStatus: "pending",
        qrCodeData: qrCodeDataUrl,
        refundDetails: { status: "none", amount: 0 },
      });

      createdBookingIds.push(newBooking._id);
      createdBookingsData.push(newBooking);

      // Increment bookedCount on the event's slot
      if (item.selectedSlot?.slotId) {
        await Event.updateOne(
          { _id: event._id, "scheduleSlots.id": item.selectedSlot.slotId },
          { $inc: { "scheduleSlots.$.bookedCount": item.guestsCount || 1 } }
        );
      }
    }

    // Update order status
    order.paymentStatus = "paid";
    order.customer = customerId;
    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature;
    order.bookings = createdBookingIds;
    await order.save();

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      orderId: order._id.toString(),
      bookings: createdBookingsData,
      message: "Payment successfully verified! Your bookings are confirmed.",
    });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: error.message || "Payment verification failed" },
      { status: 500 }
    );
  }
}
