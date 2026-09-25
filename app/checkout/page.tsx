"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { formatPrice, formatEventDate, isSlotStarted } from "@/lib/utils";
import ReservationTimer from "@/components/layout/ReservationTimer";
import {
  ShieldCheck,
  CreditCard,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles,
  Ticket,
  Mail,
  User,
  Phone,
  RefreshCw,
  X,
  LogIn,
  UserPlus,
} from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);

    const script = document.createElement("script");
    script.id = "razorpay-sdk-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, platformFee, taxAmount, totalAmount, clearCart, mergeGuestCartWithUser } = useCart();
  const { user, login, refreshUser } = useAuth();
  const { toast } = useToast();

  const [customerDetails, setCustomerDetails] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const [processing, setProcessing] = useState(false);

  // Auth Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register" | "verify">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // OTP Verification state in modal
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpResending, setOtpResending] = useState(false);
  const [otpResendCooldown, setOtpResendCooldown] = useState(0);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Open modal automatically if user is not logged in
  useEffect(() => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      setShowAuthModal(false);
    }
  }, [user]);

  // Synchronize customer details and silently sync cart when user logs in
  useEffect(() => {
    if (user) {
      setCustomerDetails({
        name: user.name,
        email: user.email,
        phone: user.phone || "",
      });
      mergeGuestCartWithUser().catch(console.error);
    }
  }, [user, mergeGuestCartWithUser]);

  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart");
    }
  }, [items, router]);

  // Resend cooldown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpResendCooldown > 0) {
      timer = setTimeout(() => setOtpResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpResendCooldown]);

  // Modal Login Handler
  const handleModalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    try {
      const res = await login(authEmail.trim(), authPassword);
      if (res.success) {
        toast.success("Signed in successfully.", "Welcome");
        await mergeGuestCartWithUser();
        setShowAuthModal(false);
      } else if (res.unverified) {
        toast.warning(
          res.error || "Please verify your email before continuing.",
          "Verification Required"
        );
        setAuthTab("verify");
        setOtpResendCooldown(60);
      } else {
        toast.error(res.error || "Invalid email or password.", "Authentication Failed");
      }
    } catch {
      toast.error("An unexpected error occurred during sign in.", "Network Error");
    } finally {
      setAuthLoading(false);
    }
  };

  // Modal Register Handler
  const handleModalRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authName.trim() || !authEmail.trim() || !authPassword) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (authPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setAuthLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: authName.trim(),
          email: authEmail.trim(),
          password: authPassword,
          phone: authPhone.trim(),
          role: "customer",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(
          `We've sent a 6-digit verification code to ${authEmail}.`,
          "Verification Code Sent"
        );
        setAuthTab("verify");
        setOtpResendCooldown(60);
      } else {
        toast.error(data.error || "Failed to create account.", "Registration Error");
      }
    } catch {
      toast.error("An unexpected error occurred during registration.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Modal OTP Digits change
  const handleOtpDigitChange = (index: number, value: string) => {
    const char = value.replace(/[^0-9]/g, "").slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);

    if (char && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    if (paste.length === 6) {
      setOtpDigits(paste.split(""));
      otpInputRefs.current[5]?.focus();
    }
  };

  // Modal OTP Verification Submit
  const handleModalVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpDigits.join("");
    if (code.length !== 6) {
      toast.error("Please enter the complete 6-digit code.");
      return;
    }

    setOtpVerifying(true);

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail.trim(), code }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Account verified successfully! You can now complete your booking.", "Verified");
        await refreshUser();
        await mergeGuestCartWithUser();
        setShowAuthModal(false);
      } else {
        toast.error(data.error || "Invalid or expired verification code.", "Verification Failed");
      }
    } catch {
      toast.error("Failed to verify code. Please check your connection.");
    } finally {
      setOtpVerifying(false);
    }
  };

  // Resend OTP in Modal
  const handleModalResendCode = async () => {
    try {
      setOtpResending(true);
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`New verification code sent to ${authEmail}`, "Code Resent");
        setOtpResendCooldown(60);
      } else {
        toast.error(data.error || "Failed to resend code.");
      }
    } catch {
      toast.error("An error occurred while resending the code.");
    } finally {
      setOtpResending(false);
    }
  };

  const hasExpiredItems = items.some((i) =>
    isSlotStarted(i.selectedSlot?.date, i.selectedSlot?.startTime)
  );

  const handlePayment = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    const expiredItem = items.find((i) =>
      isSlotStarted(i.selectedSlot?.date, i.selectedSlot?.startTime)
    );
    if (expiredItem) {
      const msg = `The shift for "${expiredItem.eventTitle}" on ${expiredItem.selectedSlot?.date} (${expiredItem.selectedSlot?.startTime}) has already started and cannot be booked. Please remove it from your cart.`;
      toast.error(msg, "Shift Already Started");
      return;
    }

    if (!customerDetails.name || !customerDetails.email || !customerDetails.phone) {
      toast.warning("Please complete all contact details (Name, Email, Phone) before proceeding.", "Missing Information");
      return;
    }

    setProcessing(true);

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

      const { razorpayOrderId, orderNumber, orderId, keyId, isSimulation } = orderData;

      // If simulated fallback or test key
      if (
        isSimulation ||
        !keyId ||
        keyId.includes("placeholder") ||
        keyId.includes("eventhub2026") ||
        keyId === "rzp_test_dummy"
      ) {
        toast.info("Confirming reservation passes...", "Processing");
        const verifyRes = await fetch("/api/payment/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            orderNumber,
            razorpayOrderId,
            razorpayPaymentId: `pay_sim_${Date.now()}`,
            razorpaySignature: `sig_sim_${Date.now()}`,
            items,
            customerDetails,
          }),
        });

        const verifyData = await verifyRes.json();
        if (!verifyRes.ok) {
          throw new Error(verifyData.error || "Payment verification failed");
        }

        toast.success("Reservation confirmed! Your celebration is locked in.", "Celebration Booked");
        router.push(`/booking-confirmation/${orderId}`);
        clearCart();
        return;
      }

      // Load Razorpay SDK
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || !window.Razorpay) {
        throw new Error("Unable to connect to Razorpay payment gateway. Please check your internet connection.");
      }

      // Trigger Razorpay Payment Dialog
      const options = {
        key: keyId,
        amount: totalAmount * 100,
        currency: "INR",
        name: "CelebrateHub Venues",
        description: `Reservation Pass #${orderNumber} (${items.length} Celebration Experience)`,
        order_id: razorpayOrderId,
        handler: async function (response: any) {
          try {
            setProcessing(true);
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId,
                orderNumber,
                razorpayOrderId: response.razorpay_order_id,
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

            toast.success("Payment successful! Your passes have been generated.", "Reservation Confirmed");
            router.push(`/booking-confirmation/${orderId}`);
            clearCart();
          } catch (err: any) {
            console.error("Verification error:", err);
            toast.error(err.message || "Failed to confirm payment. Please contact host support.", "Verification Error");
          } finally {
            setProcessing(false);
          }
        },
        prefill: {
          name: customerDetails.name,
          email: customerDetails.email,
          contact: customerDetails.phone,
        },
        theme: {
          color: "#9333ea",
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on("payment.failed", function (response: any) {
        toast.error(`Payment failed: ${response.error?.description || "Transaction declined"}`, "Payment Declined");
        setProcessing(false);
      });

      razorpayInstance.open();
    } catch (err: any) {
      console.error("Payment error:", err);
      toast.error(err.message || "An unexpected error occurred during checkout.", "Payment Error");
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner with Active Reservation Hold Timer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-purple-400 transition mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Celebration Cart
          </Link>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white flex items-center gap-3">
            <Lock className="w-6 h-6 text-purple-400" />
            <span>Secure Reservation Checkout</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Complete your guest reservation to lock the venue shift and receive instant entry passes.
          </p>
        </div>

        <ReservationTimer />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Customer Details & Venue Confirmation */}
        <div className="lg:col-span-2 space-y-6">
          {/* Authenticated Customer Details */}
          {user ? (
            <div className="bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-6 sm:p-7 backdrop-blur-xl shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-heading font-bold text-white flex items-center gap-2">
                      <span>Customer Details</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold uppercase tracking-wider">
                        Verified
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400">
                      Passes and tax invoices will be issued to these contact credentials.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Full Name</span>
                  <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Email Address</span>
                  <p className="text-xs font-semibold text-white truncate">{user.email}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Phone Number</span>
                  <p className="text-xs font-semibold text-white truncate">{user.phone || customerDetails.phone || "Provided at check-in"}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/90 border border-purple-500/30 rounded-3xl p-6 sm:p-7 backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-base sm:text-lg font-heading font-bold text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-400" />
                  <span>Account Authentication Required</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Please sign in or create an account to issue your verified digital entry pass.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAuthModal(true)}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-heading font-bold text-xs shadow-lg transition flex items-center gap-2 shrink-0 self-start sm:self-auto"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In or Register</span>
              </button>
            </div>
          )}

          {/* Contact Details Form (for additional phone number entry if missing) */}
          <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 sm:p-7 backdrop-blur-xl shadow-xl space-y-4">
            <h2 className="text-base font-heading font-bold text-white flex items-center gap-2">
              <Phone className="w-4 h-4 text-purple-400" />
              <span>Reservation Contact Phone Number</span>
            </h2>
            <p className="text-xs text-slate-400">
              Used for WhatsApp pass delivery and venue captain entry coordination.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Guest Contact Phone *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={customerDetails.phone}
                  onChange={(e) => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-white/10 text-white text-xs outline-none focus:border-purple-400 transition"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Guest Contact Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Primary guest name"
                  value={customerDetails.name}
                  onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-white/10 text-white text-xs outline-none focus:border-purple-400 transition"
                />
              </div>
            </div>
          </div>

          {/* Security & Cancellation Policy Box */}
          <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>CelebrateHub Buyer Protection & Guarantee</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every booking includes guaranteed slot reservation, direct host WhatsApp captain contact,
              and our tiered celebration cancellation protection. If the host cancels, 100% of your payment is refunded immediately.
            </p>
          </div>
        </div>

        {/* Right Column: Order Summary & Checkout Trigger */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-6 shadow-2xl sticky top-24">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-lg font-heading font-extrabold text-white flex items-center gap-2">
                <Ticket className="w-5 h-5 text-purple-400" />
                <span>Reservation Summary</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {items.length} {items.length === 1 ? "venue package" : "venue packages"} in reservation
              </p>
            </div>

            {/* Reserved Items List */}
            <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => {
                const isItemExpired = isSlotStarted(
                  item.selectedSlot?.date,
                  item.selectedSlot?.startTime
                );

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border text-xs space-y-1.5 transition ${
                      isItemExpired
                        ? "bg-rose-950/20 border-rose-500/40"
                        : "bg-slate-950/80 border-white/5"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-heading font-bold text-white text-xs line-clamp-1">
                        {item.eventTitle}
                      </span>
                      <span className="font-bold text-purple-300 shrink-0 font-mono">
                        {formatPrice(item.itemTotal)}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      {item.packageDetails.name} • {item.guestsCount} guest(s)
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>{formatEventDate(item.selectedSlot.date, "dd MMM yyyy")}</span>
                      <span>•</span>
                      <span>{item.selectedSlot.startTime}</span>
                    </div>

                    {isItemExpired && (
                      <div className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-md inline-flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>Shift Already Started (Booking Closed)</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Price Calculations */}
            <div className="border-t border-white/10 pt-4 space-y-2 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Shift Package Subtotal</span>
                <span className="font-semibold text-white">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Concierge Fee (5%)</span>
                <span>{formatPrice(platformFee)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (18% on platform fee)</span>
                <span>{formatPrice(taxAmount)}</span>
              </div>

              <div className="border-t border-white/10 pt-3 flex justify-between items-center text-sm font-extrabold text-white">
                <span>Total Amount</span>
                <span className="text-xl font-heading text-purple-400">{formatPrice(totalAmount)}</span>
              </div>
            </div>

            {/* Main Action Button */}
            {user ? (
              <button
                type="button"
                onClick={handlePayment}
                disabled={processing || hasExpiredItems}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-heading font-extrabold text-sm shadow-xl shadow-purple-900/30 flex items-center justify-center gap-2 transition hover:scale-[1.02] disabled:opacity-50 disabled:scale-100"
              >
                {processing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Connecting Payment Gateway...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Confirm & Pay {formatPrice(totalAmount)}</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowAuthModal(true)}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-heading font-extrabold text-sm shadow-xl shadow-purple-900/30 flex items-center justify-center gap-2 transition hover:scale-[1.02]"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In to Complete Reservation</span>
              </button>
            )}

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 text-center">
              <Lock className="w-3.5 h-3.5" />
              <span>Razorpay 256-bit Encrypted SSL Gateway</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* POPUP AUTHENTICATION MODAL (Triggered when user is unauthenticated)       */}
      {/* ========================================================================= */}
      {showAuthModal && !user && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-slate-900 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowAuthModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="space-y-1.5 pr-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>CelebrateHub Account</span>
              </div>
              <h3 className="text-xl font-heading font-black text-white">
                {authTab === "verify" ? "Verify Your Email" : "Sign In or Create Account"}
              </h3>
              <p className="text-xs text-slate-400">
                {authTab === "verify"
                  ? `Enter the 6-digit code sent to ${authEmail}`
                  : "Please authenticate to secure your celebration passes and proceed to payment."}
              </p>
            </div>

            {/* Tab Navigation (Only shown when not verifying) */}
            {authTab !== "verify" && (
              <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-white/10 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setAuthTab("login")}
                  className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                    authTab === "login"
                      ? "bg-purple-600 text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAuthTab("register")}
                  className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                    authTab === "register"
                      ? "bg-pink-600 text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create Account</span>
                </button>
              </div>
            )}

            {/* Form: Sign In */}
            {authTab === "login" && (
              <form onSubmit={handleModalLogin} className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="yourname@gmail.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-white/10 text-white text-xs outline-none focus:border-purple-400 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-white/10 text-white text-xs outline-none focus:border-purple-400 transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-heading font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 mt-1"
                >
                  {authLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In & Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Form: Create Account */}
            {authTab === "register" && (
              <form onSubmit={handleModalRegister} className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs outline-none focus:border-pink-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="yourname@gmail.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs outline-none focus:border-pink-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={authPhone}
                    onChange={(e) => setAuthPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs outline-none focus:border-pink-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Create Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    minLength={6}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs outline-none focus:border-pink-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-heading font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 mt-1"
                >
                  {authLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sending Verification Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue & Verify Email</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Form: Verify 6-Digit Code */}
            {authTab === "verify" && (
              <form onSubmit={handleModalVerifyOtp} className="space-y-4">
                <div className="space-y-2 text-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Enter 6-Digit Code
                  </label>
                  <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                    {otpDigits.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => {
                          otpInputRefs.current[i] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpDigitChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className="w-10 h-12 text-center text-xl font-mono font-bold rounded-xl border border-white/15 bg-slate-950 text-white outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-500"
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={otpVerifying || otpDigits.join("").length !== 6}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-heading font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {otpVerifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Verify & Continue to Payment</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <button
                    type="button"
                    onClick={() => setAuthTab("login")}
                    className="hover:text-white transition"
                  >
                    Back to Sign In
                  </button>

                  <button
                    type="button"
                    onClick={handleModalResendCode}
                    disabled={otpResending || otpResendCooldown > 0}
                    className="text-amber-400 hover:text-amber-300 disabled:text-slate-500 font-bold transition"
                  >
                    {otpResending
                      ? "Sending..."
                      : otpResendCooldown > 0
                      ? `Resend in ${otpResendCooldown}s`
                      : "Resend Code"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
