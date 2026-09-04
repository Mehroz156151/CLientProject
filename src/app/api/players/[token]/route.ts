import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const verificationType = req.nextUrl.searchParams.get("type") ?? "vtc";

  if (token === "not-found") {
    return NextResponse.json({ player: null });
  }

  const supabase = getSupabaseAdmin();
  const { data: player } = await supabase
    .from("players")
    .select("*")
    .eq("qr_token", token)
    .maybeSingle();

  if (player) {
    const authClient = await createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    await supabase.from("verification_logs").insert({
      player_id: player.id,
      status: player.status,
      verification_type: verificationType,
      checked_by: user?.id ?? null,
    });
  }

  return NextResponse.json({ player: player ?? null });
}
