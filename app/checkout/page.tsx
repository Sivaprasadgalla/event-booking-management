"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { formatPrice, formatEventDate, isSlotStarted } from "@/lib/utils";
import {
  CreditCard,
  ShieldCheck,
  Lock,
  AlertCircle,
  User,
  Sparkles,
  CheckCircle,
  LogIn,
  UserPlus,
  ArrowRight,
  RefreshCw,
  Ticket,
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

    const existing = document.getElementById("razorpay-sdk-script");
    if (existing) return resolve(true);

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
  const { user, login, switchRole, refreshUser } = useAuth();
  const { toast } = useToast();

  const [customerDetails, setCustomerDetails] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Guest Auth State
  const [authTab, setAuthTab] = useState<"login" | "register" | "demo">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // Auto populate contact details & merge cart when user becomes available
  useEffect(() => {
    if (user) {
      setCustomerDetails({
        name: user.name,
        email: user.email,
        phone: user.phone || "",
      });
      // Synchronize & merge guest cart items with user's saved account cart
      mergeGuestCartWithUser().catch(console.error);
    }
  }, [user, mergeGuestCartWithUser]);

  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart");
    }
  }, [items, router]);

  // Handle Inline Login
  const handleInlineLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");

    try {
      const ok = await login(authEmail, authPassword);
      if (ok) {
        toast.success("Welcome back! Your guest celebration cart has been merged.", "Signed In");
        await mergeGuestCartWithUser();
      } else {
        setAuthError("Invalid email or password. Please try again.");
      }
    } catch {
      setAuthError("Failed to sign in. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Inline Register
  const handleInlineRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: authName,
          email: authEmail,
          password: authPassword,
          phone: authPhone,
          role: "customer",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(
          "Account created! We've sent a verification code to your Gmail.",
          "Verification Code Sent"
        );
        // After register, redirect to verify or login
        router.push(`/verify-email?email=${encodeURIComponent(authEmail)}`);
      } else {
        setAuthError(data.error || "Registration failed.");
      }
    } catch {
      setAuthError("An unexpected error occurred during registration.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Inline Demo Login
  const handleInlineDemo = async (role: "customer" | "organiser") => {
    setAuthLoading(true);
    setAuthError("");
    try {
      await switchRole(role);
      toast.success("Signed in with demo account. Guest cart merged!");
      await mergeGuestCartWithUser();
    } catch {
      setAuthError("Demo sign in failed.");
    } finally {
      setAuthLoading(false);
    }
  };

  const hasExpiredItems = items.some((i) =>
    isSlotStarted(i.selectedSlot?.date, i.selectedSlot?.startTime)
  );

  const handlePayment = async () => {
    if (!user) {
      toast.warning("Please sign in or create an account before completing your reservation.", "Account Required");
      return;
    }

    const expiredItem = items.find((i) =>
      isSlotStarted(i.selectedSlot?.date, i.selectedSlot?.startTime)
    );
    if (expiredItem) {
      const msg = `The shift for "${expiredItem.eventTitle}" on ${expiredItem.selectedSlot?.date} (${expiredItem.selectedSlot?.startTime}) has already started and cannot be booked. Please remove it from your cart.`;
      setErrorMessage(msg);
      toast.error(msg, "Shift Already Started");
      return;
    }

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

      const { razorpayOrderId, orderNumber, orderId, keyId, isSimulation } = orderData;

      // 1. If simulated order or test key
      if (
        isSimulation ||
        !keyId ||
        keyId.includes("placeholder") ||
        keyId.includes("eventhub2026") ||
        keyId === "rzp_test_dummy"
      ) {
        toast.info("Processing reservation verification...", "Instant Confirmation");
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

      // 2. Load Razorpay script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || !window.Razorpay) {
        throw new Error("Unable to connect to Razorpay payment gateway. Please check your internet connection.");
      }

      // 3. Trigger Razorpay Popup
      const options = {
        key: keyId,
        amount: totalAmount * 100,
        currency: "INR",
        name: "CelebrateHub Venues",
        description: `Reservation #${orderNumber} (${items.length} Celebration Pass${items.length > 1 ? "es" : ""})`,
        image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=200",
        order_id: razorpayOrderId,
        handler: async function (response: any) {
          try {
            toast.info("Verifying transaction with bank...", "Payment Processing");
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
            setErrorMessage(err.message || "Failed to confirm payment. Please contact host support.");
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
        setErrorMessage(`Payment failed: ${response.error?.description || "Transaction declined"}`);
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
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Guest Authentication Prompt / Logged in verification */}
          {!user ? (
            <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-pink-950/30 border border-purple-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Guest Account Detected</span>
                  </div>
                  <h2 className="text-xl font-heading font-black text-white">
                    Sign In or Register to Complete Reservation
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300">
                    Signing in locks your digital passes, allows instant QR gate entry, and merges your current
                    guest cart with any previously saved tickets in your profile.
                  </p>
                </div>
              </div>

              {/* Tabs */}
              <div className="grid grid-cols-3 gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-white/10 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab("login");
                    setAuthError("");
                  }}
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
                  onClick={() => {
                    setAuthTab("register");
                    setAuthError("");
                  }}
                  className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                    authTab === "register"
                      ? "bg-pink-600 text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab("demo");
                    setAuthError("");
                  }}
                  className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                    authTab === "demo"
                      ? "bg-amber-500 text-slate-950 shadow-md font-black"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Fast Demo</span>
                </button>
              </div>

              {authError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Form Tab: Login */}
              {authTab === "login" && (
                <form onSubmit={handleInlineLogin} className="space-y-3.5 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="email"
                      required
                      placeholder="Email (e.g. guest@celebratehub.com)"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white text-xs outline-none focus:border-purple-400"
                    />
                    <input
                      type="password"
                      required
                      placeholder="Password"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white text-xs outline-none focus:border-purple-400"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {authLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Signing In & Merging Carts...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In & Merge Guest Cart</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Form Tab: Register */}
              {authTab === "register" && (
                <form onSubmit={handleInlineRegister} className="space-y-3 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Full Name"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs outline-none focus:border-pink-400"
                    />
                    <input
                      type="email"
                      required
                      placeholder="Gmail Address"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs outline-none focus:border-pink-400"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="Phone Number"
                      value={authPhone}
                      onChange={(e) => setAuthPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs outline-none focus:border-pink-400"
                    />
                    <input
                      type="password"
                      required
                      placeholder="Create Password (min 6 chars)"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      minLength={6}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs outline-none focus:border-pink-400"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {authLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending Gmail Verification...</span>
                      </>
                    ) : (
                      <>
                        <span>Register & Verify Gmail</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Form Tab: Demo */}
              {authTab === "demo" && (
                <div className="space-y-3 pt-1">
                  <p className="text-xs text-slate-300">
                    Click below to instantly authenticate with a pre-seeded celebration customer profile.
                    Your guest cart items will be merged immediately.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleInlineDemo("customer")}
                    disabled={authLoading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>1-Click Sign In as Demo Customer (Merge Cart)</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Logged in state verification badge */
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Authenticated as {user.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 uppercase">
                      Cart Merged
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">{user.email}</div>
                </div>
              </div>

              <Link
                href="/login?returnUrl=/checkout"
                className="text-xs text-purple-400 hover:text-purple-300 underline font-semibold"
              >
                Switch Account
              </Link>
            </div>
          )}

          {/* Attendee Details Form */}
          <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
            <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2.5">
              <Lock className="w-5 h-5 text-amber-400" />
              <span>Celebration Contact & Admission Details</span>
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
              <span>Payment & Confirmation</span>
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
                disabled={processing || !user || hasExpiredItems}
                className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-heading font-bold text-sm shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2.5 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CreditCard className="w-4 h-4" />
                <span>
                  {hasExpiredItems
                    ? "Remove Expired Shift(s) in Cart to Proceed"
                    : processing
                    ? "Processing Payment..."
                    : !user
                    ? "Sign In or Register Above to Complete Reservation"
                    : `Pay ${formatPrice(totalAmount)} with Razorpay`}
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

            {hasExpiredItems && (
              <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-rose-300">
                  <AlertCircle className="w-4 h-4" />
                  <span>Expired Shift in Cart</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  One or more celebration shifts have already started. Please{" "}
                  <Link href="/cart" className="underline font-bold text-rose-300 hover:text-white">
                    return to your cart
                  </Link>{" "}
                  to remove them before completing payment.
                </p>
              </div>
            )}

            <div className="space-y-4 divide-y divide-white/10">
              {items.map((item) => {
                const isItemExpired = isSlotStarted(
                  item.selectedSlot?.date,
                  item.selectedSlot?.startTime
                );

                return (
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

                    {isItemExpired && (
                      <div className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-md inline-flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>Shift Already Started (Booking Closed)</span>
                      </div>
                    )}

                    {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                      <div className="text-xs text-slate-400 pl-2">
                        + {item.selectedAddOns.map((a) => `${a.name} (${a.quantity})`).join(", ")}
                      </div>
                    )}
                  </div>
                );
              })}
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
  );
}
