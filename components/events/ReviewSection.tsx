"use client";

import React, { useState } from "react";
import { Star, MessageSquare, CheckCircle, Send } from "lucide-react";
import { formatEventDate } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

export interface ReviewItem {
  _id: string;
  rating: number;
  comment: string;
  organiserResponse?: string;
  createdAt: string;
  customer?: {
    name: string;
    avatar?: string;
  };
}

interface ReviewSectionProps {
  eventId: string;
  reviews: ReviewItem[];
  averageRating: number;
  reviewCount: number;
  onReviewAdded?: () => void;
}

export default function ReviewSection({
  eventId,
  reviews: initialReviews,
  averageRating,
  reviewCount,
  onReviewAdded,
}: ReviewSectionProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/customer/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          rating,
          comment: comment.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSuccessMsg(data.message || "Review submitted successfully!");
        setComment("");
        // Append optimistic review
        setReviews([
          {
            _id: `rev_${Date.now()}`,
            rating,
            comment,
            createdAt: new Date().toISOString(),
            customer: {
              name: user?.name || "Verified Guest",
              avatar: user?.avatar,
            },
          },
          ...reviews,
        ]);
        if (onReviewAdded) onReviewAdded();
      }
    } catch (e) {
      console.error("Failed to post review", e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pt-6 border-t border-white/10">
      {/* Header with rating score */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg sm:text-xl font-heading font-extrabold text-white flex items-center gap-2.5">
            <MessageSquare className="w-5 h-5 text-purple-400" />
            <span>Celebration Reviews & Host Ratings</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Verified feedback from party hosts and event guests
          </p>
        </div>

        <div className="flex items-center gap-3 border border-white/10 px-4 py-2.5 rounded-2xl shrink-0">
          <div className="flex items-center gap-1.5 text-amber-400">
            <Star className="w-5 h-5 fill-amber-400" />
            <span className="text-xl font-heading font-black text-white">
              {averageRating > 0 ? averageRating.toFixed(1) : "New"}
            </span>
          </div>
          <div className="border-l border-white/10 pl-3 text-xs text-slate-400">
            <span className="font-semibold text-white">{reviews.length}</span> verified reviews
          </div>
        </div>
      </div>

      {/* Review submission box */}
      <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-5 sm:p-6 space-y-4">
        <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider">
          Leave a Review for this Venue
        </h4>

        {successMsg ? (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-slate-300">Your Rating:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-0.5 focus:outline-none transition hover:scale-110"
                    aria-label={`Rate ${star} stars`}
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= rating
                          ? "text-amber-400 fill-amber-400"
                          : "text-slate-600 hover:text-amber-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-bold text-slate-200 ml-1">{rating} of 5 Stars</span>
            </div>

            <textarea
              rows={3}
              placeholder="Tell others about your celebration experience, venue ambiance, sound, catering, or host hospitality..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full text-sm p-3.5 rounded-xl border border-white/10 bg-slate-900/90 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
              required
            />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting || !comment.trim()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-900/30 transition disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? "Submitting..." : "Submit Review"}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Reviews list */}
      <div className="space-y-3.5">
        {reviews.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">
            No celebration reviews yet. Be the first party host to leave a review!
          </p>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev._id}
              className="bg-slate-950/60 border border-white/10 rounded-2xl p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold uppercase overflow-hidden ring-1 ring-white/20">
                    {rev.customer?.avatar ? (
                      <img
                        src={rev.customer.avatar}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (rev.customer?.name || "G").charAt(0)
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-heading font-bold text-white block">
                      {rev.customer?.name || "Verified Celebration Host"}
                    </span>
                    <span className="text-xs text-slate-400">
                      {formatEventDate(rev.createdAt, "dd MMM yyyy")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= rev.rating
                          ? "text-amber-400 fill-amber-400"
                          : "text-slate-700"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed font-normal">{rev.comment}</p>

              {rev.organiserResponse && (
                <div className="mt-2 bg-purple-500/10 border-l-2 border-purple-500 pl-3.5 py-2 text-xs text-purple-200 rounded-r-xl">
                  <span className="font-bold block text-purple-300 mb-0.5">Host Partner Response:</span>
                  <span>{rev.organiserResponse}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
