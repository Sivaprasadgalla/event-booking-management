import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Booking } from "@/models";
import { getUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "all";

    const filter: Record<string, any> = {
      "refundDetails.status": { $ne: "none" },
    };

    if (status !== "all") {
      filter["refundDetails.status"] = status;
    }

    const refunds = await Booking.find(filter)
      .populate("event", "title slug venue")
      .populate("customer", "name email phone")
      .populate("organiser", "name companyName email")
      .populate("order", "orderNumber paymentGateway razorpayPaymentId")
      .sort({ "refundDetails.requestedAt": -1 })
      .lean();

    return NextResponse.json({ refunds });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
