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
    </div>
  );
}
