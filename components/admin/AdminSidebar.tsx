"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Shield,
  LayoutDashboard,
  Building2,
  Users,
  RotateCcw,
  Settings,
  LogOut,
  ExternalLink,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  Server,
  PlusCircle,
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    {
      title: "Command Center",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      title: "Venue Moderation",
      href: "/admin/events",
      icon: Building2,
      badge: "Pending",
    },
    {
      title: "Create & Assign Venue",
      href: "/admin/events/new",
      icon: PlusCircle,
      badge: "Studio",
    },
    {
      title: "CMS Content Studio",
      href: "/admin/cms",
      icon: Sparkles,
      badge: "Live",
    },
    {
      title: "Users & Hosts",
      href: "/admin/users",
      icon: Users,
      badge: null,
    },
    {
      title: "Disputes & Refunds",
      href: "/admin/refunds",
      icon: RotateCcw,
      badge: null,
    },
    {
      title: "Commission & Settings",
      href: "/admin/settings",
      icon: Settings,
      badge: null,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between bg-slate-950/95 border-r border-amber-500/10 text-slate-300">
      {/* Top Brand & Badge */}
      <div className="p-6 space-y-6">
        <Link href="/admin/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20 group-hover:scale-105 transition">
            <Shield className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-extrabold text-base text-white tracking-tight">
                Celebrate<span className="text-amber-400">Admin</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300/80">
                Governance Suite
              </span>
            </div>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="space-y-1.5 pt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition ${
                  isActive
                    ? "bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-300 border border-amber-500/30 shadow-lg shadow-amber-500/5 font-bold"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-amber-400" : "text-slate-500"}`} />
                  <span>{item.title}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Status & User */}
      <div className="p-5 border-t border-white/5 space-y-4">
        {/* Switch to Customer Marketplace Storefront */}
        <Link
          href="/events"
          className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 border border-white/5 transition group"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-semibold text-white">Customer Storefront</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition" />
        </Link>

        {/* Live Health Badge */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 text-[11px] text-slate-400 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Server className="w-3 h-3 text-emerald-400" /> Platform Core
            </span>
            <span className="text-emerald-400 font-bold">100% Online</span>
          </div>
          <p className="text-[10px] text-slate-400">Commission Engine: 5% Platform Fee</p>
        </div>

        {/* Admin Identity & Logout */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center font-bold text-xs shrink-0">
              {user?.name?.charAt(0) || "A"}
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-white truncate">{user?.name || "Administrator"}</div>
              <div className="text-[10px] text-amber-400 font-mono">Platform Admin</div>
            </div>
          </div>
          <button
            onClick={() => logout()}
            title="Sign Out"
            className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0 h-screen sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Trigger Bar */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-slate-950 border-b border-amber-500/10 text-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
            <Shield className="w-4 h-4" />
          </div>
          <span className="font-heading font-extrabold text-sm text-white">
            Celebrate<span className="text-amber-400">Admin</span>
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-slate-400 hover:text-white rounded-xl bg-white/5"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
