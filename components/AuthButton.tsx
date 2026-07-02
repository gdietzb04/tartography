"use client";

import { useAuth } from "./AuthProvider";

function GoogleGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true" className="shrink-0">
      <path fill="#4285F4" d="M45.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h11.8c-.5 2.7-2 5-4.4 6.6v5.5h7.1c4.2-3.8 6.6-9.5 6.6-16.1z" />
      <path fill="#34A853" d="M24 46c5.9 0 10.9-2 14.5-5.4l-7.1-5.5c-2 1.3-4.5 2.1-7.4 2.1-5.7 0-10.5-3.8-12.2-9H4.5v5.7C8.1 41.1 15.4 46 24 46z" />
      <path fill="#FBBC05" d="M11.8 28.2c-.4-1.3-.7-2.7-.7-4.2s.3-2.9.7-4.2v-5.7H4.5C3 17.1 2.1 20.4 2.1 24s.9 6.9 2.4 9.9l7.3-5.7z" />
      <path fill="#EA4335" d="M24 10.8c3.2 0 6.1 1.1 8.4 3.3l6.3-6.3C34.9 4.2 29.9 2 24 2 15.4 2 8.1 6.9 4.5 14.1l7.3 5.7c1.7-5.2 6.5-9 12.2-9z" />
    </svg>
  );
}

export default function AuthButton() {
  const { user, ready, signInWithGoogle, signOut } = useAuth();

  if (!ready) {
    return <div className="h-10 w-24 animate-pulse rounded-full bg-line/60" aria-hidden="true" />;
  }

  if (!user) {
    return (
      <button
        type="button"
        onClick={signInWithGoogle}
        className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-line bg-paper px-3.5 text-sm font-bold text-cocoa shadow-card transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-cream"
      >
        <GoogleGlyph />
        <span className="hidden sm:inline">Sign in</span>
        <span className="sm:hidden">Sign in</span>
      </button>
    );
  }

  const meta = user.user_metadata ?? {};
  const name: string = meta.full_name || meta.name || user.email || "Signed in";
  const avatar: string | undefined = meta.avatar_url || meta.picture;

  return (
    <div className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-line bg-paper py-1 pl-1 pr-1.5 shadow-card">
      {avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatar} alt="" className="h-8 w-8 rounded-full object-cover" referrerPolicy="no-referrer" />
      ) : (
        <span className="grid h-8 w-8 place-items-center rounded-full bg-custard text-sm font-bold text-crust">
          {name.charAt(0).toUpperCase()}
        </span>
      )}
      <span className="hidden max-w-[9rem] truncate text-sm font-bold text-cocoa sm:inline">{name}</span>
      <button
        type="button"
        onClick={signOut}
        className="min-h-[32px] rounded-full px-2.5 text-xs font-bold text-cocoa-soft transition-colors hover:bg-cocoa/10 hover:text-cocoa"
      >
        Sign out
      </button>
    </div>
  );
}
