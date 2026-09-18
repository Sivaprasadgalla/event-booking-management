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
  Plus,
  X,
  Phone,
  DollarSign,
  Sparkles,
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

  // Direct offline booking modal state
  const [showDirectModal, setShowDirectModal] = useState(false);
  const [directSubmitting, setDirectSubmitting] = useState(false);
  const [directForm, setDirectForm] = useState({
    eventId: "",
    date: new Date().toISOString().split("T")[0],
    slotId: "",
    packageId: "",
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    guestsCount: 10,
    paymentMode: "Cash at Venue",
    directNotes: "",
  });

  const fetchBookings = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedEventId) params.set("eventId", selectedEventId);
    if (checkInStatus !== "all") params.set("checkInStatus", checkInStatus);

    fetch(`/api/organiser/bookings?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setBookings(data.bookings || []);
        const evts = data.events || [];
        setEvents(evts);

        // Prepopulate directForm defaults if empty
        if (evts.length > 0) {
          setDirectForm((prev) => ({
            ...prev,
            eventId: prev.eventId || evts[0]._id,
            packageId: prev.packageId || evts[0].packages?.[0]?.id || "",
            slotId: prev.slotId || evts[0].dailyTimeSlots?.[0]?.id || "",
          }));
        }
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

  const handleCreateDirectBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directForm.eventId || !directForm.customerName || !directForm.customerPhone) {
      toast.warning("Please enter customer name, phone, and select a venue.", "Missing Details");
      return;
    }

    try {
      setDirectSubmitting(true);
      const res = await fetch("/api/organiser/bookings/direct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(directForm),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create direct reservation");
      }

      toast.success(
        `Direct booking confirmed! Reference: ${data.booking.bookingReference}`,
        "Reservation Created"
      );
      setBookings((prev) => [data.booking, ...prev]);
      setShowDirectModal(false);
      setDirectForm((prev) => ({
        ...prev,
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        directNotes: "",
      }));
    } catch (err: any) {
      toast.error(err.message || "Failed to register direct booking", "Creation Error");
    } finally {
      setDirectSubmitting(false);
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
            Verify guest passes, record walk-in phone reservations, and track arrivals at venue entrances.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowDirectModal(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-heading font-bold text-xs sm:text-sm shadow-xl shadow-purple-900/30 flex items-center gap-2 transition hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>+ Direct Reservation</span>
          </button>

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
                      <td className="py-4 px-5">
                        <span className="font-mono font-bold text-amber-400 text-xs block">
                          {b.bookingReference}
                        </span>
                        {b.bookingType === "direct" && (
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                            Direct Offline
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-5">
                        <span className="font-bold text-white block">{b.customer?.name}</span>
                        <span className="text-xs text-slate-400 block">{b.customer?.phone || b.customer?.email}</span>
                        {b.paymentMode && (
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {b.paymentMode}
                          </span>
                        )}
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

      {/* Direct Offline / Walk-in Booking Modal */}
      {showDirectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6 text-white my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <h3 className="font-heading font-bold text-lg text-white">
                    Create Direct Walk-in / Phone Reservation
                  </h3>
                </div>
                <p className="text-xs text-slate-400">
                  Book direct reservations for your venue, allocate celebration shifts, and record offline payments.
                </p>
              </div>
              <button
                onClick={() => setShowDirectModal(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDirectBooking} className="space-y-4 text-xs">
              {/* Event selection */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 block">Select Venue Partner Listing *</label>
                <select
                  value={directForm.eventId}
                  onChange={(e) => {
                    const evId = e.target.value;
                    const ev = events.find((x) => x._id === evId);
                    setDirectForm({
                      ...directForm,
                      eventId: evId,
                      packageId: ev?.packages?.[0]?.id || "",
                      slotId: ev?.dailyTimeSlots?.[0]?.id || "",
                    });
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs outline-none focus:border-purple-500"
                  required
                >
                  {events.map((ev) => (
                    <option key={ev._id} value={ev._id}>
                      {ev.title} ({ev.venue?.city || "Venue"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Shift */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 block">Celebration Date *</label>
                  <input
                    type="date"
                    value={directForm.date}
                    onChange={(e) => setDirectForm({ ...directForm, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 block">Hosting Time Shift *</label>
                  {(() => {
                    const ev = events.find((x) => x._id === directForm.eventId) || events[0];
                    const slots = ev?.dailyTimeSlots || [];
                    return (
                      <select
                        value={directForm.slotId}
                        onChange={(e) => setDirectForm({ ...directForm, slotId: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs outline-none focus:border-purple-500"
                        required
                      >
                        {slots.map((s: any) => (
                          <option key={s.id} value={s.id}>
                            {s.title} ({s.startTime} - {s.endTime})
                          </option>
                        ))}
                      </select>
                    );
                  })()}
                </div>
              </div>

              {/* Package Tier & Guests */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 block">Celebration Package *</label>
                  {(() => {
                    const ev = events.find((x) => x._id === directForm.eventId) || events[0];
                    const pkgs = ev?.packages || [];
                    return (
                      <select
                        value={directForm.packageId}
                        onChange={(e) => setDirectForm({ ...directForm, packageId: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs outline-none focus:border-purple-500"
                        required
                      >
                        {pkgs.map((p: any) => (
                          <option key={p.id} value={p.id}>
                            {p.name} - ₹{p.price.toLocaleString("en-IN")}
                          </option>
                        ))}
                      </select>
                    );
                  })()}
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 block">Attendees / Family Guests *</label>
                  <input
                    type="number"
                    min="1"
                    value={directForm.guestsCount}
                    onChange={(e) => setDirectForm({ ...directForm, guestsCount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs outline-none focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              {/* Customer Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-white/10">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 block">Guest / Host Full Name *</label>
                  <input
                    type="text"
                    value={directForm.customerName}
                    onChange={(e) => setDirectForm({ ...directForm, customerName: e.target.value })}
                    placeholder="e.g. Vikramaditya Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 block">Guest Phone Number *</label>
                  <input
                    type="tel"
                    value={directForm.customerPhone}
                    onChange={(e) => setDirectForm({ ...directForm, customerPhone: e.target.value })}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 block">Email Address (Optional)</label>
                  <input
                    type="email"
                    value={directForm.customerEmail}
                    onChange={(e) => setDirectForm({ ...directForm, customerEmail: e.target.value })}
                    placeholder="guest@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 block">Payment Mode Received *</label>
                  <select
                    value={directForm.paymentMode}
                    onChange={(e) => setDirectForm({ ...directForm, paymentMode: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs outline-none focus:border-purple-500"
                  >
                    <option value="Cash at Venue">Cash at Venue</option>
                    <option value="UPI Direct / QR">UPI Direct / QR</option>
                    <option value="Card Swipe at Venue">Card Swipe at Venue</option>
                    <option value="Bank Wire / IMPS">Bank Wire / IMPS</option>
                    <option value="Complimentary / Host VIP">Complimentary / Host VIP</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 block">Direct Notes / Family Requests</label>
                <textarea
                  rows={2}
                  value={directForm.directNotes}
                  onChange={(e) => setDirectForm({ ...directForm, directNotes: e.target.value })}
                  placeholder="e.g. 1st Birthday party, requested blue balloon arch and eggless chocolate cake..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-xs outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowDirectModal(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={directSubmitting}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-purple-900/30 transition disabled:opacity-50"
                >
                  {directSubmitting ? "Locking Reservation..." : "Confirm Direct Reservation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
