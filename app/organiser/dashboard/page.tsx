"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { formatPrice, formatEventDate } from "@/lib/utils";
import RevenueLineChart from "@/components/analytics/RevenueLineChart";
import BookingsBarChart from "@/components/analytics/BookingsBarChart";
import CapacityProgressBar from "@/components/analytics/CapacityProgressBar";
import {
  LayoutDashboard,
  PlusCircle,
  Ticket,
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  AlertCircle,
  Eye,
  CheckCircle,
  Clock,
  ArrowRight,
  Building2,
  Sparkles,
  BarChart3,
} from "lucide-react";

export default function OrganiserDashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [revenueTimeframe, setRevenueTimeframe] = useState<"7d" | "6m">("7d");
  const [volumeMode, setVolumeMode] = useState<"shifts" | "weekly">("shifts");

  useEffect(() => {
    if (!isLoading && (!user || (user.role !== "organiser" && user.role !== "admin"))) {
      router.push("/login");
      return;
    }
    if (user) {
      fetch("/api/organiser/dashboard")
        .then((res) => res.json())
        .then((resData) => setData(resData))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user, isLoading]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 space-y-6">
        <div className="h-8 w-1/4 bg-white/5 animate-pulse rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white/5 animate-pulse rounded-3xl border border-white/5" />
          ))}
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const analytics = data?.analytics || {};
  const events = data?.events || [];
  const recentBookings = data?.recentBookings || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-10">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-4xl font-heading font-extrabold text-white tracking-tight">
              Venue Host Studio
            </h1>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300">
              {user?.companyName || user?.name}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
            Monitor sales velocity, review venue capacity, analyze party shifts, and supervise guest admissions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/organiser/bookings"
            className="px-4 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-slate-200 text-xs sm:text-sm font-heading font-bold flex items-center gap-2 transition"
          >
            <Ticket className="w-4 h-4 text-amber-400" />
            <span>Attendee Check-In</span>
          </Link>

          <Link
            href="/organiser/events/new"
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs sm:text-sm font-heading font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>List New Venue</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-slate-900/60 rounded-3xl border border-white/10 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Gross Pass Sales
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-black text-white">
            {formatPrice(stats.totalGrossRevenue || 0)}
          </div>
          <p className="text-xs text-slate-400">
            Net payout: <span className="font-bold text-emerald-400">{formatPrice(stats.netEarnings || 0)}</span>
          </p>
        </div>

        <div className="bg-slate-900/60 rounded-3xl border border-white/10 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Passes Reserved
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center">
              <Ticket className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-black text-white">{stats.totalTicketsSold || 0}</div>
          <p className="text-xs text-slate-400">Across all celebration packages</p>
        </div>

        <div className="bg-slate-900/60 rounded-3xl border border-white/10 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Checked-in Attendees
            </span>
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-black text-white">{stats.checkedInCount || 0}</div>
          <p className="text-xs text-slate-400">Validated at venue gate security</p>
        </div>

        <div className="bg-slate-900/60 rounded-3xl border border-white/10 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Venues
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-black text-white">{stats.publishedEventsCount || 0}</div>
          <p className="text-xs text-slate-400">
            {stats.pendingApprovalCount || 0} awaiting Admin verification
          </p>
        </div>
      </div>

      {/* --- Analytics & Graphs Section --- */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-xl text-white">Performance Analytics</h2>
              <p className="text-xs text-slate-400">Real-time revenue metrics, capacity utilization, and shift trends</p>
            </div>
          </div>

          {/* Timeframe selector */}
          <div className="flex items-center bg-slate-900 border border-white/10 rounded-xl p-1 self-start sm:self-auto text-xs font-heading font-bold">
            <button
              onClick={() => setRevenueTimeframe("7d")}
              className={`px-3.5 py-1.5 rounded-lg transition ${
                revenueTimeframe === "7d"
                  ? "bg-amber-400 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setRevenueTimeframe("6m")}
              className={`px-3.5 py-1.5 rounded-lg transition ${
                revenueTimeframe === "6m"
                  ? "bg-amber-400 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Last 6 Months
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Trajectory Line Chart (Spans 2 cols) */}
          <div className="lg:col-span-2">
            <RevenueLineChart
              data={
                revenueTimeframe === "7d"
                  ? analytics.revenue7Days || []
                  : analytics.revenue6Months || []
              }
              title={revenueTimeframe === "7d" ? "Daily Revenue Trajectory (Last 7 Days)" : "Monthly Revenue Trajectory (Last 6 Months)"}
              subtitle="Interactive sales volume with daily/monthly data points"
              accentColor="amber"
            />
          </div>

          {/* Celebration Shift or Weekly Bar Chart */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Volume Breakdown
              </span>
              <div className="flex gap-1 text-[11px] font-bold">
                <button
                  onClick={() => setVolumeMode("shifts")}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    volumeMode === "shifts"
                      ? "bg-white/15 text-white"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  By Shift
                </button>
                <button
                  onClick={() => setVolumeMode("weekly")}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    volumeMode === "weekly"
                      ? "bg-white/15 text-white"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  By Day
                </button>
              </div>
            </div>

            <BookingsBarChart
              data={
                volumeMode === "shifts"
                  ? analytics.shiftData || []
                  : analytics.weeklyData || []
              }
              title={volumeMode === "shifts" ? "Celebration Shift Volume" : "Weekly Day Distribution"}
              subtitle={volumeMode === "shifts" ? "Brunch vs Sunset vs Starlight Midnight" : "Reservations by day of week"}
              unitLabel="passes"
              barColor="amber"
            />
          </div>
        </div>

        {/* Capacity Utilization Bars */}
        {analytics.capacityUtilization && analytics.capacityUtilization.length > 0 && (
          <CapacityProgressBar
            items={analytics.capacityUtilization}
            title="Managed Venue Occupancy & Capacity Utilization"
            subtitle="Booked guest counts vs maximum venue hosting capacity across your active properties"
          />
        )}
      </div>

      {/* Events Table Section */}
      <div className="bg-slate-900/60 rounded-3xl border border-white/10 shadow-xl backdrop-blur-xl overflow-hidden space-y-5 p-6 sm:p-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-lg font-heading font-bold text-white">Your Managed Venues</h2>
            <p className="text-xs sm:text-sm text-slate-400">Track review states and venue configurations</p>
          </div>
          <Link
            href="/organiser/events/new"
            className="text-xs sm:text-sm font-heading font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5"
          >
            <span>+ New Venue</span>
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="py-10 text-center space-y-3">
            <p className="text-sm text-slate-400">You haven't listed any celebration venues yet.</p>
            <Link
              href="/organiser/events/new"
              className="inline-block px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-sm font-heading font-bold"
            >
              List Your First Venue
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-slate-400 uppercase tracking-wider text-xs border-b border-white/10 pb-3">
                  <th className="py-3 px-3 font-semibold">Venue Event</th>
                  <th className="py-3 px-3 font-semibold">Status</th>
                  <th className="py-3 px-3 font-semibold">Packages</th>
                  <th className="py-3 px-3 font-semibold">Schedule</th>
                  <th className="py-3 px-3 font-semibold">Rating</th>
                  <th className="py-3 px-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {events.map((evt: any) => {
                  let statusBadge = "bg-white/10 text-slate-300 border border-white/10";
                  if (evt.status === "published") statusBadge = "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20";
                  if (evt.status === "pending_approval") statusBadge = "bg-amber-400/10 text-amber-300 border border-amber-400/20";
                  if (evt.status === "rejected") statusBadge = "bg-rose-500/10 text-rose-300 border border-rose-500/20";

                  return (
                    <tr key={evt._id} className="hover:bg-white/5 transition">
                      <td className="py-4 px-3 flex items-center gap-3.5">
                        <img
                          src={evt.coverImage}
                          alt={evt.title}
                          className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0"
                        />
                        <span className="font-heading font-bold text-white line-clamp-1 max-w-xs">
                          {evt.title}
                        </span>
                      </td>

                      <td className="py-4 px-3">
                        <span className={`px-3 py-1 rounded-full font-bold uppercase text-[11px] tracking-wider ${statusBadge}`}>
                          {evt.status.replace("_", " ")}
                        </span>
                      </td>

                      <td className="py-4 px-3 text-slate-300">{evt.packagesCount} tiers</td>
                      <td className="py-4 px-3 text-slate-300">{evt.slotsCount || evt.dailyTimeSlots?.length || "Daily"} shifts</td>

                      <td className="py-4 px-3 text-amber-400 font-semibold">
                        {evt.averageRating > 0 ? `★ ${evt.averageRating} (${evt.reviewCount})` : "New"}
                      </td>

                      <td className="py-4 px-3 text-right">
                        <Link
                          href={`/events/${evt.slug}`}
                          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white inline-flex items-center gap-1.5 text-xs font-heading font-bold border border-white/10 transition"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-400" /> View Live
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Bookings Section */}
      <div className="bg-slate-900/60 rounded-3xl border border-white/10 shadow-xl backdrop-blur-xl overflow-hidden p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-lg font-heading font-bold text-white">Recent Guest Reservations</h2>
            <p className="text-xs sm:text-sm text-slate-400">Live feed of confirmed customer venue reservations</p>
          </div>
          <Link
            href="/organiser/bookings"
            className="text-xs sm:text-sm font-heading font-bold text-amber-400 hover:text-amber-300"
          >
            View All Attendees →
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <p className="text-sm text-slate-400 py-8 text-center">No reservations recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-slate-400 uppercase tracking-wider text-xs border-b border-white/10">
                  <th className="py-3 px-3 font-semibold">Pass Ref</th>
                  <th className="py-3 px-3 font-semibold">Host / Guest</th>
                  <th className="py-3 px-3 font-semibold">Venue</th>
                  <th className="py-3 px-3 font-semibold">Tier / Guests</th>
                  <th className="py-3 px-3 font-semibold">Slot Date</th>
                  <th className="py-3 px-3 font-semibold">Amount</th>
                  <th className="py-3 px-3 font-semibold">Check-In</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentBookings.map((b: any) => (
                  <tr key={b._id} className="hover:bg-white/5 transition">
                    <td className="py-4 px-3 font-mono font-bold text-amber-400 text-xs">
                      {b.bookingReference}
                    </td>
                    <td className="py-4 px-3">
                      <span className="font-bold text-white block">{b.customer?.name}</span>
                      <span className="text-xs text-slate-400">{b.customer?.email}</span>
                    </td>
                    <td className="py-4 px-3 text-slate-300 line-clamp-1 max-w-xs">
                      {b.event?.title}
                    </td>
                    <td className="py-4 px-3 text-slate-300">
                      {b.packageDetails?.name} × {b.guestsCount}
                    </td>
                    <td className="py-4 px-3 text-slate-300">
                      {formatEventDate(b.selectedSlot?.date, "dd MMM yyyy")}
                    </td>
                    <td className="py-4 px-3 font-heading font-bold text-white">
                      {formatPrice(b.totalAmount)}
                    </td>
                    <td className="py-4 px-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          b.checkInStatus === "checked_in"
                            ? "bg-teal-500/10 text-teal-300 border border-teal-500/20"
                            : "bg-white/10 text-slate-300 border border-white/10"
                        }`}
                      >
                        {b.checkInStatus === "checked_in" ? "Checked In ✓" : "Pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
