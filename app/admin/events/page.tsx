"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { formatPrice, formatEventDate } from "@/lib/utils";
import {
  Sparkles,
  CheckCircle,
  XCircle,
  Eye,
  Star,
  Calendar,
  MapPin,
  Clock,
  Filter,
  AlertCircle,
  MessageSquare,
} from "lucide-react";

export default function AdminEventsModerationPage() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending_approval");

  // Reject modal
  const [rejectTarget, setRejectTarget] = useState<any | null>(null);
  const [feedbackReason, setFeedbackReason] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchEvents = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);

    fetch(`/api/admin/events?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setEvents(data.events || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/login");
      return;
    }
    if (user) {
      fetchEvents();
    }
  }, [user, isLoading, statusFilter]);

  const handleUpdateStatus = async (
    eventId: string,
    newStatus: string,
    feedback?: string
  ) => {
    try {
      setUpdatingId(eventId);
      const res = await fetch(`/api/admin/events/${eventId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          adminFeedback: feedback || "",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setEvents((prev) =>
          prev.map((e) => (e._id === eventId ? { ...e, ...data.event } : e))
        );
        setRejectTarget(null);
        setFeedbackReason("");
        toast.success(
          newStatus === "published"
            ? "Venue celebration approved and published live!"
            : newStatus === "rejected"
            ? "Venue submission rejected with feedback sent to organiser."
            : `Event status updated to ${newStatus}`,
          "Status Updated"
        );
      } else {
        toast.error(data.error || "Failed to update event status", "Update Failed");
      }
    } catch (e) {
      console.error(e);
      toast.error("An unexpected error occurred while updating status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleFeatured = async (eventId: string, currentFeatured: boolean) => {
    try {
      setUpdatingId(eventId);
      const res = await fetch(`/api/admin/events/${eventId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isFeatured: !currentFeatured,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setEvents((prev) =>
          prev.map((e) => (e._id === eventId ? { ...e, ...data.event } : e))
        );
        toast.success(
          !currentFeatured
            ? "Event marked as Featured on the homepage showcase!"
            : "Event unfeatured from homepage showcase.",
          "Featured Status"
        );
      } else {
        toast.error(data.error || "Failed to toggle featured status");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to toggle featured status.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-white flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-amber-400" />
          <span>Venue Moderation & Curation</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400 mt-1">
          Inspect host submissions, review venue photos, approve for public listing, or reject with constructive notes.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 text-sm font-heading font-bold overflow-x-auto scrollbar-none">
        {[
          { id: "pending_approval", label: "Pending Approval" },
          { id: "published", label: "Published & Live" },
          { id: "rejected", label: "Rejected" },
          { id: "draft", label: "Drafts" },
          { id: "all", label: "All Statuses" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-4 py-2 rounded-xl whitespace-nowrap transition ${
              statusFilter === tab.id
                ? "bg-amber-400 text-slate-950 font-bold"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Events Moderation Cards */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-white/5 rounded-3xl animate-pulse border border-white/5" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="bg-slate-900/60 rounded-3xl border border-white/10 p-12 text-center space-y-4 backdrop-blur-xl">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-heading font-bold text-white">Queue is Clear</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            No venues found under the "{statusFilter.replace("_", " ")}" filter.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {events.map((evt) => {
            const isPending = evt.status === "pending_approval";
            const isPublished = evt.status === "published";

            return (
              <div
                key={evt._id}
                className={`bg-slate-900/60 rounded-3xl border p-6 sm:p-7 backdrop-blur-xl shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition ${
                  isPending
                    ? "border-amber-400/40 bg-amber-500/[0.03]"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                {/* Event info */}
                <div className="flex gap-4 sm:gap-5">
                  <img
                    src={evt.coverImage}
                    alt={evt.title}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border border-white/10 shrink-0"
                  />

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          isPublished
                            ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                            : isPending
                            ? "bg-amber-400/10 text-amber-300 border border-amber-400/20"
                            : "bg-rose-500/10 text-rose-300 border border-rose-500/20"
                        }`}
                      >
                        {evt.status.replace("_", " ")}
                      </span>

                      {evt.category && (
                        <span className="text-xs font-semibold text-slate-300 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
                          {evt.category.name}
                        </span>
                      )}

                      {evt.isFeatured && (
                        <span className="text-xs font-bold text-amber-300 bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> Featured Spotlight
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg sm:text-xl font-heading font-bold text-white leading-snug">
                      {evt.title}
                    </h3>

                    <p className="text-sm text-slate-400 line-clamp-1">
                      {evt.shortDescription}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-400 pt-1">
                      <span>
                        Host:{" "}
                        <strong className="text-white">
                          {evt.organiser?.companyName || evt.organiser?.name}
                        </strong>
                      </span>
                      <span>•</span>
                      <span>{evt.venue?.name || evt.venue?.city || "Venue"}</span>
                      <span>•</span>
                      <span>{evt.packages?.length || 0} Package Tiers</span>
                      <span>•</span>
                      <span>{evt.scheduleSlots?.length || evt.dailyTimeSlots?.length || 0} Time Slots</span>
                    </div>

                    {evt.adminFeedback && (
                      <div className="text-xs bg-rose-500/10 text-rose-300 p-3 rounded-xl border border-rose-500/20">
                        <strong>Admin Feedback:</strong> {evt.adminFeedback}
                      </div>
                    )}
                  </div>
                </div>

                {/* Moderation Actions */}
                <div className="flex flex-wrap lg:flex-col items-end gap-3 shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-white/10">
                  <div className="flex items-center gap-2">
                    {/* View Details */}
                    <Link
                      href={`/events/${evt.slug}`}
                      className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-slate-200 text-xs sm:text-sm font-heading font-bold flex items-center gap-1.5 transition"
                    >
                      <Eye className="w-4 h-4 text-amber-400" />
                      <span>Preview</span>
                    </Link>

                    {/* Toggle Featured */}
                    <button
                      onClick={() => handleToggleFeatured(evt._id, evt.isFeatured)}
                      className={`px-4 py-2 rounded-xl border text-xs sm:text-sm font-heading font-bold flex items-center gap-1.5 transition ${
                        evt.isFeatured
                          ? "border-amber-400/40 bg-amber-400/10 text-amber-300"
                          : "border-white/10 hover:bg-white/5 text-slate-300"
                      }`}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          evt.isFeatured ? "fill-amber-400 text-amber-400" : ""
                        }`}
                      />
                      <span>{evt.isFeatured ? "Featured" : "Feature"}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    {/* Approve & Publish */}
                    {!isPublished ? (
                      <button
                        onClick={() => handleUpdateStatus(evt._id, "published")}
                        disabled={updatingId === evt._id}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 text-xs sm:text-sm font-heading font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve & Publish</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateStatus(evt._id, "unpublished")}
                        disabled={updatingId === evt._id}
                        className="px-4 py-2 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 text-xs sm:text-sm font-heading font-bold transition"
                      >
                        Unpublish
                      </button>
                    )}

                    {/* Reject */}
                    {evt.status !== "rejected" && (
                      <button
                        onClick={() => setRejectTarget(evt)}
                        disabled={updatingId === evt._id}
                        className="p-2.5 rounded-xl border border-rose-500/30 hover:bg-rose-500/10 text-rose-400 text-xs transition"
                        title="Reject submission"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject with Feedback Modal */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 text-white">
            <h3 className="text-xl font-heading font-bold text-white flex items-center gap-2.5">
              <XCircle className="w-6 h-6 text-rose-400" />
              <span>Reject Venue Submission</span>
            </h3>

            <p className="text-sm text-slate-300">
              Provide constructive feedback for{" "}
              <strong className="text-white">{rejectTarget.title}</strong> so the host partner can amend and resubmit.
            </p>

            <textarea
              rows={3}
              value={feedbackReason}
              onChange={(e) => setFeedbackReason(e.target.value)}
              placeholder="e.g. Please clarify operating hours, upload higher quality venue photos, or include complete package pricing..."
              className="w-full text-sm p-3.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 focus:border-amber-400 outline-none"
              required
            />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setRejectTarget(null)}
                className="flex-1 py-3 rounded-xl border border-white/10 text-slate-300 font-heading font-bold text-xs sm:text-sm hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus(rejectTarget._id, "rejected", feedbackReason)}
                disabled={!feedbackReason.trim()}
                className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-heading font-bold text-xs sm:text-sm disabled:opacity-50 transition"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
