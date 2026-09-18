"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import { formatPrice, formatEventDate } from "@/lib/utils";
import {
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  Printer,
  Download,
  Ticket,
  ArrowRight,
  ShieldCheck,
  Video,
  Sparkles,
  FileText,
} from "lucide-react";

export default function BookingConfirmationPage() {
  const { orderId } = useParams();
  const router = useRouter();

  const [order, setOrder] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fire confetti celebration
    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch (e) {
      console.error(e);
    }

    if (!orderId) return;

    fetch(`/api/orders/${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.order) {
          setOrder(data.order);
          setBookings(data.bookings || []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCalendar = (booking: any) => {
    const event = booking.event;
    const title = event?.title || "Celebration";
    const dateStr = booking.selectedSlot?.date?.replace(/-/g, "") || "20261015";
    const startT = booking.selectedSlot?.startTime?.replace(":", "") || "1800";
    const endT = booking.selectedSlot?.endTime?.replace(":", "") || "2300";

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//CelebrateHub//NONSGML v1.0//EN
BEGIN:VEVENT
UID:${booking.bookingReference}@celebratehub.com
DTSTAMP:${dateStr}T${startT}00Z
DTSTART:${dateStr}T${startT}00Z
DTEND:${dateStr}T${endT}00Z
SUMMARY:${title}
DESCRIPTION:Celebration Pass Reference: ${booking.bookingReference} | Tier: ${booking.packageDetails?.name} | Guests: ${booking.guestsCount}
LOCATION:${event?.venue?.name || "Celebration Venue"}, ${event?.venue?.city || ""}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${booking.bookingReference}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-400">Retrieving your confirmed venue passes...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-2xl font-heading font-bold text-white">Order Not Found</h2>
        <Link
          href="/customer/bookings"
          className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-sm font-heading font-bold inline-block"
        >
          Go to My Bookings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header Banner */}
      <div className="text-center space-y-4 bg-slate-900/60 rounded-3xl p-8 sm:p-10 border border-white/10 backdrop-blur-xl shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle className="w-9 h-9" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-white tracking-tight">
          Celebration Confirmed!
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-lg mx-auto leading-relaxed">
          Thank you, <span className="font-bold text-white">{order.customerDetails?.name}</span>!
          Your payment has been securely verified and your digital celebration passes are ready below.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm">
          <span className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 font-mono font-bold text-slate-300">
            Order #{order.orderNumber}
          </span>
          <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
            Payment Paid ({formatPrice(order.totalAmount)})
          </span>
        </div>

        <div className="pt-4 flex flex-wrap justify-center gap-3">
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/10 text-xs sm:text-sm font-heading font-bold text-white flex items-center gap-2 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print Passes</span>
          </button>
          <Link
            href="/customer/bookings"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs sm:text-sm font-heading font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 transition"
          >
            <Ticket className="w-4 h-4" />
            <span>View in My Bookings</span>
          </Link>
          {bookings.length > 0 && (
            <Link
              href={`/customer/invoices/${bookings[0]._id}`}
              className="px-5 py-2.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs sm:text-sm font-heading font-bold flex items-center gap-2 transition"
            >
              <FileText className="w-4 h-4" />
              <span>Tax Invoice</span>
            </Link>
          )}
        </div>
      </div>

      {/* Digital Tickets Container */}
      <div className="space-y-6">
        <h2 className="text-xl font-heading font-bold text-white flex items-center gap-2.5">
          <Ticket className="w-6 h-6 text-amber-400" />
          <span>Your Digital Celebration Passes ({bookings.length})</span>
        </h2>

        {bookings.map((booking) => {
          const event = booking.event;
          return (
            <div
              key={booking._id}
              className="bg-slate-900/70 rounded-3xl border border-white/10 overflow-hidden shadow-xl print:shadow-none print:border transition hover:border-amber-400/30"
            >
              <div className="flex flex-col md:flex-row">
                {/* Left Ticket Details */}
                <div className="p-6 sm:p-8 flex-1 space-y-5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400/10 border border-amber-400/20 text-amber-300">
                      {booking.packageDetails.name}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-400">
                      REF: {booking.bookingReference}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl sm:text-2xl font-heading font-bold text-white leading-snug">
                      {event?.title}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                      Hosted by {booking.organiser?.companyName || booking.organiser?.name}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 text-xs sm:text-sm">
                    <div className="space-y-1">
                      <span className="text-xs uppercase font-bold text-slate-400 block tracking-wider">
                        Date
                      </span>
                      <span className="font-semibold text-white flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-amber-400" />
                        {formatEventDate(booking.selectedSlot.date, "dd MMM yyyy")}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs uppercase font-bold text-slate-400 block tracking-wider">
                        Time Slot
                      </span>
                      <span className="font-semibold text-white flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-amber-400" />
                        {booking.selectedSlot.startTime} - {booking.selectedSlot.endTime}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs uppercase font-bold text-slate-400 block tracking-wider">
                        Attendees
                      </span>
                      <span className="font-semibold text-white">
                        {booking.guestsCount} Guest(s)
                      </span>
                    </div>

                    <div className="col-span-2 sm:col-span-3 space-y-1 pt-1">
                      <span className="text-xs uppercase font-bold text-slate-400 block tracking-wider">
                        Venue Location
                      </span>
                      <span className="font-medium text-slate-300 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                        {event?.venue?.name}, {event?.venue?.address}, {event?.venue?.city}
                      </span>
                    </div>
                  </div>

                  {/* Add-ons list if any */}
                  {booking.selectedAddOns && booking.selectedAddOns.length > 0 && (
                    <div className="bg-white/5 rounded-2xl p-4 text-xs sm:text-sm space-y-1.5 border border-white/5">
                      <span className="text-xs uppercase font-bold text-slate-400 block tracking-wider">
                        Included Add-ons & Amenities
                      </span>
                      {booking.selectedAddOns.map((addon: any) => (
                        <div key={addon.addOnId} className="flex justify-between text-slate-300">
                          <span>
                            {addon.name} × {addon.quantity}
                          </span>
                          <span className="font-semibold text-white">{formatPrice(addon.total)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-2 flex flex-wrap gap-3 print:hidden">
                    <button
                      onClick={() => handleDownloadCalendar(booking)}
                      className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/10 text-xs sm:text-sm font-semibold text-slate-200 flex items-center gap-2 transition"
                    >
                      <Download className="w-4 h-4 text-amber-400" /> Add to Calendar (.ics)
                    </button>
                    <Link
                      href={`/customer/invoices/${booking._id}`}
                      className="px-4 py-2 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-xs sm:text-sm font-semibold text-amber-300 flex items-center gap-1.5 transition"
                    >
                      <FileText className="w-4 h-4" /> Download Tax Invoice
                    </Link>
                  </div>
                </div>

                {/* Right Ticket Stub with QR Code */}
                <div className="bg-slate-950/80 border-t md:border-t-0 md:border-l border-dashed border-white/15 p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-3 w-full md:w-68 shrink-0">
                  <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                    Entry Barcode / Pass
                  </span>

                  {/* QR Code image */}
                  {booking.qrCodeData && (
                    <div className="p-3 bg-white rounded-2xl shadow-lg">
                      <img
                        src={booking.qrCodeData}
                        alt={`QR Code for ${booking.bookingReference}`}
                        className="w-36 h-36 object-contain"
                      />
                    </div>
                  )}

                  <span className="font-mono text-sm font-black text-amber-400">
                    {booking.bookingReference}
                  </span>

                  <span className="text-xs text-slate-400 max-w-[170px] leading-relaxed">
                    Show this QR code at the venue gate for direct check-in
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
