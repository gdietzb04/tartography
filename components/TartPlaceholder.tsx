const VARIANTS = [
  { bg: "bg-custard/50", shell: "#E8C97E", shellStroke: "#7A4A21", custard: "#F0B429", custardStroke: "#B5651D" },
  { bg: "bg-[#EAD9C2]", shell: "#DCB877", shellStroke: "#6B4A2A", custard: "#E8A23A", custardStroke: "#A2571E" },
  { bg: "bg-[#E3D6BE]", shell: "#D9BE84", shellStroke: "#5C4326", custard: "#EFB94D", custardStroke: "#95591C" },
  { bg: "bg-[#EFDFC4]", shell: "#E2C68A", shellStroke: "#7A4A21", custard: "#F2C15A", custardStroke: "#B5651D" },
];

function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h;
}

/** Illustrated egg tart used when a shop has no photos yet. A seed (e.g. shop id) picks
 * one of a few warm tints so a grid of placeholders doesn't read as one broken image repeated. */
export default function TartPlaceholder({ className, seed = "" }: { className?: string; seed?: string }) {
  const v = VARIANTS[hashSeed(seed) % VARIANTS.length];
  const rotate = ((hashSeed(seed + "r") % 7) - 3) * 0.6;
  return (
    <div className={`flex items-center justify-center ${v.bg} ${className ?? ""}`}>
      <svg
        width="64"
        height="64"
        viewBox="0 0 100 100"
        aria-hidden="true"
        style={{ transform: `rotate(${rotate}deg)` }}
      >
        <ellipse cx="50" cy="58" rx="38" ry="20" fill={v.shell} stroke={v.shellStroke} strokeWidth="3" />
        <ellipse cx="50" cy="54" rx="28" ry="13" fill={v.custard} stroke={v.custardStroke} strokeWidth="2" />
        <path
          d="M14 52 Q20 40 28 48 Q34 38 42 46 Q50 36 58 46 Q66 38 72 48 Q80 40 86 52"
          fill="none"
          stroke={v.shellStroke}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <ellipse cx="42" cy="50" rx="7" ry="3" fill={v.shell} opacity="0.8" />
      </svg>
    </div>
  );
}
