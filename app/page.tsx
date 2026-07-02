import DirectoryExplorer from "@/components/DirectoryExplorer";
import { getShopsWithRatings } from "@/lib/queries";

export const revalidate = 300;

export default async function Home() {
  let shops: Awaited<ReturnType<typeof getShopsWithRatings>> = [];
  let loadError = false;
  try {
    shops = await getShopsWithRatings();
  } catch {
    loadError = true;
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <header className="mb-6">
        <div className="flex items-center gap-3">
          <svg width="44" height="44" viewBox="0 0 100 100" aria-hidden="true">
            <ellipse cx="50" cy="58" rx="38" ry="20" fill="#E8C97E" stroke="#7A4A21" strokeWidth="4" />
            <ellipse cx="50" cy="54" rx="28" ry="13" fill="#F0B429" stroke="#B5651D" strokeWidth="3" />
            <path d="M14 52 Q20 40 28 48 Q34 38 42 46 Q50 36 58 46 Q66 38 72 48 Q80 40 86 52" fill="none" stroke="#7A4A21" strokeWidth="4" strokeLinecap="round" />
          </svg>
          <div>
            <h1 className="font-display text-3xl font-bold text-cocoa">Tartography</h1>
            <p className="text-sm text-cocoa-soft">Every egg tart in New York, mapped.</p>
          </div>
        </div>
        <p className="mt-4 max-w-2xl text-cocoa">
          Flaky Hong Kong shells in Flushing. Shortcrust classics on Mott Street. Portuguese-leaning
          brûléed tops in Sunset Park. Pick a style, pick a borough, go eat.
        </p>
      </header>

      {loadError ? (
        <div className="rounded-card border border-line bg-paper p-8 text-center shadow-card">
          <p className="font-display text-xl text-cocoa">The oven timer went off early.</p>
          <p className="mt-2 text-cocoa-soft">
            We could not reach the shop database. Refresh in a minute.
          </p>
        </div>
      ) : shops.length === 0 ? (
        <div className="rounded-card border border-line bg-paper p-8 text-center shadow-card">
          <p className="font-display text-xl text-cocoa">The map is still proofing.</p>
          <p className="mt-2 text-cocoa-soft">
            No shops loaded yet. Run the seed script, then refresh.
          </p>
        </div>
      ) : (
        <DirectoryExplorer shops={shops} />
      )}
    </main>
  );
}
