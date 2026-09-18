"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Settings, Save, CheckCircle, AlertCircle } from "lucide-react";

export default function AdminSettingsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [settings, setSettings] = useState({
    platformName: "CelebrateHub Luxury Celebrations",
    platformFeePercent: 5,
    taxPercent: 18,
    currency: "INR",
    supportEmail: "support@celebratehub.com",
    allowNewOrganiserRegistration: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/login");
      return;
    }
    if (user) {
      fetch("/api/admin/settings")
        .then((res) => res.json())
        .then((data) => {
          if (data.setting) setSettings(data.setting);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user, isLoading]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div>
        <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-white flex items-center gap-3">
          <Settings className="w-8 h-8 text-amber-400" />
          <span>Platform Marketplace Settings</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400 mt-1">
          Configure marketplace commission percentages, tax levies, and hospitality platform defaults.
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="bg-slate-900/60 rounded-3xl border border-white/10 p-6 sm:p-8 space-y-6 backdrop-blur-xl shadow-xl"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Marketplace Name</label>
            <input
              type="text"
              value={settings.platformName}
              onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
              className="w-full p-3 rounded-xl bg-slate-950 border border-white/10 text-white text-sm font-medium focus:border-amber-400 outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Support Email</label>
            <input
              type="email"
              value={settings.supportEmail}
              onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
              className="w-full p-3 rounded-xl bg-slate-950 border border-white/10 text-white text-sm font-medium focus:border-amber-400 outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Convenience Fee (%)
            </label>
            <input
              type="number"
              value={settings.platformFeePercent}
              onChange={(e) =>
                setSettings({ ...settings, platformFeePercent: Number(e.target.value) })
              }
              className="w-full p-3 rounded-xl bg-slate-950 border border-white/10 text-white text-sm font-medium focus:border-amber-400 outline-none"
            />
            <p className="text-xs text-slate-400">Default 5% fee on each cart checkout</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">GST / Hospitality Tax (%)</label>
            <input
              type="number"
              value={settings.taxPercent}
              onChange={(e) => setSettings({ ...settings, taxPercent: Number(e.target.value) })}
              className="w-full p-3 rounded-xl bg-slate-950 border border-white/10 text-white text-sm font-medium focus:border-amber-400 outline-none"
            />
            <p className="text-xs text-slate-400">Standard 18% GST calculation</p>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Settlement Currency</label>
            <select
              value={settings.currency}
              onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              className="w-full p-3 rounded-xl bg-slate-950 border border-white/10 text-white text-sm font-medium focus:border-amber-400 outline-none"
            >
              <option value="INR">Indian Rupee (INR ₹)</option>
              <option value="USD">US Dollar (USD $)</option>
              <option value="EUR">Euro (EUR €)</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          {savedSuccess ? (
            <span className="text-sm text-emerald-400 font-bold flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" /> Settings updated successfully!
            </span>
          ) : (
            <div />
          )}

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-heading font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save Platform Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
