"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { formatPrice, formatEventDate } from "@/lib/utils";
import RevenueLineChart from "@/components/analytics/RevenueLineChart";
import CategoryDistributionChart from "@/components/analytics/CategoryDistributionChart";
import CapacityProgressBar from "@/components/analytics/CapacityProgressBar";
import {
  Shield,
  TrendingUp,
  DollarSign,
  Ticket,
  Calendar,
  Users,
  Sparkles,
  AlertCircle,
  ArrowRight,
  CheckCircle,
  RotateCcw,
  Settings,
  BarChart3,
} from "lucide-react";

export default function AdminDashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [gmvTimeframe, setGmvTimeframe] = useState<"7d" | "6m">("6m");

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/login");
      return;
    }
    if (user) {
      fetch("/api/admin/dashboard")
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

  const metrics = data?.metrics || {};
  const analytics = data?.analytics || {};
  const recentBookings = data?.recentBookings || [];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Platform Executive Overview Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-slate-900/60 to-purple-500/10 border border-amber-500/20 backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs uppercase tracking-wider">
              Governance Active
            </span>
            <span className="text-xs text-slate-400">• Real-Time Marketplace Analytics</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-heading font-black text-white">
            Marketplace Command & Operational Overview
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Oversee GMV velocity, collect 5% platform commission fees, audit partner listings, and authorize disputes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/events"
            className="px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs sm:text-sm font-heading font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>Venue Moderation ({metrics.pendingEvents || 0} Pending)</span>
          </Link>
          <Link
            href="/admin/refunds"
            className="px-4 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-slate-200 text-xs sm:text-sm font-heading font-bold flex items-center gap-2 transition"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>Refunds ({metrics.totalRefundRequests || 0})</span>
          </Link>
          <Link
            href="/admin/settings"
            className="p-3 rounded-xl border border-white/10 hover:bg-white/5 text-slate-200 text-sm font-heading font-bold transition"
            title="System Settings"
          >
            <Settings className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-slate-900/60 rounded-3xl border border-white/10 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Platform GMV
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-black text-white">
            {formatPrice(metrics.totalGMV || 0)}
          </div>
          <p className="text-xs text-slate-400">Gross celebration booking sales</p>
        </div>

        <div className="bg-slate-900/60 rounded-3xl border border-white/10 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Platform Fee Revenue
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-black text-amber-400">
            {formatPrice(metrics.platformRevenue || 0)}
          </div>
          <p className="text-xs text-slate-400">5% Platform commission collected</p>
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
          <div className="text-2xl sm:text-3xl font-heading font-black text-white">{metrics.publishedEvents || 0}</div>
          <p className="text-xs text-slate-400">
            {metrics.pendingEvents || 0} awaiting partner review
          </p>
        </div>

        <div className="bg-slate-900/60 rounded-3xl border border-white/10 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Platform Users
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-black text-white">{metrics.totalUsers || 0}</div>
          <p className="text-xs text-slate-400">
            {metrics.totalCustomers || 0} Guests • {metrics.totalOrganisers || 0} Hosts
          </p>
        </div>
      </div>

      {/* Moderation Alert Banner if events pending */}
      {metrics.pendingEvents > 0 && (
        <div className="p-5 sm:p-6 rounded-3xl bg-amber-500/10 border border-amber-500/20 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold shrink-0">
              <AlertCircle className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-heading font-bold text-white">
                {metrics.pendingEvents} Venue Partner Listing(s) Awaiting Review
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                Organisers have submitted new celebration venues requiring quality and licensing inspection.
              </p>
            </div>
          </div>
          <Link
            href="/admin/events?status=pending_approval"
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs sm:text-sm font-heading font-bold shadow-lg shadow-amber-400/20 transition whitespace-nowrap self-start sm:self-auto"
          >
            Review Queue →
          </Link>
        </div>
      )}

      {/* --- Platform Analytics Section --- */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-xl text-white">Marketplace Intelligence</h2>
              <p className="text-xs text-slate-400">Platform GMV trajectory, category market share, and occupancy indicators</p>
            </div>
          </div>

          {/* Timeframe selector */}
          <div className="flex items-center bg-slate-900 border border-white/10 rounded-xl p-1 self-start sm:self-auto text-xs font-heading font-bold">
            <button
              onClick={() => setGmvTimeframe("7d")}
              className={`px-3.5 py-1.5 rounded-lg transition ${
                gmvTimeframe === "7d"
                  ? "bg-amber-400 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setGmvTimeframe("6m")}
              className={`px-3.5 py-1.5 rounded-lg transition ${
                gmvTimeframe === "6m"
                  ? "bg-amber-400 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Last 6 Months
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* GMV Trajectory Chart (Spans 2 cols) */}
          <div className="lg:col-span-2">
            <RevenueLineChart
              data={
                gmvTimeframe === "7d"
                  ? analytics.weeklyGMVHistory || []
                  : analytics.monthlyGMVHistory || []
              }
              title={gmvTimeframe === "7d" ? "Platform GMV Trajectory (Last 7 Days)" : "Platform GMV Trajectory (Last 6 Months)"}
              subtitle="Total marketplace reservation transaction volume"
              accentColor="emerald"
            />
          </div>

          {/* Category Share Component */}
          <div>
            <CategoryDistributionChart
              items={analytics.categoryShare || []}
              title="Venue Category Market Share"
              subtitle="Share of celebration booking revenue by property type"
            />
          </div>
        </div>

        {/* Top Venue Occupancy Progress Bars */}
        {analytics.topVenues && analytics.topVenues.length > 0 && (
          <CapacityProgressBar
            items={analytics.topVenues}
            title="Top Partner Venues — Booking Capacity Utilization"
            subtitle="Platform-wide capacity filled rates across premium listed venues"
          />
        )}
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
        <Link
          href="/admin/events"
          className="p-6 sm:p-7 rounded-3xl bg-slate-900/60 border border-white/10 hover:border-amber-400/30 backdrop-blur-xl transition space-y-3 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-bold text-base text-white">Venue Moderation & Curation</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Approve, reject with feedback notes, publish/unpublish, and feature venues on the homepage spotlight.
          </p>
        </Link>

        <Link
          href="/admin/refunds"
          className="p-6 sm:p-7 rounded-3xl bg-slate-900/60 border border-white/10 hover:border-amber-400/30 backdrop-blur-xl transition space-y-3 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition">
            <RotateCcw className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-bold text-base text-white">Refund Requests Queue</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Review customer cancellation refund requests and process payouts based on venue cancellation policy.
          </p>
        </Link>

        <Link
          href="/admin/users"
          className="p-6 sm:p-7 rounded-3xl bg-slate-900/60 border border-white/10 hover:border-amber-400/30 backdrop-blur-xl transition space-y-3 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center group-hover:scale-110 transition">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-bold text-base text-white">User Directory & Security</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Manage customer and host partner profiles, verify venue credentials, or revoke account access.
          </p>
        </Link>
      </div>

      {/* Global Bookings Stream */}
      <div className="bg-slate-900/60 rounded-3xl border border-white/10 shadow-xl backdrop-blur-xl overflow-hidden p-6 sm:p-8 space-y-5">
        <h2 className="text-lg font-heading font-bold text-white">Recent Marketplace Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-slate-400 uppercase tracking-wider text-xs border-b border-white/10">
                <th className="py-3.5 px-4 font-semibold">Ref</th>
                <th className="py-3.5 px-4 font-semibold">Attendee / Host</th>
                <th className="py-3.5 px-4 font-semibold">Celebration Venue</th>
                <th className="py-3.5 px-4 font-semibold">Amount</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentBookings.map((b: any) => (
                <tr key={b._id} className="hover:bg-white/5 transition">
                  <td className="py-4 px-4 font-mono font-bold text-amber-400 text-xs">
                    {b.bookingReference}
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-bold text-white block">{b.customer?.name}</span>
                    <span className="text-xs text-slate-400">{b.customer?.email}</span>
                  </td>
                  <td className="py-4 px-4 text-slate-300 line-clamp-1 max-w-xs">{b.event?.title}</td>
                  <td className="py-4 px-4 font-heading font-bold text-white">{formatPrice(b.totalAmount)}</td>
                  <td className="py-4 px-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400/10 border border-amber-400/20 text-amber-300 uppercase">
                      {b.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-400 text-xs">
                    {formatEventDate(b.createdAt, "dd MMM yyyy")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
