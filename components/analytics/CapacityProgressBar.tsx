"use client";

import React from "react";
import { motion } from "framer-motion";
import { Users, Flame } from "lucide-react";

export interface CapacityItem {
  id: string;
  name: string;
  category?: string;
  bookedCount: number;
  capacity: number;
}

interface CapacityProgressBarProps {
  items: CapacityItem[];
  title?: string;
  subtitle?: string;
}

export default function CapacityProgressBar({
  items = [],
  title = "Venue Occupancy & Capacity Utilization",
  subtitle = "Live pass reservation volume vs maximum venue capacity",
}: CapacityProgressBarProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-5 sm:p-7 backdrop-blur-xl shadow-xl space-y-5">
      <div>
        <h3 className="font-heading font-bold text-lg text-white">{title}</h3>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">{subtitle}</p>
      </div>

      <div className="space-y-4">
        {items.map((item, idx) => {
          const percentage = Math.min(
            Math.round((item.bookedCount / Math.max(item.capacity, 1)) * 100),
            100
          );

          let barColor = "from-emerald-500 to-teal-400";
          let badgeColor = "bg-emerald-500/10 text-emerald-300 border-emerald-500/20";
          if (percentage >= 85) {
            barColor = "from-purple-500 to-pink-500";
            badgeColor = "bg-pink-500/10 text-pink-300 border-pink-500/20";
          } else if (percentage >= 60) {
            barColor = "from-amber-400 to-amber-500";
            badgeColor = "bg-amber-400/10 text-amber-300 border-amber-400/20";
          }

          return (
            <div key={item.id || idx} className="space-y-2 group">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-heading font-bold text-white line-clamp-1 max-w-[200px] sm:max-w-xs">
                    {item.name}
                  </span>
                  {item.category && (
                    <span className="text-[10px] text-slate-400 font-semibold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 hidden sm:inline-block">
                      {item.category}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="text-xs text-slate-300 font-medium">
                    <strong className="text-white">{item.bookedCount}</strong> / {item.capacity} guests
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full border ${badgeColor} flex items-center gap-1`}
                  >
                    {percentage >= 85 && <Flame className="w-3 h-3 text-pink-400" />}
                    {percentage}%
                  </span>
                </div>
              </div>

              {/* Progress Bar Track */}
              <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.6, delay: idx * 0.08 }}
                  className={`h-full rounded-full bg-gradient-to-r ${barColor} shadow-md`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
