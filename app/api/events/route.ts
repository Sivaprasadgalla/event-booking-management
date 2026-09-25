import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Event, Category, User } from "@/models";
import { getUserFromRequest } from "@/lib/auth";
import { seedDatabase } from "@/lib/seedData";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search")?.trim();
    const categorySlug = searchParams.get("category");
    const city = searchParams.get("city");
    const eventType = searchParams.get("eventType");
    const isFeatured = searchParams.get("featured");
    const sort = searchParams.get("sort") || "upcoming";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    // Auto-seed if database has 0 events
    const count = await Event.countDocuments();
    if (count === 0) {
      await seedDatabase();
    }

    const filter: Record<string, any> = { status: "published" };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { shortDescription: { $regex: search, $options: "i" } },
        { "venue.city": { $regex: search, $options: "i" } },
      ];
    }

    if (categorySlug && categorySlug !== "all") {
      const cat = await Category.findOne({ slug: categorySlug });
      if (cat) {
        filter.category = cat._id;
      }
    }

    if (city && city !== "all") {
      filter["venue.city"] = { $regex: new RegExp(`^${city}$`, "i") };
    }

    if (eventType && eventType !== "all") {
      filter.eventType = eventType;
    }

    if (isFeatured === "true") {
      filter.isFeatured = true;
    }

    // Determine sort
    let sortOption: Record<string, 1 | -1> = { "scheduleSlots.date": 1 };
    if (sort === "popular") {
      sortOption = { reviewCount: -1, averageRating: -1 };
    } else if (sort === "rating") {
      sortOption = { averageRating: -1 };
    } else if (sort === "newest") {
      sortOption = { createdAt: -1 };
    } else if (sort === "price_asc") {
      sortOption = { "packages.0.price": 1 };
    } else if (sort === "price_desc") {
      sortOption = { "packages.0.price": -1 };
    }

    const events = await Event.find(filter)
      .populate("category", "name slug icon")
      .populate("organiser", "name companyName avatar isVerified")
      .sort(sortOption)
      .lean();

    // In-memory price filter if requested
    let results = events;
    if (minPrice || maxPrice) {
      const min = minPrice ? Number(minPrice) : 0;
      const max = maxPrice ? Number(maxPrice) : Infinity;

      results = results.filter((evt) => {
        const prices = (evt.packages || []).map((p) => p.price);
        const lowestPrice = prices.length ? Math.min(...prices) : 0;
        return lowestPrice >= min && lowestPrice <= max;
      });
    }

    return NextResponse.json({ events: results, count: results.length });
  } catch (error: any) {
    console.error("Fetch events error:", error);
    return NextResponse.json({ events: [], count: 0, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || (user.role !== "organiser" && user.role !== "admin")) {
      return NextResponse.json(
        { error: "Unauthorized: Organiser or Admin access required" },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const data = await req.json();

    if (!data.title || !data.category || !data.shortDescription) {
      return NextResponse.json(
        { error: "Title, category, and short description are required" },
        { status: 400 }
      );
    }

    // Generate unique slug
    let baseSlug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    if (!baseSlug) baseSlug = "event";

    let slug = baseSlug;
    let counter = 1;
    while (await Event.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Ensure packages have IDs
    const packages = (data.packages || []).map((pkg: any, idx: number) => ({
      id: pkg.id || `pkg_${Date.now()}_${idx}`,
      name: pkg.name || "General Admission",
      price: Number(pkg.price) || 0,
      capacity: Number(pkg.capacity) || 100,
      features: Array.isArray(pkg.features) ? pkg.features : [],
      isDefault: idx === 0,
    }));

    // Ensure schedule slots have IDs
    const scheduleSlots = (data.scheduleSlots || []).map((slot: any, idx: number) => ({
      id: slot.id || `slot_${Date.now()}_${idx}`,
      date: slot.date,
      startTime: slot.startTime || "10:00",
      endTime: slot.endTime || "18:00",
      capacity: Number(slot.capacity) || 100,
      bookedCount: 0,
    }));

    // Ensure add-ons have IDs
    const addOns = (data.addOns || []).map((addon: any, idx: number) => ({
      id: addon.id || `addon_${Date.now()}_${idx}`,
      name: addon.name,
      price: Number(addon.price) || 0,
      description: addon.description || "",
      maxPerBooking: Number(addon.maxPerBooking) || 5,
    }));

    const newEvent = await Event.create({
      title: data.title,
      slug,
      organiser: user.role === "admin" && data.organiserId ? data.organiserId : user.id,
      category: data.category,
      shortDescription: data.shortDescription,
      fullDescription: data.fullDescription || data.shortDescription,
      eventType: data.eventType || "physical",
      venueType: data.venueType || "banquet_hall",
      celebrationTypes: Array.isArray(data.celebrationTypes) && data.celebrationTypes.length > 0
        ? data.celebrationTypes
        : ["Birthday Parties", "Private Celebrations", "Anniversary"],
      venue: data.venue || { name: "", address: "", city: "" },
      contactInfo: data.contactInfo || { phone: "", whatsapp: "", contactPerson: "", email: "" },
      operatingDays: data.operatingDays || "all_days",
      customOperatingDays: Array.isArray(data.customOperatingDays) ? data.customOperatingDays : [1, 2, 3, 4, 5],
      dailyTimeSlots: Array.isArray(data.dailyTimeSlots) && data.dailyTimeSlots.length > 0
        ? data.dailyTimeSlots.map((s: any, idx: number) => ({
            id: s.id || `slot_daily_${Date.now()}_${idx}`,
            title: s.title || "Celebration Shift",
            startTime: s.startTime || "18:00",
            endTime: s.endTime || "22:00",
            capacity: Number(s.capacity) || 100,
            slotType: s.slotType || "evening",
            isActive: s.isActive ?? true,
          }))
        : [
            {
              id: `slot_daily_${Date.now()}_1`,
              title: "Evening Gala & Celebration",
              startTime: "18:00",
              endTime: "23:00",
              capacity: 150,
              slotType: "evening",
              isActive: true,
            },
          ],
      coverImage:
        data.coverImage ||
        "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80",
      gallery: data.gallery || [],
      packages: packages.length > 0 ? packages : [
        {
          id: `pkg_default_${Date.now()}`,
          name: "General Admission",
          price: 999,
          capacity: 100,
          features: ["Full Event Access"],
          isDefault: true,
        },
      ],
      addOns,
      scheduleSlots: scheduleSlots.length > 0 ? scheduleSlots : [
        {
          id: `slot_default_${Date.now()}`,
          date: new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0],
          startTime: "18:00",
          endTime: "22:00",
          capacity: 100,
          bookedCount: 0,
        },
      ],
      termsAndConditions: Array.isArray(data.termsAndConditions)
        ? data.termsAndConditions
        : typeof data.termsAndConditions === "string"
        ? data.termsAndConditions.split("\n").map((t: string) => t.trim()).filter(Boolean)
        : ["Decor setup is permitted 60 minutes prior to shift commencement."],
      cancellationPolicy: data.cancellationPolicy || {
        allowed: true,
        maxDaysBefore: 2,
        refundPercentage: 80,
      },
      policyText: data.policyText || "",
      status: user.role === "admin" && data.status ? data.status : (data.submitForApproval ? "pending_approval" : "draft"),
      isFeatured: user.role === "admin" && data.isFeatured !== undefined ? Boolean(data.isFeatured) : false,
    });

    return NextResponse.json({
      success: true,
      event: newEvent,
      message: data.submitForApproval
        ? "Event submitted for Administrator approval!"
        : "Event draft created successfully!",
    });
  } catch (error: any) {
    console.error("Create event error:", error);
    return NextResponse.json({ error: error.message || "Failed to create event" }, { status: 500 });
  }
}
