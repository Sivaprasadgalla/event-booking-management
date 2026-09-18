import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Event } from "@/models";
import { getUserFromRequest } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
    }

    await connectToDatabase();
    const { id } = params;
    const body = await req.json();
    const { status, adminFeedback, isFeatured } = body;

    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (status) {
      event.status = status;
    }

    if (adminFeedback !== undefined) {
      event.adminFeedback = adminFeedback;
    }

    if (isFeatured !== undefined) {
      event.isFeatured = Boolean(isFeatured);
    }

    await event.save();

    return NextResponse.json({
      success: true,
      message: `Event updated successfully (Status: ${event.status})`,
      event,
    });
  } catch (error: any) {
    console.error("Admin event status error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
