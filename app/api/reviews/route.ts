import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SCORE_FIELDS = [
  "crust_score",
  "custard_score",
  "sweetness_score",
  "value_score",
  "freshness_score",
] as const;

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

// Service role client, server-only: needed to upload guest photos to storage.
function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function POST(req: NextRequest) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Send the review as form data." }, { status: 400 });
  }

  const shopId = String(form.get("shop_id") ?? "");
  const name = String(form.get("reviewer_display_name") ?? "").trim();
  if (!/^[0-9a-f-]{36}$/i.test(shopId)) {
    return NextResponse.json({ error: "That shop id does not look right." }, { status: 400 });
  }
  if (name.length < 1 || name.length > 60) {
    return NextResponse.json({ error: "Add a display name, 60 characters max." }, { status: 400 });
  }

  const scores: Record<string, number> = {};
  for (const f of SCORE_FIELDS) {
    const n = Number(form.get(f));
    if (!Number.isInteger(n) || n < 1 || n > 5) {
      return NextResponse.json({ error: "Every score must be a whole number from 1 to 5." }, { status: 400 });
    }
    scores[f] = n;
  }

  const comment = form.get("comment") ? String(form.get("comment")).slice(0, 2000) : null;

  const db = supabaseAdmin();

  const { data: shop, error: shopErr } = await db
    .from("shops")
    .select("id")
    .eq("id", shopId)
    .maybeSingle();
  if (shopErr) {
    return NextResponse.json({ error: "Database hiccup. Try again shortly." }, { status: 502 });
  }
  if (!shop) {
    return NextResponse.json({ error: "That shop is not on the map." }, { status: 404 });
  }

  let photoUrl: string | null = null;
  const photo = form.get("photo");
  if (photo instanceof File && photo.size > 0) {
    if (!PHOTO_TYPES.has(photo.type)) {
      return NextResponse.json({ error: "Photos must be JPEG, PNG, or WebP." }, { status: 400 });
    }
    if (photo.size > MAX_PHOTO_BYTES) {
      return NextResponse.json({ error: "Photos must be under 5 MB." }, { status: 400 });
    }
    const ext = photo.type === "image/png" ? "png" : photo.type === "image/webp" ? "webp" : "jpg";
    const path = `${shopId}/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await db.storage
      .from("review-photos")
      .upload(path, photo, { contentType: photo.type });
    if (upErr) {
      return NextResponse.json({ error: "Photo upload failed. Submit without it or retry." }, { status: 502 });
    }
    photoUrl = db.storage.from("review-photos").getPublicUrl(path).data.publicUrl;
  }

  const { error: insErr } = await db.from("reviews").insert({
    shop_id: shopId,
    reviewer_display_name: name,
    ...scores,
    comment,
    photo_url: photoUrl,
  });
  if (insErr) {
    return NextResponse.json({ error: "Could not save the review. Try again." }, { status: 502 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
