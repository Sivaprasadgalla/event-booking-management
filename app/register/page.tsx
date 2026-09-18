"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { PartyPopper, User, Building2, Mail, Lock, Phone, ArrowRight, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const { toast } = useToast();

  const [role, setRole] = useState<"customer" | "organiser">("customer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          phone,
          companyName: role === "organiser" ? companyName : "",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(
          role === "organiser"
            ? "Welcome to CelebrateHub! Your host partner account is created."
            : "Welcome to CelebrateHub! Account created successfully.",
          "Account Created"
        );
        await refreshUser();
        if (role === "organiser") {
          router.push("/organiser/dashboard");
        } else {
          router.push("/events");
        }
      } else {
        const msg = data.error || "Failed to register account";
        setError(msg);
        toast.error(msg, "Registration Failed");
      }
    } catch {
      const msg = "An unexpected error occurred.";
      setError(msg);
      toast.error(msg, "Registration Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 relative overflow-hidden bg-slate-950 text-slate-100">
      {/* Background glow orbs */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-600/15 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-pink-600/15 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-lg w-full space-y-6 relative z-10">
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 text-white flex items-center justify-center font-bold shadow-lg shadow-purple-900/40">
              <PartyPopper className="w-6 h-6" />
            </div>
            <span className="text-2xl font-heading font-extrabold text-white tracking-tight">
              Celebrate<span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Hub</span>
            </span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-white">Create Your Account</h1>
          <p className="text-sm text-slate-300">Join our celebration venues & event hosting partner network</p>
        </div>

        {/* Role Picker */}
        <div className="grid grid-cols-2 gap-3 bg-slate-900/80 p-2 rounded-2xl border border-white/10">
          <button
            type="button"
            onClick={() => setRole("customer")}
            className={`py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
              role === "customer"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-900/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Party Host / Customer</span>
          </button>

          <button
            type="button"
            onClick={() => setRole("organiser")}
            className={`py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
              role === "organiser"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-900/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Venue Partner</span>
          </button>
        </div>

        {/* Form Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-white/10 p-7 sm:p-9 shadow-2xl space-y-5">
          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs sm:text-sm flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-4 top-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-white/10 bg-slate-950 text-white text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition placeholder:text-slate-500"
                  required
                />
              </div>
            </div>

            {role === "organiser" && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Venue / Company Name *</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-4 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Skyline Hospitality & Rooftops"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-white/10 bg-slate-950 text-white text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition placeholder:text-slate-500"
                    required
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-3.5 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-white/10 bg-slate-950 text-white text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition placeholder:text-slate-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-4 top-3.5 pointer-events-none" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-white/10 bg-slate-950 text-white text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition placeholder:text-slate-500"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-3.5 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-white/10 bg-slate-950 text-white text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition placeholder:text-slate-500"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm shadow-lg shadow-purple-900/40 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <span>{loading ? "Creating Account..." : "Create Account"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-white/10 text-center">
            <p className="text-xs sm:text-sm text-slate-400">
              Already have an account?{" "}
              <Link href="/login" className="font-bold text-purple-400 hover:text-purple-300 transition">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
