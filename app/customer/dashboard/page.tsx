"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { formatPrice, formatEventDate } from "@/lib/utils";
import {
  PartyPopper,
  Sparkles,
  Ticket,
  Calendar,
  Clock,
  MapPin,
  QrCode,
  FileText,
  Compass,
  ArrowRight,
  CheckCircle,
  ExternalLink,
  X,
  Phone,
  MessageCircle,
} from "lucide-react";

export default function CustomerDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeQrModal, setActiveQrModal] = useState<any | null>(null);

  useEffect(() => {
    fetch("/api/customer/bookings")
      .then((res) => res.json())
      .then((data) => {
        setBookings(data.bookings || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const upcomingBookings = bookings.filter(
    (b) => b.status === "confirmed" && new Date(b.bookingDate) >= new Date()
  );

  const pastBookings = bookings.filter(
    (b) => b.status === "attended" || (b.status === "confirmed" && new Date(b.bookingDate) < new Date())
  );

  const nextCelebration = upcomingBookings[0] || null;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Top Welcome Concierge Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900/40 via-pink-900/30 to-amber-950/20 border border-purple-500/20 p-6 sm:p-8 backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-extrabold text-[11px] uppercase tracking-wider shadow-md">
                VIP Concierge
              </span>
              <span className="text-xs text-purple-300 font-semibold">Welcome back, {user?.name?.split(" ")[0]}!</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-white">
              Your Celebration Lounge & Passes
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Access entry passes, view upcoming venue reservations, retrieve GST receipts,
              and discover handpicked celebration spaces for your next milestone.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/events"
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-heading font-bold text-xs sm:text-sm shadow-xl shadow-purple-900/30 transition flex items-center gap-2"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Venues</span>
            </Link>
            <Link
              href="/customer/bookings"
              className="px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-heading font-bold text-xs sm:text-sm transition flex items-center gap-2"
            >
              <Ticket className="w-4 h-4 text-amber-400" />
              <span>All Passes ({bookings.length})</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Upcoming Parties</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-black text-white">
            {upcomingBookings.length}
          </div>
          <p className="text-[11px] text-purple-300">Ready for admission</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Celebrations Attended</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-black text-white">
            {pastBookings.length}
          </div>
          <p className="text-[11px] text-emerald-400">Memories created</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Total Bookings</span>
            <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-300 flex items-center justify-center">
              <PartyPopper className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-black text-white">
            {bookings.length}
          </div>
          <p className="text-[11px] text-slate-400">Across all venue types</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Invoices on File</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-black text-white">
            {bookings.length}
          </div>
          <p className="text-[11px] text-slate-400">Downloadable tax receipts</p>
        </div>
      </div>

      {/* Next Celebration Feature Card */}
      {nextCelebration && (
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-purple-950/40 border border-purple-500/30 shadow-2xl relative overflow-hidden space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next Upcoming Celebration</span>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Booking ID: <span className="text-white font-bold">{nextCelebration.bookingNumber}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            {/* Image & Venue info */}
            <div className="lg:col-span-2 flex flex-col sm:flex-row gap-5">
              <div className="w-full sm:w-44 h-36 rounded-2xl overflow-hidden bg-slate-800 shrink-0">
                <img
                  src={nextCelebration.event?.coverImage || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800"}
                  alt={nextCelebration.eventTitle}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-heading font-black text-white leading-tight">
                  {nextCelebration.eventTitle}
                </h3>
                <div className="space-y-1 text-xs text-slate-300">
                  <div className="flex items-center gap-2 text-purple-300 font-semibold">
                    <Calendar className="w-4 h-4 shrink-0" />
                    <span>{formatEventDate(nextCelebration.bookingDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{nextCelebration.timeSlot?.startTime} – {nextCelebration.timeSlot?.endTime} ({nextCelebration.timeSlot?.label || "Party Shift"})</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{nextCelebration.event?.venue?.name}, {nextCelebration.event?.venue?.city}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick QR & Action */}
            <div className="flex flex-col gap-3 justify-center items-start lg:items-end">
              <button
                onClick={() => setActiveQrModal(nextCelebration)}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-heading font-extrabold text-sm shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2.5 transition"
              >
                <QrCode className="w-5 h-5" />
                <span>View Entry Pass QR</span>
              </button>

              <Link
                href={`/customer/invoices/${nextCelebration._id}`}
                className="text-xs text-purple-300 hover:text-white transition flex items-center gap-1 font-semibold"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>View Tax Invoice</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Passes Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-heading font-black text-white flex items-center gap-2">
            <Ticket className="w-5 h-5 text-pink-400" />
            <span>Active Digital Passes & QR Codes</span>
          </h2>
          <Link
            href="/customer/bookings"
            className="text-xs font-bold text-pink-400 hover:text-pink-300 transition flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-44 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-slate-900/40 border border-white/10 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-300 flex items-center justify-center mx-auto">
              <PartyPopper className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-heading font-bold text-white">No Celebration Passes Yet</h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
                Ready to plan your next rooftop gathering or private pool villa party?
              </p>
            </div>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xs shadow-lg transition"
            >
              <Compass className="w-4 h-4" />
              <span>Browse Celebration Venues</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bookings.slice(0, 4).map((booking) => (
              <div
                key={booking._id}
                className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-purple-500/30 transition flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold">
                      {booking.bookingNumber}
                    </span>
                    <h4 className="font-heading font-bold text-base text-white truncate max-w-xs">
                      {booking.eventTitle}
                    </h4>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{formatEventDate(booking.bookingDate)}</span>
                      <span>•</span>
                      <span>{booking.timeSlot?.label || "Party Shift"}</span>
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      booking.status === "confirmed"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : booking.status === "attended"
                        ? "bg-purple-500/20 text-purple-300"
                        : "bg-rose-500/20 text-rose-300"
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div className="text-xs text-slate-300">
                    Guests: <strong className="text-white">{booking.guestsCount}</strong>
                    <span className="mx-2 text-slate-600">•</span>
                    Total: <strong className="text-emerald-400">{formatPrice(booking.pricing?.totalPrice || 0)}</strong>
                  </div>

                  <button
                    onClick={() => setActiveQrModal(booking)}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Pass QR</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {activeQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-sm w-full space-y-5 text-center shadow-2xl relative">
            <button
              onClick={() => setActiveQrModal(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-white/5"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-purple-400">
                Official Gate Admission Pass
              </span>
              <h3 className="text-lg font-heading font-black text-white truncate">
                {activeQrModal.eventTitle}
              </h3>
              <p className="text-xs text-slate-400">Present this QR code to the venue host upon arrival</p>
            </div>

            <div className="bg-white p-4 rounded-2xl inline-block mx-auto shadow-xl">
              {activeQrModal.qrCode ? (
                <img
                  src={activeQrModal.qrCode}
                  alt="Entry QR"
                  className="w-48 h-48 mx-auto object-contain"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center bg-slate-100 text-slate-800 text-xs font-mono font-bold">
                  {activeQrModal.ticketCode}
                </div>
              )}
            </div>

            <div className="space-y-1 text-xs text-slate-300 bg-white/5 p-3 rounded-xl border border-white/5">
              <p>Pass Code: <strong className="font-mono text-purple-300">{activeQrModal.ticketCode}</strong></p>
              <p>Admit: <strong className="text-white">{activeQrModal.guestsCount} Guests</strong></p>
              <p>Date: <strong>{formatEventDate(activeQrModal.bookingDate)}</strong></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
