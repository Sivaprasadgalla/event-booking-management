"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { formatPrice, formatEventDate } from "@/lib/utils";
import PackageSelector, { PackageItem } from "@/components/events/PackageSelector";
import ModernCalendar from "@/components/events/ModernCalendar";
import AddOnsSelector, { AddOnItem } from "@/components/events/AddOnsSelector";
import ReviewSection, { ReviewItem } from "@/components/events/ReviewSection";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Star,
  CheckCircle,
  ShieldAlert,
  ShoppingCart,
  Zap,
  ChevronRight,
  ExternalLink,
  Sparkles,
  PartyPopper,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function EventDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const { toast } = useToast();

  const [event, setEvent] = useState<any>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>("");

  // Booking selection state
  const [selectedPackage, setSelectedPackage] = useState<PackageItem | null>(null);
  const [guestsCount, setGuestsCount] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<{
    slotId: string;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
  } | null>(null);
  const [selectedAddOns, setSelectedAddOns] = useState<Record<string, number>>({});
  const [bookingNotice, setBookingNotice] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    fetch(`/api/events/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.event) {
          setEvent(data.event);
          setReviews(data.reviews || []);
          setActiveImage(data.event.coverImage);

          // Default package
          const defaultPkg =
            data.event.packages?.find((p: any) => p.isDefault) || data.event.packages?.[0];
          if (defaultPkg) setSelectedPackage(defaultPkg);

          // Default date (tomorrow or next operating day)
          const tomorrow = new Date(Date.now() + 86400000);
          const tomorrowStr = tomorrow.toISOString().split("T")[0];
          setSelectedDate(tomorrowStr);

          // Default slot if available
          const firstSlot = data.event.dailyTimeSlots?.[0];
          if (firstSlot) {
            setSelectedSlot({
              slotId: firstSlot.id,
              title: firstSlot.title,
              date: tomorrowStr,
              startTime: firstSlot.startTime,
              endTime: firstSlot.endTime,
            });
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 space-y-6">
        <div className="h-96 rounded-3xl bg-slate-800 animate-pulse" />
        <div className="h-8 w-1/3 bg-slate-800 animate-pulse rounded" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Venue Not Found</h2>
        <p className="text-xs text-slate-400">The requested venue partner might be unavailable.</p>
        <button
          onClick={() => router.push("/events")}
          className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold"
        >
          Browse Venues
        </button>
      </div>
    );
  }

  // Calculate pricing
  const packageTotal = (selectedPackage?.price || 0) * guestsCount;
  const addOnsList = (event.addOns || [])
    .filter((a: any) => (selectedAddOns[a.id] || 0) > 0)
    .map((a: any) => ({
      addOnId: a.id,
      name: a.name,
      unitPrice: a.price,
      quantity: selectedAddOns[a.id],
      total: a.price * selectedAddOns[a.id],
    }));

  const addOnsTotal = addOnsList.reduce((sum: number, a: any) => sum + a.total, 0);
  const itemTotal = packageTotal + addOnsTotal;

  const handleAddOnQtyChange = (addOnId: string, quantity: number) => {
    setSelectedAddOns((prev) => ({
      ...prev,
      [addOnId]: quantity,
    }));
  };

  const handleAddToCart = (instantCheckout = false) => {
    if (!selectedPackage || !selectedSlot) {
      toast.warning(
        "Please choose a celebration package, date, and hosting time slot first.",
        "Selection Required"
      );
      return;
    }

    addItem({
      eventId: event._id,
      eventTitle: event.title,
      eventSlug: event.slug,
      eventCoverImage: event.coverImage,
      organiserName: event.organiser?.name || "Verified Venue Partner",
      venueName: event.venue?.name || event.venue?.city || "Venue",
      city: event.venue?.city || "Online",
      packageDetails: {
        packageId: selectedPackage.id,
        name: selectedPackage.name,
        price: selectedPackage.price,
      },
      guestsCount,
      selectedSlot: {
        slotId: selectedSlot.slotId,
        date: selectedSlot.date,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
      },
      selectedAddOns: addOnsList,
    });

    setBookingNotice(true);
    toast.success(`"${event.title}" added to your celebration cart!`, "Added to Cart");
    setTimeout(() => setBookingNotice(false), 3000);

    if (instantCheckout) {
      router.push("/checkout");
    }
  };

  const allGalleryImages = [event.coverImage, ...(event.gallery || [])].filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 font-medium">
        <button onClick={() => router.push("/")} className="hover:text-purple-400 transition">
          Home
        </button>
        <ChevronRight className="w-4 h-4 text-slate-600" />
        <button onClick={() => router.push("/events")} className="hover:text-purple-400 transition">
          Venues & Partners
        </button>
        <ChevronRight className="w-4 h-4 text-slate-600" />
        <span className="text-white font-bold truncate max-w-xs">{event.title}</span>
      </nav>

      {/* Header & Venue Badges */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {event.venueType && (
                <span className="px-3 py-1 rounded-full font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {event.venueType}
                </span>
              )}
              {event.celebrationTypes &&
                event.celebrationTypes.map((c: string, i: number) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-slate-300 border border-white/10"
                  >
                    {c}
                  </span>
                ))}
              <span className="px-3 py-1 rounded-full font-medium bg-white/5 text-slate-300 border border-white/10 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-purple-400" />
                {event.venue?.city || "In-person"}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-heading font-black text-white tracking-tight leading-tight">
              {event.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              {event.shortDescription}
            </p>
          </div>

          {/* Host Partner Badge Card */}
          <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-xl flex items-center gap-3.5 shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-heading font-bold text-lg shadow-md overflow-hidden ring-1 ring-white/20">
              {event.organiser?.avatar ? (
                <img src={event.organiser.avatar} alt="Host" className="w-full h-full object-cover" />
              ) : (
                (event.organiser?.name || "H").charAt(0)
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-heading font-bold text-white">
                  {event.organiser?.companyName || event.organiser?.name || "Venue Partner"}
                </span>
                {event.organiser?.isVerified && (
                  <CheckCircle className="w-4 h-4 text-purple-400" />
                )}
              </div>
              <span className="text-xs text-slate-400">Verified Celebration Host</span>
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div className="space-y-3">
          <div className="relative aspect-[21/9] w-full rounded-3xl overflow-hidden bg-slate-950 shadow-2xl border border-slate-800">
            <img
              src={activeImage}
              alt={event.title}
              className="w-full h-full object-cover transition duration-500"
            />
          </div>

          {allGalleryImages.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-2">
              {allGalleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-24 h-16 rounded-2xl overflow-hidden border-2 shrink-0 transition ${
                    activeImage === img
                      ? "border-purple-500 ring-2 ring-purple-500/40"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Configurator Steps */}
        <div className="lg:col-span-2 space-y-10">
          {/* Step 1: Packages */}
          <section className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-xl">
            <PackageSelector
              packages={event.packages || []}
              selectedPackageId={selectedPackage?.id || ""}
              onSelectPackage={(pkg) => setSelectedPackage(pkg)}
              guestsCount={guestsCount}
              onChangeGuests={(count) => setGuestsCount(count)}
            />
          </section>

          {/* Step 2: Interactive Modern Calendar & Time Slots */}
          <section className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PartyPopper className="w-5 h-5 text-purple-400" />
                <span>2. Select Celebration Date & Hosting Time Slot</span>
              </h3>
              <p className="text-xs text-slate-400">
                Choose any future date from the calendar to view available hosting shifts.
              </p>
            </div>

            <ModernCalendar
              operatingDays={event.operatingDays}
              customOperatingDays={event.customOperatingDays}
              dailyTimeSlots={event.dailyTimeSlots}
              scheduleSlots={event.scheduleSlots}
              selectedDate={selectedDate}
              selectedSlotId={selectedSlot?.slotId || ""}
              onSelectDate={(d) => {
                setSelectedDate(d);
                if (selectedSlot) {
                  setSelectedSlot({ ...selectedSlot, date: d });
                }
              }}
              onSelectSlot={(slot) => setSelectedSlot(slot)}
              requiredGuests={guestsCount}
            />
          </section>

          {/* Step 3: Add-ons */}
          {event.addOns && event.addOns.length > 0 && (
            <section className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-xl">
              <AddOnsSelector
                addOns={event.addOns}
                selectedAddOns={selectedAddOns}
                onChangeQuantity={handleAddOnQtyChange}
              />
            </section>
          )}

          {/* Venue details & policies */}
          <section className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Venue & Hosting Experience</h3>
              <div className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {event.fullDescription}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800">
              <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-400" />
                <span>Venue Location</span>
              </h4>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">{event.venue?.name}</span>
                  <span className="text-xs text-slate-400">
                    {event.venue?.address}, {event.venue?.city}, {event.venue?.state}{" "}
                    {event.venue?.pincode}
                  </span>
                </div>
                {event.venue?.googleMapsUrl && (
                  <a
                    href={event.venue.googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-xs font-semibold text-purple-300 flex items-center gap-1 transition shrink-0"
                  >
                    <span>Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-slate-400" />
                <span>Hosting Policy & Cancellation</span>
              </h4>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1">
                <span className="font-bold text-slate-200 block">
                  Cancellation Policy:{" "}
                  {event.cancellationPolicy?.allowed ? (
                    <span className="text-emerald-400 font-bold">
                      {event.cancellationPolicy.refundPercentage}% Refund Permitted
                    </span>
                  ) : (
                    <span className="text-rose-400 font-bold">Non-refundable</span>
                  )}
                </span>
                <p className="text-slate-400 text-[11px]">
                  {event.cancellationPolicy?.allowed
                    ? `Cancellations permitted up to ${event.cancellationPolicy?.maxDaysBefore || 2} day(s) before your reservation date.`
                    : "Reservations are non-refundable once booked."}
                </p>
              </div>

              {event.termsAndConditions && (
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-400 pt-1">
                  {event.termsAndConditions.map((tc: string, i: number) => (
                    <li key={i}>{tc}</li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* Attendee Reviews */}
          <section className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-xl">
            <ReviewSection
              eventId={event._id}
              reviews={reviews}
              averageRating={event.averageRating || 0}
              reviewCount={event.reviewCount || 0}
            />
          </section>
        </div>

        {/* Right Column: Sticky Glass Booking Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-slate-900/90 backdrop-blur-2xl rounded-3xl border border-purple-500/30 p-7 shadow-2xl shadow-purple-950/50 space-y-6">
            <div className="flex items-baseline justify-between border-b border-white/10 pb-4">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Total Estimate</span>
              <span className="text-3xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">
                {formatPrice(itemTotal)}
              </span>
            </div>

            {/* Selected Breakdown */}
            <div className="space-y-3.5 text-sm">
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-white/10 space-y-1.5">
                <span className="text-xs uppercase font-bold text-slate-400 block tracking-wider">
                  Package & Guests
                </span>
                <div className="flex justify-between font-semibold text-white">
                  <span>
                    {selectedPackage?.name} × {guestsCount}
                  </span>
                  <span className="font-heading font-bold">{formatPrice(packageTotal)}</span>
                </div>
              </div>

              {selectedSlot && (
                <div className="bg-slate-950/60 p-4 rounded-2xl border border-white/10 space-y-1.5">
                  <span className="text-xs uppercase font-bold text-slate-400 block tracking-wider">
                    Reserved Celebration Shift
                  </span>
                  <div className="font-semibold text-white flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-purple-400" />
                    <span>{formatEventDate(selectedSlot.date, "EEE, dd MMM yyyy")}</span>
                  </div>
                  <div className="text-purple-300 font-medium flex items-center gap-2 pl-6 pt-0.5 text-xs">
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                    <span>
                      {selectedSlot.title} ({selectedSlot.startTime} – {selectedSlot.endTime})
                    </span>
                  </div>
                </div>
              )}

              {addOnsList.length > 0 && (
                <div className="bg-slate-950/60 p-4 rounded-2xl border border-white/10 space-y-2">
                  <span className="text-xs uppercase font-bold text-slate-400 block tracking-wider">
                    Celebration Add-ons
                  </span>
                  {addOnsList.map((addon: any) => (
                    <div key={addon.addOnId} className="flex justify-between text-slate-300 text-xs">
                      <span>
                        {addon.name} × {addon.quantity}
                      </span>
                      <span className="font-semibold text-white">
                        {formatPrice(addon.total)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => handleAddToCart(false)}
                className="w-full py-3.5 px-4 rounded-xl border border-purple-500/40 hover:bg-purple-600/10 text-purple-300 font-bold text-sm flex items-center justify-center gap-2 transition"
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </button>

              <button
                type="button"
                onClick={() => handleAddToCart(true)}
                className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm shadow-lg shadow-purple-900/40 flex items-center justify-center gap-2 transition hover:scale-[1.01]"
              >
                <Zap className="w-4 h-4" />
                Book Now
              </button>
            </div>

            {bookingNotice && (
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Added to cart successfully!</span>
              </div>
            )}

            <p className="text-xs text-center text-slate-400">
              🔒 100% Secured by Razorpay Online Payment Gateway
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
