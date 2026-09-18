import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Event } from "@/models";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const user = getUserFromRequest(req);
    if (!user || (user.role !== "organiser" && user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDatabase();
    const { slug } = params;

    const query = slug.match(/^[0-9a-fA-F]{24}$/)
      ? { $or: [{ _id: slug }, { slug }] }
      : { slug };

    const event = await Event.findOne(query);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (user.role !== "admin" && event.organiser.toString() !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Validation before submission
    if (!event.packages || event.packages.length === 0) {
      return NextResponse.json(
        { error: "Event must have at least one pricing package before submitting" },
        { status: 400 }
      );
    }

    if (!event.scheduleSlots || event.scheduleSlots.length === 0) {
      return NextResponse.json(
        { error: "Event must have at least one schedule slot before submitting" },
        { status: 400 }
      );
    }

    event.status = "pending_approval";
    event.adminFeedback = "";
    await event.save();

    return NextResponse.json({
      success: true,
      message: "Event submitted to Administrator for review and approval!",
      event,
    });
  } catch (error: any) {
    console.error("Submit event error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
