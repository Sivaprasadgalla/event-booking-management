import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Booking, Event, Order, User, SlotHold } from "@/models";
import { getUserFromRequest } from "@/lib/auth";
import { generateBookingReference, generateOrderNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || (user.role !== "organiser" && user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized: Organiser access required" }, { status: 403 });
    }

    await connectToDatabase();
    const body = await req.json();

    const {
      eventId,
      slotId,
      date,
      packageId,
      customerName,
      customerPhone,
      customerEmail,
      guestsCount,
      paymentMode,
      directNotes,
      selectedAddOns = [],
    } = body;

    if (!eventId || !date || !slotId || !customerName || !customerPhone) {
      return NextResponse.json(
        { error: "Event, celebration date, shift time slot, customer name, and phone number are required" },
        { status: 400 }
      );
    }

    // Verify event ownership
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: "Venue listing not found" }, { status: 404 });
    }

    if (user.role !== "admin" && event.organiser.toString() !== user.id) {
      return NextResponse.json({ error: "Forbidden: You can only book your own venue listings" }, { status: 403 });
    }

    // Find package
    const pkg = event.packages?.find((p: any) => p.id === packageId) || event.packages?.[0];
    const pkgPrice = pkg?.price || 0;
    const pkgName = pkg?.name || "Direct Celebration Package";

    // Find slot details
    let selectedDailySlot = event.dailyTimeSlots?.find((s: any) => s.id === slotId);
    let slotStartTime = selectedDailySlot?.startTime || "18:00";
    let slotEndTime = selectedDailySlot?.endTime || "22:00";

    // Calculate totals (flat package tier fee + add-ons)
    const addonsCost = (selectedAddOns || []).reduce(
      (sum: number, a: any) => sum + (Number(a.unitPrice) || 0) * (Number(a.quantity) || 1),
      0
    );
    const totalAmount = pkgPrice + addonsCost;

    // Find or create customer account
    const cleanEmail = customerEmail?.trim()?.toLowerCase() || `direct_${customerPhone.replace(/[^0-9]/g, "")}@celebratehub.offline`;
    let customerUser = await User.findOne({
      $or: [{ email: cleanEmail }, { phone: customerPhone }],
    });

    if (!customerUser) {
      customerUser = await User.create({
        name: customerName.trim(),
        email: cleanEmail,
        phone: customerPhone.trim(),
        role: "customer",
        isVerified: true,
      });
    }

    // Create Order record
    const orderNumber = generateOrderNumber();
    const order = await Order.create({
      orderNumber,
      customer: customerUser._id,
      bookings: [],
      subtotal: totalAmount,
      platformFee: 0,
      taxAmount: 0,
      discountAmount: 0,
      totalAmount,
      currency: "INR",
      paymentStatus: "paid",
      paymentGateway: "offline_direct",
      customerDetails: {
        name: customerName,
        email: cleanEmail,
        phone: customerPhone,
      },
    });

    // Create Booking record
    const bookingRef = generateBookingReference();
    const newBooking = await Booking.create({
      bookingReference: bookingRef,
      order: order._id,
      event: event._id,
      customer: customerUser._id,
      organiser: event.organiser,
      packageDetails: {
        packageId: pkg?.id || "pkg_direct",
        name: pkgName,
        price: pkgPrice,
      },
      guestsCount: Number(guestsCount) || 1,
      selectedSlot: {
        slotId,
        date,
        startTime: slotStartTime,
        endTime: slotEndTime,
      },
      selectedAddOns: (selectedAddOns || []).map((a: any) => ({
        addOnId: a.addOnId || a.id || `addon_${Date.now()}`,
        name: a.name,
        unitPrice: Number(a.unitPrice) || Number(a.price) || 0,
        quantity: Number(a.quantity) || 1,
        total: (Number(a.unitPrice) || Number(a.price) || 0) * (Number(a.quantity) || 1),
      })),
      subtotal: totalAmount,
      totalAmount,
      status: "confirmed",
      checkInStatus: "pending",
      bookingType: "direct",
      paymentMode: paymentMode || "Cash at Venue",
      directNotes: directNotes?.trim() || "",
      qrCodeData: "",
      refundDetails: { status: "none", amount: 0 },
    });

    // Update order with booking reference
    order.bookings = [newBooking._id];
    await order.save();

    // Increment slot booked count in scheduleSlots
    const slotExistsIndex = (event.scheduleSlots || []).findIndex(
      (s: any) => s.id === slotId && s.date === date
    );

    if (slotExistsIndex >= 0) {
      event.scheduleSlots[slotExistsIndex].bookedCount =
        (event.scheduleSlots[slotExistsIndex].bookedCount || 0) + (Number(guestsCount) || 1);
      await event.save();
    } else {
      // Append slot record for this date
      await Event.updateOne(
        { _id: event._id },
        {
          $push: {
            scheduleSlots: {
              id: slotId,
              date,
              startTime: slotStartTime,
              endTime: slotEndTime,
              capacity: selectedDailySlot?.capacity || 50,
              bookedCount: Number(guestsCount) || 1,
            },
          },
        }
      );
    }

    // Clear any slot holds for this slot and date
    await SlotHold.deleteMany({
      eventId: event._id,
      slotId,
      date,
    });

    return NextResponse.json({
      success: true,
      message: `Direct reservation confirmed! Reference: ${bookingRef}`,
      booking: await Booking.findById(newBooking._id)
        .populate("event", "title slug coverImage venue")
        .populate("customer", "name email phone")
        .lean(),
    });
  } catch (error: any) {
    console.error("Direct booking error:", error);
    return NextResponse.json({ error: error.message || "Failed to create direct booking" }, { status: 500 });
  }
}
