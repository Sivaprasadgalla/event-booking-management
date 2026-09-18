"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { formatPrice, formatEventDate, calculateRefund } from "@/lib/utils";
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  XCircle,
  Star,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  Sparkles,
  FileText,
  Phone,
  MessageCircle,
} from "lucide-react";

export default function CustomerBookingsPage() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<"all" | "upcoming" | "attended" | "cancelled">("all");

  // QR Modal
  const [activeTicket, setActiveTicket] = useState<any | null>(null);

  // Cancel / Refund Modal
  const [cancelBookingTarget, setCancelBookingTarget] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  // Review Modal
  const [reviewBookingTarget, setReviewBookingTarget] = useState<any | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchBookings = () => {
    setLoading(true);
    fetch("/api/customer/bookings")
      .then((res) => res.json())
      .then((data) => {
        setBookings(data.bookings || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      fetchBookings();
    }
  }, [user, isLoading]);

  const handleCancelBooking = async () => {
    if (!cancelBookingTarget) return;

    try {
      setCancelling(true);
      const res = await fetch(`/api/customer/bookings/${cancelBookingTarget._id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelReason }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Booking cancelled successfully!", "Cancelled");
        setCancelBookingTarget(null);
        fetchBookings();
      } else {
        toast.error(data.error || "Failed to cancel booking", "Cancellation Error");
      }
    } catch (e) {
      console.error(e);
      toast.error("An unexpected error occurred while cancelling the booking.");
    } finally {
      setCancelling(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewBookingTarget || !reviewComment.trim()) return;

    try {
      setSubmittingReview(true);
      const res = await fetch("/api/customer/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: reviewBookingTarget.event?._id,
          bookingId: reviewBookingTarget._id,
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Thank you! Your celebration review has been recorded.", "Review Submitted");
        setReviewBookingTarget(null);
        setReviewComment("");
      } else {
        toast.error(data.error || "Failed to submit review", "Review Error");
      }
    } catch (e) {
      console.error(e);
      toast.error("An unexpected error occurred while submitting your review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filterTab === "all") return true;
    if (filterTab === "upcoming") return b.status === "confirmed";
    if (filterTab === "attended") return b.status === "attended";
    if (filterTab === "cancelled") return b.status === "cancelled";
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-white flex items-center gap-3">
            <Ticket className="w-8 h-8 text-amber-400" />
            <span>My Bookings & Venue Passes</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 mt-1">
            Access digital passes, venue QR codes, entry validation status, and reschedule options
          </p>
        </div>

        <Link
          href="/events"
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-heading font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center gap-2 self-start sm:self-auto transition"
        >
          <span>Explore More Venues</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto text-sm font-heading font-bold scrollbar-none">
        {(
          [
            { id: "all", label: `All Bookings (${bookings.length})` },
            {
              id: "upcoming",
              label: `Upcoming (${bookings.filter((b) => b.status === "confirmed").length})`,
            },
            {
              id: "attended",
              label: `Attended (${bookings.filter((b) => b.status === "attended").length})`,
            },
            {
              id: "cancelled",
              label: `Cancelled (${bookings.filter((b) => b.status === "cancelled").length})`,
            },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterTab(tab.id)}
            className={`px-4 py-2 rounded-xl whitespace-nowrap transition ${
              filterTab === tab.id
                ? "bg-amber-400 text-slate-950"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-white/5 rounded-3xl animate-pulse border border-white/5" />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-slate-900/60 rounded-3xl border border-white/10 p-12 text-center space-y-4 backdrop-blur-xl">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-400">
            <Ticket className="w-8 h-8 text-amber-400" />
          </div>
          <h3 className="text-xl font-heading font-bold text-white">No bookings in this category</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
            Browse our curated selection of luxury rooftops, farmhouses, private villas, and banquet lawns.
          </p>
          <Link
            href="/events"
            className="inline-block px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-sm font-heading font-bold transition"
          >
            Browse Venues
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredBookings.map((b) => {
            const event = b.event;
            const isCancelled = b.status === "cancelled";
            const isAttended = b.status === "attended";
            const refundInfo = b.refundDetails;

            return (
              <div
                key={b._id}
                className="bg-slate-900/60 rounded-3xl border border-white/10 p-6 sm:p-7 backdrop-blur-xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 transition hover:border-amber-400/25"
              >
                {/* Left: Event & Ticket Details */}
                <div className="flex gap-4 sm:gap-5">
                  <img
                    src={event?.coverImage || "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=400"}
                    alt={event?.title || "Venue Event"}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border border-white/10 shrink-0"
                  />
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-300 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
                        REF: {b.bookingReference}
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          isCancelled
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            : isAttended
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-amber-400/10 text-amber-300 border border-amber-400/20"
                        }`}
                      >
                        {b.status}
                      </span>
                      {b.checkInStatus === "checked_in" && (
                        <span className="text-xs font-bold bg-teal-500/10 text-teal-300 border border-teal-500/20 px-2.5 py-0.5 rounded-full">
                          Gate Checked In ✓
                        </span>
                      )}
                    </div>

                    <Link href={`/events/${event?.slug}`}>
                      <h3 className="text-lg sm:text-xl font-heading font-bold text-white hover:text-amber-400 transition line-clamp-1">
                        {event?.title}
                      </h3>
                    </Link>

                    <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-400">
                      <span className="flex items-center gap-1 font-semibold text-white">
                        {b.packageDetails?.name} ({b.guestsCount} Guest(s))
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-amber-400" />
                        {formatEventDate(b.selectedSlot?.date, "dd MMM yyyy")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-amber-400" />
                        {b.selectedSlot?.startTime} - {b.selectedSlot?.endTime}
                      </span>
                    </div>

                    {/* Refund info pill if applicable */}
                    {refundInfo && refundInfo.status !== "none" && (
                      <div className="text-xs font-semibold text-amber-300 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-xl inline-block">
                        Refund {refundInfo.status}: {formatPrice(refundInfo.amount)}
                        {refundInfo.adminNote && ` (${refundInfo.adminNote})`}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap md:flex-col items-end gap-3 shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-white/10">
                  <span className="text-xl font-heading font-black text-amber-400 md:mb-1">
                    {formatPrice(b.totalAmount)}
                  </span>

                  <div className="flex items-center gap-2.5">
                    {/* View Digital Voucher */}
                    <button
                      onClick={() => setActiveTicket(b)}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-heading font-bold flex items-center gap-2 border border-white/10 transition"
                    >
                      <Ticket className="w-4 h-4 text-amber-400" />
                      <span>View Voucher</span>
                    </button>

                    {/* Download Tax Invoice */}
                    <Link
                      href={`/customer/invoices/${b._id}`}
                      className="px-3.5 py-2 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs sm:text-sm font-heading font-bold flex items-center gap-1.5 transition"
                      title="Download Official Tax Invoice"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Invoice</span>
                    </Link>

                    {/* Review button if attended or confirmed */}
                    {!isCancelled && (
                      <button
                        onClick={() => setReviewBookingTarget(b)}
                        className="px-3.5 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-xs sm:text-sm font-semibold text-slate-300 flex items-center gap-1.5 transition"
                      >
                        <Star className="w-4 h-4 text-amber-400" />
                        <span>Review</span>
                      </button>
                    )}

                    {/* Cancel booking if not already cancelled */}
                    {!isCancelled && (
                      <button
                        onClick={() => setCancelBookingTarget(b)}
                        className="px-3.5 py-2 rounded-xl border border-rose-500/30 hover:bg-rose-500/10 text-xs sm:text-sm font-semibold text-rose-400 transition"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Celebration Reservation Voucher Modal */}
      {activeTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-white">
            <div className="text-center space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full inline-block">
                Celebration Pass Voucher
              </span>
              <h3 className="font-heading font-bold text-xl text-white line-clamp-1">
                {activeTicket.event?.title}
              </h3>
              <p className="text-xs text-slate-400">
                {activeTicket.packageDetails?.name} • {activeTicket.guestsCount} Guest(s) Included
              </p>
            </div>

            {/* Reference Badge Card */}
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
                Booking Reference
              </span>
              <div className="font-mono text-xl font-black text-amber-400">
                {activeTicket.bookingReference}
              </div>
              <span className="text-[11px] text-emerald-400 font-semibold block">
                ✓ Confirmed Celebration Reservation
              </span>
            </div>

            {/* Shift & Venue Details */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" /> Date:
                </span>
                <span className="font-bold text-white">
                  {formatEventDate(activeTicket.selectedSlot?.date, "dd MMM yyyy")}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-amber-400" /> Time Slot:
                </span>
                <span className="font-bold text-white">
                  {activeTicket.selectedSlot?.startTime} – {activeTicket.selectedSlot?.endTime}
                </span>
              </div>
              <div className="flex items-start justify-between text-slate-300 pt-1 border-t border-white/5">
                <span className="flex items-center gap-1.5 text-slate-400 shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" /> Venue:
                </span>
                <span className="font-medium text-right text-slate-200 truncate max-w-[200px]">
                  {activeTicket.event?.venue?.name || "Private Venue"}, {activeTicket.event?.venue?.city}
                </span>
              </div>
            </div>

            {/* Host Contact Details */}
            <div className="bg-purple-950/40 border border-purple-500/20 rounded-2xl p-4 space-y-2.5">
              <span className="text-[10px] uppercase font-bold text-purple-300 tracking-wider block">
                Venue Host Contact Info
              </span>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">
                  {activeTicket.event?.contactInfo?.contactPerson || activeTicket.organiser?.name || "Venue Host Coordinator"}
                </span>
              </div>
              <div className="flex gap-2 pt-1">
                {(activeTicket.event?.contactInfo?.phone || activeTicket.organiser?.phone) && (
                  <a
                    href={`tel:${activeTicket.event?.contactInfo?.phone || activeTicket.organiser?.phone}`}
                    className="flex-1 py-2 px-3 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 text-purple-200 border border-purple-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Host</span>
                  </a>
                )}
                {(activeTicket.event?.contactInfo?.whatsapp || activeTicket.event?.contactInfo?.phone || activeTicket.organiser?.phone) && (
                  <a
                    href={`https://wa.me/${(activeTicket.event?.contactInfo?.whatsapp || activeTicket.event?.contactInfo?.phone || activeTicket.organiser?.phone || "").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi, I'm reaching out regarding my booking Ref: ${activeTicket.bookingReference}.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-200 border border-emerald-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Link
                href={`/customer/invoices/${activeTicket._id}`}
                className="flex-1 py-3 rounded-xl bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 text-xs sm:text-sm font-heading font-bold border border-amber-400/30 flex items-center justify-center gap-1.5 transition"
              >
                <FileText className="w-4 h-4" />
                <span>Tax Invoice</span>
              </Link>
              <button
                onClick={() => setActiveTicket(null)}
                className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-heading font-bold border border-white/10 transition"
              >
                Close Voucher
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Booking & Refund Dialog */}
      {cancelBookingTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-white">
            <h3 className="text-xl font-heading font-bold text-white flex items-center gap-2.5">
              <XCircle className="w-6 h-6 text-rose-400" />
              <span>Cancel Venue Booking</span>
            </h3>

            {(() => {
              const event = cancelBookingTarget.event;
              const refundCalc = calculateRefund({
                totalAmount: cancelBookingTarget.totalAmount,
                eventDate: cancelBookingTarget.selectedSlot?.date,
                cancellationPolicy: event?.cancellationPolicy,
              });

              return (
                <div className="space-y-4 text-sm">
                  <p className="text-slate-300">
                    Are you sure you want to cancel your pass for{" "}
                    <span className="font-bold text-white">{event?.title}</span>?
                  </p>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                    <span className="font-bold text-white block">Refund Eligibility:</span>
                    <p className="text-slate-400 text-xs sm:text-sm">{refundCalc.reason}</p>
                    {refundCalc.eligible && (
                      <p className="text-emerald-400 font-bold pt-1 text-sm">
                        Estimated Refund: {formatPrice(refundCalc.refundAmount)} (
                        {refundCalc.refundPercentage}%)
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Reason for cancellation:
                    </label>
                    <textarea
                      rows={2}
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="e.g., Schedule conflict, travel emergency..."
                      className="w-full p-3 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-sm focus:border-amber-400 outline-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setCancelBookingTarget(null)}
                      className="flex-1 py-3 rounded-xl border border-white/10 text-slate-300 font-heading font-bold text-xs sm:text-sm hover:bg-white/5 transition"
                    >
                      Keep Booking
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelBooking}
                      disabled={cancelling}
                      className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-heading font-bold text-xs sm:text-sm transition disabled:opacity-50"
                    >
                      {cancelling ? "Processing..." : "Confirm Cancellation"}
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Review Dialog */}
      {reviewBookingTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-white">
            <div>
              <h3 className="text-xl font-heading font-bold text-white">Review Your Experience</h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {reviewBookingTarget.event?.title}
              </p>
            </div>

            <div className="flex items-center gap-1.5 py-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  className="p-1 transition hover:scale-110"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= reviewRating
                        ? "text-amber-400 fill-amber-400"
                        : "text-slate-600 hover:text-amber-300"
                    }`}
                  />
                </button>
              ))}
              <span className="text-sm font-bold text-white ml-2">
                {reviewRating} of 5 Stars
              </span>
            </div>

            <textarea
              rows={3}
              placeholder="What did you love about this celebration? How was the ambiance, catering, hospitality, sound system?"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="w-full text-sm p-3.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 focus:border-amber-400 outline-none"
              required
            />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setReviewBookingTarget(null)}
                className="flex-1 py-3 rounded-xl border border-white/10 text-slate-300 font-heading font-bold text-xs sm:text-sm hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitReview}
                disabled={submittingReview || !reviewComment.trim()}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-heading font-bold text-xs sm:text-sm transition disabled:opacity-50"
              >
                {submittingReview ? "Posting..." : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
