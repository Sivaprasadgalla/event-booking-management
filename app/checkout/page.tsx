"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { formatPrice, formatEventDate } from "@/lib/utils";
import {
  CreditCard,
  ShieldCheck,
  Calendar,
  Clock,
  MapPin,
  Lock,
  Sparkles,
  AlertCircle,
  Building2,
  CheckCircle2,
} from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, platformFee, taxAmount, totalAmount, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();

  const [customerDetails, setCustomerDetails] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (user) {
      setCustomerDetails({
        name: user.name,
        email: user.email,
        phone: user.phone || "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (items.length === 0) {
      router.push("/events");
    }
  }, [items, router]);

  const handlePayment = async () => {
    if (!customerDetails.name || !customerDetails.email || !customerDetails.phone) {
      const msg = "Please complete all contact details (Name, Email, Phone) before proceeding.";
      setErrorMessage(msg);
      toast.warning(msg, "Missing Information");
      return;
    }

    setProcessing(true);
    setErrorMessage("");

    try {
      // 1. Create order on server
      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          customerDetails,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || "Failed to initialize order");
      }

      const { razorpayOrderId, orderNumber, orderId, keyId } = orderData;

      // 2. Trigger Razorpay Client Popup
      const options = {
        key: keyId,
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        name: "CelebrateHub Luxury Celebrations",
        description: `Booking for ${items.length} celebration venue pass(es)`,
        order_id: razorpayOrderId,
        prefill: {
          name: customerDetails.name,
          email: customerDetails.email,
          contact: customerDetails.phone,
        },
        theme: {
          color: "#f59e0b",
        },
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId,
                orderNumber,
                razorpayOrderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                items,
                customerDetails,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error(verifyData.error || "Payment verification failed");
            }

            toast.success("Payment verified! Your celebration is confirmed.", "Celebration Booked");
            clearCart();
            router.push(`/booking-confirmation/${orderId}`);
          } catch (err: any) {
            setErrorMessage(err.message);
            toast.error(err.message || "Payment verification failed", "Verification Error");
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            toast.info("Payment window dismissed. Your cart is preserved.", "Checkout Paused");
            setProcessing(false);
          },
        },
      };

      if (!window.Razorpay) {
        throw new Error("Razorpay payment gateway SDK is loading. Please retry in a moment.");
      }

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on("payment.failed", function (response: any) {
        setErrorMessage(`Payment failed: ${response.error.description}`);
        setProcessing(false);
      });

      razorpayInstance.open();
    } catch (error: any) {
      console.error("Payment error:", error);
      setErrorMessage(error.message || "An unexpected error occurred during payment.");
      setProcessing(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-white tracking-tight">
            Checkout & Confirmation
          </h1>
          <p className="text-sm sm:text-base text-slate-400 mt-1">
            Confirm celebration contact details and complete secure payment to lock your date
          </p>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Attendee Information */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
              <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2.5">
                <Lock className="w-5 h-5 text-amber-400" />
                <span>1. Celebration Host / Contact Details</span>
              </h2>

              <p className="text-sm text-slate-400">
                Your digital venue passes, host access codes, and gate entry QR verification will be dispatched to this contact info.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Primary Host / Guest Name
                  </label>
                  <input
                    type="text"
                    value={customerDetails.name}
                    onChange={(e) =>
                      setCustomerDetails({ ...customerDetails, name: e.target.value })
                    }
                    className="w-full p-3.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-sm font-medium focus:border-amber-400 outline-none transition"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={customerDetails.email}
                    onChange={(e) =>
                      setCustomerDetails({ ...customerDetails, email: e.target.value })
                    }
                    className="w-full p-3.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-sm font-medium focus:border-amber-400 outline-none transition"
                    placeholder="name@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={customerDetails.phone}
                    onChange={(e) =>
                      setCustomerDetails({ ...customerDetails, phone: e.target.value })
                    }
                    className="w-full p-3.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-sm font-medium focus:border-amber-400 outline-none transition"
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Details */}
            <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
              <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2.5">
                <CreditCard className="w-5 h-5 text-amber-400" />
                <span>2. Online Payment via Razorpay</span>
              </h2>

              <p className="text-sm text-slate-400">
                Supports UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, NetBanking, and Wallets with 256-bit bank grade encryption.
              </p>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-heading font-black text-xl">
                    ₹
                  </div>
                  <div>
                    <span className="text-sm font-heading font-bold text-white block">
                      Razorpay Verified Payment Gateway
                    </span>
                    <span className="text-xs text-slate-400">
                      HMAC SHA-256 Server Signature Verification
                    </span>
                  </div>
                </div>
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>

              {/* Payment Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handlePayment}
                  disabled={processing}
                  className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-heading font-bold text-sm shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2.5 transition disabled:opacity-50"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>
                    {processing ? "Processing Payment..." : `Pay ${formatPrice(totalAmount)} with Razorpay`}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Order Items Summary */}
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 sm:p-7 backdrop-blur-xl shadow-xl space-y-5 sticky top-24">
              <h3 className="text-base font-heading font-bold text-white pb-3 border-b border-white/10">
                Celebration Passes ({items.length})
              </h3>

              <div className="space-y-4 divide-y divide-white/10">
                {items.map((item) => (
                  <div key={item.id} className="pt-4 first:pt-0 space-y-1.5">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-sm font-heading font-bold text-white line-clamp-1">
                        {item.eventTitle}
                      </span>
                      <span className="text-sm font-heading font-bold text-amber-400 shrink-0">
                        {formatPrice(item.itemTotal)}
                      </span>
                    </div>

                    <div className="text-xs text-amber-300 font-semibold">
                      {item.packageDetails.name} • {item.guestsCount} guest(s)
                    </div>

                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <span>{formatEventDate(item.selectedSlot.date, "dd MMM yyyy")}</span>
                      <span>•</span>
                      <span>{item.selectedSlot.startTime}</span>
                    </div>

                    {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                      <div className="text-xs text-slate-400 pl-2">
                        + {item.selectedAddOns.map((a) => `${a.name} (${a.quantity})`).join(", ")}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Price totals */}
              <div className="border-t border-white/10 pt-4 space-y-2.5 text-sm text-slate-300">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-white">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Platform Fee (5%)</span>
                  <span className="font-medium text-slate-300">{formatPrice(platformFee)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>GST & Hospitality Taxes (18%)</span>
                  <span className="font-medium text-slate-300">{formatPrice(taxAmount)}</span>
                </div>
                <div className="border-t border-white/10 pt-3 flex justify-between text-lg font-heading font-black text-white">
                  <span>Total Amount</span>
                  <span className="text-amber-400 text-xl">{formatPrice(totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
