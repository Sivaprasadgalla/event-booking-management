"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { formatPrice, formatEventDate } from "@/lib/utils";
import {
  Building2,
  PlusCircle,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Ticket,
  DollarSign,
  Users,
  MapPin,
  Calendar,
  Sparkles,
  Trash2,
  X,
  AlertTriangle,
  ArrowRight,
  LayoutGrid,
  List,
  Filter,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

export default function OrganiserEventsPage() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [events, setEvents] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalVenues: 0,
    publishedCount: 0,
    pendingCount: 0,
    rejectedCount: 0,
    draftCount: 0,
    totalRevenue: 0,
    totalBookings: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Deletion Modal
  const [deleteTargetEvent, setDeleteTargetEvent] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeBookingsWarning, setActiveBookingsWarning] = useState<number | null>(null);

  const fetchEvents = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (search.trim()) params.set("search", search.trim());

    fetch(`/api/organiser/events?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.events) {
          setEvents(data.events);
          if (data.stats) {
            setStats(data.stats);
          }
        }
      })
      .catch((err) => {
        console.error("Failed to fetch organiser venues:", err);
        toast.error("Could not load your venue listings.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isLoading && (!user || (user.role !== "organiser" && user.role !== "admin"))) {
      router.push("/login?returnUrl=/organiser/events");
      return;
    }
    if (user) {
      fetchEvents();
    }
  }, [user, isLoading, statusFilter, search]);

  const handleDeleteEvent = async (force: boolean = false) => {
    if (!deleteTargetEvent) return;
    try {
      setIsDeleting(true);
      const url = `/api/organiser/events/${deleteTargetEvent._id}${force ? "?force=true" : ""}`;
      const res = await fetch(url, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.status === 409 && data.hasActiveBookings) {
        setActiveBookingsWarning(data.activeBookingsCount);
        toast.warning(
          `This venue has ${data.activeBookingsCount} active reservation(s). Confirm force deletion to proceed.`,
          "Active Bookings Detected"
        );
        return;
      }

      if (res.ok) {
        toast.success(
          data.message || `Venue "${deleteTargetEvent.title}" removed successfully.`,
          "Venue Removed"
        );
        setEvents((prev) => prev.filter((e) => e._id !== deleteTargetEvent._id));
        setStats((prev: any) => ({
          ...prev,
          totalVenues: Math.max(0, prev.totalVenues - 1),
          publishedCount:
            deleteTargetEvent.status === "published"
              ? Math.max(0, prev.publishedCount - 1)
              : prev.publishedCount,
          pendingCount:
            deleteTargetEvent.status === "pending_approval"
              ? Math.max(0, prev.pendingCount - 1)
              : prev.pendingCount,
        }));
        setDeleteTargetEvent(null);
        setActiveBookingsWarning(null);
      } else {
        toast.error(data.error || "Failed to remove venue listing.", "Deletion Error");
      }
    } catch {
      toast.error("An unexpected error occurred while deleting the venue.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Hero & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>Host Partner Properties</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white flex items-center gap-3">
            <span>My Venues & Celebration Spaces</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your listed celebration spaces, party shifts, pricing packages, and live guest booking statuses.
          </p>
        </div>

        <Link
          href="/organiser/events/new"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-heading font-bold text-sm shadow-xl shadow-purple-900/30 transition self-start sm:self-auto shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>List New Venue</span>
        </Link>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 border border-white/10 rounded-3xl p-5 space-y-1.5 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total Properties</span>
            <Building2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
            {stats.totalVenues}
          </div>
          <p className="text-[11px] text-slate-500">Across your host account</p>
        </div>

        <div className="bg-slate-900/70 border border-emerald-500/20 rounded-3xl p-5 space-y-1.5 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Live on Marketplace</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-extrabold text-emerald-400">
            {stats.publishedCount}
          </div>
          <p className="text-[11px] text-emerald-300/60">Open for guest reservations</p>
        </div>

        <div className="bg-slate-900/70 border border-amber-500/20 rounded-3xl p-5 space-y-1.5 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>In Review</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-extrabold text-amber-400">
            {stats.pendingCount}
          </div>
          <p className="text-[11px] text-amber-300/60">Pending admin verification</p>
        </div>

        <div className="bg-slate-900/70 border border-purple-500/20 rounded-3xl p-5 space-y-1.5 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Gross Revenue</span>
            <DollarSign className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-extrabold text-purple-300 font-mono">
            {formatPrice(stats.totalRevenue)}
          </div>
          <p className="text-[11px] text-slate-400">From {stats.totalBookings} reservation passes</p>
        </div>
      </div>

      {/* Control Toolbar: Search, Filters & View Toggle */}
      <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-4 sm:p-5 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search venue name, city, or type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-white/10 text-white text-xs outline-none focus:border-purple-400 transition placeholder:text-slate-500"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 md:pb-0">
          {[
            { id: "all", label: "All Venues" },
            { id: "published", label: "Published & Live" },
            { id: "pending_approval", label: "Under Review" },
            { id: "draft", label: "Drafts" },
            { id: "rejected", label: "Action Needed" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                statusFilter === tab.id
                  ? "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-900/30"
                  : "bg-white/5 text-slate-400 border-transparent hover:text-white hover:bg-white/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 self-end md:self-auto bg-slate-950 p-1 rounded-2xl border border-white/10 shrink-0">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-xl transition ${
              viewMode === "grid"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`p-2 rounded-xl transition ${
              viewMode === "table"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
            title="Table View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-24 text-center space-y-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading your listed celebration spaces...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="bg-slate-900/40 border border-dashed border-white/10 rounded-3xl p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-heading font-bold text-white">No venues found</h3>
            <p className="text-xs text-slate-400 mt-1">
              {search || statusFilter !== "all"
                ? "No celebration venues matched your filter criteria. Try clearing filters or search keywords."
                : "You haven't listed any celebration spaces yet. List your property to receive direct guest bookings!"}
            </p>
          </div>
          {search || statusFilter !== "all" ? (
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
              }}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition"
            >
              Reset Filters
            </button>
          ) : (
            <Link
              href="/organiser/events/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-heading font-bold shadow-lg shadow-purple-900/30 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List Your First Venue</span>
            </Link>
          )}
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((evt) => {
            const isLive = evt.status === "published";
            const isPending = evt.status === "pending_approval";
            const isRejected = evt.status === "rejected";

            return (
              <div
                key={evt._id}
                className="bg-slate-900/80 border border-white/10 hover:border-purple-500/30 rounded-3xl overflow-hidden flex flex-col justify-between shadow-xl transition-all duration-300 group"
              >
                <div>
                  {/* Image & Status Overlays */}
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                    <img
                      src={
                        evt.coverImage ||
                        "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80"
                      }
                      alt={evt.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                    {/* Top Status Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border ${
                          isLive
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                            : isPending
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                            : isRejected
                            ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                            : "bg-slate-800/80 text-slate-300 border-white/10"
                        }`}
                      >
                        {isLive && <CheckCircle className="w-3 h-3 text-emerald-400" />}
                        {isPending && <Clock className="w-3 h-3 text-amber-400" />}
                        {isRejected && <AlertCircle className="w-3 h-3 text-rose-400" />}
                        <span>{evt.status.replace("_", " ")}</span>
                      </span>

                      {evt.isFeatured && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/30 text-amber-300 border border-amber-500/40 backdrop-blur-md">
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          <span>Featured</span>
                        </span>
                      )}
                    </div>

                    {/* Bottom Venue Type & City Tag */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                      <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md font-semibold text-[11px] border border-white/10">
                        {evt.venueType || "Celebration Space"}
                      </span>
                      {evt.venue?.city && (
                        <span className="flex items-center gap-1 text-[11px] font-medium text-slate-300 bg-black/60 px-2 py-0.5 rounded-lg border border-white/10 backdrop-blur-md">
                          <MapPin className="w-3 h-3 text-purple-400" />
                          <span>{evt.venue.city}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-4">
                    <div>
                      <h3 className="font-heading font-bold text-base text-white group-hover:text-purple-300 transition line-clamp-1">
                        {evt.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {evt.shortDescription || evt.venue?.address}
                      </p>
                    </div>

                    {/* Shift Badges */}
                    {evt.dailyTimeSlots && evt.dailyTimeSlots.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                          Daily Shifts ({evt.dailyTimeSlots.length})
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {evt.dailyTimeSlots.slice(0, 2).map((s: any, idx: number) => (
                            <span
                              key={idx}
                              className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300 inline-flex items-center gap-1"
                            >
                              <Clock className="w-3 h-3 text-purple-400" />
                              <span>{s.title || `${s.startTime} - ${s.endTime}`}</span>
                            </span>
                          ))}
                          {evt.dailyTimeSlots.length > 2 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">
                              +{evt.dailyTimeSlots.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Admin Feedback Warning if Rejected or Action Needed */}
                    {isRejected && evt.adminFeedback && (
                      <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs space-y-1">
                        <span className="font-bold flex items-center gap-1.5 text-rose-300">
                          <AlertTriangle className="w-3.5 h-3.5" /> Admin Feedback:
                        </span>
                        <p className="text-[11px] text-rose-300/90 leading-relaxed">
                          {evt.adminFeedback}
                        </p>
                      </div>
                    )}

                    {/* Performance Metrics Box */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-950/80 p-3 rounded-2xl border border-white/5 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Confirmed Passes</span>
                        <span className="font-heading font-bold text-white text-sm">
                          {evt.totalBookings || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Gross Revenue</span>
                        <span className="font-heading font-bold text-emerald-400 text-sm font-mono">
                          {formatPrice(evt.totalRevenue || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-5 pt-0 flex items-center justify-between gap-2 border-t border-white/5 mt-2">
                  <div className="text-xs">
                    <span className="text-[10px] text-slate-500 block">Tier Pricing</span>
                    <span className="font-bold text-purple-300 font-mono text-xs">
                      From {formatPrice(evt.startingPrice || 0)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Public link */}
                    <Link
                      href={`/events/${evt.slug}`}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition"
                      title="View public marketplace page"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    {/* Bookings link */}
                    <Link
                      href={`/organiser/bookings`}
                      className="p-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 hover:text-purple-200 border border-purple-500/30 transition flex items-center gap-1 text-xs font-semibold"
                      title="View guest bookings"
                    >
                      <Ticket className="w-4 h-4" />
                    </Link>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteTargetEvent(evt);
                        setActiveBookingsWarning(null);
                      }}
                      className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-white/10 hover:border-rose-500/20 transition"
                      title="Delete venue"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-slate-900/60 border border-white/10 rounded-3xl shadow-xl backdrop-blur-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 uppercase tracking-wider text-[11px] border-b border-white/10 bg-white/5">
                  <th className="py-4 px-5 font-semibold">Venue Property</th>
                  <th className="py-4 px-5 font-semibold">Status</th>
                  <th className="py-4 px-5 font-semibold">Shifts / Slots</th>
                  <th className="py-4 px-5 font-semibold">Starting Price</th>
                  <th className="py-4 px-5 font-semibold">Bookings & Revenue</th>
                  <th className="py-4 px-5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {events.map((evt) => {
                  const isLive = evt.status === "published";
                  const isPending = evt.status === "pending_approval";
                  const isRejected = evt.status === "rejected";

                  return (
                    <tr key={evt._id} className="hover:bg-white/[0.02] transition">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              evt.coverImage ||
                              "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=150&q=80"
                            }
                            alt={evt.title}
                            className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0"
                          />
                          <div>
                            <div className="font-heading font-bold text-white text-sm line-clamp-1">
                              {evt.title}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                              <span>{evt.venueType || "Celebration Space"}</span>
                              {evt.venue?.city && (
                                <>
                                  <span>&bull;</span>
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-purple-400" />
                                    <span>{evt.venue.city}</span>
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            isLive
                              ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                              : isPending
                              ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                              : isRejected
                              ? "bg-rose-500/10 text-rose-300 border-rose-500/30"
                              : "bg-white/5 text-slate-300 border-white/10"
                          }`}
                        >
                          {isLive && <CheckCircle className="w-3 h-3 text-emerald-400" />}
                          {isPending && <Clock className="w-3 h-3 text-amber-400" />}
                          {isRejected && <AlertCircle className="w-3 h-3 text-rose-400" />}
                          <span>{evt.status.replace("_", " ")}</span>
                        </span>
                      </td>

                      <td className="py-4 px-5 text-slate-300">
                        <span className="font-semibold text-white">
                          {evt.dailyTimeSlots?.length || 0} shifts
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {evt.packagesCount || 0} pricing tiers
                        </span>
                      </td>

                      <td className="py-4 px-5 font-mono font-bold text-purple-300 text-xs">
                        From {formatPrice(evt.startingPrice || 0)}
                      </td>

                      <td className="py-4 px-5">
                        <div className="font-bold text-white text-xs">
                          {evt.totalBookings || 0} passes
                        </div>
                        <div className="font-mono text-emerald-400 font-semibold text-[11px] mt-0.5">
                          {formatPrice(evt.totalRevenue || 0)}
                        </div>
                      </td>

                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/events/${evt.slug}`}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition"
                            title="Preview Listing"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          <Link
                            href="/organiser/bookings"
                            className="p-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 transition"
                            title="View Bookings"
                          >
                            <Ticket className="w-4 h-4" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => {
                              setDeleteTargetEvent(evt);
                              setActiveBookingsWarning(null);
                            }}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition"
                            title="Delete Venue"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetEvent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <button
                onClick={() => {
                  setDeleteTargetEvent(null);
                  setActiveBookingsWarning(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="text-xl font-heading font-bold text-white">
                Remove {deleteTargetEvent.title}?
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Property in{" "}
                <span className="text-slate-300 font-semibold">
                  {deleteTargetEvent.venue?.city || "your portfolio"}
                </span>{" "}
                &bull; Status:{" "}
                <span className="text-purple-400 font-bold uppercase">
                  {deleteTargetEvent.status.replace("_", " ")}
                </span>
              </p>
            </div>

            <div className="text-sm text-slate-300 bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
              <p className="font-semibold text-rose-400 flex items-center gap-1.5 text-xs">
                <AlertTriangle className="w-4 h-4" /> Permanent Listing Removal
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Removing this venue will unpublish it from CelebrateHub and prevent any new guest reservations.
              </p>
            </div>

            {activeBookingsWarning !== null && activeBookingsWarning > 0 && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex gap-3 text-amber-200 text-xs leading-relaxed">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-300 block mb-0.5">
                    {activeBookingsWarning} Active Confirmed Reservation(s)
                  </strong>
                  Guests have reserved shifts for this venue. Deleting will cancel these bookings. Click Force Delete below only if you intend to cancel all guest reservations.
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteTargetEvent(null);
                  setActiveBookingsWarning(null);
                }}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 text-xs font-bold transition"
              >
                Cancel
              </button>
              {activeBookingsWarning !== null && activeBookingsWarning > 0 ? (
                <button
                  type="button"
                  onClick={() => handleDeleteEvent(true)}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition disabled:opacity-50"
                >
                  {isDeleting ? "Cancelling & Deleting..." : "Force Delete Venue"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleDeleteEvent(false)}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-lg shadow-rose-500/30 transition disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Delete Venue"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
