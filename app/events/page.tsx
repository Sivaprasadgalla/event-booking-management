"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import EventCard from "@/components/events/EventCard";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  SlidersHorizontal,
  Sparkles,
  X,
  Building2,
  PartyPopper,
  Calendar,
  MapPin,
} from "lucide-react";

const OCCASIONS = [
  "All Occasions",
  "Birthday Parties",
  "Anniversary Specials",
  "Cocktail Sundowners",
  "Private Reunions",
  "Intimate Weddings",
];

function EventsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [events, setEvents] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [selectedCity, setSelectedCity] = useState(searchParams.get("city") || "all");
  const [selectedOccasion, setSelectedOccasion] = useState(searchParams.get("occasion") || "All Occasions");
  const [sort, setSort] = useState(searchParams.get("sort") || "rating");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Fetch categories
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(console.error);
  }, []);

  // Fetch filtered events
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (selectedCategory && selectedCategory !== "all") params.set("category", selectedCategory);
    if (selectedCity && selectedCity !== "all") params.set("city", selectedCity);
    if (sort) params.set("sort", sort);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);

    fetch(`/api/events?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        let evts = data.events || [];
        if (selectedOccasion && selectedOccasion !== "All Occasions") {
          evts = evts.filter((e: any) =>
            (e.celebrationTypes || []).some(
              (occ: string) => occ.toLowerCase() === selectedOccasion.toLowerCase()
            )
          );
        }
        setEvents(evts);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, selectedCategory, selectedCity, selectedOccasion, sort, minPrice, maxPrice]);

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setSelectedCity("all");
    setSelectedOccasion("All Occasions");
    setSort("rating");
    setMinPrice("");
    setMaxPrice("");
    router.push("/events");
  };

  const hasActiveFilters =
    search ||
    selectedCategory !== "all" ||
    selectedCity !== "all" ||
    selectedOccasion !== "All Occasions" ||
    minPrice ||
    maxPrice;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-10 w-[450px] h-[450px] bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Header & Search Banner */}
        <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-r from-slate-900/90 via-purple-950/40 to-slate-900/90 backdrop-blur-xl p-8 sm:p-12 shadow-2xl">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>Exclusive Celebration Venues & Hosting Partners</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Discover & Reserve Your Dream Celebration Venue
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              From sky-high rooftops and private poolside farmhouses to royal ballroom banquet halls, book verified celebration partners with real-time slot reservations.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mt-8 max-w-2xl relative">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                placeholder="Search venue names, cities, occasions, or amenities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-12 py-3.5 bg-white/10 hover:bg-white/15 focus:bg-slate-900 text-white placeholder:text-slate-400 rounded-2xl border border-white/15 outline-none transition text-sm backdrop-blur-md focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-4 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Occasion Fast Filter Chips */}
          <div className="flex flex-wrap gap-2.5 pt-6">
            {OCCASIONS.map((occ) => {
              const active = selectedOccasion === occ;
              return (
                <button
                  key={occ}
                  onClick={() => setSelectedOccasion(occ)}
                  className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition ${
                    active
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-900/40"
                      : "bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {occ}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Layout: Filters Sidebar + Grid */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden flex items-center justify-between">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs sm:text-sm font-semibold flex items-center gap-2 text-white shadow-sm"
            >
              <Filter className="w-4 h-4 text-purple-400" />
              Filters {hasActiveFilters && "•"}
            </button>

            <span className="text-xs sm:text-sm text-slate-400 font-medium">
              {events.length} {events.length === 1 ? "venue partner" : "venue partners"} found
            </span>
          </div>

          {/* Filters Sidebar */}
          <aside
            className={`w-full lg:w-72 shrink-0 space-y-6 ${
              showMobileFilters ? "block" : "hidden lg:block"
            }`}
          >
            <div className="bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-sm font-heading font-bold text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-purple-400" /> Filters
                </span>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs font-semibold text-rose-400 hover:underline"
                  >
                    Reset All
                  </button>
                )}
              </div>

              {/* Category filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Venue Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-white/10 bg-slate-950 text-sm text-white outline-none focus:border-purple-500"
                >
                  <option value="all">All Venue Styles</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* City filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  City / Location
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-white/10 bg-slate-950 text-sm text-white outline-none focus:border-purple-500"
                >
                  <option value="all">All Cities</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Delhi NCR">Delhi NCR</option>
                  <option value="Goa">Goa</option>
                  <option value="Pune">Pune</option>
                  <option value="Hyderabad">Hyderabad</option>
                </select>
              </div>

              {/* Price Range */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Package Budget (₹)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-white/10 bg-slate-950 text-sm text-white placeholder:text-slate-600 outline-none focus:border-purple-500"
                  />
                  <span className="text-slate-500 text-sm">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-white/10 bg-slate-950 text-sm text-white placeholder:text-slate-600 outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Events Grid Area */}
          <div className="flex-1 space-y-6">
            {/* Top Sort Bar */}
            <div className="hidden lg:flex items-center justify-between bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/10 p-3.5 px-6 shadow-xl">
              <span className="text-xs font-medium text-slate-400">
                Displaying <span className="text-white font-bold">{events.length}</span> celebration venues
              </span>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 font-medium">Sort by:</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-white/10 text-xs text-white bg-slate-950 font-semibold outline-none focus:border-purple-500"
                >
                  <option value="rating">Highest Rated Hosts</option>
                  <option value="popular">Most Celebrated</option>
                  <option value="price_asc">Budget: Low to High</option>
                  <option value="price_desc">Budget: High to Low</option>
                  <option value="newest">Recently Added</option>
                </select>
              </div>
            </div>

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-96 rounded-3xl bg-slate-900/50 border border-white/5 animate-pulse"
                  />
                ))}
              </div>
            ) : events.length === 0 ? (
              <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-400">
                  <Search className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-white">No venues match your filters</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Try widening your budget range, resetting occasion categories, or searching for another city.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold rounded-xl shadow-lg shadow-purple-900/30 transition"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {events.map((event) => (
                  <EventCard key={event._id} event={event} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EventsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-slate-400">Loading celebration venues...</div>}>
      <EventsContent />
    </Suspense>
  );
}
