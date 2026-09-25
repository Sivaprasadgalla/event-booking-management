"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { formatPrice, formatEventDate } from "@/lib/utils";
import { FileText, ArrowRight, Download, Calendar, CheckCircle } from "lucide-react";

export default function CustomerInvoicesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login?returnUrl=/customer/invoices");
      return;
    }
    if (user) {
      fetch("/api/customer/bookings")
        .then((res) => res.json())
        .then((data) => {
          setBookings(data.bookings || []);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user, isLoading, router]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-black text-white flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-pink-400" />
            <span>Tax Invoices & Receipts</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Download GST-compliant tax invoices for your celebration venue bookings and add-on services.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-white/10 space-y-3">
          <FileText className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-heading font-bold text-white">No Invoices Generated Yet</h3>
          <p className="text-xs text-slate-400">
            Once you reserve a celebration venue, your official GST invoice will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-pink-500/30 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-pink-400">
                    INV-{booking.bookingNumber}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                    Paid in Full
                  </span>
                </div>
                <h4 className="font-heading font-bold text-white text-base">
                  {booking.eventTitle}
                </h4>
                <p className="text-xs text-slate-400 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Celebration Date: {formatEventDate(booking.bookingDate)}</span>
                  <span>•</span>
                  <span>Guests: {booking.guestsCount}</span>
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-lg font-heading font-black text-white">
                    {formatPrice(booking.pricing?.totalPrice || 0)}
                  </div>
                  <div className="text-[11px] text-slate-400">Includes 18% GST</div>
                </div>

                <Link
                  href={`/customer/invoices/${booking._id}`}
                  className="px-4 py-2.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 hover:text-white border border-pink-500/30 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <span>View Tax Invoice</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
