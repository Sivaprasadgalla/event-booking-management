"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { EVENT_IMAGE_PRESETS } from "@/lib/presets";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Building2,
  PartyPopper,
  ShieldCheck,
  Info,
  Sun,
  Sunset,
  Moon,
  Coffee,
  Check,
  UploadCloud,
  Image as ImageIcon,
  X,
  Loader2,
} from "lucide-react";

const VENUE_TYPES = [
  "Rooftop Lounge",
  "Private Farmhouse & Pool",
  "Luxury Banquet Hall",
  "Botanical Lawn & Pavilion",
  "Beachfront Lawn",
  "Boutique Speakeasy",
  "Ballroom & Banquet",
  "Poolside Deck",
  "Villa & Estate",
];

const CELEBRATION_OPTIONS = [
  "Birthday Parties",
  "Anniversary Specials",
  "Cocktail Sundowners",
  "Private Reunions",
  "Intimate Weddings",
  "Engagement Ceremonies",
  "Baby Showers",
  "Bachelorette Celebrations",
  "Pool Parties",
  "Corporate Galas",
];

const DAY_NAMES = [
  { day: 0, label: "Sunday", short: "Sun" },
  { day: 1, label: "Monday", short: "Mon" },
  { day: 2, label: "Tuesday", short: "Tue" },
  { day: 3, label: "Wednesday", short: "Wed" },
  { day: 4, label: "Thursday", short: "Thu" },
  { day: 5, label: "Friday", short: "Fri" },
  { day: 6, label: "Saturday", short: "Sat" },
];

export default function CreateEventWizardPage() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [categories, setCategories] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    venueType: "Rooftop Lounge",
    celebrationTypes: ["Birthday Parties", "Anniversary Specials"],
    shortDescription: "",
    fullDescription: "",
    eventType: "physical",
    venue: {
      name: "",
      address: "",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "",
      googleMapsUrl: "",
      virtualLink: "",
    },
    operatingDays: "all_days" as "all_days" | "weekdays_only" | "weekends_only" | "custom_days",
    customOperatingDays: [1, 2, 3, 4, 5], // default Mon-Fri if custom
    dailyTimeSlots: [
      {
        id: "slot_1",
        title: "Brunch & Daytime Soirée",
        startTime: "11:30",
        endTime: "15:30",
        capacity: 80,
        slotType: "morning" as const,
        isActive: true,
      },
      {
        id: "slot_2",
        title: "Sunset Gala & Cocktail Shift",
        startTime: "16:30",
        endTime: "20:00",
        capacity: 120,
        slotType: "evening" as const,
        isActive: true,
      },
      {
        id: "slot_3",
        title: "Starlight Midnight Celebration",
        startTime: "20:30",
        endTime: "01:30",
        capacity: 150,
        slotType: "night" as const,
        isActive: true,
      },
    ],
    coverImage: EVENT_IMAGE_PRESETS[0].url,
    gallery: [] as string[],
    packages: [
      {
        id: "pkg_1",
        name: "Silver Celebration Tier",
        price: 24999,
        capacity: 50,
        features: [
          "Exclusive Terrace / Hall access for selected shift",
          "Signature Welcome Drinks on arrival",
          "Ambient Lighting & Sound Console setup",
          "Dedicated Floor Captain & Hospitality Host",
        ],
        isDefault: true,
      },
      {
        id: "pkg_2",
        name: "Gold Luxury Gala Tier",
        price: 54999,
        capacity: 100,
        features: [
          "Full Venue Exclusive Buyout for selected shift",
          "Gourmet 4-Course Buffet & Live Food Station for 50 guests",
          "Live Mocktail / Cocktail Bar setup with Bartender",
          "Pro Sound System with Wireless Mics for Speeches",
          "Complimentary 1kg Artisan Celebration Cake",
        ],
        isDefault: false,
      },
    ],
    addOns: [
      {
        id: "addon_1",
        name: "Live Acoustic Band / Saxophonist",
        price: 12000,
        description: "2-hour live performance to elevate your party vibe",
        maxPerBooking: 1,
      },
      {
        id: "addon_2",
        name: "Bespoke Floral Arch & Fairy Light Canopy",
        price: 15000,
        description: "Instagrammable photo-wall and celebratory entrance setup",
        maxPerBooking: 1,
      },
    ],
    termsAndConditions: [
      "Decor setup is permitted 60 minutes prior to shift commencement.",
      "Catering sanitation and outside sound adhere to local venue guidelines.",
      "Advance booking deposit is required to confirm reservation slot.",
    ],
    cancellationPolicy: {
      allowed: true,
      maxDaysBefore: 3,
      refundPercentage: 85,
    },
  });

  useEffect(() => {
    if (!isLoading && (!user || (user.role !== "organiser" && user.role !== "admin"))) {
      router.push("/login");
      return;
    }

    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories?.length > 0) {
          setCategories(data.categories);
          if (!formData.category) {
            setFormData((prev) => ({ ...prev, category: data.categories[0]._id }));
          }
        }
      })
      .catch(console.error);
  }, [user, isLoading, router]);

  const toggleCelebrationType = (type: string) => {
    setFormData((prev) => {
      const exists = prev.celebrationTypes.includes(type);
      return {
        ...prev,
        celebrationTypes: exists
          ? prev.celebrationTypes.filter((t) => t !== type)
          : [...prev.celebrationTypes, type],
      };
    });
  };

  const toggleCustomDay = (dayNum: number) => {
    setFormData((prev) => {
      const exists = prev.customOperatingDays.includes(dayNum);
      const updated = exists
        ? prev.customOperatingDays.filter((d) => d !== dayNum)
        : [...prev.customOperatingDays, dayNum].sort((a, b) => a - b);
      return { ...prev, customOperatingDays: updated };
    });
  };

  // Cloudinary Upload Handlers
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }

    try {
      setUploadingCover(true);
      const data = new FormData();
      data.append("file", file);
      data.append("type", "events");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });
      const json = await res.json();

      if (res.ok && json.url) {
        setFormData((prev) => ({ ...prev, coverImage: json.url }));
        toast.success(
          `Cover image uploaded to your Cloudinary folder (${json.folder})!`,
          "Cover Uploaded"
        );
      } else {
        toast.error(json.error || "Failed to upload image", "Upload Error");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during image upload.");
    } finally {
      setUploadingCover(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingGallery(true);
      const data = new FormData();
      for (let i = 0; i < files.length; i++) {
        data.append("files", files[i]);
      }
      data.append("type", "gallery");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });
      const json = await res.json();

      if (res.ok && json.urls) {
        setFormData((prev) => ({
          ...prev,
          gallery: [...prev.gallery, ...json.urls],
        }));
        toast.success(
          `${json.count} photo(s) uploaded to your dedicated Cloudinary gallery folder!`,
          "Gallery Uploaded"
        );
      } else {
        toast.error(json.error || "Failed to upload gallery images", "Upload Error");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during gallery upload.");
    } finally {
      setUploadingGallery(false);
    }
  };

  const removeGalleryImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, idx) => idx !== index),
    }));
  };

  // Daily Shift helpers
  const addDailyShift = () => {
    const newId = `slot_${Date.now()}`;
    setFormData((prev) => ({
      ...prev,
      dailyTimeSlots: [
        ...prev.dailyTimeSlots,
        {
          id: newId,
          title: `Celebration Shift ${prev.dailyTimeSlots.length + 1}`,
          startTime: "18:00",
          endTime: "22:00",
          capacity: 100,
          slotType: "evening",
          isActive: true,
        },
      ],
    }));
  };

  const removeDailyShift = (index: number) => {
    if (formData.dailyTimeSlots.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      dailyTimeSlots: prev.dailyTimeSlots.filter((_, i) => i !== index),
    }));
  };

  const updateDailyShift = (index: number, field: string, val: any) => {
    const updated = [...formData.dailyTimeSlots];
    updated[index] = { ...updated[index], [field]: val };
    setFormData({ ...formData, dailyTimeSlots: updated });
  };

  // Package helpers
  const addPackage = () => {
    setFormData((prev) => ({
      ...prev,
      packages: [
        ...prev.packages,
        {
          id: `pkg_${Date.now()}`,
          name: "Diamond Exclusive VIP",
          price: 99999,
          capacity: 150,
          features: ["Full Venue Buyout", "Gourmet Live Catering", "Dedicated DJ"],
          isDefault: false,
        },
      ],
    }));
  };

  const removePackage = (index: number) => {
    if (formData.packages.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      packages: prev.packages.filter((_, i) => i !== index),
    }));
  };

  // Add-on helpers
  const addAddOn = () => {
    setFormData((prev) => ({
      ...prev,
      addOns: [
        ...prev.addOns,
        {
          id: `addon_${Date.now()}`,
          name: "Artisan 3-Tier Fondant Cake",
          price: 4500,
          description: "Custom flavored celebration cake",
          maxPerBooking: 1,
        },
      ],
    }));
  };

  const removeAddOn = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      addOns: prev.addOns.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (submitForApproval = true) => {
    if (!formData.title || !formData.shortDescription || !formData.category) {
      const msg = "Please complete all required fields (Venue Title, Category, and Summary).";
      setErrorMessage(msg);
      toast.warning(msg, "Missing Information");
      return;
    }

    if (formData.dailyTimeSlots.length === 0) {
      const msg = "Please configure at least one daily time slot / shift for host celebrations.";
      setErrorMessage(msg);
      toast.warning(msg, "Time Slots Required");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          submitForApproval,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create venue event");
      }

      toast.success(
        submitForApproval
          ? "Venue celebration partner listing submitted successfully! It is now in the Administrator Review Queue."
          : "Draft saved successfully.",
        submitForApproval ? "Listing Submitted" : "Draft Saved"
      );
      router.push("/organiser/dashboard");
    } catch (err: any) {
      const msg = err.message || "Failed to create event";
      setErrorMessage(msg);
      toast.error(msg, "Submission Failed");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        {/* Wizard Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5" />
            <span>Venue & Celebration Hosting Partner Studio</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            List Your Celebration Venue
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Configure your venue schedule, hosting days, daily party shifts, celebration packages, and custom add-ons for customer celebration reservations.
          </p>
        </div>

        {/* Stepper Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto text-xs font-semibold scrollbar-none">
          {[
            { step: 1, label: "1. Venue & Occasions" },
            { step: 2, label: "2. Schedule & Daily Shifts" },
            { step: 3, label: "3. Packages & Pricing" },
            { step: 4, label: "4. Add-ons & Policy" },
            { step: 5, label: "5. Media & Submit" },
          ].map((s) => (
            <button
              key={s.step}
              onClick={() => setCurrentStep(s.step)}
              className={`px-4 py-2 rounded-xl whitespace-nowrap transition flex items-center gap-2 ${
                currentStep === s.step
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-900/30"
                  : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
              }`}
            >
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Step 1: Venue & Occasions */}
        {currentStep === 1 && (
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl">
            <div>
              <h2 className="text-lg font-bold text-white">Venue Identity & Celebration Occasions</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Define your venue name, type, and celebrations you specialize in hosting.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Venue Title / Listing Name *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. The Glasshouse Penthouse & Rooftop Lounge"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white text-sm outline-none focus:border-purple-500 transition"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">Venue Architecture Type</label>
                  <select
                    value={formData.venueType}
                    onChange={(e) => setFormData({ ...formData, venueType: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white text-sm outline-none focus:border-purple-500 transition"
                  >
                    {VENUE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Celebration Occasions Tag Selector */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-slate-300 block">
                  Celebration Occasions Hosted (Select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {CELEBRATION_OPTIONS.map((occ) => {
                    const isSelected = formData.celebrationTypes.includes(occ);
                    return (
                      <button
                        key={occ}
                        type="button"
                        onClick={() => toggleCelebrationType(occ)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-purple-500/20 border border-purple-500/50 text-purple-300"
                            : "bg-white/5 border border-white/10 text-slate-400 hover:text-white"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-purple-400" />}
                        <span>{occ}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Short Teaser Hook *
                </label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="e.g. Breathtaking 360° skyline rooftop for birthday parties, anniversaries, and sunset galas..."
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-sm outline-none focus:border-purple-500 transition"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Full Venue & Celebration Experience Description
                </label>
                <textarea
                  rows={4}
                  value={formData.fullDescription}
                  onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                  placeholder="Describe your venue ambiance, sound setup, lighting, catering facilities, privacy, and celebratory vibe..."
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-sm outline-none focus:border-purple-500 transition"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-xs flex items-center gap-2 transition shadow-lg shadow-purple-900/30"
              >
                <span>Next: Schedule & Daily Shifts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Schedule & Daily Shifts */}
        {currentStep === 2 && (
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 p-6 sm:p-8 space-y-8 shadow-2xl">
            <div>
              <h2 className="text-lg font-bold text-white">Location, Operating Days & Daily Time Slots</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure your venue address, operating availability (weekdays, weekends, or custom), and how many party shifts you host per day.
              </p>
            </div>

            {/* Venue Address */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block">
                1. Physical Venue Address
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-medium text-slate-400">Venue Building / Complex Name</label>
                  <input
                    type="text"
                    value={formData.venue.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        venue: { ...formData.venue, name: e.target.value },
                      })
                    }
                    placeholder="e.g. The Glasshouse Penthouse, 32nd Floor Apex Tower"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-medium text-slate-400">Street Address & Landmark</label>
                  <input
                    type="text"
                    value={formData.venue.address}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        venue: { ...formData.venue, address: e.target.value },
                      })
                    }
                    placeholder="Linking Road, Bandra West"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-400">City</label>
                  <input
                    type="text"
                    value={formData.venue.city}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        venue: { ...formData.venue, city: e.target.value },
                      })
                    }
                    placeholder="Mumbai"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-400">State</label>
                  <input
                    type="text"
                    value={formData.venue.state}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        venue: { ...formData.venue, state: e.target.value },
                      })
                    }
                    placeholder="Maharashtra"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Operating Days Selector */}
            <div className="pt-6 border-t border-white/10 space-y-4">
              <div>
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block">
                  2. Venue Hosting Schedule (Days of Week)
                </span>
                <p className="text-xs text-slate-400 mt-1">
                  When can customers book your celebration venue? The booking calendar will automatically enable only these days.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  {
                    id: "all_days",
                    title: "All Days",
                    desc: "Open Monday through Sunday (7 days a week)",
                  },
                  {
                    id: "weekdays_only",
                    title: "Weekdays Only",
                    desc: "Host Monday through Friday bookings only",
                  },
                  {
                    id: "weekends_only",
                    title: "Weekends Only",
                    desc: "Host Saturday and Sunday celebrations",
                  },
                  {
                    id: "custom_days",
                    title: "Custom Schedule",
                    desc: "Pick specific operating days of the week",
                  },
                ].map((schedule) => (
                  <button
                    key={schedule.id}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        operatingDays: schedule.id as any,
                      })
                    }
                    className={`p-4 rounded-2xl text-left border transition relative ${
                      formData.operatingDays === schedule.id
                        ? "bg-purple-500/10 border-purple-500 text-white shadow-lg shadow-purple-900/20 ring-1 ring-purple-500/50"
                        : "bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10"
                    }`}
                  >
                    <span className="text-xs font-bold text-white block">{schedule.title}</span>
                    <span className="text-[11px] text-slate-400 mt-1 block leading-relaxed">
                      {schedule.desc}
                    </span>
                  </button>
                ))}
              </div>

              {/* Custom days multi-select if 'custom_days' */}
              {formData.operatingDays === "custom_days" && (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <span className="text-xs font-semibold text-slate-300 block">
                    Select Enabled Days:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {DAY_NAMES.map((d) => {
                      const active = formData.customOperatingDays.includes(d.day);
                      return (
                        <button
                          key={d.day}
                          type="button"
                          onClick={() => toggleCustomDay(d.day)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                            active
                              ? "bg-purple-600 text-white"
                              : "bg-white/10 text-slate-400 hover:bg-white/15"
                          }`}
                        >
                          {active && <Check className="w-3 h-3 text-white" />}
                          <span>{d.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Daily Time Slots / Shifts Configurator */}
            <div className="pt-6 border-t border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block">
                    3. Daily Time Slots & Shifts ({formData.dailyTimeSlots.length})
                  </span>
                  <p className="text-xs text-slate-400 mt-0.5">
                    How many celebration slots do you host per day? (e.g. Brunch, Sunset Gala, Midnight Soirée)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addDailyShift}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-xs font-semibold transition flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Daily Shift</span>
                </button>
              </div>

              <div className="space-y-3">
                {formData.dailyTimeSlots.map((slot, index) => (
                  <div
                    key={slot.id || index}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> Shift #{index + 1}
                      </span>
                      {formData.dailyTimeSlots.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDailyShift(index)}
                          className="p-1 text-slate-400 hover:text-rose-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-[11px] font-medium text-slate-400">Shift Name / Title</label>
                        <input
                          type="text"
                          value={slot.title}
                          onChange={(e) => updateDailyShift(index, "title", e.target.value)}
                          placeholder="e.g. Sunset Gala & Cocktail Shift"
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs outline-none focus:border-purple-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-slate-400">Shift Type</label>
                        <select
                          value={slot.slotType}
                          onChange={(e) => updateDailyShift(index, "slotType", e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs outline-none focus:border-purple-500"
                        >
                          <option value="morning">Morning / Brunch</option>
                          <option value="afternoon">Afternoon</option>
                          <option value="evening">Sunset / Evening</option>
                          <option value="night">Night / Midnight</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-slate-400">Guest Capacity</label>
                        <input
                          type="number"
                          value={slot.capacity}
                          onChange={(e) => updateDailyShift(index, "capacity", Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-slate-400">Start Time</label>
                        <input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => updateDailyShift(index, "startTime", e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs outline-none focus:border-purple-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-slate-400">End Time</label>
                        <input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => updateDailyShift(index, "endTime", e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-xs flex items-center gap-2 transition shadow-lg shadow-purple-900/30"
              >
                <span>Next: Packages & Pricing</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Packages & Pricing */}
        {currentStep === 3 && (
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Celebration Packages & Pricing</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure your package tiers (e.g. Silver Soirée, Gold Gala, Diamond Exclusive Buyout).
                </p>
              </div>
              <button
                type="button"
                onClick={addPackage}
                className="px-3.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-xs font-semibold transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Package Tier</span>
              </button>
            </div>

            <div className="space-y-4">
              {formData.packages.map((pkg, index) => (
                <div
                  key={pkg.id || index}
                  className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-400">
                      Tier #{index + 1} {index === 0 && "(Default)"}
                    </span>
                    {formData.packages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePackage(index)}
                        className="text-slate-400 hover:text-rose-400 p-1 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-400">Tier Name</label>
                      <input
                        type="text"
                        value={pkg.name}
                        onChange={(e) => {
                          const updated = [...formData.packages];
                          updated[index].name = e.target.value;
                          setFormData({ ...formData, packages: updated });
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs outline-none focus:border-purple-500"
                        placeholder="e.g. Gold Luxury Soirée Tier"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-400">Package Price (₹)</label>
                      <input
                        type="number"
                        value={pkg.price}
                        onChange={(e) => {
                          const updated = [...formData.packages];
                          updated[index].price = Number(e.target.value);
                          setFormData({ ...formData, packages: updated });
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs outline-none focus:border-purple-500"
                        placeholder="54999"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-400">Guest Capacity</label>
                      <input
                        type="number"
                        value={pkg.capacity}
                        onChange={(e) => {
                          const updated = [...formData.packages];
                          updated[index].capacity = Number(e.target.value);
                          setFormData({ ...formData, packages: updated });
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs outline-none focus:border-purple-500"
                        placeholder="100"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-400">
                      Included Inclusions & Perks (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={pkg.features.join(", ")}
                      onChange={(e) => {
                        const updated = [...formData.packages];
                        updated[index].features = e.target.value
                          .split(",")
                          .map((f) => f.trim())
                          .filter(Boolean);
                        setFormData({ ...formData, packages: updated });
                      }}
                      placeholder="e.g. Exclusive Hall Access, Signature Drinks, Live Buffet, Sound System"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-xs flex items-center gap-2 transition shadow-lg shadow-purple-900/30"
              >
                <span>Next: Add-ons & Policy</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Add-ons & Policy */}
        {currentStep === 4 && (
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Celebration Add-ons & Policy</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Offer live entertainment, decorator setups, drone videographers, or custom celebration cakes.
                </p>
              </div>
              <button
                type="button"
                onClick={addAddOn}
                className="px-3.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-xs font-semibold transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Add-on</span>
              </button>
            </div>

            <div className="space-y-3">
              {formData.addOns.map((addon, index) => (
                <div
                  key={addon.id || index}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-end gap-3"
                >
                  <div className="flex-1 space-y-1 w-full">
                    <label className="text-[11px] font-medium text-slate-400">Add-on Name</label>
                    <input
                      type="text"
                      value={addon.name}
                      onChange={(e) => {
                        const updated = [...formData.addOns];
                        updated[index].name = e.target.value;
                        setFormData({ ...formData, addOns: updated });
                      }}
                      placeholder="e.g. Live Acoustic Band / Saxophonist"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="w-full sm:w-28 space-y-1">
                    <label className="text-[11px] font-medium text-slate-400">Price (₹)</label>
                    <input
                      type="number"
                      value={addon.price}
                      onChange={(e) => {
                        const updated = [...formData.addOns];
                        updated[index].price = Number(e.target.value);
                        setFormData({ ...formData, addOns: updated });
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="w-full sm:w-24 space-y-1">
                    <label className="text-[11px] font-medium text-slate-400">Max / Booking</label>
                    <input
                      type="number"
                      value={addon.maxPerBooking}
                      onChange={(e) => {
                        const updated = [...formData.addOns];
                        updated[index].maxPerBooking = Number(e.target.value);
                        setFormData({ ...formData, addOns: updated });
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs outline-none focus:border-purple-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeAddOn(index)}
                    className="p-2 text-slate-400 hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Cancellation Policy */}
            <div className="pt-6 border-t border-white/10 space-y-4">
              <h3 className="text-sm font-bold text-white">Cancellation & Refund Policy</h3>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="cancellationAllowed"
                  checked={formData.cancellationPolicy.allowed}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cancellationPolicy: {
                        ...formData.cancellationPolicy,
                        allowed: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 text-purple-600 rounded bg-slate-900 border-white/20"
                />
                <label htmlFor="cancellationAllowed" className="text-xs font-semibold text-slate-300">
                  Allow customers to cancel their celebration bookings
                </label>
              </div>

              {formData.cancellationPolicy.allowed && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-400">
                      Notice Required (Days before reservation)
                    </label>
                    <input
                      type="number"
                      value={formData.cancellationPolicy.maxDaysBefore}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cancellationPolicy: {
                            ...formData.cancellationPolicy,
                            maxDaysBefore: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-400">Refund Percentage (%)</label>
                    <input
                      type="number"
                      value={formData.cancellationPolicy.refundPercentage}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cancellationPolicy: {
                            ...formData.cancellationPolicy,
                            refundPercentage: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(5)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-xs flex items-center gap-2 transition shadow-lg shadow-purple-900/30"
              >
                <span>Next: Media & Review</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Media & Submit */}
        {currentStep === 5 && (
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 p-6 sm:p-8 space-y-8 shadow-2xl">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-amber-400" />
                <span>Venue Imagery, Gallery & Review</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Upload your high-definition cover photography and atmospheric gallery photos directly to your dedicated Cloudinary organizer folder.
              </p>
            </div>

            {/* Cloudinary Cover Photo */}
            <div className="space-y-4 p-5 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="text-xs font-bold text-white block uppercase tracking-wider">
                    Primary Cover Photo *
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Main header visual displayed across the marketplace and search results.
                  </span>
                </div>

                <label className="cursor-pointer px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shrink-0 self-start sm:self-auto shadow-md shadow-amber-400/20">
                  {uploadingCover ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading to Cloudinary...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-3.5 h-3.5" /> Upload Cover Photo
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    disabled={uploadingCover}
                    className="hidden"
                  />
                </label>
              </div>

              {formData.coverImage && (
                <div className="relative rounded-2xl overflow-hidden border border-white/10 h-48 sm:h-64 bg-slate-950 group">
                  <img
                    src={formData.coverImage}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                    <span className="text-[11px] text-amber-300 font-mono bg-black/60 px-2.5 py-1 rounded-lg border border-white/10">
                      Active Cover Photo
                    </span>
                  </div>
                </div>
              )}

              {/* Presets Option */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Or Pick a Curated High-Definition Preset
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {EVENT_IMAGE_PRESETS.slice(0, 4).map((preset, idx) => (
                    <div
                      key={idx}
                      onClick={() => setFormData({ ...formData, coverImage: preset.url })}
                      className={`cursor-pointer rounded-xl overflow-hidden border transition relative ${
                        formData.coverImage === preset.url
                          ? "border-amber-400 ring-2 ring-amber-400/40 scale-[1.02]"
                          : "border-white/10 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={preset.url} alt={preset.label} className="w-full h-16 object-cover" />
                      <div className="p-1.5 bg-slate-950/90 text-[10px] font-semibold text-white text-center truncate">
                        {preset.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Cloudinary Multi-Image Event Gallery */}
            <div className="space-y-4 p-5 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="text-xs font-bold text-white block uppercase tracking-wider">
                    Venue Photo Gallery ({formData.gallery.length} photos)
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Upload multiple ambiance shots, dining setups, outdoor lawn views, and sound consoles.
                  </span>
                </div>

                <label className="cursor-pointer px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0 self-start sm:self-auto shadow-md shadow-purple-600/20">
                  {uploadingGallery ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading Photos...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-3.5 h-3.5" /> Add Gallery Photos
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryUpload}
                    disabled={uploadingGallery}
                    className="hidden"
                  />
                </label>
              </div>

              {formData.gallery.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {formData.gallery.map((url, idx) => (
                    <div
                      key={idx}
                      className="relative group rounded-xl overflow-hidden border border-white/10 bg-slate-950 aspect-video"
                    >
                      <img
                        src={url}
                        alt={`Gallery photo ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(idx)}
                        className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-black/70 hover:bg-rose-600 text-white transition opacity-80 hover:opacity-100"
                        title="Remove photo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-dashed border-white/10 rounded-2xl p-6 text-center text-xs text-slate-400">
                  No additional gallery photos added yet. Click &ldquo;Add Gallery Photos&rdquo; to upload showcase imagery.
                </div>
              )}
            </div>

            {/* Moderation Guarantee Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-900/30 to-pink-900/20 border border-purple-500/30 text-xs space-y-1.5">
              <span className="font-bold text-purple-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-purple-400" /> Professional Partner Quality Review
              </span>
              <p className="text-slate-300 leading-relaxed">
                When submitted, your listing enters the Administrator Moderation Queue. Our team verifies safety standards, venue compliance, and capacity limits before activating it on the live marketplace.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4">
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition"
              >
                Back
              </button>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleSubmit(false)}
                  disabled={submitting}
                  className="px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 text-xs font-semibold transition"
                >
                  Save as Draft
                </button>

                <button
                  type="button"
                  onClick={() => handleSubmit(true)}
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-purple-900/40 flex items-center gap-2 transition disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{submitting ? "Submitting..." : "Submit to Admin for Approval"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
