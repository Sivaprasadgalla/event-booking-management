import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Event } from "@/models";
import { getUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const filter: Record<string, any> = {};
    if (status && status !== "all") {
      filter.status = status;
    }

    const events = await Event.find(filter)
      .populate("organiser", "name companyName email phone")
      .populate("category", "name slug")
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json({ events });
  } catch (error: any) {
    console.error("Admin events error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
