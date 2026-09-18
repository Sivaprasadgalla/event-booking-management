"use client";

import React, { useState } from "react";
import { formatPrice } from "@/lib/utils";
import { TrendingUp, Sparkles } from "lucide-react";

export interface RevenueDataPoint {
  label: string;
  date: string;
  revenue: number;
  bookings: number;
}

interface RevenueLineChartProps {
  data: RevenueDataPoint[];
  title?: string;
  subtitle?: string;
  accentColor?: "amber" | "purple" | "emerald";
}

export default function RevenueLineChart({
  data = [],
  title = "Revenue Trajectory",
  subtitle = "Gross celebration pass booking sales over time",
  accentColor = "amber",
}: RevenueLineChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 backdrop-blur-xl flex items-center justify-center h-64 text-slate-400 text-sm">
        No sales data available for this timeframe
      </div>
    );
  }

  // Dimensions
  const svgWidth = 700;
  const svgHeight = 260;
  const paddingX = 40;
  const paddingTop = 25;
  const paddingBottom = 45;

  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1000);
  const totalPeriodRevenue = data.reduce((acc, d) => acc + d.revenue, 0);

  // Coordinate computation
  const points = data.map((d, i) => {
    const x = paddingX + (i / Math.max(data.length - 1, 1)) * chartWidth;
    const y = paddingTop + chartHeight - (d.revenue / maxRevenue) * chartHeight;
    return { x, y, ...d };
  });

  // Construct SVG Path
  const linePath = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    // Smooth bezier curve control point
    const prev = points[i - 1];
    const cpx1 = prev.x + (p.x - prev.x) / 2;
    const cpy1 = prev.y;
    const cpx2 = prev.x + (p.x - prev.x) / 2;
    const cpy2 = p.y;
    return `${acc} C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${p.x} ${p.y}`;
  }, "");

  // Area path closing down to bottom
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${
    paddingTop + chartHeight
  } L ${points[0].x} ${paddingTop + chartHeight} Z`;

  // Color mappings
  const strokeColor =
    accentColor === "purple"
      ? "#c084fc"
      : accentColor === "emerald"
      ? "#34d399"
      : "#fbbf24";

  const gradientId = `revGrad-${accentColor}`;

  const activePoint = hoverIndex !== null ? points[hoverIndex] : points[points.length - 1];

  return (
    <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-5 sm:p-7 backdrop-blur-xl shadow-xl space-y-5">
      {/* Header with summary stat */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-heading font-bold text-lg text-white">{title}</h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 font-semibold">
              Live Feed
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">{subtitle}</p>
        </div>

        <div className="text-left sm:text-right bg-white/5 sm:bg-transparent p-3 sm:p-0 rounded-2xl border border-white/5 sm:border-0">
          <span className="text-xs uppercase font-bold text-slate-400 block tracking-wider">
            Period Total
          </span>
          <span className="text-xl sm:text-2xl font-heading font-black text-white">
            {formatPrice(totalPeriodRevenue)}
          </span>
        </div>
      </div>

      {/* Interactive Chart Container */}
      <div className="relative w-full overflow-hidden">
        {/* Floating Tooltip if active */}
        {activePoint && (
          <div className="flex items-center justify-between px-2 py-1.5 mb-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: strokeColor }} />
              {activePoint.date || activePoint.label}
            </span>
            <div className="flex items-center gap-3">
              <span>
                Sales: <strong className="text-white">{formatPrice(activePoint.revenue)}</strong>
              </span>
              <span>
                Passes: <strong className="text-white">{activePoint.bookings}</strong>
              </span>
            </div>
          </div>
        )}

        {/* SVG Graphic */}
        <div className="w-full aspect-[700/260] min-h-[220px]">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-full select-none overflow-visible"
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strokeColor} stopOpacity="0.35" />
                <stop offset="60%" stopColor={strokeColor} stopOpacity="0.08" />
                <stop offset="100%" stopColor={strokeColor} stopOpacity="0.00" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines (4 levels) */}
            {[0, 0.33, 0.66, 1].map((ratio, idx) => {
              const y = paddingTop + chartHeight * (1 - ratio);
              const val = Math.round(maxRevenue * ratio);
              return (
                <g key={idx}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={svgWidth - paddingX}
                    y2={y}
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x={paddingX - 8}
                    y={y + 3}
                    textAnchor="end"
                    fill="rgba(255, 255, 255, 0.35)"
                    fontSize="10"
                    fontWeight="600"
                    fontFamily="inherit"
                  >
                    ₹{val >= 1000 ? `${Math.round(val / 1000)}k` : val}
                  </text>
                </g>
              );
            })}

            {/* Area Fill */}
            <path d={areaPath} fill={`url(#${gradientId})`} />

            {/* Main Curved Line */}
            <path
              d={linePath}
              fill="none"
              stroke={strokeColor}
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data Points & Touch Targets */}
            {points.map((p, i) => {
              const isActive = hoverIndex === i;
              return (
                <g
                  key={i}
                  className="cursor-pointer group"
                  onMouseEnter={() => setHoverIndex(i)}
                  onMouseLeave={() => setHoverIndex(null)}
                  onTouchStart={() => setHoverIndex(i)}
                >
                  {/* Invisible wide hit-box for easy touch */}
                  <rect
                    x={p.x - 20}
                    y={paddingTop}
                    width={40}
                    height={chartHeight + paddingBottom}
                    fill="transparent"
                  />

                  {/* Vertical guide line on active */}
                  {isActive && (
                    <line
                      x1={p.x}
                      y1={paddingTop}
                      x2={p.x}
                      y2={paddingTop + chartHeight}
                      stroke="rgba(255, 255, 255, 0.25)"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                  )}

                  {/* Outer glow ring */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isActive ? 7 : 4}
                    fill="#020617"
                    stroke={strokeColor}
                    strokeWidth={isActive ? 3 : 2}
                    className="transition-all duration-150"
                  />

                  {/* X-axis Label */}
                  <text
                    x={p.x}
                    y={svgHeight - 12}
                    textAnchor="middle"
                    fill={isActive ? "#ffffff" : "rgba(255, 255, 255, 0.45)"}
                    fontSize="11"
                    fontWeight={isActive ? "700" : "500"}
                    fontFamily="inherit"
                    className="transition-colors"
                  >
                    {p.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
