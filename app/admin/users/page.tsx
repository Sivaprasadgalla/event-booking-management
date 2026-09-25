"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { formatEventDate } from "@/lib/utils";
import {
  Users,
  Search,
  CheckCircle,
  XCircle,
  Shield,
  AlertTriangle,
  Trash2,
  X,
  AlertCircle,
  UserPlus,
  Lock,
  Mail,
  Building2,
  Phone,
  Eye,
  EyeOff,
  User,
  Sparkles,
} from "lucide-react";

export default function AdminUsersPage() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deleteTargetUser, setDeleteTargetUser] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeBookingsWarning, setActiveBookingsWarning] = useState<number | null>(null);

  // Create User Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer" as "customer" | "organiser" | "admin",
    phone: "",
    companyName: "",
    isVerified: true,
  });

  const fetchUsers = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (roleFilter !== "all") params.set("role", roleFilter);
    if (search) params.set("search", search);

    fetch(`/api/admin/users?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setUsers(data.users || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/login");
      return;
    }
    if (user) {
      fetchUsers();
    }
  }, [user, isLoading, roleFilter, search]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.name.trim() || !newUserData.email.trim() || !newUserData.password) {
      toast.error("Name, email, and password are required.");
      return;
    }

    try {
      setCreatingUser(true);
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUserData),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(
          data.message || `Account for ${newUserData.name} created successfully!`,
          "User Created"
        );
        setCreateModalOpen(false);
        setNewUserData({
          name: "",
          email: "",
          password: "",
          role: "customer",
          phone: "",
          companyName: "",
          isVerified: true,
        });
        fetchUsers();
      } else {
        toast.error(data.error || "Failed to create user account", "Creation Failed");
      }
    } catch {
      toast.error("An unexpected error occurred while creating user.");
    } finally {
      setCreatingUser(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    try {
      setUpdatingId(userId);
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, status: newStatus } : u))
        );
        toast.success(
          newStatus === "active"
            ? "User account reactivated successfully!"
            : "User account suspended successfully.",
          "Account Status"
        );
      } else {
        toast.error(data.error || "Failed to update user", "Status Error");
      }
    } catch (e) {
      console.error(e);
      toast.error("An unexpected error occurred while updating user status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteUser = async (force: boolean = false) => {
    if (!deleteTargetUser) return;
    try {
      setIsDeleting(true);
      const url = `/api/admin/users/${deleteTargetUser._id}${force ? "?force=true" : ""}`;
      const res = await fetch(url, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.status === 409 && data.hasActiveBookings) {
        setActiveBookingsWarning(data.activeBookingsCount);
        toast.warning(
          `Organizer has ${data.activeBookingsCount} active booking(s). Confirm force deletion to proceed.`,
          "Active Bookings Detected"
        );
        return;
      }

      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u._id !== deleteTargetUser._id));
        toast.success(data.message || "User and associated events deleted successfully.", "User Deleted");
        setDeleteTargetUser(null);
        setActiveBookingsWarning(null);
      } else {
        toast.error(data.error || "Failed to delete user", "Deletion Failed");
      }
    } catch (e) {
      console.error(e);
      toast.error("An unexpected error occurred while deleting user.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleVerification = async (userId: string, currentVerified: boolean) => {
    try {
      setUpdatingId(userId);
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVerified: !currentVerified }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, isVerified: !currentVerified } : u))
        );
        toast.success(
          !currentVerified
            ? "User marked as verified host partner!"
            : "Partner verification badge removed.",
          "Verification Status"
        );
      } else {
        toast.error(data.error || "Failed to update verification", "Verification Error");
      }
    } catch (e) {
      console.error(e);
      toast.error("An unexpected error occurred while updating verification status.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-amber-400" />
            <span>User Directory & Governance</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 mt-1">
            Manage Customer, Host Partner, and Admin profiles, permissions, and security credentials.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-heading font-bold text-sm shadow-xl shadow-amber-500/20 transition self-start sm:self-auto shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Create New User</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-slate-900/60 rounded-3xl border border-white/10 p-5 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search by name, email, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 focus:border-amber-400 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-sm font-heading font-bold self-start sm:self-auto">
          {["all", "customer", "organiser", "admin"].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3.5 py-2 rounded-xl capitalize transition ${
                roleFilter === r
                  ? "bg-amber-400 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {r}s
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 rounded-3xl border border-white/10 shadow-xl backdrop-blur-xl overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-sm text-slate-400">Loading directory...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-slate-400 uppercase tracking-wider text-xs border-b border-white/10 bg-white/5">
                  <th className="py-4 px-5 font-semibold">User</th>
                  <th className="py-4 px-5 font-semibold">Role</th>
                  <th className="py-4 px-5 font-semibold">Verification</th>
                  <th className="py-4 px-5 font-semibold">Status</th>
                  <th className="py-4 px-5 font-semibold">Joined Date</th>
                  <th className="py-4 px-5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      No accounts matched your criteria.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id} className="hover:bg-white/[0.02] transition">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center font-heading font-bold text-purple-400">
                            {u.name?.charAt(0) || "U"}
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-2">
                              <span>{u.name}</span>
                              {u.role === "admin" && (
                                <span className="bg-amber-400/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-400/30 flex items-center gap-1">
                                  <Shield className="w-2.5 h-2.5" /> Staff
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400 font-mono">{u.email}</div>
                            {u.companyName && (
                              <div className="text-[11px] text-amber-300/80 font-semibold mt-0.5">
                                {u.companyName}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <span
                          className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
                            u.role === "admin"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                              : u.role === "organiser"
                              ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                              : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="py-4 px-5">
                        <button
                          type="button"
                          disabled={updatingId === u._id}
                          onClick={() => handleToggleVerification(u._id, u.isVerified)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition ${
                            u.isVerified
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20"
                          }`}
                        >
                          {u.isVerified ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Verified</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-rose-400" />
                              <span>Unverified</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-4 px-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                            u.status === "active"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              u.status === "active" ? "bg-emerald-400" : "bg-rose-400"
                            }`}
                          />
                          <span className="capitalize">{u.status || "active"}</span>
                        </span>
                      </td>

                      <td className="py-4 px-5 text-slate-400 text-xs">
                        {u.createdAt ? formatEventDate(u.createdAt, "dd MMM yyyy") : "N/A"}
                      </td>

                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            disabled={updatingId === u._id || u.role === "admin"}
                            onClick={() => handleToggleStatus(u._id, u.status || "active")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition disabled:opacity-40 ${
                              u.status === "active"
                                ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20"
                                : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                            }`}
                          >
                            {u.status === "active" ? "Suspend" : "Reactivate"}
                          </button>

                          {u.role !== "admin" && (
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteTargetUser(u);
                                setActiveBookingsWarning(null);
                              }}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition"
                              title="Delete user account"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-heading font-bold text-white">Create New Account</h3>
                  <p className="text-xs text-slate-400">
                    Add a Guest, Venue Host, or Administrator to CelebrateHub.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              {/* Role Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Account Role *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["customer", "organiser", "admin"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setNewUserData({ ...newUserData, role: r })}
                      className={`py-2 px-3 rounded-xl text-xs font-bold capitalize transition border ${
                        newUserData.role === r
                          ? "bg-amber-400 text-slate-950 border-amber-400 shadow-md"
                          : "bg-slate-950 text-slate-400 border-white/10 hover:text-white"
                      }`}
                    >
                      {r === "customer" ? "Guest" : r === "organiser" ? "Host" : "Admin"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram Singhania"
                    value={newUserData.name}
                    onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs outline-none focus:border-amber-400 transition"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. host@celebratehub.com"
                    value={newUserData.email}
                    onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs outline-none focus:border-amber-400 transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Initial Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder="At least 6 characters"
                    value={newUserData.password}
                    onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs outline-none focus:border-amber-400 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={newUserData.phone}
                    onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs outline-none focus:border-amber-400 transition"
                  />
                </div>
              </div>

              {/* Company / Brand Name if host */}
              {newUserData.role === "organiser" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Venue / Hospitality Brand *</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Skydeck Manor & Banquet"
                      value={newUserData.companyName}
                      onChange={(e) => setNewUserData({ ...newUserData, companyName: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs outline-none focus:border-amber-400 transition"
                    />
                  </div>
                </div>
              )}

              {/* Instant Verification Toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                <div>
                  <span className="text-xs font-bold text-white block">Pre-Verify Account</span>
                  <span className="text-[11px] text-slate-400 block">
                    Allow user to log in immediately without completing email OTP.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={newUserData.isVerified}
                  onChange={(e) => setNewUserData({ ...newUserData, isVerified: e.target.checked })}
                  className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  disabled={creatingUser}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {creatingUser ? "Creating..." : "Confirm & Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <button
                onClick={() => {
                  setDeleteTargetUser(null);
                  setActiveBookingsWarning(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="text-xl font-heading font-bold text-white">
                Delete Account: {deleteTargetUser.name}?
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Email: <span className="text-slate-300 font-mono">{deleteTargetUser.email}</span> &bull; Role:{" "}
                <span className="text-amber-400 font-bold uppercase">{deleteTargetUser.role}</span>
              </p>
            </div>

            <div className="text-sm text-slate-300 bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
              <p className="font-semibold text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Permanent Action Warning
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Deleting this account will permanently remove this user from the system. If this account is an event
                organizer, <strong>all of their events and listings will also be permanently deleted</strong>.
              </p>
            </div>

            {activeBookingsWarning !== null && activeBookingsWarning > 0 && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex gap-3 text-amber-200 text-xs leading-relaxed">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-300 block mb-0.5">Active Confirmed Bookings Detected</strong>
                  This organizer currently has {activeBookingsWarning} active booking(s). Deleting will disrupt confirmed guest reservations. Click Force Delete below only if you are certain.
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteTargetUser(null);
                  setActiveBookingsWarning(null);
                }}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 text-sm font-semibold transition"
              >
                Cancel
              </button>
              {activeBookingsWarning !== null && activeBookingsWarning > 0 ? (
                <button
                  type="button"
                  onClick={() => handleDeleteUser(true)}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold shadow-lg shadow-rose-600/30 transition disabled:opacity-50"
                >
                  {isDeleting ? "Force Deleting..." : "Force Delete"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleDeleteUser(false)}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold shadow-lg shadow-rose-500/30 transition disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Delete Account"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
