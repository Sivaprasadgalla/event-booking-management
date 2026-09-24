"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import CustomerSidebar from "@/components/customer/CustomerSidebar";
import CustomerHeader from "@/components/customer/CustomerHeader";
import { PartyPopper } from "lucide-react";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login?returnUrl=/customer/dashboard");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070913] flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 text-white flex items-center justify-center animate-pulse shadow-lg shadow-purple-900/40">
            <PartyPopper className="w-6 h-6" />
          </div>
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Opening Your Celebration Lounge...
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#080914] text-slate-100 flex flex-col lg:flex-row antialiased">
      <CustomerSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <CustomerHeader />
        <main className="flex-1 p-4 sm:p-8 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
