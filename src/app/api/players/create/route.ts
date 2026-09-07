import { NextRequest, NextResponse } from "next/server";

import { getSupabaseAdmin } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/server";
import { generateCardNumber, generateQrToken } from "@/lib/token";
import type { ActivityType } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    // Login is optional.
    const authClient = await createClient();

    const {
      data: { user },
    } = await authClient.auth.getUser();

    const body = await req.json();

    const fullName = String(body.full_name ?? "").trim();

    if (!fullName) {
      return NextResponse.json(
        { error: "Le nom complet est requis." },
        { status: 400 }
      );
    }

    const allowedActivities: ActivityType[] = [
      "TAXI",
      "VTC",
      "TRANSPORT",
      "AUTRE",
    ];

    const activity: ActivityType = allowedActivities.includes(body.activity)
      ? body.activity
      : "VTC";

    const isDateString = (value: unknown): value is string =>
      typeof value === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(value);

    const issuedDate = new Date();
    const expiresDate = new Date(issuedDate);

    expiresDate.setFullYear(expiresDate.getFullYear() + 5);

    const cardNumber =
      String(body.card_number ?? "").trim() ||
      generateCardNumber();

    const issuedAt = isDateString(body.issued_at)
      ? body.issued_at
      : issuedDate.toISOString().slice(0, 10);

    const expiresAt = isDateString(body.expires_at)
      ? body.expires_at
      : expiresDate.toISOString().slice(0, 10);

    const record = {
      // Guest = null, logged-in user = their ID
      user_id: user?.id ?? null,

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

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("players")
      .insert(record)
      .select("id")
      .single();

    if (error || !data) {
      console.error("PLAYER CREATE ERROR:", error);

      return NextResponse.json(
        {
          error: "Impossible de créer le profil. Réessayez.",
          details: error?.message,
        },
        { status: 500 }
      );
    }

    console.log("PLAYER CREATED:", {
      id: data.id,
      user_id: user?.id ?? null,
    });

    return NextResponse.json(
      { id: data.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("PLAYER CREATE UNEXPECTED ERROR:", error);

    return NextResponse.json(
      {
        error:
          "Une erreur est survenue lors de la création du profil.",
      },
      { status: 500 }
    );
  }
}