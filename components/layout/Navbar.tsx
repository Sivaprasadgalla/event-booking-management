"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useCms } from "@/context/CmsContext";
import {
  Sparkles,
  Search,
  ShoppingCart,
  User,
  LogOut,
  LayoutDashboard,
  Ticket,
  PlusCircle,
  Menu,
  X,
  Building2,
  PartyPopper,
  ArrowRight,
} from "lucide-react";
import ReservationTimer from "./ReservationTimer";
import ThemeToggle from "@/components/common/ThemeToggle";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount, openDrawer } = useCart();
  const { cms } = useCms();
  const router = useRouter();
  const pathname = usePathname();

  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // If in admin, organiser or customer portals, or in auth pages, DO NOT render public navbar
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/events?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const navLinks = cms?.header?.navLinks || [];
  const brandName = cms?.header?.brandName || "CelebrateHub";
  const brandTagline = cms?.header?.brandTagline || "Venue & Hosting";
  const searchPlaceholder = cms?.header?.searchPlaceholder || "Search rooftops, villas, banquets, occasions...";
  const announcement = cms?.header?.announcement;

  return (
    <>
      {/* Dynamic Announcement Bar */}
      {announcement?.enabled && announcement?.text && (
        <div className="bg-gradient-to-r from-purple-900/90 via-pink-900/90 to-purple-900/90 border-b border-purple-500/20 py-2 px-4 text-center text-xs text-slate-200 flex items-center justify-center gap-2">
          <span>{announcement.text}</span>
          {announcement.linkText && (
            <Link
              href={announcement.linkUrl || "/events"}
              className="font-bold underline text-amber-300 hover:text-white flex items-center gap-0.5 ml-1"
            >
              <span>{announcement.linkText}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      )}

      <header className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-xl border-b border-white/10 text-white transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Dynamic Brand Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-purple-900/40 group-hover:scale-105 transition">
                <PartyPopper className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-extrabold text-lg leading-tight tracking-tight text-white flex items-center gap-1">
                  {brandName}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                  {brandTagline}
                </span>
              </div>
            </Link>

            {/* Dynamic Search bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="hidden md:flex flex-1 max-w-sm lg:max-w-md relative items-center"
            >
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-white/5 border border-white/10 rounded-full text-white placeholder:text-slate-400 focus:bg-slate-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition"
              />
            </form>

            {/* Dynamic Nav links */}
            <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
              {navLinks.map((link, idx) => (
                <Link
                  key={idx}
                  href={link.href}
                  className={`hover:text-white transition ${
                    link.isHighlighted
                      ? "text-amber-400 font-bold hover:text-amber-300"
                      : "text-slate-300"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
            {/* 10-Minute Reservation Hold Timer */}
            <ReservationTimer />

            {/* Theme Switcher Icon */}
            <ThemeToggle />

            {/* Cart Button */}
            <button
              onClick={openDrawer}
              aria-label="Open Celebration Bag"
              className="relative p-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-full transition flex items-center justify-center border border-white/5"
            >
              <ShoppingCart className="w-4 h-4" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-lg shadow-purple-900/50">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Host celebrations CTA for Organiser */}
            {user?.role === "organiser" && (
              <Link
                href="/organiser/events/new"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-xs font-semibold transition"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Venue</span>
              </Link>
            )}

            {/* Auth or User dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1 pl-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition"
                >
                  <span className="text-xs font-semibold max-w-[90px] text-foreground truncate">
                    {user.name.split(" ")[0]}
                  </span>
                  <div className="w-7 h-7 rounded-full overflow-hidden bg-purple-600 flex items-center justify-center text-white text-xs font-bold ring-1 ring-white/20">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 p-2 text-xs space-y-1">
                      <div className="p-2 border-b border-white/10">
                        <p className="font-bold text-foreground truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-semibold text-[10px] uppercase">
                          {user.role}
                        </span>
                      </div>

                      {user.role === "admin" && (
                        <Link
                          href="/admin/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition"
                        >
                          <LayoutDashboard className="w-4 h-4 text-purple-400" />
                          <span>Admin Control Center</span>
                        </Link>
                      )}

                      {user.role === "organiser" && (
                        <>
                          <Link
                            href="/organiser/dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition"
                          >
                            <LayoutDashboard className="w-4 h-4 text-purple-400" />
                            <span>Partner Dashboard</span>
                          </Link>
                          <Link
                            href="/organiser/events/new"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition"
                          >
                            <PlusCircle className="w-4 h-4 text-pink-400" />
                            <span>List Celebration Venue</span>
                          </Link>
                        </>
                      )}

                      <Link
                        href="/customer/bookings"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition"
                      >
                        <Ticket className="w-4 h-4 text-amber-400" />
                        <span>My Celebrations & Bookings</span>
                      </Link>

                      <Link
                        href="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition"
                      >
                        <User className="w-4 h-4 text-sky-400" />
                        <span>Profile & Settings</span>
                      </Link>

                      <div className="pt-1 border-t border-white/10">
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="hidden lg:flex px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold shadow-md shadow-purple-900/30 transition"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-slate-950/95 backdrop-blur-2xl p-5 space-y-4 shadow-2xl">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search venues, rooftops, banquets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 outline-none focus:border-amber-400 transition"
            />
          </form>

          <div className="space-y-1.5 text-sm font-medium">
            {navLinks.map((link, idx) => (
              <Link
                key={idx}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl transition ${
                  link.isHighlighted
                    ? "text-amber-400 font-bold bg-amber-400/10"
                    : "text-slate-300 hover:bg-white/5"
                }`}
              >
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Mobile Auth & Account Quick-links */}
          <div className="pt-3 border-t border-white/10 space-y-2 text-sm font-medium">
            {user ? (
              <>
                <Link
                  href="/customer/bookings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-amber-300 bg-amber-400/10 border border-amber-400/20"
                >
                  <Ticket className="w-4 h-4" />
                  <span>My Bookings & Passes</span>
                </Link>

                {(user.role === "organiser" || user.role === "admin") && (
                  <Link
                    href="/organiser/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-purple-300 bg-purple-500/10 border border-purple-500/20"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Venue Host Studio</span>
                  </Link>
                )}

                {user.role === "admin" && (
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-rose-300 bg-rose-500/10 border border-rose-500/20"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Admin Command Center</span>
                  </Link>
                )}

                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sky-300 bg-sky-500/10 border border-sky-500/20"
                >
                  <User className="w-4 h-4" />
                  <span>My Profile & Settings</span>
                </Link>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-rose-400 hover:bg-rose-500/10 transition text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-3 text-center rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-heading font-bold"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-3 text-center rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-heading font-bold shadow-md"
                >
                  Register
                </Link>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-white/10 px-1">
              <span className="text-xs text-slate-400 font-semibold">Theme Mode</span>
              <ThemeToggle showLabel />
            </div>
          </div>
        </div>
      )}
    </header>
  </>
);
}
