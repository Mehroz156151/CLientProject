import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const cardNumber = req.nextUrl.searchParams.get("card_number")?.trim();

  if (!cardNumber) {
    return NextResponse.json({ token: null }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("players")
    .select("qr_token")
    .eq("card_number", cardNumber)
    .maybeSingle();

  return NextResponse.json({ token: data?.qr_token ?? null });
}
