import React from "react";
import Link from "next/link";
import { connectToDatabase } from "@/lib/db";
import { Event, Category, CmsContent } from "@/models";
import { DEFAULT_CMS_DATA } from "@/lib/defaultCms";
import { seedDatabase } from "@/lib/seedData";
import EventCard from "@/components/events/EventCard";
import {
  Calendar,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Ticket,
  ArrowRight,
  MapPin,
  PartyPopper,
  Wine,
  Heart,
  Cake,
  Building,
  TreePine,
  CheckCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";

const OCCASIONS = [
  { label: "Birthday Bashes", icon: <Cake className="w-4 h-4 text-pink-400" />, href: "/events?search=Birthday" },
  { label: "Romantic Anniversaries", icon: <Heart className="w-4 h-4 text-rose-400" />, href: "/events?search=Anniversary" },
  { label: "Rooftop Sundowners", icon: <Wine className="w-4 h-4 text-purple-400" />, href: "/events?search=Rooftop" },
  { label: "Private Farmhouses", icon: <TreePine className="w-4 h-4 text-emerald-400" />, href: "/events?search=Farmhouse" },
  { label: "Weddings & Engagements", icon: <Sparkles className="w-4 h-4 text-amber-400" />, href: "/events?search=Wedding" },
  { label: "Corporate Galas", icon: <Building className="w-4 h-4 text-indigo-400" />, href: "/events?search=Corporate" },
];

export default async function HomePage() {
  let categories: any[] = [];
  let featuredEvents: any[] = [];
  let trendingEvents: any[] = [];
  let cmsData = DEFAULT_CMS_DATA;

  try {
    await connectToDatabase();

    const [catRes, featRes, trendRes, cmsRes] = await Promise.all([
      Category.find({ isActive: true }).lean(),
      Event.find({ status: "published", isFeatured: true })
        .populate("category", "name slug")
        .populate("organiser", "name companyName isVerified")
        .limit(3)
        .lean(),
      Event.find({ status: "published" })
        .populate("category", "name slug")
        .populate("organiser", "name companyName isVerified")
        .sort({ reviewCount: -1, averageRating: -1 })
        .limit(6)
        .lean(),
      CmsContent.findOne().lean(),
    ]);

    categories = catRes;
    featuredEvents = featRes;
    trendingEvents = trendRes;
    if (cmsRes) {
      cmsData = cmsRes as any;
    }

    if (categories.length === 0 || trendingEvents.length === 0) {
      await seedDatabase();
      [categories, featuredEvents, trendingEvents] = await Promise.all([
        Category.find({ isActive: true }).lean(),
        Event.find({ status: "published", isFeatured: true })
          .populate("category", "name slug")
          .populate("organiser", "name companyName isVerified")
          .limit(3)
          .lean(),
        Event.find({ status: "published" })
          .populate("category", "name slug")
          .populate("organiser", "name companyName isVerified")
          .sort({ reviewCount: -1, averageRating: -1 })
          .limit(6)
          .lean(),
      ]);
    }
  } catch (error) {
    console.warn("Database connection pending");
  }

  // Convert Mongoose BSON documents (which contain ObjectIds with toJSON/buffer methods and Date objects)
  // to plain serializable JavaScript objects before passing to Client Components (like EventCard)
  featuredEvents = JSON.parse(JSON.stringify(featuredEvents));
  trendingEvents = JSON.parse(JSON.stringify(trendingEvents));
  cmsData = JSON.parse(JSON.stringify(cmsData));

  const hero = cmsData.hero || DEFAULT_CMS_DATA.hero;
  const occasionsList = cmsData.occasions && cmsData.occasions.length > 0 ? cmsData.occasions : OCCASIONS;

  return (
    <div className="space-y-24 pb-28 relative overflow-hidden bg-slate-950 text-slate-100">
      {/* Background Ambient Glow Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[600px] bg-gradient-to-tr from-purple-600/15 via-indigo-600/15 to-pink-600/15 blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute top-96 -left-48 w-[550px] h-[550px] bg-purple-900/20 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-[850px] -right-48 w-[550px] h-[550px] bg-pink-900/15 blur-[140px] pointer-events-none rounded-full" />

      {/* Hero Section */}
      <section className="relative z-10 pt-24 pb-14 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto space-y-8">
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs sm:text-sm font-bold tracking-wide backdrop-blur-md shadow-lg shadow-purple-950/40">
          <PartyPopper className="w-4 h-4 text-purple-400" />
          <span>{hero.badgeText || "India's Premier Venue & Celebration Partner Marketplace"}</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-heading font-black tracking-tight leading-[1.08] text-white">
          {hero.title || "Celebrate Life's Moments at"}{" "}
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
            {hero.highlightedTitle || "Dream Venues."}
          </span>
        </h1>

        <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto font-normal leading-relaxed">
          {hero.subtitle ||
            "From high-energy birthday parties and romantic anniversaries to private poolside farmhouses and skyline rooftop soirées. Choose a date on our interactive calendar, customize your celebration package, and book instantly."}
        </p>

        {/* Occasion Quick Chips */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {occasionsList.map((occ, idx) => (
            <Link
              key={idx}
              href={occ.href}
              className="px-4 py-2.5 rounded-2xl bg-slate-900/80 hover:bg-purple-900/30 border border-white/10 hover:border-purple-500/50 text-slate-200 hover:text-white text-xs sm:text-sm font-semibold flex items-center gap-2.5 backdrop-blur-md transition shadow-md"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>{occ.label}</span>
            </Link>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          <Link
            href={hero.primaryCta?.href || "/events"}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-purple-900/40 flex items-center gap-2 transition hover:scale-[1.02]"
          >
            <span>{hero.primaryCta?.label || "Explore All Venues"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href={hero.secondaryCta?.href || "/register"}
            className="px-8 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-white/10 border border-white/15 text-slate-200 hover:text-white font-bold text-sm sm:text-base backdrop-blur-md transition hover:scale-[1.02]"
          >
            {hero.secondaryCta?.label || "Become a Hosting Partner"}
          </Link>
        </div>

        {/* Hero Stats */}
        {hero.stats && hero.stats.length > 0 && (
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto border-t border-white/10">
            {hero.stats.map((stat, sIdx) => (
              <div key={sIdx} className="space-y-0.5">
                <div className="text-xl sm:text-2xl font-black font-heading text-white">{stat.value}</div>
                <div className="text-xs text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Featured Venues & Partners */}
      {featuredEvents.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
            <div className="space-y-1.5">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Handpicked Celebration Spaces
              </span>
              <h2 className="text-2xl sm:text-4xl font-heading font-black text-white tracking-tight">
                Featured Venues of the Month
              </h2>
            </div>
            <Link
              href="/events?featured=true"
              className="text-xs sm:text-sm font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1.5 transition"
            >
              <span>View All Venues</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredEvents.map((event: any) => (
              <EventCard key={event._id.toString()} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* Trending Spaces */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1.5">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
              <PartyPopper className="w-4 h-4" /> Most Popular Celebrations
            </span>
            <h2 className="text-2xl sm:text-4xl font-heading font-black text-white tracking-tight">
              Top Trending Venues & Packages
            </h2>
          </div>
          <Link
            href="/events?sort=popular"
            className="text-xs sm:text-sm font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1.5 transition"
          >
            <span>Explore Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trendingEvents.map((event: any) => (
            <EventCard key={event._id.toString()} event={event} />
          ))}
        </div>
      </section>

      {/* How it Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 p-8 sm:p-14 space-y-12 shadow-2xl">
          <div className="text-center max-w-2xl mx-auto space-y-2.5">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-purple-400">
              The Celebration Experience
            </span>
            <h2 className="text-2xl sm:text-4xl font-heading font-black text-white tracking-tight">
              How Booking a Venue Works
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Four simple steps from finding your dream space to partying with your loved ones
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-950/60 border border-white/10 space-y-3.5">
              <div className="w-11 h-11 rounded-2xl bg-purple-500/20 text-purple-400 font-heading font-black flex items-center justify-center text-base shadow-sm">
                01
              </div>
              <h3 className="text-base font-heading font-bold text-white">Find Your Space</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Filter by occasion, rooftop vs farmhouse, city location, capacity, and luxury packages.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950/60 border border-white/10 space-y-3.5">
              <div className="w-11 h-11 rounded-2xl bg-pink-500/20 text-pink-400 font-heading font-black flex items-center justify-center text-base shadow-sm">
                02
              </div>
              <h3 className="text-base font-heading font-bold text-white">Pick Date & Shift</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Select your celebration date on the interactive calendar and choose brunch, sunset gala, or midnight party shift.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950/60 border border-white/10 space-y-3.5">
              <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 text-indigo-400 font-heading font-black flex items-center justify-center text-base shadow-sm">
                03
              </div>
              <h3 className="text-base font-heading font-bold text-white">Bundle Custom Add-ons</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Add live acoustic bands, poolside BBQ chef, LED marquee letters, custom designer cakes, and bartending.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950/60 border border-white/10 space-y-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 font-heading font-black flex items-center justify-center text-base shadow-sm">
                04
              </div>
              <h3 className="text-base font-heading font-bold text-white">Instant Pass & Gate QR</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Receive instant confirmation with a digital ticket pass and gate check-in QR code for your celebration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Partner CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="rounded-3xl bg-gradient-to-r from-purple-900/80 via-indigo-950/90 to-slate-900 border border-purple-500/30 p-8 sm:p-14 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl backdrop-blur-xl">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-purple-300">
              For Venue Owners & Event Curators
            </span>
            <h2 className="text-2xl sm:text-4xl font-heading font-black leading-snug">
              Host Celebrations & Maximize Your Space
            </h2>
            <p className="text-sm sm:text-base leading-relaxed">
              List your banquet hall, rooftop, or private farmhouse. Define your weekday/weekend availability,
              set multiple daily shifts, offer customized celebration packages, and receive direct payouts.
            </p>
          </div>
          <div className="shrink-0 flex flex-col sm:flex-row gap-3.5">
            <Link
              href="/register"
              className="px-7 py-3.5 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 font-bold text-xs sm:text-sm shadow-xl transition text-center"
            >
              Become a Venue Partner
            </Link>
            <Link
              href="/organiser/dashboard"
              className="px-7 py-3.5 rounded-2xl bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 border border-purple-400/30 font-bold text-xs sm:text-sm transition text-center"
            >
              Partner Studio
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
