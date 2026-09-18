"use client";

import React from "react";
import { formatEventDate } from "@/lib/utils";
import { Calendar, Clock, AlertCircle } from "lucide-react";

export interface ScheduleSlotItem {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
}

interface SlotSelectorProps {
  slots: ScheduleSlotItem[];
  selectedSlotId: string;
  onSelectSlot: (slot: ScheduleSlotItem) => void;
  requiredGuests: number;
}

export default function SlotSelector({
  slots,
  selectedSlotId,
  onSelectSlot,
  requiredGuests,
}: SlotSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <span>2. Choose Date & Time Slot</span>
        </h3>
        <span className="text-xs text-slate-500">{slots.length} available slot(s)</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {slots.map((slot) => {
          const remaining = Math.max(0, slot.capacity - (slot.bookedCount || 0));
          const isSoldOut = remaining === 0 || remaining < requiredGuests;
          const isSelected = selectedSlotId === slot.id;

          let badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
          let badgeText = `${remaining} seats left`;

          if (isSoldOut) {
            badgeColor = "bg-rose-50 text-rose-700 border-rose-200";
            badgeText = remaining === 0 ? "Sold Out" : `Only ${remaining} left`;
          } else if (remaining < 20) {
            badgeColor = "bg-amber-50 text-amber-700 border-amber-200";
            badgeText = `Filling fast (${remaining} left)`;
          }

          return (
            <div
              key={slot.id}
              onClick={() => {
                if (!isSoldOut) onSelectSlot(slot);
              }}
              className={`rounded-xl p-3.5 border-2 transition-all duration-200 ${
                isSoldOut
                  ? "opacity-50 cursor-not-allowed bg-slate-50 border-slate-200"
                  : isSelected
                  ? "cursor-pointer border-indigo-600 bg-indigo-50/40 shadow-sm ring-2 ring-indigo-600/20"
                  : "cursor-pointer border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{formatEventDate(slot.date, "EEEE, dd MMM yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {slot.startTime} - {slot.endTime}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badgeColor}`}
                >
                  {badgeText}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {slots.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>No upcoming slots currently open for booking. Please check back later.</span>
        </div>
      )}
    </div>
  );
}
