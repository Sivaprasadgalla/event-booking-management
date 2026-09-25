import { NextRequest, NextResponse } from "next/server";
import { seedDatabase } from "@/lib/seedData";
import { getUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
    }

    const result = await seedDatabase();
    return NextResponse.json({
      success: true,
      message: "Database marketplace content synchronized successfully.",
      stats: result,
    });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to seed database",
      },
      { status: 500 }
    );
  }
}

