import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency = "INR"): string {
  if (currency === "INR") {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatEventDate(dateString: string | Date, formatStr = "EEE, MMM d, yyyy"): string {
  try {
    const d = typeof dateString === "string" ? parseISO(dateString) : dateString;
    return format(d, formatStr);
  } catch {
    return String(dateString);
  }
}

export function generateOrderNumber(): string {
  const datePart = format(new Date(), "yyyyMMdd");
  const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ORD-${datePart}-${randomPart}`;
}

export function generateBookingReference(): string {
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `EVT-${random}`;
}

export function calculateRefund({
  totalAmount,
  eventDate,
  cancellationPolicy,
}: {
  totalAmount: number;
  eventDate: string | Date;
  cancellationPolicy?: {
    allowed?: boolean;
    maxDaysBefore?: number;
    refundPercentage?: number;
  };
}): { eligible: boolean; refundPercentage: number; refundAmount: number; reason: string } {
  if (!cancellationPolicy || cancellationPolicy.allowed === false) {
    return {
      eligible: false,
      refundPercentage: 0,
      refundAmount: 0,
      reason: "This event does not allow cancellations or refunds.",
    };
  }

  const now = new Date();
  const eventD = typeof eventDate === "string" ? new Date(eventDate) : eventDate;
  const diffTime = eventD.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const minDaysNotice = cancellationPolicy.maxDaysBefore || 2;
  const refundPct = cancellationPolicy.refundPercentage ?? 80;

  if (diffDays < minDaysNotice) {
    return {
      eligible: false,
      refundPercentage: 0,
      refundAmount: 0,
      reason: `Cancellation must be requested at least ${minDaysNotice} day(s) before event start. Current notice: ${diffDays <= 0 ? "0" : diffDays} day(s).`,
    };
  }

  const refundAmount = Math.round((totalAmount * refundPct) / 100);
  return {
    eligible: true,
    refundPercentage: refundPct,
    refundAmount,
    reason: `Eligible for a ${refundPct}% refund according to the event cancellation policy.`,
  };
}

/**
 * Parses a slot date string (YYYY-MM-DD or ISO) and a time string (e.g. "11:30", "16:30", "11:30 AM", "04:30 PM")
 * into a valid local Date object.
 */
export function parseSlotDateTime(dateStr: string, timeStr: string): Date | null {
  if (!dateStr || !timeStr) return null;
  try {
    const cleanDate = dateStr.split("T")[0]; // "YYYY-MM-DD"
    const parts = cleanDate.split("-").map(Number);
    if (parts.length < 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
      return null;
    }
    const [year, month, day] = parts;

    // Check for AM / PM indicators
    const isPM = /pm/i.test(timeStr);
    const isAM = /am/i.test(timeStr);

    // Match "HH:MM" or "H:MM"
    const match = timeStr.match(/(\d{1,2}):(\d{2})/);
    if (!match) return null;

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);

    if (isPM && hours < 12) {
      hours += 12;
    } else if (isAM && hours === 12) {
      hours = 0;
    }

    return new Date(year, month - 1, day, hours, minutes, 0, 0);
  } catch {
    return null;
  }
}

/**
 * Determines whether a slot has already started relative to current time.
 * If bufferMinutes is passed, marks slot started bufferMinutes before the start time.
 */
export function isSlotStarted(dateStr: string, timeStr: string, bufferMinutes = 0): boolean {
  const slotDate = parseSlotDateTime(dateStr, timeStr);
  if (!slotDate) return false;
  return slotDate.getTime() <= (Date.now() + bufferMinutes * 60 * 1000);
}

