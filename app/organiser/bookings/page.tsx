"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { formatPrice, formatEventDate } from "@/lib/utils";
import {
  Ticket,
  Search,
  CheckCircle,
  Clock,
  Calendar,
  Users,
  AlertCircle,
  Filter,
  RefreshCw,
} from "lucide-react";

export default function OrganiserBookingsPage() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [bookings, setBookings] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedEventId, setSelectedEventId] = useState("");
  const [checkInStatus, setCheckInStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [checkingInId, setCheckingInId] = useState<string | null>(null);

  const fetchBookings = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedEventId) params.set("eventId", selectedEventId);
    if (checkInStatus !== "all") params.set("checkInStatus", checkInStatus);

    fetch(`/api/organiser/bookings?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setBookings(data.bookings || []);
        setEvents(data.events || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isLoading && (!user || (user.role !== "organiser" && user.role !== "admin"))) {
      router.push("/login");
      return;
    }
    if (user) {
      fetchBookings();
    }
  }, [user, isLoading, selectedEventId, checkInStatus]);

  const handleToggleCheckIn = async (bookingId: string) => {
    try {
      setCheckingInId(bookingId);
      const res = await fetch(`/api/organiser/bookings/${bookingId}/check-in`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (res.ok) {
        // Optimistically update local booking
        setBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? { ...b, ...data.booking } : b))
        );
        toast.success(
          data.booking?.checkInStatus === "checked_in"
            ? "Celebration guest checked in successfully!"
            : "Guest check-in status revoked.",
          "Check-In Status"
        );
      } else {
        toast.error(data.error || "Failed to check in attendee", "Check-In Error");
      }
    } catch (e) {
      console.error(e);
      toast.error("An unexpected error occurred during check-in.");
    } finally {
      setCheckingInId(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.bookingReference?.toLowerCase().includes(q) ||
      b.customer?.name?.toLowerCase().includes(q) ||
      b.customer?.email?.toLowerCase().includes(q)
    );
  });

  const totalCheckedIn = bookings.filter((b) => b.checkInStatus === "checked_in").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header & Gate Statistics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-white flex items-center gap-3">
            <Ticket className="w-8 h-8 text-amber-400" />
            <span>Gate Check-In & Attendee Manifest</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 mt-1">
            Verify guest passes, scan QR references, and record arrivals at venue entrances.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-white/10 rounded-2xl px-6 py-4 backdrop-blur-xl shadow-xl flex items-center gap-5 self-start sm:self-auto">
          <div>
            <span className="text-xs uppercase font-bold text-slate-400 block tracking-wider">Gate Check-in</span>
            <span className="text-2xl font-heading font-black text-amber-400">
              {totalCheckedIn} / {bookings.length}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-slate-900/60 rounded-3xl border border-white/10 p-6 backdrop-blur-xl shadow-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search reference (EVT-...) or host name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-sm rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 focus:border-amber-400 outline-none"
            />
          </div>

          <div>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full p-3 text-sm rounded-xl bg-slate-950 border border-white/10 text-white focus:border-amber-400 outline-none"
            >
              <option value="">All Celebration Venues</option>
              {events.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={checkInStatus}
              onChange={(e) => setCheckInStatus(e.target.value)}
              className="w-full p-3 text-sm rounded-xl bg-slate-950 border border-white/10 text-white focus:border-amber-400 outline-none"
            >
              <option value="all">All Gate Statuses</option>
              <option value="pending">Pending Entry</option>
              <option value="checked_in">Checked In</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-slate-900/60 rounded-3xl border border-white/10 shadow-xl backdrop-blur-xl overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-sm text-slate-400">Loading attendee records...</div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-16 text-center text-sm text-slate-400">
            No attendees matching the filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-slate-400 uppercase tracking-wider text-xs border-b border-white/10 bg-white/5">
                  <th className="py-4 px-5 font-semibold">Booking Ref</th>
                  <th className="py-4 px-5 font-semibold">Attendee & Contact</th>
                  <th className="py-4 px-5 font-semibold">Venue & Tier</th>
                  <th className="py-4 px-5 font-semibold">Guests</th>
                  <th className="py-4 px-5 font-semibold">Scheduled Slot</th>
                  <th className="py-4 px-5 font-semibold">Gate Status</th>
                  <th className="py-4 px-5 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredBookings.map((b) => {
                  const isCheckedIn = b.checkInStatus === "checked_in";
                  return (
                    <tr key={b._id} className="hover:bg-white/5 transition">
                      <td className="py-4 px-5 font-mono font-bold text-amber-400 text-xs">
                        {b.bookingReference}
                      </td>

                      <td className="py-4 px-5">
                        <span className="font-bold text-white block">{b.customer?.name}</span>
                        <span className="text-xs text-slate-400">{b.customer?.email}</span>
                      </td>

                      <td className="py-4 px-5">
                        <span className="font-bold text-white line-clamp-1 max-w-xs block">
                          {b.event?.title}
                        </span>
                        <span className="text-xs text-amber-300">
                          {b.packageDetails?.name}
                        </span>
                      </td>

                      <td className="py-4 px-5 text-white font-bold">{b.guestsCount}</td>

                      <td className="py-4 px-5 text-slate-300">
                        <div>{formatEventDate(b.selectedSlot?.date, "dd MMM yyyy")}</div>
                        <div className="text-xs text-slate-400">
                          {b.selectedSlot?.startTime} - {b.selectedSlot?.endTime}
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            isCheckedIn
                              ? "bg-teal-500/10 text-teal-300 border border-teal-500/20"
                              : "bg-white/10 text-slate-300 border border-white/10"
                          }`}
                        >
                          {isCheckedIn ? "Checked In ✓" : "Pending"}
                        </span>
                        {b.checkedInAt && (
                          <span className="text-xs text-slate-400 block mt-0.5">
                            {new Date(b.checkedInAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={() => handleToggleCheckIn(b._id)}
                          disabled={checkingInId === b._id}
                          className={`px-4 py-2 rounded-xl font-heading font-bold text-xs transition ${
                            isCheckedIn
                              ? "border border-white/10 text-slate-300 hover:bg-white/10"
                              : "bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-lg shadow-teal-500/20"
                          }`}
                        >
                          {isCheckedIn ? "Undo" : "Check In"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
