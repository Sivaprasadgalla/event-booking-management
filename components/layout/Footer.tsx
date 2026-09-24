"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCms } from "@/context/CmsContext";
import { PartyPopper, ShieldCheck, CreditCard, Sparkles, Building2 } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();
  const { cms } = useCms();

  // Hide footer on dashboard and auth pages for clean layout
  if (
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/organiser") ||
    pathname?.startsWith("/customer") ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/verify-email" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password"
  ) {
    return null;
  }

  const footer = cms?.footer;
  const brandName = cms?.header?.brandName || "CelebrateHub";
  const columns = footer?.columns || [];
  const trustBadges = footer?.trustBadges || [];

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
              <span className="font-extrabold text-base tracking-tight text-white">
                {brandName}
              </span>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed">
              {footer?.brandDescription ||
                "The premier celebration venue & hosting partner marketplace. Reserve private rooftops, luxury farmhouses, and grand ballrooms for birthdays, anniversaries, and unforgettable milestones."}
            </p>

            {/* Dynamic Trust Badges */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              {trustBadges.map((badge, idx) => (
                <span key={idx} className="flex items-center gap-1 text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{badge.text}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Dynamic Link Columns */}
          {columns.map((col, idx) => (
            <div key={idx}>
              <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">
                {col.title}
              </h4>
              <ul className="space-y-2 text-xs">
                {(col.links || []).map((link, lIdx) => (
                  <li key={lIdx}>
                    <Link href={link.href} className="hover:text-white transition">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom copyright row */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>{footer?.copyrightText || `© ${new Date().getFullYear()} ${brandName}. All rights reserved.`}</p>
          <p className="flex items-center gap-1 text-slate-400">
            Crafted for premium celebration venue booking & hosting experiences
          </p>
        </div>
      </div>
    </footer>
  );
}
