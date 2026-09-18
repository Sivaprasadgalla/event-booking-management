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
