"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export interface BarChartItem {
  label: string;
  count: number;
  subLabel?: string;
}

interface BookingsBarChartProps {
  data: BarChartItem[];
  title?: string;
  subtitle?: string;
  unitLabel?: string;
  barColor?: "amber" | "purple" | "emerald";
}

export default function BookingsBarChart({
  data = [],
  title = "Celebration Volume Distribution",
  subtitle = "Pass reservations breakdown across categories & shifts",
  unitLabel = "passes",
  barColor = "amber",
}: BookingsBarChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 backdrop-blur-xl flex items-center justify-center h-64 text-slate-400 text-sm">
        No volume data recorded yet
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.count), 1);
  const totalCount = data.reduce((acc, d) => acc + d.count, 0);

  const getBarGradient = (isActive: boolean) => {
    if (barColor === "purple") {
      return isActive
        ? "from-purple-500 to-pink-500 shadow-purple-500/40"
        : "from-purple-600/80 to-purple-500/60";
    }
    if (barColor === "emerald") {
      return isActive
        ? "from-emerald-400 to-teal-500 shadow-emerald-500/40"
        : "from-emerald-500/80 to-teal-600/60";
    }
    return isActive
      ? "from-amber-400 to-amber-500 shadow-amber-500/40"
      : "from-amber-500/80 to-amber-600/60";
  };

  return (
    <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-5 sm:p-7 backdrop-blur-xl shadow-xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading font-bold text-lg text-white">{title}</h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">{subtitle}</p>
        </div>
        <div className="text-right">
          <span className="text-xs uppercase font-bold text-slate-400 block tracking-wider">
            Total {unitLabel}
          </span>
          <span className="text-xl sm:text-2xl font-heading font-black text-white">
            {totalCount}
          </span>
        </div>
      </div>

      {/* Bars visualization container */}
      <div className="pt-4 pb-2">
        <div className="grid grid-flow-col auto-cols-fr gap-2 sm:gap-4 items-end h-48 border-b border-white/10 px-1 pb-2">
          {data.map((item, idx) => {
            const heightPercent = Math.max(Math.round((item.count / maxVal) * 100), 8);
            const isHovered = hoveredIdx === idx;

            return (
              <div
                key={idx}
                className="flex flex-col items-center h-full justify-end group cursor-pointer relative"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                onTouchStart={() => setHoveredIdx(idx)}
              >
                {/* Tooltip value */}
                <div
                  className={`text-xs font-bold transition-all duration-200 mb-1.5 ${
                    isHovered
                      ? "text-white scale-110 -translate-y-1"
                      : "text-slate-400"
                  }`}
                >
                  {item.count}
                </div>

                {/* Vertical Bar */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPercent}%` }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  className={`w-full max-w-[48px] rounded-t-xl bg-gradient-to-t ${getBarGradient(
                    isHovered
                  )} shadow-lg transition-all duration-200 group-hover:brightness-110`}
                />

                {/* X-axis Label */}
                <div className="w-full text-center mt-3 space-y-0.5">
                  <span
                    className={`block text-[11px] sm:text-xs font-heading font-bold truncate transition-colors ${
                      isHovered ? "text-white" : "text-slate-400"
                    }`}
                  >
                    {item.label}
                  </span>
                  {item.subLabel && (
                    <span className="block text-[10px] text-slate-500 truncate">
                      {item.subLabel}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
