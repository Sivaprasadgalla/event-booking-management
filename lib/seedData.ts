import { connectToDatabase } from "@/lib/db";
import { User, Category, Event, Order, Booking, Review, Setting } from "@/models";
import { hashPassword } from "@/lib/auth";

export async function seedDatabase() {
  await connectToDatabase();

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Event.deleteMany({}),
    Order.deleteMany({}),
    Booking.deleteMany({}),
    Review.deleteMany({}),
    Setting.deleteMany({}),
  ]);

  // Platform Settings
  await Setting.create({
    platformName: "CelebrateHub",
    platformFeePercent: 5,
    taxPercent: 18,
    currency: "INR",
    supportEmail: "concierge@celebratehub.com",
    allowNewOrganiserRegistration: true,
  });

  // Demo Credentials
  const hashedPassword = await hashPassword("password123");

  const adminUser = await User.create({
    name: "Alex Sterling (Admin)",
    email: "admin@eventhub.com",
    password: hashedPassword,
    role: "admin",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    phone: "+91 98765 43210",
    bio: "Head Platform Administrator & Compliance Lead",
    isVerified: true,
    status: "active",
  });

  const organiserUser1 = await User.create({
    name: "Skyline Hospitality & Venues",
    email: "organiser@eventhub.com",
    password: hashedPassword,
    role: "organiser",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    phone: "+91 98111 22334",
    bio: "Premier celebration venue curator specializing in luxury rooftops, private farmhouses, and bespoke party hosting.",
    companyName: "Skyline Venues Group",
    isVerified: true,
    status: "active",
  });

  const organiserUser2 = await User.create({
    name: "Royal Heritage Banquets & Lawns",
    email: "novatech@eventhub.com",
    password: hashedPassword,
    role: "organiser",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
    phone: "+91 98222 33445",
    bio: "Hosting royal wedding receptions, grand silver jubilee anniversaries, and elite ballroom gala milestones.",
    companyName: "Royal Heritage Hospitality",
    isVerified: true,
    status: "active",
  });

  const customerUser = await User.create({
    name: "Rohan Verma",
    email: "customer@eventhub.com",
    password: hashedPassword,
    role: "customer",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    phone: "+91 98999 11223",
    bio: "Planning celebration milestones, birthday soirées, and weekend getaways.",
    isVerified: true,
    status: "active",
  });

  // Celebration Categories
  const categoriesData = [
    {
      name: "Rooftops & Sky Lounges",
      slug: "rooftops",
      description: "Breathtaking panoramic city view venues for sunset sundowners, anniversaries, and high-energy birthday bashes.",
      icon: "Sparkles",
      image: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=80",
      isActive: true,
    },
    {
      name: "Private Farmhouses & Villas",
      slug: "farmhouses-villas",
      description: "Exclusive gated farmhouses with private pools, lush green lawns, and overnight luxury stay options.",
      icon: "Home",
      image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
      isActive: true,
    },
    {
      name: "Grand Ballrooms & Banquets",
      slug: "banquets",
      description: "Lavish indoor air-conditioned ballrooms with high ceilings and royal chandeliers for large family gatherings.",
      icon: "Crown",
      image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80",
      isActive: true,
    },
    {
      name: "Garden & Beachfront Lawns",
      slug: "garden-lawns",
      description: "Open-air floral manicured lawns and waterfront decks ideal for golden hour celebrations and fairy-lit soirées.",
      icon: "Palmtree",
      image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80",
      isActive: true,
    },
    {
      name: "Intimate Cafes & Speakeasies",
      slug: "boutique-venues",
      description: "Cozy artisanal speakeasies and hidden wine cellars for milestone dinners, private acoustic nights, and proposals.",
      icon: "Wine",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
      isActive: true,
    },
    {
      name: "Poolside Cabanas & Decks",
      slug: "poolside",
      description: "Vibrant illuminated poolside decks with DJ booths, floating lounges, and summer barbecue bars.",
      icon: "Waves",
      image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&q=80",
      isActive: true,
    },
  ];

  const categories = await Category.insertMany(categoriesData);
  const catMap = new Map(categories.map((c) => [c.slug, c._id]));

  // Celebration Events with Operating Days and Daily Time Slots
  const eventsData = [
    {
      title: "The Glasshouse Penthouse & Rooftop Lounge",
      slug: "the-glasshouse-penthouse-rooftop",
      organiser: organiserUser1._id,
      category: catMap.get("rooftops"),
      shortDescription:
        "Breathtaking 360-degree skyline rooftop for birthday parties, anniversaries, cocktail sundowners, and private celebrations.",
      fullDescription: `Perched on the 32nd floor with panoramic city skyline views, The Glasshouse Penthouse offers an unforgettable backdrop for milestone celebrations. 
      
Features include an illuminated marble bar, temperature-controlled glass enclosed pavilion, ambient fairy light terrace, state-of-the-art BOSE sound system, and dedicated mixologists and chef crew. Host your birthday, anniversary, or private reunion in total luxury.`,
      eventType: "physical",
      venueType: "Rooftop Lounge",
      celebrationTypes: ["Birthday Parties", "Anniversary Specials", "Cocktail Sundowners", "Private Reunions"],
      operatingDays: "all_days",
      customOperatingDays: [0, 1, 2, 3, 4, 5, 6],
      dailyTimeSlots: [
        {
          id: "slot_gh_brunch",
          title: "Brunch & Day Celebration",
          startTime: "11:30",
          endTime: "15:30",
          capacity: 80,
          slotType: "morning",
          isActive: true,
        },
        {
          id: "slot_gh_sunset",
          title: "Sunset Gala & Cocktail Shift",
          startTime: "16:30",
          endTime: "20:00",
          capacity: 120,
          slotType: "evening",
          isActive: true,
        },
        {
          id: "slot_gh_midnight",
          title: "Starlight Midnight Celebration",
          startTime: "20:30",
          endTime: "01:30",
          capacity: 150,
          slotType: "night",
          isActive: true,
        },
      ],
      venue: {
        name: "The Glasshouse Rooftop, Bandra",
        address: "32nd Floor, Apex Tower, Linking Road, Bandra West",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400050",
        googleMapsUrl: "https://maps.google.com/?q=Bandra+West+Mumbai",
      },
      coverImage: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80",
      ],
      packages: [
        {
          id: "pkg_gh_silver",
          name: "Silver Celebration Tier",
          price: 24999,
          capacity: 50,
          features: [
            "Exclusive access to Terrace Lounge for chosen shift",
            "Signature Welcome Mocktails on arrival",
            "Standard Ambient Lighting & Sound System Setup",
            "Dedicated Event Host & Floor Captain",
          ],
          isDefault: true,
        },
        {
          id: "pkg_gh_gold",
          name: "Gold Luxury Soirée Tier",
          price: 54999,
          capacity: 100,
          features: [
            "Full Penthouse & Glass Pavilion Takeover",
            "Custom Gourmet Finger Foods & Appetizers (5 veg, 5 non-veg)",
            "Live Mocktail / Cocktail Bar setup with Bartender",
            "Pro Sound System with Wireless Mics for Speeches",
            "Complimentary 1kg Artisan Celebration Cake",
          ],
          isDefault: false,
        },
        {
          id: "pkg_gh_vip",
          name: "Diamond Exclusive Royal Takeover",
          price: 119999,
          capacity: 150,
          features: [
            "Complete 32nd Floor Private Buyout with Rooftop Terrace",
            "Full Multi-Course Gourmet Buffet & Live Food Stations",
            "Dedicated Resident DJ & Club-Grade Moving Head Lighting",
            "Customized Photo-Wall & Personalized LED Name Signage",
            "Valet Parking for all guests",
          ],
          isDefault: false,
        },
      ],
      addOns: [
        {
          id: "addon_gh_band",
          name: "Live Acoustic Trio / Saxophonist",
          price: 12000,
          description: "2-hour live musical performance to elevate your party vibe",
          maxPerBooking: 1,
        },
        {
          id: "addon_gh_cake",
          name: "Custom 3-Tier Fondant Celebration Cake",
          price: 4500,
          description: "Personalized designer cake in Belgian Chocolate, Red Velvet, or Hazelnut",
          maxPerBooking: 2,
        },
        {
          id: "addon_gh_decor",
          name: "Floral Canopy & Fairy Light Arch",
          price: 15000,
          description: "Bespoke Instagrammable entrance and celebration photobooth backdrop",
          maxPerBooking: 1,
        },
      ],
      scheduleSlots: [
        {
          id: "slot_gh_s1",
          date: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
          startTime: "16:30",
          endTime: "20:00",
          capacity: 120,
          bookedCount: 15,
        },
        {
          id: "slot_gh_s2",
          date: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
          startTime: "20:30",
          endTime: "01:30",
          capacity: 150,
          bookedCount: 30,
        },
      ],
      termsAndConditions: [
        "Decor setup permitted 60 minutes prior to scheduled shift start.",
        "Music volume after 22:00 adheres to local municipal sound regulations.",
        "Advance deposit required to confirm slot reservation.",
      ],
      cancellationPolicy: {
        allowed: true,
        maxDaysBefore: 3,
        refundPercentage: 85,
      },
      status: "published",
      isFeatured: true,
      averageRating: 4.95,
      reviewCount: 42,
    },
    {
      title: "Palm Meadows Private Farmhouse & Pool Villa",
      slug: "palm-meadows-farmhouse-pool-villa",
      organiser: organiserUser1._id,
      category: catMap.get("farmhouses-villas"),
      shortDescription:
        "Sprawling 2-acre private estate with infinity pool, gazebo, lawn barbecue, and guest rooms for weekend birthday parties.",
      fullDescription: `Escape the city chaos to Palm Meadows, a private luxury farmhouse tailored for high-spirited celebrations. 
      
Enjoy a crystal clear pool with floating daybeds, an expansive green lawn accommodating outdoor games and dining, a covered pavilion with barbecue pit, and 4 air-conditioned villa suites for overnight rest. Perfect for unforgettable milestone birthdays and family anniversaries.`,
      eventType: "physical",
      venueType: "Private Farmhouse & Pool",
      celebrationTypes: ["Birthday Parties", "Anniversary Specials", "Pool Parties", "Bachelorette Celebrations"],
      operatingDays: "weekends_only",
      customOperatingDays: [0, 5, 6], // Fri, Sat, Sun
      dailyTimeSlots: [
        {
          id: "slot_pm_pool",
          title: "Sunshine Poolside Splash Shift",
          startTime: "12:00",
          endTime: "17:00",
          capacity: 60,
          slotType: "afternoon",
          isActive: true,
        },
        {
          id: "slot_pm_night",
          title: "Sunset Barbecue & Night Lawn Shift",
          startTime: "18:00",
          endTime: "01:00",
          capacity: 100,
          slotType: "evening",
          isActive: true,
        },
      ],
      venue: {
        name: "Palm Meadows Estate, Alibaug / Panvel",
        address: "Sector 14, Old Mumbai-Pune Highway, Panvel Green Zone",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "410206",
        googleMapsUrl: "https://maps.google.com/?q=Panvel+Maharashtra",
      },
      coverImage: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80",
      ],
      packages: [
        {
          id: "pkg_pm_day",
          name: "Day Poolside Celebration",
          price: 34999,
          capacity: 50,
          features: [
            "Access to entire lawn, pool deck & gazebo",
            "Pool towels, changing rooms & shower facilities",
            "Barbecue grill equipment with charcoal ready",
            "High-output Bluetooth sound system",
          ],
          isDefault: true,
        },
        {
          id: "pkg_pm_overnight",
          name: "All-Night Villa & Lawn Retreat",
          price: 74999,
          capacity: 80,
          features: [
            "Full 2-acre private property buyout for day & evening",
            "Access to 4 furnished AC Master Bedrooms (sleeps 16)",
            "Live Barbecue Grill Chef for evening appetizers",
            "Lawn illumination with hanging fairy canopies",
            "Complimentary morning breakfast spread",
          ],
          isDefault: false,
        },
      ],
      addOns: [
        {
          id: "addon_pm_bbq",
          name: "Live Barbecue Buffet Chef Service",
          price: 18000,
          description: "Chef-curated live skewered kebabs, grilled veggies, and burgers",
          maxPerBooking: 1,
        },
        {
          id: "addon_pm_dj",
          name: "Professional DJ & Lighting Console",
          price: 15000,
          description: "High-energy sound setup with DJ mixing Bollywood, EDM & House hits",
          maxPerBooking: 1,
        },
      ],
      scheduleSlots: [
        {
          id: "slot_pm_s1",
          date: new Date(Date.now() + 86400000 * 5).toISOString().split("T")[0],
          startTime: "12:00",
          endTime: "17:00",
          capacity: 60,
          bookedCount: 10,
        },
      ],
      termsAndConditions: [
        "Swimming pool rules must be strictly followed; no glass bottles near the pool.",
        "Overnight stay limited to 16 guests inside bedroom suites.",
      ],
      cancellationPolicy: {
        allowed: true,
        maxDaysBefore: 5,
        refundPercentage: 80,
      },
      status: "published",
      isFeatured: true,
      averageRating: 4.88,
      reviewCount: 31,
    },
    {
      title: "Aura Grand Palace Ballroom & Banquets",
      slug: "aura-grand-palace-ballroom-banquets",
      organiser: organiserUser2._id,
      category: catMap.get("banquets"),
      shortDescription:
        "Opulent 8,000 sq.ft banquet hall with crystal chandeliers, royal stage, and multi-cuisine catering for anniversary galas.",
      fullDescription: `Step into grandeur at Aura Grand Palace, crafted for life's most momentous milestones. 
      
Featuring soaring 22-ft gilded ceilings, Italian crystal chandeliers, grand red carpet arrivals, state-of-the-art audiovisual screens, and central climate control. Whether it's a 25th Silver Jubilee Anniversary, an engagement celebration, or a 50th Golden birthday, Aura Palace delivers unmatched majesty.`,
      eventType: "physical",
      venueType: "Luxury Banquet Hall",
      celebrationTypes: ["Intimate Weddings", "Silver Jubilee Anniversaries", "Grand Milestones", "Engagement Ceremonies"],
      operatingDays: "all_days",
      customOperatingDays: [0, 1, 2, 3, 4, 5, 6],
      dailyTimeSlots: [
        {
          id: "slot_aura_morning",
          title: "Morning Auspicious Reception Shift",
          startTime: "09:30",
          endTime: "14:30",
          capacity: 350,
          slotType: "morning",
          isActive: true,
        },
        {
          id: "slot_aura_evening",
          title: "Royal Evening Banquet & Sangeet",
          startTime: "18:00",
          endTime: "23:30",
          capacity: 500,
          slotType: "evening",
          isActive: true,
        },
      ],
      venue: {
        name: "Aura Grand Palace, Indiranagar",
        address: "Plot 88, 100 Feet Road, Indiranagar",
        city: "Bangalore",
        state: "Karnataka",
        pincode: "560038",
        googleMapsUrl: "https://maps.google.com/?q=Indiranagar+Bangalore",
      },
      coverImage: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=80",
      ],
      packages: [
        {
          id: "pkg_aura_silver",
          name: "Crystal Ballroom Tier",
          price: 74999,
          capacity: 200,
          features: [
            "Exclusive Ballroom hall reservation for 5 hours",
            "Grand floral stage backdrop & sofa set",
            "LED Stage wash lights and ambient chandeliers",
            "VIP Bride & Groom / Host Green Rooms",
          ],
          isDefault: true,
        },
        {
          id: "pkg_aura_gold",
          name: "Imperial Royal Feast Tier",
          price: 159999,
          capacity: 400,
          features: [
            "Full Ballroom & Reception Foyer takeover",
            "Lavish 4-Course Multi-Cuisine Gourmet Buffet for 150 guests included",
            "Central 4K LED Screen Backdrop for slideshows & video memories",
            "Valet Parking service for 80 cars",
            "Dedicated event production manager and security team",
          ],
          isDefault: false,
        },
      ],
      addOns: [
        {
          id: "addon_aura_decor",
          name: "Royal Fresh Floral Entrance Archway",
          price: 25000,
          description: "Fresh Dutch roses, orchids, and carnations floral archway",
          maxPerBooking: 1,
        },
        {
          id: "addon_aura_photo",
          name: "Drone & Cinematic Video Crew",
          price: 22000,
          description: "2 videographers + 1 drone pilot with edited celebration film",
          maxPerBooking: 1,
        },
      ],
      scheduleSlots: [
        {
          id: "slot_aura_s1",
          date: new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0],
          startTime: "18:00",
          endTime: "23:30",
          capacity: 500,
          bookedCount: 45,
        },
      ],
      termsAndConditions: [
        "Outside caterers subject to kitchen sanitation approval fee.",
        "Pyrotechnics inside the hall strictly prohibited.",
      ],
      cancellationPolicy: {
        allowed: true,
        maxDaysBefore: 7,
        refundPercentage: 75,
      },
      status: "published",
      isFeatured: true,
      averageRating: 4.92,
      reviewCount: 56,
    },
    {
      title: "The Conservatory Botanical Pavilion & Glasshouse",
      slug: "conservatory-botanical-pavilion",
      organiser: organiserUser2._id,
      category: catMap.get("garden-lawns"),
      shortDescription:
        "Enchanting greenhouse pavilion amidst tropical gardens, ideal for intimate weekday anniversaries and boutique birthdays.",
      fullDescription: `Surround your celebration with cascading flora and sunlight at The Conservatory. 
      
A custom-built Victorian style glass pavilion nestled in 1 acre of manicured botanical gardens. Soft natural lighting, wrought iron vintage furniture, string lighting, and fragrant jasmine blooms make this the most romantic celebration sanctuary.`,
      eventType: "physical",
      venueType: "Botanical Lawn & Pavilion",
      celebrationTypes: ["Birthday Parties", "Baby Showers", "Bridal Showers", "Anniversary Specials"],
      operatingDays: "weekdays_only",
      customOperatingDays: [1, 2, 3, 4, 5], // Mon to Fri
      dailyTimeSlots: [
        {
          id: "slot_cb_lunch",
          title: "Sunshine High-Tea & Luncheon Shift",
          startTime: "11:00",
          endTime: "15:00",
          capacity: 60,
          slotType: "morning",
          isActive: true,
        },
        {
          id: "slot_cb_dinner",
          title: "Twilight Garden Candlelight Soirée",
          startTime: "17:30",
          endTime: "22:30",
          capacity: 90,
          slotType: "evening",
          isActive: true,
        },
      ],
      venue: {
        name: "The Conservatory, Koregaon Park",
        address: "Lane 7, South Main Road, Koregaon Park",
        city: "Pune",
        state: "Maharashtra",
        pincode: "411001",
        googleMapsUrl: "https://maps.google.com/?q=Koregaon+Park+Pune",
      },
      coverImage: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=80",
      ],
      packages: [
        {
          id: "pkg_cb_tea",
          name: "Botanical High-Tea Tier",
          price: 21999,
          capacity: 40,
          features: [
            "Exclusive access to Glasshouse & surrounding rose lawn",
            "Vintage English Tea & Pastry Display setup",
            "Acoustic background jazz audio playlist",
            "Personalized menu chalkboards and table florals",
          ],
          isDefault: true,
        },
        {
          id: "pkg_cb_dinner",
          name: "Twilight Candlelight Soirée",
          price: 45999,
          capacity: 75,
          features: [
            "Full evening buyout of Glasshouse and Fairy Light Garden",
            "Gourmet 3-Course plated dinner for up to 30 guests",
            "Custom Floral Photo Wall for celebratory pictures",
            "Dedicated Butler & Service Captain",
          ],
          isDefault: false,
        },
      ],
      addOns: [
        {
          id: "addon_cb_dessert",
          name: "Artisanal Dessert & Macaron Bar",
          price: 7500,
          description: "Curated French macarons, mini cheesecakes, and chocolate eclairs display",
          maxPerBooking: 1,
        },
      ],
      scheduleSlots: [
        {
          id: "slot_cb_s1",
          date: new Date(Date.now() + 86400000 * 4).toISOString().split("T")[0],
          startTime: "17:30",
          endTime: "22:30",
          capacity: 90,
          bookedCount: 8,
        },
      ],
      termsAndConditions: [
        "Weekday venue only (Monday through Friday).",
        "Gentle acoustic music permitted until 22:00 in outdoor garden.",
      ],
      cancellationPolicy: {
        allowed: true,
        maxDaysBefore: 2,
        refundPercentage: 90,
      },
      status: "published",
      isFeatured: false,
      averageRating: 4.96,
      reviewCount: 24,
    },
    {
      title: "Azure Beachfront Deck & Oceanfront Lawn",
      slug: "azure-beachfront-deck-lawn",
      organiser: organiserUser1._id,
      category: catMap.get("garden-lawns"),
      shortDescription:
        "Direct sand access with oceanfront teakwood deck for sunset beach birthdays, anniversaries, and bonfire parties.",
      fullDescription: `Celebrate steps away from the Arabian Sea waves at Azure Beachfront. 
      
Featuring a 4,000 sq.ft teak wood elevated deck with panoramic ocean horizon, private sand cove, ambient fire torches, cocktail cabanas, and fresh coastal seafood barbecue. Feel the ocean breeze as you dance beneath the stars.`,
      eventType: "physical",
      venueType: "Beachfront Lawn",
      celebrationTypes: ["Birthday Parties", "Anniversary Specials", "Sunset Cocktails", "Private Gatherings"],
      operatingDays: "all_days",
      customOperatingDays: [0, 1, 2, 3, 4, 5, 6],
      dailyTimeSlots: [
        {
          id: "slot_az_sunset",
          title: "Golden Hour Sundowner Shift",
          startTime: "16:00",
          endTime: "20:00",
          capacity: 120,
          slotType: "evening",
          isActive: true,
        },
        {
          id: "slot_az_night",
          title: "Moonlit Beach Gala & Bonfire Shift",
          startTime: "20:30",
          endTime: "01:30",
          capacity: 180,
          slotType: "night",
          isActive: true,
        },
      ],
      venue: {
        name: "Azure Beachfront, Anjuna",
        address: "North Anjuna Beach Coast Road",
        city: "Goa",
        state: "Goa",
        pincode: "403509",
        googleMapsUrl: "https://maps.google.com/?q=Anjuna+Goa",
      },
      coverImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&q=80",
      ],
      packages: [
        {
          id: "pkg_az_sunset",
          name: "Coastal Sundowner Package",
          price: 39999,
          capacity: 80,
          features: [
            "Exclusive Deck reservation during peak golden sunset hour",
            "Signature Tropical Cocktails & Fresh Coconut Welcome",
            "Tiki torches & fairy lit palm trees",
            "Surround sound system ready for playlists",
          ],
          isDefault: true,
        },
        {
          id: "pkg_az_night",
          name: "Starlight Oceanfront VIP Buyout",
          price: 89999,
          capacity: 150,
          features: [
            "Full Beachfront Deck & Sand Cove Buyout",
            "Live Seafood & Tandoori Coastal BBQ Station",
            "Beach Fire Pit with Marshmallow Roasting Kit",
            "Live Percussionist & DJ Setup",
          ],
          isDefault: false,
        },
      ],
      addOns: [
        {
          id: "addon_az_bonfire",
          name: "Beach Fire Pit & Bonfire Setup",
          price: 6000,
          description: "Curated wood fire pit with cushions and ambient seating on sand",
          maxPerBooking: 1,
        },
      ],
      scheduleSlots: [
        {
          id: "slot_az_s1",
          date: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
          startTime: "16:00",
          endTime: "20:00",
          capacity: 120,
          bookedCount: 18,
        },
      ],
      termsAndConditions: [
        "Beach permits managed by the venue.",
        "Respect local shoreline environmental guidelines.",
      ],
      cancellationPolicy: {
        allowed: true,
        maxDaysBefore: 4,
        refundPercentage: 80,
      },
      status: "published",
      isFeatured: true,
      averageRating: 4.97,
      reviewCount: 38,
    },
    {
      title: "The Velvet Speakeasy & Private Wine Cellar",
      slug: "velvet-speakeasy-wine-cellar",
      organiser: organiserUser1._id,
      category: catMap.get("boutique-venues"),
      shortDescription:
        "Hidden underground cellar with vintage leather booths, craft mixology bar, and dim sultry lighting for intimate celebrations.",
      fullDescription: `Concealed behind an unmarked bookcase door, The Velvet Speakeasy provides the ultimate aura of exclusivity for intimate birthday parties and anniversary dinners. 
      
Features exposed brick arches, velvet Chesterfield booths, curated cellar of 200+ global wines, custom ice-carving mixology, and high-fidelity vinyl acoustic playback.`,
      eventType: "physical",
      venueType: "Boutique Speakeasy",
      celebrationTypes: ["Birthday Parties", "Anniversary Specials", "Intimate Milestones", "Cocktail Sundowners"],
      operatingDays: "custom_days",
      customOperatingDays: [2, 3, 4, 5, 6], // Tue, Wed, Thu, Fri, Sat
      dailyTimeSlots: [
        {
          id: "slot_vs_tapas",
          title: "Evening Tapas & Wine Shift",
          startTime: "17:30",
          endTime: "21:00",
          capacity: 45,
          slotType: "evening",
          isActive: true,
        },
        {
          id: "slot_vs_late",
          title: "Late-Night Speakeasy & Cocktails",
          startTime: "21:30",
          endTime: "02:00",
          capacity: 60,
          slotType: "night",
          isActive: true,
        },
      ],
      venue: {
        name: "The Velvet Cellar, Connaught Place",
        address: "Middle Circle, Block B, Connaught Place",
        city: "Delhi NCR",
        state: "Delhi",
        pincode: "110001",
        googleMapsUrl: "https://maps.google.com/?q=Connaught+Place+Delhi",
      },
      coverImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=80",
      ],
      packages: [
        {
          id: "pkg_vs_reserve",
          name: "Cellar Reserve Experience",
          price: 27999,
          capacity: 35,
          features: [
            "Exclusive 3.5 hour buyout of Private Cellar Room",
            "Artisanal Cheese & Charcuterie Tasting Board",
            "Welcome Glasses of Sparkling Wine for all guests",
            "Personalized Vinyl Record Music Selector",
          ],
          isDefault: true,
        },
        {
          id: "pkg_vs_sommelier",
          name: "Master Mixology & Chef's Table",
          price: 59999,
          capacity: 50,
          features: [
            "Full Speakeasy Venue Buyout for the evening",
            "Dedicated Head Mixologist crafting personalized cocktail menus",
            "7-Course Gourmet Tapas Tasting for up to 20 guests included",
            "Secret password custom-branded invitations",
          ],
          isDefault: false,
        },
      ],
      addOns: [
        {
          id: "addon_vs_flight",
          name: "Sommelier Guided Wine Flight Tasting",
          price: 9500,
          description: "Tasting flight of 4 reserve vintage wines with guided notes",
          maxPerBooking: 1,
        },
      ],
      scheduleSlots: [
        {
          id: "slot_vs_s1",
          date: new Date(Date.now() + 86400000 * 6).toISOString().split("T")[0],
          startTime: "21:30",
          endTime: "02:00",
          capacity: 60,
          bookedCount: 12,
        },
      ],
      termsAndConditions: [
        "Operating Tuesday through Saturday only.",
        "Dress code: Smart Casual / Elegant Evening.",
      ],
      cancellationPolicy: {
        allowed: true,
        maxDaysBefore: 2,
        refundPercentage: 85,
      },
      status: "published",
      isFeatured: false,
      averageRating: 4.98,
      reviewCount: 19,
    },
  ];

  const createdEvents = await Event.insertMany(eventsData);

  // Initial Sample Order & Booking for Rohan Verma
  const event1 = createdEvents[0];
  const orderNumber = "ORD-20260918-CELEB1";
  const bookingRef = "CLB-MUM-772";

  const sampleOrder = await Order.create({
    orderNumber,
    customer: customerUser._id,
    bookings: [],
    subtotal: 24999,
    platformFee: 1250,
    taxAmount: 4725,
    discountAmount: 0,
    totalAmount: 30974,
    currency: "INR",
    paymentStatus: "paid",
    paymentGateway: "razorpay",
    razorpayOrderId: "order_celeb_99812",
    razorpayPaymentId: "pay_celeb_44719",
    razorpaySignature: "demo_signature_valid",
    customerDetails: {
      name: customerUser.name,
      email: customerUser.email,
      phone: customerUser.phone || "+91 98999 11223",
    },
  });

  const sampleBooking = await Booking.create({
    bookingReference: bookingRef,
    order: sampleOrder._id,
    event: event1._id,
    customer: customerUser._id,
    organiser: organiserUser1._id,
    packageDetails: {
      packageId: "pkg_gh_silver",
      name: "Silver Celebration Tier",
      price: 24999,
    },
    guestsCount: 25,
    selectedSlot: {
      slotId: "slot_gh_sunset",
      date: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
      startTime: "16:30",
      endTime: "20:00",
    },
    selectedAddOns: [
      {
        addOnId: "addon_gh_cake",
        name: "Custom 3-Tier Fondant Celebration Cake",
        unitPrice: 4500,
        quantity: 1,
        total: 4500,
      },
    ],
    subtotal: 29499,
    totalAmount: 35500,
    status: "confirmed",
    checkInStatus: "pending",
    qrCodeData: JSON.stringify({
      ref: bookingRef,
      venue: event1.title,
      customer: customerUser.name,
      guests: 25,
      date: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
      shift: "Sunset Gala & Cocktail Shift",
    }),
    refundDetails: { status: "none", amount: 0 },
  });

  sampleOrder.bookings = [sampleBooking._id];
  await sampleOrder.save();

  // Review
  await Review.create({
    event: event1._id,
    customer: customerUser._id,
    booking: sampleBooking._id,
    rating: 5,
    comment:
      "Celebrated my 30th birthday at The Glasshouse Penthouse! The sunset shift was pure magic, the city skyline views blew our guests away, and the catering was stellar!",
    organiserResponse: "It was an honor hosting your milestone celebration, Rohan! Congratulations again!",
    isApproved: true,
  });

  return {
    usersCount: 4,
    categoriesCount: categories.length,
    eventsCount: createdEvents.length,
    ordersCount: 1,
    bookingsCount: 1,
  };
}
