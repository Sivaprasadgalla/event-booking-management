"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { formatEventDate } from "@/lib/utils";
import { Users, Search, CheckCircle, XCircle, Shield, AlertTriangle } from "lucide-react";

export default function AdminUsersPage() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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
      <div>
        <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-white flex items-center gap-3">
          <Users className="w-8 h-8 text-amber-400" />
          <span>User Directory & Governance</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400 mt-1">
          Manage Customer and Host Partner profiles, verification statuses, and system credentials.
        </p>
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
              <tbody className="divide-y divide-white/5 font-medium">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-white/5 transition">
                    <td className="py-4 px-5 flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center font-bold text-sm text-amber-300 shrink-0">
                        {u.name?.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-white block">{u.name}</span>
                        <span className="text-xs text-slate-400">{u.email}</span>
                        {u.companyName && (
                          <span className="text-xs text-amber-400 block mt-0.5">
                            {u.companyName}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          u.role === "admin"
                            ? "bg-rose-500/10 text-rose-300 border border-rose-500/20"
                            : u.role === "organiser"
                            ? "bg-amber-400/10 text-amber-300 border border-amber-400/20"
                            : "bg-white/10 text-slate-300 border border-white/10"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="py-4 px-5">
                      <button
                        onClick={() => handleToggleVerification(u._id, u.isVerified)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
                          u.isVerified
                            ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                            : "bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10"
                        }`}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        {u.isVerified ? "Verified" : "Unverified"}
                      </button>
                    </td>

                    <td className="py-4 px-5">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          u.status === "active"
                            ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-300 border border-rose-500/20"
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>

                    <td className="py-4 px-5 text-slate-400 text-xs">
                      {formatEventDate(u.createdAt, "dd MMM yyyy")}
                    </td>

                    <td className="py-4 px-5 text-right">
                      {u.email !== "admin@celebratehub.com" && u.email !== "admin@eventhub.com" && (
                        <button
                          onClick={() => handleToggleStatus(u._id, u.status)}
                          disabled={updatingId === u._id}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-heading font-bold transition ${
                            u.status === "active"
                              ? "text-rose-400 hover:bg-rose-500/10 border border-rose-500/30"
                              : "text-emerald-300 hover:bg-emerald-500/10 border border-emerald-500/30"
                          }`}
                        >
                          {u.status === "active" ? "Suspend" : "Activate"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
