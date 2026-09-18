"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Shield, Sparkles, User, Store, RefreshCw, Check } from "lucide-react";

export default function DemoBanner() {
  const { user, switchRole } = useAuth();
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  const handleSeed = async () => {
    try {
      setSeeding(true);
      const res = await fetch("/api/seed", { method: "POST" });
      if (res.ok) {
        setSeedSuccess(true);
        setTimeout(() => setSeedSuccess(false), 3000);
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSeeding(false);
    }
  };

  const currentRole = user?.role || "guest";

  return (
    <div className="bg-slate-900 text-slate-200 border-b border-slate-800 text-xs py-1.5 px-4 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-medium text-slate-300">
            Role Mode:{" "}
            <span className="font-semibold text-white capitalize bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              {currentRole}
            </span>
            {user?.name && <span className="hidden sm:inline ml-1 text-slate-400">({user.name})</span>}
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-400 hidden md:inline">Quick Switch:</span>

          <button
            onClick={() => switchRole("customer")}
            className={`px-2 py-1 rounded flex items-center gap-1 transition ${
              currentRole === "customer"
                ? "bg-indigo-600 text-white font-semibold"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300"
            }`}
          >
            <User className="w-3 h-3" />
            Customer
          </button>

          <button
            onClick={() => switchRole("organiser")}
            className={`px-2 py-1 rounded flex items-center gap-1 transition ${
              currentRole === "organiser"
                ? "bg-purple-600 text-white font-semibold"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300"
            }`}
          >
            <Store className="w-3 h-3" />
            Organiser
          </button>

          <button
            onClick={() => switchRole("admin")}
            className={`px-2 py-1 rounded flex items-center gap-1 transition ${
              currentRole === "admin"
                ? "bg-rose-600 text-white font-semibold"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300"
            }`}
          >
            <Shield className="w-3 h-3" />
            Admin
          </button>

          <button
            onClick={handleSeed}
            disabled={seeding}
            title="Reset database to fresh realistic demo data"
            className="ml-2 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 flex items-center gap-1 transition disabled:opacity-50"
          >
            {seedSuccess ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Seeded!</span>
              </>
            ) : (
              <>
                <RefreshCw className={`w-3 h-3 ${seeding ? "animate-spin" : ""}`} />
                <span>{seeding ? "Seeding..." : "Reset Data"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
