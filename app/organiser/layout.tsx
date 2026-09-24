"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import OrganiserSidebar from "@/components/organiser/OrganiserSidebar";
import OrganiserHeader from "@/components/organiser/OrganiserHeader";
import { PartyPopper } from "lucide-react";

export default function OrganiserLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || (user.role !== "organiser" && user.role !== "admin"))) {
      router.push("/login?returnUrl=/organiser/dashboard");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070913] flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center animate-pulse">
            <PartyPopper className="w-6 h-6" />
          </div>
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Connecting Host Partner Studio...
          </span>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== "organiser" && user.role !== "admin")) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 flex flex-col lg:flex-row antialiased">
      <OrganiserSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <OrganiserHeader />
        <main className="flex-1 p-4 sm:p-8 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
