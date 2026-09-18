import { NextResponse } from "next/server";
import { seedDatabase } from "@/lib/seedData";

export async function POST() {
  try {
    const result = await seedDatabase();
    return NextResponse.json({
      success: true,
      message: "Database successfully seeded with realistic demo data!",
      stats: result,
      demoAccounts: {
        admin: { email: "admin@eventhub.com", password: "password123" },
        organiser: { email: "organiser@eventhub.com", password: "password123" },
        customer: { email: "customer@eventhub.com", password: "password123" },
      },
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

export async function GET() {
  return POST();
}
