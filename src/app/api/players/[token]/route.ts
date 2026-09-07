import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const verificationType =
    req.nextUrl.searchParams.get("type") ?? "vtc";

  // Only logged-in users can access verification data.
  const authClient = await createClient();

  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { player: null },
      { status: 401 }
    );
  }

  if (token === "not-found") {
    return NextResponse.json({ player: null });
  }

  const supabase = getSupabaseAdmin();

  const { data: player, error } = await supabase
    .from("players")
    .select("*")
    .eq("qr_token", token)
    .maybeSingle();

  if (error) {
    console.error("PLAYER VERIFICATION ERROR:", error);

    return NextResponse.json(
      { player: null },
      { status: 500 }
    );
  }

  if (player) {
    await supabase.from("verification_logs").insert({
      player_id: player.id,
      status: player.status,
      verification_type: verificationType,
      checked_by: user.id,
    });
  }

  return NextResponse.json({
    player: player ?? null,
  });
}