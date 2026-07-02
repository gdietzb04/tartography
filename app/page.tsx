import DirectoryExplorer from "@/components/DirectoryExplorer";
import OnboardingLauncher from "@/components/OnboardingLauncher";
import AuthButton from "@/components/AuthButton";
import { getShopsWithRatings } from "@/lib/queries";

export const revalidate = 300;

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-line bg-paper/70 px-3.5 py-1.5 shadow-card sm:items-start">
      <dd className="font-display text-lg font-bold leading-none text-cocoa">{value}</dd>
      <dt className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-cocoa-soft/70">{label}</dt>
    </div>
  );
}

export default async function Home() {
  let shops: Awaited<ReturnType<typeof getShopsWithRatings>> = [];
  let loadError = false;
  try {
    shops = await getShopsWithRatings();
  } catch {
    loadError = true;
  }

  const boroughCount = new Set(shops.map((s) => s.borough)).size;
  const specialistCount = shops.filter((s) => s.is_dedicated_egg_tart_shop).length;

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6 sm:py-7">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <svg width="46" height="46" viewBox="0 0 100 100" aria-hidden="true" className="shrink-0">
            <ellipse cx="50" cy="58" rx="38" ry="20" fill="#E8C97E" stroke="#7A4A21" strokeWidth="4" />
            <ellipse cx="50" cy="54" rx="28" ry="13" fill="#F0B429" stroke="#B5651D" strokeWidth="3" />
            <path d="M14 52 Q20 40 28 48 Q34 38 42 46 Q50 36 58 46 Q66 38 72 48 Q80 40 86 52" fill="none" stroke="#7A4A21" strokeWidth="4" strokeLinecap="round" />
          </svg>
          <div>
            <h1 className="font-display text-[26px] font-extrabold leading-none tracking-tight text-cocoa sm:text-4xl">
              Tartography
            </h1>
            <p className="mt-1 text-sm text-cocoa-soft">Every mapped egg tart in New York.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!loadError && shops.length > 0 && (
            <dl className="hidden gap-2 sm:flex">
              <Stat label="Shops" value={shops.length} />
              <Stat label="Boroughs" value={boroughCount} />
              <Stat label="Specialists" value={specialistCount} />
            </dl>
          )}
          <OnboardingLauncher />
          <AuthButton />
        </div>
      </header>

      {loadError ? (
        <div className="rounded-card border border-line bg-paper p-8 text-center shadow-card">
          <p className="font-display text-xl text-cocoa">The oven timer went off early.</p>
          <p className="mt-2 text-cocoa-soft">We could not reach the shop database. Refresh in a minute.</p>
        </div>
      ) : shops.length === 0 ? (
        <div className="rounded-card border border-line bg-paper p-8 text-center shadow-card">
          <p className="font-display text-xl text-cocoa">The map is still proofing.</p>
          <p className="mt-2 text-cocoa-soft">No shops loaded yet. Run the seed script, then refresh.</p>
        </div>
      ) : (
        <DirectoryExplorer shops={shops} />
      )}
    </main>
  );
}
