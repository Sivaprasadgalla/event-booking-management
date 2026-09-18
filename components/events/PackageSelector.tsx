"use client";

import React from "react";
import { formatPrice } from "@/lib/utils";
import { Check, Users, Sparkles } from "lucide-react";

export interface PackageItem {
  id: string;
  name: string;
  price: number;
  capacity: number;
  features: string[];
  isDefault?: boolean;
}

interface PackageSelectorProps {
  packages: PackageItem[];
  selectedPackageId: string;
  onSelectPackage: (pkg: PackageItem) => void;
  guestsCount: number;
  onChangeGuests: (guests: number) => void;
}

export default function PackageSelector({
  packages,
  selectedPackageId,
  onSelectPackage,
  guestsCount,
  onChangeGuests,
}: PackageSelectorProps) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-base sm:text-lg font-heading font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span>1. Choose Celebration Package Tier</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Select the package that fits your party size and luxury inclusions
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full w-fit">
          {packages.length} tier(s) available
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {packages.map((pkg) => {
          const isSelected = selectedPackageId === pkg.id;
          return (
            <div
              key={pkg.id}
              onClick={() => onSelectPackage(pkg)}
              className={`cursor-pointer rounded-2xl p-5 border-2 transition-all duration-200 relative flex flex-col justify-between space-y-4 ${
                isSelected
                  ? "border-purple-500 bg-purple-500/15 shadow-xl shadow-purple-900/30 ring-2 ring-purple-500/30"
                  : "border-white/10 hover:border-purple-500/40 bg-white/5 hover:bg-white/10"
              }`}
            >
              {pkg.isDefault && (
                <span className="absolute -top-2.5 right-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-md">
                  Most Popular
                </span>
              )}

              <div>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-heading font-bold text-base text-white">{pkg.name}</h4>
                  <div className="text-right shrink-0">
                    <span className="text-lg sm:text-xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">
                      {formatPrice(pkg.price)}
                    </span>
                    <span className="text-xs text-slate-400 block font-medium">/ package</span>
                  </div>
                </div>

                {/* Features checklist */}
                {pkg.features && pkg.features.length > 0 && (
                  <ul className="mt-3.5 space-y-2 text-xs text-slate-300 border-t border-white/10 pt-3">
                    {pkg.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2 leading-relaxed">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-xs flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-purple-400" /> Max Capacity: {pkg.capacity} guests
                </span>

                <span
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    isSelected
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-900/40"
                      : "bg-white/10 text-slate-300 hover:text-white hover:bg-white/15"
                  }`}
                >
                  {isSelected ? "Selected ✓" : "Select Tier"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Family Guest Count Stepper */}
      {selectedPackageId && (
        <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-purple-400" />
              <span>Family & Guests Attending</span>
            </span>
            <p className="text-[11px] text-slate-400">
              The selected package is a flat celebration fee covering your private party up to package capacity.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="flex items-center border border-white/15 rounded-xl bg-slate-950 p-1">
              <button
                type="button"
                onClick={() => onChangeGuests(Math.max(1, guestsCount - 1))}
                disabled={guestsCount <= 1}
                className="w-7 h-7 flex items-center justify-center hover:bg-white/10 text-slate-200 disabled:opacity-30 rounded-lg transition font-bold"
              >
                -
              </button>
              <span className="w-10 text-center text-xs font-bold text-white">
                {guestsCount}
              </span>
              <button
                type="button"
                onClick={() => {
                  const currentPkg = packages.find((p) => p.id === selectedPackageId);
                  const maxCap = currentPkg?.capacity || 100;
                  onChangeGuests(Math.min(maxCap, guestsCount + 1));
                }}
                className="w-7 h-7 flex items-center justify-center hover:bg-white/10 text-slate-200 rounded-lg transition font-bold"
              >
                +
              </button>
            </div>
            <span className="text-xs text-purple-300 font-semibold whitespace-nowrap">
              guest(s)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
