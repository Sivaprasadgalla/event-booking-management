import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Category, Event } from "@/models";
import { seedDatabase } from "@/lib/seedData";

export const dynamic = "force-dynamic";

const FALLBACK_CATEGORIES = [
  { _id: "cat_1", name: "Music & Concerts", slug: "music-concerts", icon: "Music", description: "Live arena gigs & festivals", eventCount: 4 },
  { _id: "cat_2", name: "Tech & Innovation", slug: "tech-innovation", icon: "Cpu", description: "Developer summits & AI", eventCount: 3 },
  { _id: "cat_3", name: "Food & Culinary", slug: "food-culinary", icon: "Utensils", description: "Gourmet tastings & beer", eventCount: 2 },
  { _id: "cat_4", name: "Wellness & Yoga", slug: "wellness-yoga", icon: "Activity", description: "Meditation getaways & fitness", eventCount: 1 },
  { _id: "cat_5", name: "Workshops & Art", slug: "workshops-art", icon: "Palette", description: "Studio pottery & painting", eventCount: 2 },
  { _id: "cat_6", name: "Nightlife & Social", slug: "nightlife-social", icon: "Sparkles", description: "Rooftop sundowners & comedy", eventCount: 1 },
];

export async function GET() {
  try {
    await connectToDatabase();
    let categories = await Category.find({ isActive: true }).sort({ name: 1 });

    if (categories.length === 0) {
      // Auto seed if empty
      await seedDatabase();
      categories = await Category.find({ isActive: true }).sort({ name: 1 });
    }

    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await Event.countDocuments({
          category: cat._id,
          status: "published",
        });
        return {
          ...cat.toObject(),
          eventCount: count,
        };
      })
    );

    return NextResponse.json({ categories: categoriesWithCount });
  } catch (error: any) {
    // Return fallback categories if database is not reachable yet
    return NextResponse.json({ categories: FALLBACK_CATEGORIES });
  }
}
