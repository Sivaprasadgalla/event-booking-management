"use client";

import React from "react";
import { formatPrice } from "@/lib/utils";

export interface CategoryShareItem {
  category: string;
  revenue: number;
  bookings: number;
  color: string;
}

interface CategoryDistributionChartProps {
  items: CategoryShareItem[];
  title?: string;
  subtitle?: string;
}

export default function CategoryDistributionChart({
  items = [],
  title = "Occasion & Venue Category Share",
  subtitle = "Gross bookings and revenue generation by venue type",
}: CategoryDistributionChartProps) {
  if (!items || items.length === 0) return null;

  const totalRevenue = items.reduce((acc, it) => acc + it.revenue, 0);

  return (
    <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-5 sm:p-7 backdrop-blur-xl shadow-xl space-y-6">
      <div>
        <h3 className="font-heading font-bold text-lg text-white">{title}</h3>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">{subtitle}</p>
      </div>

      {/* Stacked Proportional Bar */}
      <div className="w-full h-4 rounded-full overflow-hidden flex bg-white/5 border border-white/10 p-0.5">
        {items.map((item, idx) => {
          const share = totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 100 / items.length;
          return (
            <div
              key={idx}
              style={{
                width: `${share}%`,
                backgroundColor: item.color,
              }}
              className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-300 hover:opacity-85"
              title={`${item.category}: ${Math.round(share)}% (${formatPrice(item.revenue)})`}
            />
          );
        })}
      </div>

      {/* Legend & Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {items.map((item, idx) => {
          const share = totalRevenue > 0 ? Math.round((item.revenue / totalRevenue) * 100) : 0;
          return (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 text-xs sm:text-sm"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-heading font-bold text-white truncate">
                  {item.category}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-slate-400 font-medium">{share}%</span>
                <span className="font-bold text-white">{formatPrice(item.revenue)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
