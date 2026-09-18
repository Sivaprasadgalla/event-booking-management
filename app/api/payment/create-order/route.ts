import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Event, Order, Setting } from "@/models";
import { getUserFromRequest } from "@/lib/auth";
import { createRazorpayOrder, isRazorpayConfigured, getRazorpayKeyId } from "@/lib/razorpay";
import { generateOrderNumber } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { items, customerDetails } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (!customerDetails?.name || !customerDetails?.email || !customerDetails?.phone) {
      return NextResponse.json({ error: "Customer details are incomplete" }, { status: 400 });
    }

    // Fetch platform settings
    const setting = await Setting.findOne();
    const platformFeePct = setting?.platformFeePercent ?? 5;
    const taxPct = setting?.taxPercent ?? 18;
    const currency = setting?.currency ?? "INR";

    // Validate each cart item against database
    let subtotal = 0;

    for (const item of items) {
      const event = await Event.findById(item.eventId);
      if (!event || event.status !== "published") {
        return NextResponse.json(
          { error: `Event "${item.eventTitle || 'Selected event'}" is no longer available` },
          { status: 400 }
        );
      }

      // Check slot availability
      const slot = event.scheduleSlots.find((s) => s.id === item.selectedSlot?.slotId);
      if (slot) {
        const remaining = slot.capacity - slot.bookedCount;
        if (remaining < item.guestsCount) {
          return NextResponse.json(
            {
              error: `Only ${remaining} seats available for ${event.title} on ${item.selectedSlot.date}`,
            },
            { status: 400 }
          );
        }
      }

      // Verify package price (flat celebration package tier price)
      const pkg = event.packages.find((p) => p.id === item.packageDetails.packageId);
      const pkgPrice = pkg ? pkg.price : item.packageDetails.price;
      const packageCost = pkgPrice;

      // Verify add-on prices
      let addonsCost = 0;
      if (item.selectedAddOns && Array.isArray(item.selectedAddOns)) {
        for (const addon of item.selectedAddOns) {
          addonsCost += addon.unitPrice * addon.quantity;
        }
      }

      subtotal += packageCost + addonsCost;
    }

    // Fee calculation
    const platformFee = Math.round((subtotal * platformFeePct) / 100);
    const taxAmount = Math.round(((subtotal + platformFee) * taxPct) / 100);
    const totalAmount = subtotal + platformFee + taxAmount;

    const orderNumber = generateOrderNumber();
    const user = getUserFromRequest(req);

    // Create pending order
    const pendingOrder = await Order.create({
      orderNumber,
      customer: user ? user.id : undefined,
      bookings: [],
      subtotal,
      platformFee,
      taxAmount,
      discountAmount: 0,
      totalAmount,
      currency,
      paymentStatus: "pending",
      paymentGateway: "razorpay",
      customerDetails: {
        name: customerDetails.name,
        email: customerDetails.email,
        phone: customerDetails.phone,
      },
    });

    // Create Razorpay Order
    const razorpayOrder = await createRazorpayOrder({
      amount: totalAmount,
      currency,
      receipt: orderNumber,
      notes: {
        orderId: pendingOrder._id.toString(),
        orderNumber,
        customerEmail: customerDetails.email,
      },
    });

    pendingOrder.razorpayOrderId = razorpayOrder.id;
    await pendingOrder.save();

    return NextResponse.json({
      success: true,
      orderNumber,
      orderId: pendingOrder._id.toString(),
      razorpayOrderId: razorpayOrder.id,
      amount: totalAmount,
      keyId: getRazorpayKeyId(),
      isSimulation: (razorpayOrder as any).isSimulation || !isRazorpayConfigured(),
    });
  } catch (error: any) {
    console.error("Create payment order error:", error);
    return NextResponse.json({ error: error.message || "Order creation failed" }, { status: 500 });
  }
}
