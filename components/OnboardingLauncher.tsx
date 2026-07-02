"use client";

import { useEffect, useState } from "react";
import OnboardingModal from "./OnboardingModal";

const INTRO_SEEN_ID = "tartography-intro-seen";

export default function OnboardingLauncher() {
  const [open, setOpen] = useState(false);

  // Auto-open once per browser on first visit.
  useEffect(() => {
    try {
      if (!localStorage.getItem(INTRO_SEEN_ID)) setOpen(true);
    } catch {
      /* private mode / storage blocked — skip auto-open */
    }
  }, []);

  function close() {
    setOpen(false);
    try {
      localStorage.setItem(INTRO_SEEN_ID, "1");
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-line bg-paper px-3.5 text-sm font-bold text-cocoa shadow-card transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-cream"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M9.5 9a2.5 2.5 0 0 1 4.5 1.5c0 1.5-2 2-2 3.2" strokeLinecap="round" />
          <path d="M12 17.2v.01" strokeLinecap="round" />
        </svg>
        How it works
      </button>
      <OnboardingModal open={open} onClose={close} />
    </>
  );
}
