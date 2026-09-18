"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/utils";
import { MapPin, Star, CheckCircle, ArrowRight, Sparkles, Clock } from "lucide-react";

interface EventCardProps {
  event: {
    _id: string;
    title: string;
    slug: string;
    shortDescription: string;
    coverImage: string;
    eventType: "physical" | "online";
    venueType?: string;
    celebrationTypes?: string[];
    operatingDays?: string;
    venue?: {
      name?: string;
      city?: string;
    };
    category?: {
      name: string;
      slug: string;
    };
    organiser?: {
      name: string;
      companyName?: string;
      isVerified?: boolean;
    };
    packages?: Array<{
      price: number;
    }>;
    dailyTimeSlots?: Array<{
      title: string;
      startTime: string;
      endTime: string;
    }>;
    averageRating?: number;
    reviewCount?: number;
    isFeatured?: boolean;
  };
}

export default function EventCard({ event }: EventCardProps) {
  const prices = (event.packages || []).map((p) => p.price);
  const lowestPrice = prices.length ? Math.min(...prices) : 0;

  const operatingLabel =
    event.operatingDays === "weekdays_only"
      ? "Weekdays Only"
      : event.operatingDays === "weekends_only"
      ? "Weekends Only"
      : "Open Daily";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="group bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-white/10 hover:border-purple-500/50 overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-purple-500/10 flex flex-col h-full transition-all duration-300 relative"
    >
      {/* Cover Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
        <img
          src={event.coverImage}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* Gradient backdrop overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-90 transition" />

        {/* Badges on image */}
        <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-2 z-10">
          {event.venueType && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-950/80 backdrop-blur-md text-white border border-white/15 shadow-sm">
              {event.venueType}
            </span>
          )}
          {event.isFeatured && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Featured
            </span>
          )}
        </div>

        {/* City tag */}
        <div className="absolute top-3.5 right-3.5 z-10">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-950/80 text-purple-300 border border-purple-500/30 backdrop-blur-md flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-purple-400" />
            {event.venue?.city || "In-person"}
          </span>
        </div>

        {/* Operating schedule pill */}
        <div className="absolute bottom-3 left-3.5 text-slate-200 z-10 flex items-center gap-1.5 text-xs font-semibold bg-slate-950/80 px-3 py-1 rounded-full border border-white/15 backdrop-blur-md">
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          <span>{operatingLabel}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          {/* Host info & rating */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-slate-400">
              <span>Host:</span>
              <span className="font-semibold text-slate-200 truncate">
                {event.organiser?.companyName || event.organiser?.name || "Verified Partner"}
              </span>
              {event.organiser?.isVerified && (
                <CheckCircle className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              )}
            </div>

            {event.averageRating ? (
              <span className="flex items-center gap-1 text-amber-400 font-bold text-xs">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {event.averageRating.toFixed(1)}
              </span>
            ) : null}
          </div>

          {/* Title */}
          <Link href={`/events/${event.slug}`}>
            <h3 className="text-lg font-heading font-extrabold text-white group-hover:text-purple-300 transition-colors duration-200 line-clamp-2 leading-snug">
              {event.title}
            </h3>
          </Link>

          {/* Short description */}
          <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed font-normal">
            {event.shortDescription}
          </p>

          {/* Celebration tags */}
          {event.celebrationTypes && event.celebrationTypes.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {event.celebrationTypes.slice(0, 3).map((occ, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-xl text-xs font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20"
                >
                  {occ}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer: Starting price & Book button */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
          <div>
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 block">
              Package from
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-heading font-black text-white">
                {formatPrice(lowestPrice)}
              </span>
              <span className="text-xs text-slate-400 font-medium">/ package</span>
            </div>
          </div>

          <Link
            href={`/events/${event.slug}`}
            className="px-5 py-2.5 sm:px-6 sm:py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-size-200 hover:bg-right hover:from-purple-500 hover:to-pink-500 text-white text-xs sm:text-sm font-heading font-bold inline-flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-purple-900/30 hover:shadow-purple-800/50 active:scale-[0.98] transition-all duration-200"
          >
            <span>Book Venue</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
