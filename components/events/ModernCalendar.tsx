"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  format,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isBefore,
  startOfToday,
  getDay,
} from "date-fns";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  Sparkles,
  Sun,
  Sunset,
  Moon,
  Coffee,
  AlertCircle,
} from "lucide-react";

export interface TimeSlotOption {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  capacity: number;
  slotType?: "morning" | "afternoon" | "evening" | "night";
  bookedCount?: number;
}

interface ModernCalendarProps {
  operatingDays?: "all_days" | "weekdays_only" | "weekends_only" | "custom_days";
  customOperatingDays?: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  dailyTimeSlots?: TimeSlotOption[];
  scheduleSlots?: Array<{
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    capacity: number;
    bookedCount: number;
  }>;
  selectedDate: string; // "YYYY-MM-DD"
  selectedSlotId: string;
  onSelectDate: (dateStr: string) => void;
  onSelectSlot: (slot: {
    slotId: string;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
  }) => void;
  requiredGuests?: number;
}

const SHIFT_ICONS: Record<string, React.ReactNode> = {
  morning: <Coffee className="w-4 h-4 text-amber-400" />,
  afternoon: <Sun className="w-4 h-4 text-orange-400" />,
  evening: <Sunset className="w-4 h-4 text-purple-400" />,
  night: <Moon className="w-4 h-4 text-indigo-400" />,
};

export default function ModernCalendar({
  operatingDays = "all_days",
  customOperatingDays = [1, 2, 3, 4, 5, 6, 0],
  dailyTimeSlots = [],
  scheduleSlots = [],
  selectedDate,
  selectedSlotId,
  onSelectDate,
  onSelectSlot,
  requiredGuests = 1,
}: ModernCalendarProps) {
  const today = startOfToday();
  const [currentMonth, setCurrentMonth] = useState<Date>(
    selectedDate ? new Date(selectedDate) : today
  );

  // Month navigation
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => {
    if (isSameMonth(currentMonth, today)) return;
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  // Calendar days computation
  const daysInMonth = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentMonth]);

  // Check if a day is operating
  const isOperatingDay = (day: Date) => {
    const dayOfWeek = getDay(day); // 0=Sun, 1=Mon, ..., 6=Sat

    if (operatingDays === "weekdays_only") {
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    }
    if (operatingDays === "weekends_only") {
      return dayOfWeek === 0 || dayOfWeek === 6;
    }
    if (operatingDays === "custom_days" && customOperatingDays?.length) {
      return customOperatingDays.includes(dayOfWeek);
    }
    return true; // "all_days"
  };

  // Compute active slots for the venue
  const activeSlots = useMemo(() => {
    if (dailyTimeSlots && dailyTimeSlots.length > 0) {
      return dailyTimeSlots;
    }
    return [
      {
        id: "slot_brunch",
        title: "Brunch & Celebration Gathering",
        startTime: "11:30 AM",
        endTime: "03:30 PM",
        capacity: 100,
        slotType: "morning" as const,
      },
      {
        id: "slot_sunset",
        title: "Grand Sunset Gala & Cocktail",
        startTime: "05:00 PM",
        endTime: "09:00 PM",
        capacity: 150,
        slotType: "evening" as const,
      },
      {
        id: "slot_midnight",
        title: "Starlight Midnight Celebration",
        startTime: "09:30 PM",
        endTime: "02:00 AM",
        capacity: 180,
        slotType: "night" as const,
      },
    ];
  }, [dailyTimeSlots]);

  const selectedDateObj = selectedDate ? new Date(selectedDate) : null;

  return (
    <div className="space-y-6">
      {/* Operating Schedule Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-md shadow-emerald-500/50 animate-pulse" />
          <span className="font-medium text-slate-300">Host Schedule:</span>
          <span className="font-bold text-purple-300 bg-purple-500/20 border border-purple-500/30 px-3 py-1 rounded-full capitalize text-xs">
            {operatingDays === "all_days"
              ? "Open All Days (Mon - Sun)"
              : operatingDays === "weekdays_only"
              ? "Weekdays Only (Mon - Fri)"
              : operatingDays === "weekends_only"
              ? "Weekends Only (Sat - Sun)"
              : "Custom Days Schedule"}
          </span>
        </div>
        <span className="text-slate-400 text-xs">Choose a date to view open celebration shifts</span>
      </div>

      {/* Calendar Card */}
      <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Month Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <h3 className="text-lg sm:text-xl font-heading font-extrabold text-white tracking-tight">
              {format(currentMonth, "MMMM yyyy")}
            </h3>
          </div>

          <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-1 rounded-2xl">
            <button
              type="button"
              onClick={prevMonth}
              disabled={isSameMonth(currentMonth, today)}
              className="p-2 rounded-xl hover:bg-white/10 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition"
              title="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={nextMonth}
              className="p-2 rounded-xl hover:bg-white/10 text-slate-300 transition"
              title="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of Week Row */}
        <div className="grid grid-cols-7 text-center">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => (
            <div
              key={day}
              className={`text-xs font-bold py-2 uppercase tracking-wider ${
                i === 0 || i === 6 ? "text-pink-400" : "text-slate-400"
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Month Days Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2.5">
          {daysInMonth.map((day, index) => {
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isPast = isBefore(day, today);
            const operating = isOperatingDay(day);
            const isClickable = isCurrentMonth && !isPast && operating;
            const isSelected = selectedDateObj && isSameDay(day, selectedDateObj);
            const isToday = isSameDay(day, today);

            return (
              <motion.button
                key={index}
                type="button"
                whileHover={isClickable ? { scale: 1.06 } : {}}
                whileTap={isClickable ? { scale: 0.94 } : {}}
                onClick={() => {
                  if (isClickable) {
                    onSelectDate(format(day, "yyyy-MM-dd"));
                  }
                }}
                disabled={!isClickable}
                className={`aspect-square rounded-xl sm:rounded-2xl p-1 sm:p-1.5 text-xs sm:text-sm font-semibold flex flex-col items-center justify-center relative transition-all duration-200 ${
                  isSelected
                    ? "bg-gradient-to-tr from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-900/50 ring-2 ring-purple-400 scale-[1.03]"
                    : isClickable
                    ? "bg-white/5 hover:bg-purple-500/20 text-slate-200 hover:text-white border border-white/10 hover:border-purple-500/40"
                    : !isCurrentMonth
                    ? "opacity-15 cursor-not-allowed text-slate-600"
                    : "opacity-30 cursor-not-allowed bg-white/5 text-slate-600 border border-white/5"
                }`}
              >
                <span>{format(day, "d")}</span>

                {/* Operating dot */}
                {isClickable && !isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50 mt-1" />
                )}

                {/* Today tag */}
                {isToday && !isSelected && (
                  <span className="absolute bottom-1 text-[9px] font-bold text-purple-400 uppercase tracking-tighter">
                    Today
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Time Slots Section (Appears when Date is Selected) */}
      <AnimatePresence mode="wait">
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="space-y-1">
                <h4 className="text-base sm:text-lg font-heading font-bold text-white flex items-center gap-2.5">
                  <Clock className="w-5 h-5 text-purple-400" />
                  <span>
                    Celebration Shifts for{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-extrabold">
                      {format(new Date(selectedDate), "EEEE, dd MMMM yyyy")}
                    </span>
                  </span>
                </h4>
                <p className="text-xs text-slate-400">
                  Select your reserved celebration shift timing for this date
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full shrink-0">
                {activeSlots.length} shifts open
              </span>
            </div>

            {/* Time Slot Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeSlots.map((slot) => {
                const isSelected = selectedSlotId === slot.id;
                const slotShift = slot.slotType || "evening";

                return (
                  <motion.div
                    key={slot.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() =>
                      onSelectSlot({
                        slotId: slot.id,
                        title: slot.title,
                        date: selectedDate,
                        startTime: slot.startTime,
                        endTime: slot.endTime,
                      })
                    }
                    className={`cursor-pointer p-5 rounded-2xl border-2 transition-all relative flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? "border-purple-500 bg-purple-500/15 shadow-xl shadow-purple-900/30 ring-2 ring-purple-500/30"
                        : "border-white/10 hover:border-purple-500/40 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          {SHIFT_ICONS[slotShift] || <Clock className="w-4 h-4 text-purple-400" />}
                          <span className="text-sm font-heading font-bold text-white line-clamp-1">
                            {slot.title}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-purple-300 flex items-center gap-1.5">
                          <span>
                            {slot.startTime} – {slot.endTime}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isSelected ? (
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center justify-center shadow-md">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full border border-white/20" />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs text-slate-400">
                      <span>Max Shift Capacity</span>
                      <span className="font-semibold text-slate-200">
                        {slot.capacity} guests
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
