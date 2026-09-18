import React from "react";
import Link from "next/link";
import { PartyPopper, ShieldCheck, CreditCard, Sparkles, Building2 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 text-sm border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5 text-white">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-purple-900/40">
                <PartyPopper className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base tracking-tight">
                Celebrate<span className="text-purple-400">Hub</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              The premier celebration venue & hosting partner marketplace. Reserve private rooftops, luxury farmhouses, and grand ballrooms for birthdays, anniversaries, and unforgettable milestones.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified Partners
              </span>
              <span className="flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-purple-400" /> Razorpay Secured
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">
              Celebration Venues
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/events?category=rooftops" className="hover:text-white transition">
                  Rooftops & Sky Lounges
                </Link>
              </li>
              <li>
                <Link href="/events?category=farmhouses-villas" className="hover:text-white transition">
                  Private Farmhouses & Pool Villas
                </Link>
              </li>
              <li>
                <Link href="/events?category=banquets" className="hover:text-white transition">
                  Grand Ballrooms & Banquets
                </Link>
              </li>
              <li>
                <Link href="/events?category=garden-lawns" className="hover:text-white transition">
                  Garden & Beachfront Lawns
                </Link>
              </li>
              <li>
                <Link href="/events?category=boutique-venues" className="hover:text-white transition">
                  Intimate Speakeasies & Cellars
                </Link>
              </li>
            </ul>
          </div>

          {/* For Hosting Partners */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">
              For Hosting Partners
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/register" className="hover:text-white transition">
                  Join as Venue Partner
                </Link>
              </li>
              <li>
                <Link href="/organiser/dashboard" className="hover:text-white transition">
                  Partner Dashboard
                </Link>
              </li>
              <li>
                <Link href="/organiser/events/new" className="hover:text-white transition">
                  List Celebration Venue
                </Link>
              </li>
              <li>
                <Link href="/organiser/bookings" className="hover:text-white transition">
                  Guest Verification & Check-In
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Safety */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">
              Platform & Concierge
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="hover:text-white cursor-pointer transition">
                  Customer Protection & Fair Refunds
                </span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition">
                  Venue Safety Standards
                </span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition">
                  Terms of Service
                </span>
              </li>
              <li>
                <Link href="/admin/dashboard" className="text-purple-400 hover:text-purple-300 transition">
                  Administrator Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} CelebrateHub Technologies Inc. All rights reserved.</p>
          <p className="flex items-center gap-1 text-slate-400">
            Crafted for premium celebration venue booking & hosting experiences
          </p>
        </div>
      </div>
    </footer>
  );
}
