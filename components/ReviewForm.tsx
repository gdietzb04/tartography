"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const RUBRIC: { key: string; label: string; hint: string }[] = [
  { key: "crust_score", label: "Crust and pastry texture", hint: "Flaky layers or crisp shortcrust, no sog" },
  { key: "custard_score", label: "Custard quality", hint: "Silky, wobbly, tastes of egg" },
  { key: "sweetness_score", label: "Sweetness balance", hint: "Sweet enough to be dessert, not candy" },
  { key: "value_score", label: "Value for price", hint: "Worth what you paid" },
  { key: "freshness_score", label: "Freshness", hint: "Warm from the oven beats an afternoon straggler" },
];

export default function ReviewForm({ shopId }: { shopId: string }) {
  const router = useRouter();
  const [scores, setScores] = useState<Record<string, number>>({});
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const complete = name.trim().length > 0 && RUBRIC.every((r) => scores[r.key]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!complete || status === "sending") return;
    setStatus("sending");
    setErrorMsg("");
    const fd = new FormData();
    fd.set("shop_id", shopId);
    fd.set("reviewer_display_name", name.trim());
    for (const r of RUBRIC) fd.set(r.key, String(scores[r.key]));
    if (comment.trim()) fd.set("comment", comment.trim());
    if (photo) fd.set("photo", photo);
    const res = await fetch("/api/reviews", { method: "POST", body: fd });
    if (res.ok) {
      setStatus("done");
      router.refresh();
    } else {
      const body = await res.json().catch(() => null);
      setErrorMsg(body?.error ?? "Something broke on our side. Try again in a minute.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="mt-4 rounded-card border border-line bg-paper p-6 text-center shadow-card">
        <p className="font-display text-xl text-cocoa">Review saved.</p>
        <p className="mt-1 text-sm text-cocoa-soft">Your scores now count toward this shop&apos;s rating.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-4 rounded-card border border-line bg-paper p-6 shadow-card">
      <label className="block">
        <span className="text-sm font-bold text-cocoa">Your name</span>
        <input
          type="text"
          value={name}
          maxLength={60}
          onChange={(e) => setName(e.target.value)}
          placeholder="What should we call you?"
          className="mt-1 min-h-[44px] w-full rounded-lg border border-line bg-cream/50 px-4 text-sm text-cocoa focus:border-yolk focus:outline-none"
          required
        />
      </label>

      <fieldset className="mt-5">
        <legend className="text-sm font-bold text-cocoa">Score the tart, 1 to 5</legend>
        <div className="mt-2 space-y-4">
          {RUBRIC.map((r) => (
            <div key={r.key}>
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-cocoa">{r.label}</span>
                <span className="text-xs text-cocoa-soft">{r.hint}</span>
              </div>
              <div className="mt-1 flex gap-2" role="radiogroup" aria-label={r.label}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={scores[r.key] === n}
                    onClick={() => setScores({ ...scores, [r.key]: n })}
                    className={`min-h-[44px] min-w-[44px] rounded-lg border text-sm font-bold transition-colors duration-150 ease-out ${
                      scores[r.key] === n
                        ? "border-yolk bg-yolk text-paper"
                        : "border-line bg-cream/50 text-cocoa-soft hover:border-yolk"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </fieldset>

      <label className="mt-5 block">
        <span className="text-sm font-bold text-cocoa">Notes, optional</span>
        <textarea
          value={comment}
          maxLength={2000}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="Which tart did you get? Warm or cold? Would you go back?"
          className="mt-1 w-full rounded-lg border border-line bg-cream/50 px-4 py-3 text-sm text-cocoa focus:border-yolk focus:outline-none"
        />
      </label>

      <label className="mt-4 block">
        <span className="text-sm font-bold text-cocoa">Photo, optional</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
          className="mt-1 block min-h-[44px] w-full text-sm text-cocoa-soft file:mr-3 file:min-h-[44px] file:cursor-pointer file:rounded-full file:border-0 file:bg-custard/60 file:px-4 file:font-bold file:text-crust"
        />
      </label>

      {status === "error" && (
        <p className="mt-4 text-sm font-bold text-berry" role="alert">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={!complete || status === "sending"}
        className="mt-6 min-h-[44px] w-full rounded-full bg-crust px-6 font-bold text-paper transition-[transform,background-color] duration-150 ease-out enabled:hover:-translate-y-0.5 enabled:hover:bg-cocoa disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {status === "sending" ? "Saving your scores…" : "Submit review"}
      </button>
      {!complete && (
        <p className="mt-2 text-xs text-cocoa-soft">Add your name and all five scores to submit.</p>
      )}
    </form>
  );
}
