import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { SlotHold } from "@/models";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const result = await SlotHold.deleteMany({ expiresAt: { $lte: new Date() } });
    return NextResponse.json({
      success: true,
      releasedCount: result.deletedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
