import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/server";
import { generateCardNumber, generateQrToken } from "@/lib/token";
import type { ActivityType } from "@/lib/types";

export async function POST(req: NextRequest) {
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Vous devez être connecté pour créer un profil." },
      { status: 401 }
    );
  }

  const body = await req.json();

  const fullName = String(body.full_name ?? "").trim();
  if (!fullName) {
    return NextResponse.json(
      { error: "Le nom complet est requis." },
      { status: 400 }
    );
  }

  const activity: ActivityType = ["TAXI", "VTC", "TRANSPORT", "AUTRE"].includes(
    body.activity
  )
    ? body.activity
    : "VTC";

  const supabase = getSupabaseAdmin();

  const isDateString = (v: unknown): v is string =>
    typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);

  const defaultIssuedAt = new Date();
  const defaultExpiresAt = new Date(defaultIssuedAt);
  defaultExpiresAt.setFullYear(defaultExpiresAt.getFullYear() + 5);

  const cardNumber = String(body.card_number ?? "").trim() || generateCardNumber();
  const issuedAt = isDateString(body.issued_at)
    ? body.issued_at
    : defaultIssuedAt.toISOString().slice(0, 10);
  const expiresAt = isDateString(body.expires_at)
    ? body.expires_at
    : defaultExpiresAt.toISOString().slice(0, 10);

  const record = {
    user_id: user.id,
    qr_token: generateQrToken(),
    card_number: cardNumber,
    full_name: fullName,
    date_of_birth: body.date_of_birth || null,
    activity,
    agency: body.agency || null,
    avatar_url: body.avatar_url || null,
    vehicle_plate: body.vehicle_plate || null,
    vehicle_model: body.vehicle_model || null,
    issued_at: issuedAt,
    expires_at: expiresAt,
    status: "valid" as const,
  };

  const { data, error } = await supabase
    .from("players")
    .insert(record)
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Impossible de créer le profil. Réessayez." },
      { status: 500 }
    );
  }

  return NextResponse.json({ id: data.id });
}
