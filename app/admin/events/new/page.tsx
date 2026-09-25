"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { EVENT_IMAGE_PRESETS } from "@/lib/presets";
import {
  Sparkles,
  Building2,
  MapPin,
  Clock,
  Star,
  Plus,
  Trash2,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  UserCheck,
  Shield,
  UploadCloud,
  Loader2,
  Check,
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

export default function AdminCreateEventPage() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [organisers, setOrganisers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"identity" | "shifts" | "packages" | "media" | "policy">("identity");

  // Form State
  const [formData, setFormData] = useState({
    // Organiser & Admin Governance
    organiserId: "",
    status: "published",
    isFeatured: true,

    // Basic Identity
    title: "",
    category: "",
    venueType: "Luxury Banquet Hall",
    celebrationTypes: ["Birthday Parties", "Anniversary Specials", "Corporate Galas"],
    shortDescription: "",
    fullDescription: "",
    eventType: "physical",

    // Venue Location
    venue: {
      name: "",
      address: "",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "",
      googleMapsUrl: "",
    },

    // Daily Shifts / Slots
    operatingDays: "all_days",
    dailyTimeSlots: [
      {
        id: "slot_1",
        title: "Sunset & Cocktail Shift",
        startTime: "16:00",
        endTime: "20:00",
        capacity: 100,
        slotType: "evening" as const,
        isActive: true,
      },
      {
        id: "slot_2",
        title: "Starlight Gala Shift",
        startTime: "20:30",
        endTime: "01:30",
        capacity: 150,
        slotType: "night" as const,
        isActive: true,
      },
    ],

    // Package Tiers
    packages: [
      {
        id: "pkg_1",
        name: "Executive Celebration Package",
        price: 35000,
        capacity: 75,
        features: [
          "Exclusive hall access for reserved shift",
          "Welcome drinks & curated mocktail bar",
          "Dedicated venue floor captain & hospitality host",
          "Ambient lighting & sound console setup",
        ],
        isDefault: true,
      },
      {
        id: "pkg_2",
        name: "Royal Grand Buyout",
        price: 75000,
        capacity: 150,
        features: [
          "Full venue exclusive buyout",
          "Gourmet multi-course buffet with live counter",
          "Complete stage & ambient audio-visual production",
          "Complimentary customized celebration cake",
        ],
        isDefault: false,
      },
    ],

    // Media
    coverImage: EVENT_IMAGE_PRESETS[0].url,
    gallery: [] as string[],

    // Contact info
    contactInfo: {
      contactPerson: "",
      phone: "",
      email: "",
      whatsapp: "",
    },

    // Policies
    termsAndConditionsText:
      "Decor setup is permitted 60 minutes prior to shift commencement.\nOutside catering adheres to venue sanitation and local noise curfew guidelines.\nAdvance booking deposit confirms reservation slot.",
    policyText:
      "Rescheduling is permitted up to 3 days prior to your celebration reservation date subject to shift availability.\nCancellations made 3+ days in advance receive an 85% refund.",
    cancellationPolicy: {
      allowed: true,
      maxDaysBefore: 3,
      refundPercentage: 85,
    },
  });

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/login");
      return;
    }

    if (user) {
      Promise.all([
        fetch("/api/admin/users?role=organiser").then((res) => res.json()),
        fetch("/api/categories").then((res) => res.json()),
      ])
        .then(([organisersData, categoriesData]) => {
          const orgList = organisersData.users || [];
          setOrganisers(orgList);
          if (orgList.length > 0) {
            setFormData((prev) => ({
              ...prev,
              organiserId: orgList[0]._id,
              contactInfo: {
                contactPerson: orgList[0].name || "",
                phone: orgList[0].phone || "",
                email: orgList[0].email || "",
                whatsapp: orgList[0].phone || "",
              },
            }));
          } else {
            setFormData((prev) => ({ ...prev, organiserId: user.id }));
          }

          if (categoriesData.categories?.length > 0) {
            setCategories(categoriesData.categories);
            setFormData((prev) => ({
              ...prev,
              category: categoriesData.categories[0]._id,
            }));
          }
        })
        .catch(console.error)
        .finally(() => setLoadingInitial(false));
    }
  }, [user, isLoading, router]);

  const handleOrganiserChange = (orgId: string) => {
    const selected = organisers.find((o) => o._id === orgId);
    setFormData((prev) => ({
      ...prev,
      organiserId: orgId,
      contactInfo: selected
        ? {
            contactPerson: selected.name || prev.contactInfo.contactPerson,
            phone: selected.phone || prev.contactInfo.phone,
            email: selected.email || prev.contactInfo.email,
            whatsapp: selected.phone || prev.contactInfo.whatsapp,
          }
        : prev.contactInfo,
    }));
  };

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
      dailyTimeSlots: prev.dailyTimeSlots.filter((_, idx) => idx !== index),
    }));
  };

  const addPackage = () => {
    const newId = `pkg_${Date.now()}`;
    setFormData((prev) => ({
      ...prev,
      packages: [
        ...prev.packages,
        {
          id: newId,
          name: `VIP Celebration Tier ${prev.packages.length + 1}`,
          price: 49999,
          capacity: 100,
          features: ["Full Shift Access", "Beverage Service", "Audio-Visual Console"],
          isDefault: false,
        },
      ],
    }));
  };

  const removePackage = (index: number) => {
    if (formData.packages.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      packages: prev.packages.filter((_, idx) => idx !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Please provide a Venue Title / Celebration Listing Name.");
      setActiveTab("identity");
      return;
    }
    if (!formData.category) {
      toast.error("Please select a Category.");
      setActiveTab("identity");
      return;
    }
    if (!formData.organiserId) {
      toast.error("Please assign this venue to a Host Organiser.");
      setActiveTab("identity");
      return;
    }

    try {
      setSubmitting(true);

      const termsList = formData.termsAndConditionsText
        .split("\n")
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        ...formData,
        termsAndConditions: termsList,
      };

      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(
          `Venue "${data.event?.title || formData.title}" successfully created and assigned!`,
          "Venue Published"
        );
        router.push("/admin/events");
      } else {
        toast.error(data.error || "Failed to create venue", "Submission Error");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("An error occurred while creating the venue.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-400 mb-3" />
        <p className="text-sm">Loading Admin Venue Studio...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <Link
            href="/admin/events"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Moderation & Directory
          </Link>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-amber-400" />
            <span>Admin Venue Studio & Host Assignment</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Build and curate premium celebration listings and assign immediate operational control to any registered host partner.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="self-start sm:self-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-heading font-bold text-sm shadow-xl shadow-amber-400/20 transition-all hover:scale-105 shrink-0 flex items-center gap-2 disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating Venue...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>Publish & Assign Venue</span>
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* TOP SECTION: HOST ORGANISER ASSIGNMENT & GOVERNANCE */}
        <div className="bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 border border-amber-400/30 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-heading font-bold text-white">
                Host Organiser Assignment & Direct Governance
              </h2>
              <p className="text-xs text-slate-400">
                Determine which registered host partner manages reservations and operations for this venue.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Organiser Selector */}
            <div className="md:col-span-1 space-y-1.5">
              <label className="text-xs font-semibold text-amber-300 uppercase tracking-wider block">
                Assigned Host Organiser *
              </label>
              <select
                value={formData.organiserId}
                onChange={(e) => handleOrganiserChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-amber-400/40 text-white text-xs font-medium outline-none focus:border-amber-400 transition"
              >
                {organisers.map((org) => (
                  <option key={org._id} value={org._id}>
                    {org.companyName ? `${org.companyName} (${org.name})` : org.name} &bull; {org.email}
                  </option>
                ))}
                {organisers.length === 0 && (
                  <option value={user?.id}>Administrator (Self)</option>
                )}
              </select>
              <span className="text-[11px] text-slate-400 block">
                The assigned host can manage bookings, packages, and calendar slots.
              </span>
            </div>

            {/* Direct Status Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Initial Listing Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs font-medium outline-none focus:border-amber-400 transition"
              >
                <option value="published">Published & Live Immediately</option>
                <option value="pending_approval">Pending Approval</option>
                <option value="draft">Saved as Draft</option>
                <option value="unpublished">Unpublished</option>
              </select>
              <span className="text-[11px] text-slate-400 block">
                Admins bypass standard review queues by default.
              </span>
            </div>

            {/* Featured Showcase Toggle */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Homepage Featured Spotlight
              </label>
              <div
                onClick={() => setFormData({ ...formData, isFeatured: !formData.isFeatured })}
                className={`w-full px-4 py-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition select-none ${
                  formData.isFeatured
                    ? "bg-amber-400/10 border-amber-400/40 text-amber-300"
                    : "bg-slate-950 border-white/10 text-slate-400 hover:border-white/20"
                }`}
              >
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <Star className={`w-4 h-4 ${formData.isFeatured ? "fill-amber-400 text-amber-400" : ""}`} />
                  {formData.isFeatured ? "Featured on Showcase" : "Standard Listing"}
                </span>
                <span className="text-xs font-semibold underline">
                  {formData.isFeatured ? "Enabled" : "Disabled"}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 block">
                Featured listings appear at top of homepage carousel.
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto text-xs font-semibold scrollbar-none">
          {[
            { id: "identity", label: "1. Venue Identity & Location" },
            { id: "shifts", label: "2. Celebration Shifts (Slots)" },
            { id: "packages", label: "3. Packages & Pricing" },
            { id: "media", label: "4. Imagery & Presets" },
            { id: "policy", label: "5. Contact & Policies" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl whitespace-nowrap transition flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20"
                  : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: IDENTITY & LOCATION */}
        {activeTab === "identity" && (
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 p-6 sm:p-8 space-y-6 shadow-xl">
            <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-400" />
              <span>Venue Identity & Location Details</span>
            </h2>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Celebration Venue Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Grand Horizon Luxury Banquets & Rooftop Pavilion"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-sm outline-none focus:border-amber-400 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white text-sm outline-none focus:border-amber-400 transition"
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
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white text-sm outline-none focus:border-amber-400 transition"
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
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20"
                            : "bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                        <span>{occ}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Descriptions */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-slate-300 block">
                  Short Highlight (Displayed in listings) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="e.g. Stunning 5,000 sq.ft banquet hall with panoramic rooftop and curated luxury dining."
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-sm outline-none focus:border-amber-400 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Full Venue Description & Features
                </label>
                <textarea
                  rows={4}
                  value={formData.fullDescription}
                  onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                  placeholder="Comprehensive details regarding venue acoustic systems, decor provisions, valet parking, and bridal suites..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-sm outline-none focus:border-amber-400 transition leading-relaxed"
                />
              </div>

              {/* Physical Location */}
              <div className="pt-4 border-t border-white/10 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>Physical Address & Map Link</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-400">Venue Building / Complex Name</label>
                    <input
                      type="text"
                      value={formData.venue.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          venue: { ...formData.venue, name: e.target.value },
                        })
                      }
                      placeholder="e.g. The Grand Horizon Tower, Floor 14"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-400">Street Address</label>
                    <input
                      type="text"
                      value={formData.venue.address}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          venue: { ...formData.venue, address: e.target.value },
                        })
                      }
                      placeholder="e.g. Off Linking Road, Bandra West"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-400">City</label>
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
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-400">Google Maps URL</label>
                    <input
                      type="text"
                      value={formData.venue.googleMapsUrl}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          venue: { ...formData.venue, googleMapsUrl: e.target.value },
                        })
                      }
                      placeholder="https://maps.google.com/?q=..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setActiveTab("shifts")}
                className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-2"
              >
                <span>Next: Daily Shifts</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: DAILY CELEBRATION SHIFTS / SLOTS */}
        {activeTab === "shifts" && (
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-400" />
                  <span>Daily Celebration Shifts & Time Slots</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure repeating time shifts (e.g. Afternoon Lunch, Sunset Gala, Starlight Night).
                </p>
              </div>

              <button
                type="button"
                onClick={addDailyShift}
                className="px-3.5 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/30 text-xs font-bold transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Shift</span>
              </button>
            </div>

            <div className="space-y-4">
              {formData.dailyTimeSlots.map((slot, index) => (
                <div
                  key={slot.id || index}
                  className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400">
                      Shift #{index + 1}: {slot.title}
                    </span>
                    {formData.dailyTimeSlots.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDailyShift(index)}
                        className="text-slate-400 hover:text-rose-400 p-1 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-400">Shift Name</label>
                      <input
                        type="text"
                        value={slot.title}
                        onChange={(e) => {
                          const updated = [...formData.dailyTimeSlots];
                          updated[index].title = e.target.value;
                          setFormData({ ...formData, dailyTimeSlots: updated });
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs outline-none focus:border-amber-400"
                        placeholder="e.g. Sunset Gala Shift"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-400">Start Time</label>
                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => {
                          const updated = [...formData.dailyTimeSlots];
                          updated[index].startTime = e.target.value;
                          setFormData({ ...formData, dailyTimeSlots: updated });
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-400">End Time</label>
                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) => {
                          const updated = [...formData.dailyTimeSlots];
                          updated[index].endTime = e.target.value;
                          setFormData({ ...formData, dailyTimeSlots: updated });
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-400">Guest Capacity</label>
                      <input
                        type="number"
                        value={slot.capacity}
                        onChange={(e) => {
                          const updated = [...formData.dailyTimeSlots];
                          updated[index].capacity = Number(e.target.value);
                          setFormData({ ...formData, dailyTimeSlots: updated });
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs outline-none focus:border-amber-400"
                        placeholder="100"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setActiveTab("identity")}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("packages")}
                className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-2"
              >
                <span>Next: Packages & Pricing</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: PACKAGES & PRICING */}
        {activeTab === "packages" && (
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400" />
                  <span>Celebration Packages & Pricing Tiers</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Define tiered pricing packages for guests to choose during slot checkout.
                </p>
              </div>

              <button
                type="button"
                onClick={addPackage}
                className="px-3.5 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/30 text-xs font-bold transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Tier</span>
              </button>
            </div>

            <div className="space-y-4">
              {formData.packages.map((pkg, index) => (
                <div
                  key={pkg.id || index}
                  className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400">
                      Tier #{index + 1}: {pkg.name} {index === 0 && "(Default Selected)"}
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
                      <label className="text-[11px] font-medium text-slate-400">Package Name</label>
                      <input
                        type="text"
                        value={pkg.name}
                        onChange={(e) => {
                          const updated = [...formData.packages];
                          updated[index].name = e.target.value;
                          setFormData({ ...formData, packages: updated });
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs outline-none focus:border-amber-400"
                        placeholder="e.g. Royal Banquet Experience"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-400">Price (₹)</label>
                      <input
                        type="number"
                        value={pkg.price}
                        onChange={(e) => {
                          const updated = [...formData.packages];
                          updated[index].price = Number(e.target.value);
                          setFormData({ ...formData, packages: updated });
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs outline-none focus:border-amber-400"
                        placeholder="45000"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-400">Capacity (Persons)</label>
                      <input
                        type="number"
                        value={pkg.capacity}
                        onChange={(e) => {
                          const updated = [...formData.packages];
                          updated[index].capacity = Number(e.target.value);
                          setFormData({ ...formData, packages: updated });
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs outline-none focus:border-amber-400"
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
                      placeholder="e.g. Dedicated Floor Captain, Welcome Drinks, Sound Console, Buffet Setup"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setActiveTab("shifts")}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("media")}
                className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-2"
              >
                <span>Next: Media & Presets</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: MEDIA & PRESETS */}
        {activeTab === "media" && (
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 p-6 sm:p-8 space-y-6 shadow-xl">
            <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-amber-400" />
              <span>Venue Imagery & Photography</span>
            </h2>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Cover Photo URL *
                </label>
                <input
                  type="text"
                  required
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white text-xs outline-none focus:border-amber-400 transition"
                />
              </div>

              {formData.coverImage && (
                <div className="relative rounded-2xl overflow-hidden border border-white/10 h-52 bg-slate-950">
                  <img
                    src={formData.coverImage}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-amber-300 border border-white/10">
                    Active Cover Image
                  </div>
                </div>
              )}

              {/* Curated Presets Selection */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-slate-300 block">
                  Quick Select from Curated Photography Presets
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {EVENT_IMAGE_PRESETS.map((preset, idx) => (
                    <div
                      key={idx}
                      onClick={() => setFormData({ ...formData, coverImage: preset.url })}
                      className={`relative cursor-pointer rounded-xl overflow-hidden border aspect-video transition group ${
                        formData.coverImage === preset.url
                          ? "border-amber-400 ring-2 ring-amber-400/50"
                          : "border-white/10 hover:border-white/30"
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                        <span className="text-[10px] font-bold text-white leading-tight">
                          {preset.label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setActiveTab("packages")}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("policy")}
                className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-2"
              >
                <span>Next: Host Contact & Policies</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 5: HOST CONTACT & POLICIES */}
        {activeTab === "policy" && (
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 p-6 sm:p-8 space-y-6 shadow-xl">
            <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-400" />
              <span>Host Contact Information & Venue House Rules</span>
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-400">Contact Person Name</label>
                  <input
                    type="text"
                    value={formData.contactInfo.contactPerson}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contactInfo: { ...formData.contactInfo, contactPerson: e.target.value },
                      })
                    }
                    placeholder="e.g. Rajesh Mehra"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-400">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={formData.contactInfo.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contactInfo: {
                          ...formData.contactInfo,
                          phone: e.target.value,
                          whatsapp: e.target.value,
                        },
                      })
                    }
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-400">Contact Email</label>
                  <input
                    type="email"
                    value={formData.contactInfo.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contactInfo: { ...formData.contactInfo, email: e.target.value },
                      })
                    }
                    placeholder="host@grandhorizon.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-slate-300 block">
                  Venue House Rules & Terms (One per line)
                </label>
                <textarea
                  rows={4}
                  value={formData.termsAndConditionsText}
                  onChange={(e) => setFormData({ ...formData, termsAndConditionsText: e.target.value })}
                  placeholder="Decor setup is permitted 60 minutes prior to shift commencement.&#10;Outside sound and DJ music adhere to 11 PM curfew.&#10;Advance booking deposit is required to confirm reservation slot."
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-xs outline-none focus:border-amber-400 transition leading-relaxed"
                />
              </div>

              {/* Cancellation Policy */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Cancellation & Rescheduling Policy Text
                </label>
                <textarea
                  rows={3}
                  value={formData.policyText}
                  onChange={(e) => setFormData({ ...formData, policyText: e.target.value })}
                  placeholder="Rescheduling is permitted up to 3 days prior to your celebration reservation date subject to shift availability. Cancellations made 3+ days in advance receive an 85% refund."
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 text-xs outline-none focus:border-amber-400 transition leading-relaxed"
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setActiveTab("media")}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-amber-400/20 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                <span>Publish Venue Listing Now</span>
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

