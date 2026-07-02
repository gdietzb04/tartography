"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

interface OnboardingModalProps {
  open: boolean;
  onClose: () => void;
}

function TartMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" className="shrink-0">
      <ellipse cx="50" cy="58" rx="38" ry="20" fill="#E8C97E" stroke="#7A4A21" strokeWidth="4" />
      <ellipse cx="50" cy="54" rx="28" ry="13" fill="#F0B429" stroke="#B5651D" strokeWidth="3" />
      <path d="M14 52 Q20 40 28 48 Q34 38 42 46 Q50 36 58 46 Q66 38 72 48 Q80 40 86 52" fill="none" stroke="#7A4A21" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

const RUBRIC = [
  { label: "Crust", hint: "flaky or crisp, never soggy" },
  { label: "Custard", hint: "silky, wobbly, eggy" },
  { label: "Sweetness", hint: "dessert, not candy" },
  { label: "Value", hint: "worth the price" },
  { label: "Freshness", hint: "warm beats a straggler" },
];

const STEPS = [
  {
    title: "Every mapped egg tart in New York",
    body: (
      <>
        <p className="text-cocoa-soft">
          Tartography charts the bakeries across the city selling egg tarts, from{" "}
          <strong className="text-cocoa">Hong Kong</strong> flaky shells and{" "}
          <strong className="text-cocoa">Chinese-bakery</strong> shortcrust to{" "}
          <strong className="text-cocoa">Portuguese</strong> pastel de nata and flavored specialties.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {["HK flaky", "Shortcrust", "Portuguese", "Cookie-crust", "Taiwanese", "Flavored"].map((s) => (
            <span key={s} className="inline-flex items-center rounded-full bg-custard/60 px-3 py-1 text-xs font-bold text-crust">{s}</span>
          ))}
          <span className="inline-flex items-center rounded-full bg-sage px-3 py-1 text-xs font-bold text-paper">Specialist</span>
          <span className="inline-flex items-center rounded-full bg-berry px-3 py-1 text-xs font-bold text-paper">Top tart</span>
        </div>
      </>
    ),
  },
  {
    title: "How the ratings work.",
    body: (
      <>
        <p className="text-cocoa-soft">Every review scores five things from 1 to 5:</p>
        <ul className="mt-3 space-y-1.5">
          {RUBRIC.map((r) => (
            <li key={r.label} className="flex items-baseline gap-2 text-sm">
              <span className="font-name font-semibold text-cocoa">{r.label}</span>
              <span className="text-cocoa-soft">— {r.hint}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-cocoa-soft">
          A shop&apos;s rating is the <strong className="text-cocoa">average of its reviews&apos; averages</strong>. No reviews yet
          shows &ldquo;No ratings yet,&rdquo; never a zero.
        </p>
      </>
    ),
  },
  {
    title: "Find one, then rate it.",
    body: (
      <>
        <p className="text-cocoa-soft">
          Filter by style, borough, or price, sort by most reviewed or top rated, or search a name. Tap any pin or card to open a
          shop.
        </p>
        <p className="mt-3 text-cocoa-soft">
          Ate a tart? On a shop&apos;s page, hit <strong className="text-cocoa">&ldquo;Rate the tarts&rdquo;</strong> to score all
          five and add a photo. Your scores count toward its rating right away.
        </p>
        <p className="mt-3 text-cocoa-soft">
          Sign in with Google to <strong className="text-cocoa">save favorites</strong> and find them again from any device.
        </p>
      </>
    ),
  },
];

export default function OnboardingModal({ open, onClose }: OnboardingModalProps) {
  const [step, setStep] = useState(0);
  const reduce = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const last = STEPS.length - 1;

  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const current = STEPS[step];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.2 }}
        >
          <button
            aria-label="Close"
            tabIndex={-1}
            onClick={onClose}
            className="absolute inset-0 bg-cocoa/40 backdrop-blur-sm"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="onboarding-title"
            className="relative w-full max-w-lg overflow-hidden rounded-t-[1.75rem] border border-line bg-paper shadow-modal sm:rounded-card"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-line bg-cream/50 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <TartMark size={34} />
                <span className="font-display text-lg font-bold tracking-tight text-cocoa">Tartography</span>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close introduction"
                className="grid h-9 w-9 place-items-center rounded-full text-cocoa-soft transition-colors hover:bg-cocoa/10 hover:text-cocoa"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-6 sm:px-8 sm:py-7">
              <span className="text-[11px] font-bold uppercase tracking-widest text-yolk-deep">
                Step {step + 1} of {STEPS.length}
              </span>
              <div className="relative mt-3 min-h-[220px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, x: -20 }}
                    transition={{ duration: reduce ? 0 : 0.22, ease: "easeOut" }}
                  >
                    <h2 id="onboarding-title" className="font-display text-2xl font-bold leading-tight text-cocoa sm:text-3xl">
                      {current.title}
                    </h2>
                    <div className="mt-3 text-[15px] leading-relaxed">{current.body}</div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-line px-6 py-4 sm:px-8">
              <div className="flex gap-1.5" aria-hidden="true">
                {STEPS.map((_, i) => (
                  <span
                    key={i}
                    className={`h-2 rounded-full transition-all duration-200 ${i === step ? "w-6 bg-yolk" : "w-2 bg-line"}`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                {step > 0 && (
                  <button
                    type="button"
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    className="min-h-[44px] rounded-full px-4 text-sm font-bold text-cocoa-soft transition-colors hover:text-cocoa"
                  >
                    Back
                  </button>
                )}
                {step < last ? (
                  <button
                    type="button"
                    onClick={() => setStep((s) => Math.min(last, s + 1))}
                    className="min-h-[44px] rounded-full bg-crust px-6 text-sm font-bold text-paper transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-cocoa"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onClose}
                    className="min-h-[44px] rounded-full bg-crust px-6 text-sm font-bold text-paper transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-cocoa"
                  >
                    Start exploring
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
