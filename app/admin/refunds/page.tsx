"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { formatPrice, formatEventDate } from "@/lib/utils";
import { RotateCcw, CheckCircle, XCircle, AlertCircle, Calendar } from "lucide-react";

export default function AdminRefundsPage() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [refunds, setRefunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchRefunds = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);

    fetch(`/api/admin/refunds?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setRefunds(data.refunds || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/login");
      return;
    }
    if (user) {
      fetchRefunds();
    }
  }, [user, isLoading, statusFilter]);

  const handleProcessRefund = async (bookingId: string, action: "approved" | "rejected") => {
    try {
      setProcessingId(bookingId);
      const res = await fetch(`/api/admin/refunds/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || `Refund ${action} successfully!`, "Refund Processed");
        fetchRefunds();
      } else {
        toast.error(data.error || "Failed to process refund", "Refund Error");
      }
    } catch (e) {
      console.error(e);
      toast.error("An unexpected error occurred while processing the refund.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div>
        <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-white flex items-center gap-3">
          <RotateCcw className="w-8 h-8 text-amber-400" />
          <span>Customer Refund Management</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400 mt-1">
          Review guest cancellation refund requests and authorize payment gateway reversals.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 text-sm font-heading font-bold overflow-x-auto scrollbar-none">
        {[
          { id: "all", label: "All Requests" },
          { id: "requested", label: "Pending Review" },
          { id: "approved", label: "Approved & Processed" },
          { id: "rejected", label: "Declined" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-4 py-2 rounded-xl transition ${
              statusFilter === tab.id
                ? "bg-amber-400 text-slate-950 font-bold"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 rounded-3xl border border-white/10 shadow-xl backdrop-blur-xl overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-sm text-slate-400">Loading refund claims...</div>
        ) : refunds.length === 0 ? (
          <div className="p-16 text-center text-sm text-slate-400">
            No refund requests in this queue.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-slate-400 uppercase tracking-wider text-xs border-b border-white/10 bg-white/5">
                  <th className="py-4 px-5 font-semibold">Booking Ref</th>
                  <th className="py-4 px-5 font-semibold">Customer</th>
                  <th className="py-4 px-5 font-semibold">Venue Event</th>
                  <th className="py-4 px-5 font-semibold">Pass Total</th>
                  <th className="py-4 px-5 font-semibold">Refund Claim</th>
                  <th className="py-4 px-5 font-semibold">Status</th>
                  <th className="py-4 px-5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {refunds.map((b) => {
                  const refInfo = b.refundDetails;
                  const isPending = refInfo.status === "requested";

                  return (
                    <tr key={b._id} className="hover:bg-white/5 transition">
                      <td className="py-4 px-5 font-mono font-bold text-amber-400 text-xs">
                        {b.bookingReference}
                      </td>

                      <td className="py-4 px-5">
                        <span className="font-bold text-white block">{b.customer?.name}</span>
                        <span className="text-xs text-slate-400">{b.customer?.email}</span>
                      </td>

                      <td className="py-4 px-5 text-slate-300 max-w-xs line-clamp-1">
                        {b.event?.title}
                      </td>

                      <td className="py-4 px-5 text-slate-300 font-medium">
                        {formatPrice(b.totalAmount)}
                      </td>

                      <td className="py-4 px-5 font-heading font-bold text-emerald-400">
                        {formatPrice(refInfo.amount || 0)}
                      </td>

                      <td className="py-4 px-5">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            refInfo.status === "approved"
                              ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                              : refInfo.status === "requested"
                              ? "bg-amber-400/10 text-amber-300 border border-amber-400/20"
                              : "bg-rose-500/10 text-rose-300 border border-rose-500/20"
                          }`}
                        >
                          {refInfo.status}
                        </span>
                      </td>

                      <td className="py-4 px-5 text-right">
                        {isPending ? (
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => handleProcessRefund(b._id, "approved")}
                              disabled={processingId === b._id}
                              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-heading font-bold text-xs shadow-md transition"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleProcessRefund(b._id, "rejected")}
                              disabled={processingId === b._id}
                              className="px-4 py-2 rounded-xl border border-rose-500/30 hover:bg-rose-500/10 text-rose-400 font-heading font-bold text-xs transition"
                            >
                              Decline
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Processed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
