"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "@/context/ToastContext";
import { useCms } from "@/context/CmsContext";
import { DEFAULT_CMS_DATA, CmsData, CmsNavLink, CmsFooterColumn } from "@/lib/defaultCms";
import {
  Sparkles,
  Layout,
  Navigation,
  PanelBottom,
  Compass,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle,
  ExternalLink,
  Eye,
  Megaphone,
  Globe,
  Tag,
  Shield,
  Layers,
} from "lucide-react";

export default function AdminCmsStudioPage() {
  const { toast } = useToast();
  const { refreshCms } = useCms();

  const [cms, setCms] = useState<CmsData>(DEFAULT_CMS_DATA);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"header" | "footer" | "hero" | "occasions">("header");

  const fetchCmsData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/cms");
      if (res.ok) {
        const data = await res.json();
        if (data.cms) {
          setCms(data.cms);
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load CMS data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCmsData();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/admin/cms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cms),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("CMS content published live across CelebrateHub!", "Changes Published");
        await refreshCms();
      } else {
        toast.error(data.error || "Failed to publish CMS content");
      }
    } catch (e) {
      console.error(e);
      toast.error("An error occurred while saving CMS content.");
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    if (!confirm("Are you sure you want to reset all CMS content to factory defaults? Any custom links and text will be replaced.")) {
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/admin/cms/reset", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setCms(data.cms);
        toast.success("CMS content restored to factory defaults.", "Reset Complete");
        await refreshCms();
      } else {
        toast.error(data.error || "Failed to reset CMS");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to reset CMS");
    } finally {
      setSaving(false);
    }
  };

  // Nav Links Helpers
  const addNavLink = () => {
    const updated = [...(cms.header.navLinks || []), { label: "New Link", href: "/events", isHighlighted: false }];
    setCms({ ...cms, header: { ...cms.header, navLinks: updated } });
  };

  const updateNavLink = (index: number, field: keyof CmsNavLink, val: any) => {
    const updated = [...(cms.header.navLinks || [])];
    updated[index] = { ...updated[index], [field]: val };
    setCms({ ...cms, header: { ...cms.header, navLinks: updated } });
  };

  const removeNavLink = (index: number) => {
    const updated = cms.header.navLinks.filter((_, i) => i !== index);
    setCms({ ...cms, header: { ...cms.header, navLinks: updated } });
  };

  // Footer Columns Helpers
  const addFooterLink = (colIndex: number) => {
    const cols = [...(cms.footer.columns || [])];
    cols[colIndex].links.push({ label: "Custom Link", href: "/events" });
    setCms({ ...cms, footer: { ...cms.footer, columns: cols } });
  };

  const updateFooterLink = (colIndex: number, linkIndex: number, field: "label" | "href", val: string) => {
    const cols = [...(cms.footer.columns || [])];
    cols[colIndex].links[linkIndex][field] = val;
    setCms({ ...cms, footer: { ...cms.footer, columns: cols } });
  };

  const removeFooterLink = (colIndex: number, linkIndex: number) => {
    const cols = [...(cms.footer.columns || [])];
    cols[colIndex].links = cols[colIndex].links.filter((_, i) => i !== linkIndex);
    setCms({ ...cms, footer: { ...cms.footer, columns: cols } });
  };

  // Occasions Helpers
  const addOccasion = () => {
    const updated = [...(cms.occasions || []), { label: "New Occasion", href: "/events" }];
    setCms({ ...cms, occasions: updated });
  };

  const updateOccasion = (index: number, field: string, val: string) => {
    const updated = [...(cms.occasions || [])];
    updated[index] = { ...updated[index], [field]: val };
    setCms({ ...cms, occasions: updated });
  };

  const removeOccasion = (index: number) => {
    const updated = cms.occasions.filter((_, i) => i !== index);
    setCms({ ...cms, occasions: updated });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="h-8 w-1/4 bg-white/5 animate-pulse rounded-xl" />
        <div className="h-96 bg-white/5 animate-pulse rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/60 border border-amber-500/20 backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs uppercase tracking-wider">
              Content Management System
            </span>
            <span className="text-xs text-slate-400">• Full Storefront Control</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-heading font-black text-white">
            CMS Content Studio & Visual Editor
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Dynamically update header links, announcements, footers, hero headlines, occasions, and trust badges without code changes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetDefaults}
            disabled={saving}
            className="px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5"
            title="Restore starter presets"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Reset Defaults</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs sm:text-sm font-heading font-black shadow-lg shadow-amber-500/20 transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Publishing..." : "Save & Publish CMS"}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950/80 p-2 rounded-2xl border border-white/10 text-xs sm:text-sm font-bold">
        <button
          type="button"
          onClick={() => setActiveTab("header")}
          className={`py-3 rounded-xl transition flex items-center justify-center gap-2 ${
            activeTab === "header"
              ? "bg-amber-400 text-slate-950 shadow-md font-black"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Navigation className="w-4 h-4" />
          <span>Header & Nav Links</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("footer")}
          className={`py-3 rounded-xl transition flex items-center justify-center gap-2 ${
            activeTab === "footer"
              ? "bg-amber-400 text-slate-950 shadow-md font-black"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <PanelBottom className="w-4 h-4" />
          <span>Footer & Trust Columns</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("hero")}
          className={`py-3 rounded-xl transition flex items-center justify-center gap-2 ${
            activeTab === "hero"
              ? "bg-amber-400 text-slate-950 shadow-md font-black"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Layout className="w-4 h-4" />
          <span>Hero & Headline</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("occasions")}
          className={`py-3 rounded-xl transition flex items-center justify-center gap-2 ${
            activeTab === "occasions"
              ? "bg-amber-400 text-slate-950 shadow-md font-black"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Occasions & Chips</span>
        </button>
      </div>

      {/* Tab 1: Header CMS */}
      {activeTab === "header" && (
        <div className="space-y-6">
          {/* General Branding */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 space-y-4">
            <h3 className="text-base font-heading font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-400" />
              <span>Public Header Branding & Search</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Site Brand Name</label>
                <input
                  type="text"
                  value={cms.header?.brandName || ""}
                  onChange={(e) =>
                    setCms({ ...cms, header: { ...cms.header, brandName: e.target.value } })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm outline-none focus:border-amber-400"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Brand Tagline</label>
                <input
                  type="text"
                  value={cms.header?.brandTagline || ""}
                  onChange={(e) =>
                    setCms({ ...cms, header: { ...cms.header, brandTagline: e.target.value } })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm outline-none focus:border-amber-400"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Search Box Placeholder</label>
                <input
                  type="text"
                  value={cms.header?.searchPlaceholder || ""}
                  onChange={(e) =>
                    setCms({ ...cms, header: { ...cms.header, searchPlaceholder: e.target.value } })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Top Announcement Bar */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-purple-400" />
                <h3 className="text-base font-heading font-bold text-white">
                  Top Announcement Banner
                </h3>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-300">
                <input
                  type="checkbox"
                  checked={cms.header?.announcement?.enabled ?? false}
                  onChange={(e) =>
                    setCms({
                      ...cms,
                      header: {
                        ...cms.header,
                        announcement: {
                          ...cms.header.announcement,
                          enabled: e.target.checked,
                        },
                      },
                    })
                  }
                  className="w-4 h-4 accent-amber-400 rounded"
                />
                <span>Enable Announcement Banner</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Banner Announcement Text</label>
                <input
                  type="text"
                  placeholder="e.g. 🎉 Diwali Special: Flat 10% off on all rooftop party bookings!"
                  value={cms.header?.announcement?.text || ""}
                  onChange={(e) =>
                    setCms({
                      ...cms,
                      header: {
                        ...cms.header,
                        announcement: {
                          ...cms.header.announcement,
                          text: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm outline-none focus:border-amber-400"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Call-to-Action Link Text</label>
                <input
                  type="text"
                  placeholder="e.g. Browse Venues"
                  value={cms.header?.announcement?.linkText || ""}
                  onChange={(e) =>
                    setCms({
                      ...cms,
                      header: {
                        ...cms.header,
                        announcement: {
                          ...cms.header.announcement,
                          linkText: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Navigation Links Builder */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-heading font-bold text-white flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-amber-400" />
                  <span>Header Navigation Menu Links</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Configure menu links displayed on desktop header and mobile drawer.
                </p>
              </div>
              <button
                type="button"
                onClick={addNavLink}
                className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Nav Link</span>
              </button>
            </div>

            <div className="space-y-3">
              {(cms.header?.navLinks || []).map((link, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-slate-950/80 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                    <input
                      type="text"
                      placeholder="Link Label (e.g. Rooftops)"
                      value={link.label}
                      onChange={(e) => updateNavLink(idx, "label", e.target.value)}
                      className="px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs outline-none focus:border-amber-400"
                    />
                    <input
                      type="text"
                      placeholder="Destination URL (e.g. /events?category=rooftops)"
                      value={link.href}
                      onChange={(e) => updateNavLink(idx, "href", e.target.value)}
                      className="px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={link.isHighlighted || false}
                        onChange={(e) => updateNavLink(idx, "isHighlighted", e.target.checked)}
                        className="accent-amber-400"
                      />
                      <span>Highlight</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => removeNavLink(idx)}
                      className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                      title="Remove Link"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Footer CMS */}
      {activeTab === "footer" && (
        <div className="space-y-6">
          {/* Brand description & copyright */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 space-y-4">
            <h3 className="text-base font-heading font-bold text-white flex items-center gap-2">
              <PanelBottom className="w-4 h-4 text-amber-400" />
              <span>Footer Brand Description & Copyright</span>
            </h3>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Brand Paragraph Description</label>
                <textarea
                  rows={3}
                  value={cms.footer?.brandDescription || ""}
                  onChange={(e) =>
                    setCms({ ...cms, footer: { ...cms.footer, brandDescription: e.target.value } })
                  }
                  className="w-full p-3 rounded-xl bg-slate-950 border border-white/10 text-white text-xs outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Copyright Line</label>
                <input
                  type="text"
                  value={cms.footer?.copyrightText || ""}
                  onChange={(e) =>
                    setCms({ ...cms, footer: { ...cms.footer, copyrightText: e.target.value } })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Footer Link Columns */}
          <div className="space-y-4">
            <h3 className="text-base font-heading font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Footer Navigation Columns (3 Columns)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {(cms.footer?.columns || []).map((col, colIdx) => (
                <div key={colIdx} className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-amber-400">
                      Column {colIdx + 1} Title
                    </label>
                    <input
                      type="text"
                      value={col.title}
                      onChange={(e) => {
                        const cols = [...cms.footer.columns];
                        cols[colIdx].title = e.target.value;
                        setCms({ ...cms, footer: { ...cms.footer, columns: cols } });
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs font-bold outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Column Links</span>
                      <button
                        type="button"
                        onClick={() => addFooterLink(colIdx)}
                        className="text-amber-400 hover:text-amber-300 font-bold"
                      >
                        + Add Link
                      </button>
                    </div>

                    <div className="space-y-2">
                      {col.links.map((link, lIdx) => (
                        <div key={lIdx} className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Label"
                            value={link.label}
                            onChange={(e) =>
                              updateFooterLink(colIdx, lIdx, "label", e.target.value)
                            }
                            className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-white text-xs outline-none"
                          />
                          <input
                            type="text"
                            placeholder="URL"
                            value={link.href}
                            onChange={(e) =>
                              updateFooterLink(colIdx, lIdx, "href", e.target.value)
                            }
                            className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-white text-xs outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => removeFooterLink(colIdx, lIdx)}
                            className="p-1 text-slate-500 hover:text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Hero CMS */}
      {activeTab === "hero" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 space-y-4">
            <h3 className="text-base font-heading font-bold text-white flex items-center gap-2">
              <Layout className="w-4 h-4 text-amber-400" />
              <span>Hero Headline & Badges</span>
            </h3>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Pill Badge Text</label>
                <input
                  type="text"
                  value={cms.hero?.badgeText || ""}
                  onChange={(e) => setCms({ ...cms, hero: { ...cms.hero, badgeText: e.target.value } })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Main Title (White)</label>
                  <input
                    type="text"
                    value={cms.hero?.title || ""}
                    onChange={(e) => setCms({ ...cms, hero: { ...cms.hero, title: e.target.value } })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm outline-none focus:border-amber-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Highlighted Gradient Title</label>
                  <input
                    type="text"
                    value={cms.hero?.highlightedTitle || ""}
                    onChange={(e) =>
                      setCms({ ...cms, hero: { ...cms.hero, highlightedTitle: e.target.value } })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Hero Subtitle Paragraph</label>
                <textarea
                  rows={3}
                  value={cms.hero?.subtitle || ""}
                  onChange={(e) => setCms({ ...cms, hero: { ...cms.hero, subtitle: e.target.value } })}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-white/10 text-white text-xs outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 space-y-2">
                  <span className="text-xs font-bold text-purple-300">Primary Call-to-Action</span>
                  <input
                    type="text"
                    placeholder="Button Label"
                    value={cms.hero?.primaryCta?.label || ""}
                    onChange={(e) =>
                      setCms({
                        ...cms,
                        hero: {
                          ...cms.hero,
                          primaryCta: { ...cms.hero.primaryCta, label: e.target.value },
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-white text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Link URL (e.g. /events)"
                    value={cms.hero?.primaryCta?.href || ""}
                    onChange={(e) =>
                      setCms({
                        ...cms,
                        hero: {
                          ...cms.hero,
                          primaryCta: { ...cms.hero.primaryCta, href: e.target.value },
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-white text-xs"
                  />
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 space-y-2">
                  <span className="text-xs font-bold text-pink-300">Secondary Call-to-Action</span>
                  <input
                    type="text"
                    placeholder="Button Label"
                    value={cms.hero?.secondaryCta?.label || ""}
                    onChange={(e) =>
                      setCms({
                        ...cms,
                        hero: {
                          ...cms.hero,
                          secondaryCta: { ...cms.hero.secondaryCta, label: e.target.value },
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-white text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Link URL (e.g. /register)"
                    value={cms.hero?.secondaryCta?.href || ""}
                    onChange={(e) =>
                      setCms({
                        ...cms,
                        hero: {
                          ...cms.hero,
                          secondaryCta: { ...cms.hero.secondaryCta, href: e.target.value },
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-white text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Occasions CMS */}
      {activeTab === "occasions" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-heading font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Homepage Occasion Quick Chips</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Chips displayed beneath hero search for instant celebration discovery.
                </p>
              </div>
              <button
                type="button"
                onClick={addOccasion}
                className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Occasion</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(cms.occasions || []).map((occ, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/10 flex items-center justify-between gap-3"
                >
                  <input
                    type="text"
                    placeholder="Occasion (e.g. Birthday Bashes)"
                    value={occ.label}
                    onChange={(e) => updateOccasion(idx, "label", e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs outline-none focus:border-amber-400"
                  />
                  <input
                    type="text"
                    placeholder="URL (/events?search=Birthday)"
                    value={occ.href}
                    onChange={(e) => updateOccasion(idx, "href", e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => removeOccasion(idx)}
                    className="p-2 text-slate-500 hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
