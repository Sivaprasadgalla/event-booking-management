"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { formatPrice, formatEventDate } from "@/lib/utils";
import {
  Printer,
  Download,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  Clock,
  MapPin,
  Building2,
  FileText,
  Sparkles,
} from "lucide-react";

export default function CustomerInvoicePage() {
  const { bookingId } = useParams();
  const router = useRouter();

  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!bookingId) return;

    fetch(`/api/customer/invoices/${bookingId}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to load invoice");
        }
        setInvoiceData(data.invoice);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "Failed to retrieve invoice details");
      })
      .finally(() => setLoading(false));
  }, [bookingId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-400 font-medium">Generating official tax invoice...</p>
      </div>
    );
  }

  if (error || !invoiceData) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
          <FileText className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-heading font-bold text-white">Invoice Unavailable</h2>
        <p className="text-sm text-slate-400">{error || "Could not locate invoice for this booking."}</p>
        <Link
          href="/customer/bookings"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-heading font-bold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to My Bookings</span>
        </Link>
      </div>
    );
  }

  const { booking, order, event, organiser, customer, invoiceNumber, invoiceDate } = invoiceData;

  // Subtotal & Taxes Breakdown
  const packageTotal = (booking.packageDetails?.price || 0) * (booking.guestsCount || 1);
  const addOnsTotal = (booking.selectedAddOns || []).reduce(
    (sum: number, a: any) => sum + (a.total || 0),
    0
  );
  const bookingSubtotal = booking.subtotal || packageTotal + addOnsTotal;

  // 5% Platform fee and 18% GST (9% CGST + 9% SGST)
  const platformFee = Math.round(bookingSubtotal * 0.05);
  const cgstAmount = Math.round((bookingSubtotal + platformFee) * 0.09);
  const sgstAmount = Math.round((bookingSubtotal + platformFee) * 0.09);
  const totalGst = cgstAmount + sgstAmount;
  const finalTotal = booking.totalAmount || bookingSubtotal + platformFee + totalGst;

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      {/* Top Action Bar (hidden on print) */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <Link
          href="/customer/bookings"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-heading font-bold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Bookings</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs sm:text-sm font-heading font-bold flex items-center gap-2 shadow-lg shadow-amber-500/25 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Download PDF / Print Invoice</span>
          </button>
        </div>
      </div>

      {/* Invoice Document Paper Container */}
      <div
        id="tax-invoice-document"
        className="max-w-4xl mx-auto bg-slate-900/90 text-slate-100 border border-white/10 rounded-3xl p-6 sm:p-12 shadow-2xl backdrop-blur-2xl space-y-8 print:bg-white print:text-slate-900 print:border-none print:shadow-none print:p-0 print:m-0"
      >
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-white/10 print:border-slate-300">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 flex items-center justify-center text-white font-bold shadow-md print:bg-slate-900">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-heading font-black text-2xl tracking-tight text-white print:text-slate-900">
                Celebrate<span className="text-amber-400 print:text-purple-700">Hub</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 print:text-slate-600 font-medium">
              CelebrateHub Luxury Technologies Pvt. Ltd.
            </p>
            <p className="text-[11px] text-slate-400 print:text-slate-600 max-w-xs leading-relaxed">
              Level 14, Penthouse Towers, Bandra Kurla Complex, Mumbai, MH 400051
              <br />
              GSTIN: <strong className="text-white print:text-slate-900">27AABCC1234F1Z5</strong> | SAC: 998555
            </p>
          </div>

          <div className="text-left sm:text-right space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 print:bg-slate-100 print:text-slate-800 print:border-slate-300 text-xs font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Tax Invoice (Paid)
            </div>
            <div className="font-mono text-sm sm:text-base font-black text-white print:text-slate-900 pt-1">
              {invoiceNumber}
            </div>
            <p className="text-xs text-slate-400 print:text-slate-600">
              Date: <strong className="text-slate-200 print:text-slate-800">{formatEventDate(invoiceDate, "dd MMMM yyyy")}</strong>
            </p>
            <p className="text-xs text-slate-400 print:text-slate-600">
              Booking Ref: <strong className="font-mono text-amber-400 print:text-purple-700">{booking.bookingReference}</strong>
            </p>
          </div>
        </div>

        {/* Billed By & Billed To Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs sm:text-sm">
          {/* Billed By (Venue Host Partner) */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-2 print:bg-slate-50 print:border-slate-200">
            <span className="text-[11px] uppercase font-bold text-amber-400 print:text-purple-700 tracking-wider block">
              Venue Host & Partner
            </span>
            <div className="font-heading font-bold text-white print:text-slate-900 text-base">
              {organiser?.companyName || organiser?.name || "Celebration Host Partner"}
            </div>
            <p className="text-slate-300 print:text-slate-700">
              <strong>Venue:</strong> {event?.venue?.name || event?.title}
            </p>
            <p className="text-slate-400 print:text-slate-600 text-xs leading-relaxed">
              {event?.venue?.address || "Private Venue Estate"}, {event?.venue?.city || "Mumbai"}
            </p>
            <p className="text-slate-400 print:text-slate-600 text-xs">
              Contact: {organiser?.email || "host@celebratehub.com"}
            </p>
          </div>

          {/* Billed To (Customer Host) */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-2 print:bg-slate-50 print:border-slate-200">
            <span className="text-[11px] uppercase font-bold text-amber-400 print:text-purple-700 tracking-wider block">
              Billed To (Customer / Host)
            </span>
            <div className="font-heading font-bold text-white print:text-slate-900 text-base">
              {order?.customerDetails?.name || customer?.name}
            </div>
            <p className="text-slate-300 print:text-slate-700">
              <strong>Email:</strong> {order?.customerDetails?.email || customer?.email}
            </p>
            <p className="text-slate-300 print:text-slate-700">
              <strong>Phone:</strong> {order?.customerDetails?.phone || customer?.phone || "+91 Contact"}
            </p>
            <p className="text-slate-400 print:text-slate-600 text-xs">
              Place of Supply: {event?.venue?.city || "Maharashtra (27)"}
            </p>
          </div>
        </div>

        {/* Celebration Reservation Details Bar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm print:bg-slate-100 print:border-slate-200">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400 print:text-purple-700" />
            <span>
              Celebration Date:{" "}
              <strong className="text-white print:text-slate-900">
                {formatEventDate(booking.selectedSlot?.date, "EEEE, dd MMMM yyyy")}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400 print:text-purple-700" />
            <span>
              Time Shift:{" "}
              <strong className="text-white print:text-slate-900">
                {booking.selectedSlot?.startTime} – {booking.selectedSlot?.endTime}
              </strong>
            </span>
          </div>

          <div>
            <span>
              Pass Count:{" "}
              <strong className="text-white print:text-slate-900">
                {booking.guestsCount} Guest(s)
              </strong>
            </span>
          </div>
        </div>

        {/* Itemized Charges Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/10 print:border-slate-300 text-slate-400 print:text-slate-600 uppercase text-[11px] tracking-wider">
                <th className="py-3 px-3">Description</th>
                <th className="py-3 px-3 text-center">Qty / Guests</th>
                <th className="py-3 px-3 text-right">Unit Rate</th>
                <th className="py-3 px-3 text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 print:divide-slate-200">
              {/* Package tier row */}
              <tr className="hover:bg-white/5 print:hover:bg-transparent">
                <td className="py-3.5 px-3">
                  <div className="font-heading font-bold text-white print:text-slate-900">
                    {event?.title}
                  </div>
                  <div className="text-xs text-amber-300 print:text-purple-700 font-medium">
                    Package Tier: {booking.packageDetails?.name}
                  </div>
                </td>
                <td className="py-3.5 px-3 text-center text-slate-300 print:text-slate-700 font-semibold">
                  {booking.guestsCount}
                </td>
                <td className="py-3.5 px-3 text-right text-slate-300 print:text-slate-700 font-mono">
                  {formatPrice(booking.packageDetails?.price || 0)}
                </td>
                <td className="py-3.5 px-3 text-right font-heading font-bold text-white print:text-slate-900 font-mono">
                  {formatPrice(packageTotal)}
                </td>
              </tr>

              {/* Add-ons rows if any */}
              {booking.selectedAddOns &&
                booking.selectedAddOns.map((addon: any, idx: number) => (
                  <tr key={idx} className="hover:bg-white/5 print:hover:bg-transparent text-slate-300 print:text-slate-700">
                    <td className="py-3 px-3 pl-6">
                      <span className="font-medium text-slate-200 print:text-slate-800">
                        + {addon.name}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-medium">{addon.quantity}</td>
                    <td className="py-3 px-3 text-right font-mono text-xs">
                      {formatPrice(addon.unitPrice)}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold font-mono text-slate-100 print:text-slate-900">
                      {formatPrice(addon.total)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Calculation Summary & Total Due */}
        <div className="pt-4 border-t border-white/10 print:border-slate-300 flex flex-col sm:flex-row justify-between gap-6">
          <div className="space-y-3 max-w-sm">
            <span className="text-[11px] uppercase font-bold text-slate-400 print:text-slate-600 tracking-wider block">
              Payment & Security Verification
            </span>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300 print:bg-slate-50 print:border-slate-200 print:text-slate-700 space-y-1">
              <div>
                Payment Mode: <strong className="text-white print:text-slate-900">Razorpay 256-bit Encrypted</strong>
              </div>
              {order?.razorpayPaymentId && (
                <div>
                  Payment Ref ID:{" "}
                  <strong className="font-mono text-amber-300 print:text-purple-700">
                    {order.razorpayPaymentId}
                  </strong>
                </div>
              )}
              <div>
                Status: <strong className="text-emerald-400 print:text-emerald-700">Payment Captured (PAID)</strong>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 print:text-slate-500 leading-relaxed">
              This is a computer-generated electronic tax invoice complying with the provisions of the CGST/SGST Act. No physical signature is required.
            </p>
          </div>

          <div className="w-full sm:w-72 space-y-2.5 text-xs sm:text-sm">
            <div className="flex justify-between text-slate-300 print:text-slate-700">
              <span>Items Subtotal</span>
              <span className="font-semibold text-white print:text-slate-900 font-mono">
                {formatPrice(bookingSubtotal)}
              </span>
            </div>
            <div className="flex justify-between text-slate-400 print:text-slate-600 text-xs">
              <span>Platform Fee (5%)</span>
              <span className="font-medium font-mono">{formatPrice(platformFee)}</span>
            </div>
            <div className="flex justify-between text-slate-400 print:text-slate-600 text-xs">
              <span>CGST (9%)</span>
              <span className="font-medium font-mono">{formatPrice(cgstAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-400 print:text-slate-600 text-xs">
              <span>SGST (9%)</span>
              <span className="font-medium font-mono">{formatPrice(sgstAmount)}</span>
            </div>
            <div className="border-t border-white/10 print:border-slate-300 pt-3 flex justify-between text-base sm:text-lg font-heading font-black text-white print:text-slate-900">
              <span>Total Amount Paid</span>
              <span className="text-amber-400 print:text-purple-700 font-mono">
                {formatPrice(finalTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Verified Reservation Voucher Badge & Footer Note */}
        <div className="pt-6 border-t border-white/10 print:border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/5 print:bg-slate-100 rounded-2xl border border-white/10 print:border-slate-300 text-center shrink-0">
              <span className="text-[10px] font-bold text-amber-400 print:text-purple-700 uppercase tracking-wider block">
                Official Voucher
              </span>
              <span className="font-mono text-sm font-black text-white print:text-slate-900 block">
                {booking.bookingReference}
              </span>
            </div>
            <div className="space-y-0.5 text-xs">
              <span className="font-heading font-bold text-white print:text-slate-900 block">
                Confirmed Celebration Booking Voucher
              </span>
              <span className="text-[11px] text-slate-400 print:text-slate-600 block max-w-xs">
                Provide this reservation reference upon arrival for your private celebration and hospitality hosting.
              </span>
            </div>
          </div>

          <div className="text-center sm:text-right space-y-1">
            <div className="font-heading font-bold text-white print:text-slate-900 text-xs">
              CelebrateHub Technologies Inc.
            </div>
            <p className="text-[11px] text-slate-400 print:text-slate-600">
              Customer Concierge: support@celebratehub.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
