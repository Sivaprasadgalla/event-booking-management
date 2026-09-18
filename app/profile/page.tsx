"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { formatEventDate } from "@/lib/utils";
import {
  User,
  Shield,
  KeyRound,
  Camera,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Building2,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProfilePage() {
  const { user, isLoading, refreshUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");

  // Profile Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [createdAt, setCreatedAt] = useState<string | null>(null);

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Loading States
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login?redirect=/profile");
      return;
    }

    if (user) {
      fetchProfile();
    }
  }, [user, isLoading]);

  const fetchProfile = async () => {
    try {
      setFetchingProfile(true);
      const res = await fetch("/api/user/profile");
      const data = await res.json();
      if (res.ok && data.user) {
        setName(data.user.name || "");
        setPhone(data.user.phone || "");
        setBio(data.user.bio || "");
        setCompanyName(data.user.companyName || "");
        setAvatar(data.user.avatar || "");
        setRole(data.user.role || "");
        setEmail(data.user.email || "");
        setIsVerified(Boolean(data.user.isVerified));
        setCreatedAt(data.user.createdAt || null);
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
      toast.error("Failed to load profile details.");
    } finally {
      setFetchingProfile(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WEBP).", "Invalid File");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image size exceeds 8MB limit.", "File Too Large");
      return;
    }

    try {
      setUploadingAvatar(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "profile");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok && data.url) {
        setAvatar(data.url);
        // Automatically save avatar in profile
        await fetch("/api/user/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ avatar: data.url }),
        });
        if (refreshUser) refreshUser();
        toast.success(
          `Avatar uploaded to your dedicated Cloudinary folder (${data.folder})!`,
          "Avatar Updated"
        );
      } else {
        toast.error(data.error || "Failed to upload avatar to Cloudinary", "Upload Error");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("An error occurred during image upload.");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required.", "Validation Error");
      return;
    }

    try {
      setSavingProfile(true);
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          bio: bio.trim(),
          companyName: companyName.trim(),
          avatar,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        if (refreshUser) refreshUser();
        toast.success("Your profile details have been saved successfully!", "Profile Saved");
      } else {
        toast.error(data.error || "Failed to update profile", "Error");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred while saving profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Please enter your current password.", "Validation Error");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.", "Validation Error");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match.", "Validation Error");
      return;
    }

    try {
      setSavingPassword(true);
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Password updated successfully!", "Password Changed");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.error || "Failed to change password", "Error");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred.");
    } finally {
      setSavingPassword(false);
    }
  };

  if (fetchingProfile || isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-amber-400/20 border-t-amber-400 rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-400">Loading your profile & settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/40 border border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar with Cloudinary trigger */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-2 border-amber-400/30 bg-slate-800 flex items-center justify-center shadow-xl">
              {avatar ? (
                <img src={avatar} alt={name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-heading font-extrabold text-amber-300">
                  {name ? name.charAt(0).toUpperCase() : "U"}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute -bottom-2 -right-2 p-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold shadow-lg transition transform hover:scale-105"
              title="Upload new avatar to Cloudinary"
            >
              {uploadingAvatar ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarUpload}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
                {name || "User Profile"}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-heading font-bold uppercase tracking-wider ${
                  role === "admin"
                    ? "bg-rose-500/10 text-rose-300 border border-rose-500/20"
                    : role === "organiser"
                    ? "bg-amber-400/10 text-amber-300 border border-amber-400/20"
                    : "bg-white/10 text-slate-300 border border-white/10"
                }`}
              >
                {role}
              </span>
              {isVerified && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified Partner
                </span>
              )}
            </div>

            <p className="text-sm text-slate-400 mt-1 flex items-center justify-center sm:justify-start gap-2">
              <Mail className="w-3.5 h-3.5" /> {email}
            </p>

            {companyName && (
              <p className="text-xs text-amber-400/90 font-medium mt-1 flex items-center justify-center sm:justify-start gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> {companyName}
              </p>
            )}

            {createdAt && (
              <p className="text-xs text-slate-500 mt-2 flex items-center justify-center sm:justify-start gap-1.5">
                <Calendar className="w-3 h-3" /> Member since {formatEventDate(createdAt, "MMMM yyyy")}
              </p>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-8 pt-6 border-t border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-heading font-bold flex items-center gap-2 transition ${
              activeTab === "profile"
                ? "bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Personal Information</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("security")}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-heading font-bold flex items-center gap-2 transition ${
              activeTab === "security"
                ? "bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Security & Password</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {activeTab === "profile" && (
          <motion.form
            key="profile-form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleSaveProfile}
            className="bg-slate-900/60 rounded-3xl border border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6"
          >
            <div>
              <h2 className="text-xl font-heading font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>Personal & Brand Details</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Update your public profile, contact information, and business identity.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Full Name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm font-medium focus:border-amber-400 outline-none"
                  />
                </div>
              </div>

              {/* Email Address (Read-only) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Registered Email</span>
                  <span className="text-[10px] text-slate-500 lowercase">(read-only)</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-600 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/50 border border-white/5 text-slate-400 text-sm font-medium cursor-not-allowed outline-none"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Contact Phone
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm font-medium focus:border-amber-400 outline-none"
                  />
                </div>
              </div>

              {/* Company / Brand Name (for Organisers / Admins) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Company / Venue Brand Name
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Skyline Sky Lounge Hospitality"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm font-medium focus:border-amber-400 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Bio / Description */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                About / Bio
              </label>
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share a short introduction about your hospitality venue or hosting experience..."
                className="w-full p-3.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm font-medium focus:border-amber-400 outline-none leading-relaxed"
              />
            </div>

            {/* Cloudinary Folder info card */}
            <div className="p-4 rounded-2xl bg-amber-400/5 border border-amber-400/20 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5 text-slate-300">
                <UploadCloud className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Dedicated Cloudinary Media Folder:{" "}
                  <code className="text-amber-300 font-mono font-semibold">
                    celebratehub/{role}s/{name ? name.toLowerCase().replace(/[^a-z0-9]/g, "_") : "user"}_{user?.id?.slice(-6)}
                  </code>
                </span>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 font-bold transition"
              >
                Change Photo
              </button>
            </div>

            {/* Save Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={savingProfile}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-heading font-extrabold text-sm shadow-xl shadow-amber-400/20 transition flex items-center gap-2 disabled:opacity-50"
              >
                {savingProfile ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Save Profile Details
                  </>
                )}
              </button>
            </div>
          </motion.form>
        )}

        {activeTab === "security" && (
          <motion.form
            key="security-form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleChangePassword}
            className="bg-slate-900/60 rounded-3xl border border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6 max-w-2xl"
          >
            <div>
              <h2 className="text-xl font-heading font-bold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-400" />
                <span>Change Account Password</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Enter your existing password followed by your chosen new password (minimum 6 characters).
              </p>
            </div>

            {/* Current Password */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Current Password *
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm font-medium focus:border-amber-400 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="text-slate-500 hover:text-slate-300 absolute right-3.5 top-3"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                New Password * (min 6 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new strong password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm font-medium focus:border-amber-400 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="text-slate-500 hover:text-slate-300 absolute right-3.5 top-3"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Confirm New Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type your new password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm font-medium focus:border-amber-400 outline-none"
                />
              </div>
            </div>

            {/* Update Password Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={savingPassword}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-heading font-extrabold text-sm shadow-xl shadow-amber-400/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {savingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Updating Password...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" /> Update Password
                  </>
                )}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
