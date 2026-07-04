"use client";

import { useState } from "react";
import { useAuth } from "./AuthProvider";

interface ReviewVoteButtonProps {
  reviewId: string;
  reviewOwnerId: string | null;
  initialCount: number;
}

export default function ReviewVoteButton({ reviewId, reviewOwnerId, initialCount }: ReviewVoteButtonProps) {
  const { user, hasVoted, toggleVote } = useAuth();
  const [count, setCount] = useState(initialCount);
  const voted = hasVoted(reviewId);
  const isOwnReview = !!user && !!reviewOwnerId && user.id === reviewOwnerId;

  return (
    <button
      type="button"
      disabled={isOwnReview}
      aria-pressed={voted}
      title={isOwnReview ? "You can't vote on your own review" : voted ? "Remove helpful vote" : "Mark as helpful"}
      onClick={() => {
        setCount((c) => c + (voted ? -1 : 1));
        void toggleVote(reviewId);
      }}
      className={`mt-3 inline-flex min-h-[36px] items-center gap-1.5 rounded-full border px-3 text-xs font-bold transition-colors duration-150 ease-out ${
        voted ? "border-yolk bg-yolk/20 text-cocoa" : "border-line text-cocoa-soft hover:border-yolk"
      } disabled:cursor-not-allowed disabled:opacity-50`}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill={voted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M7 11v10H3V11h4zm4.5-9c-1 0-1.5.5-1.5 1.5v3.5H6a2 2 0 0 0-2 2.5l1.5 8a2 2 0 0 0 2 1.5H16a2 2 0 0 0 2-1.7l1.4-8A2 2 0 0 0 17.4 7H13V5c0-2-.5-3-1.5-3z" strokeLinejoin="round" />
      </svg>
      Helpful ({count})
    </button>
  );
}
