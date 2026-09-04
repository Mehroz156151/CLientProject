import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/server";
import type { ActivityType, PlayerStatus } from "@/lib/types";

const ACTIVITIES: ActivityType[] = ["TAXI", "VTC", "TRANSPORT", "AUTRE"];
const STATUSES: PlayerStatus[] = ["valid", "suspended", "revoked"];

export async function PATCH(req: NextRequest) {
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non connecté." }, { status: 401 });
  }

  const body = await req.json();
  const id = String(body.id ?? "");
  if (!id) {
    return NextResponse.json({ error: "Profil manquant." }, { status: 400 });
  }

  const admin = getSupabaseAdmin();

  const { data: existing } = await admin
    .from("players")
    .select("user_id")
    .eq("id", id)
    .maybeSingle();

  if (!existing || existing.user_id !== user.id) {
    return NextResponse.json(
      { error: "Vous ne pouvez modifier que vos propres profils." },
      { status: 403 }
    );
  }

  const fullName = String(body.full_name ?? "").trim();
  if (!fullName) {
    return NextResponse.json(
      { error: "Le nom complet est requis." },
      { status: 400 }
    );
  }

  const update = {
    full_name: fullName,
    date_of_birth: body.date_of_birth || null,
    activity: ACTIVITIES.includes(body.activity) ? body.activity : "VTC",
    agency: body.agency || null,
    avatar_url: body.avatar_url || null,
    vehicle_plate: body.vehicle_plate || null,
    vehicle_model: body.vehicle_model || null,
    status: STATUSES.includes(body.status) ? body.status : "valid",
  };

  const { error } = await admin.from("players").update(update).eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: "Impossible de mettre à jour le profil." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
