/** Illustrated egg tart used when a shop has no photos yet. */
export default function TartPlaceholder({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center bg-custard/40 ${className ?? ""}`}>
      <svg width="72" height="72" viewBox="0 0 100 100" aria-hidden="true">
        <ellipse cx="50" cy="58" rx="38" ry="20" fill="#E8C97E" stroke="#7A4A21" strokeWidth="3" />
        <ellipse cx="50" cy="54" rx="28" ry="13" fill="#F0B429" stroke="#B5651D" strokeWidth="2" />
        <path
          d="M14 52 Q20 40 28 48 Q34 38 42 46 Q50 36 58 46 Q66 38 72 48 Q80 40 86 52"
          fill="none"
          stroke="#7A4A21"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <ellipse cx="42" cy="50" rx="7" ry="3" fill="#F5D78E" opacity="0.8" />
      </svg>
    </div>
  );
}
