import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

const MAX_SIZE = 4 * 1024 * 1024; // 4MB

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Aucun fichier reçu." },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Format non supporté (JPEG, PNG ou WebP uniquement).",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Image trop volumineuse (4 Mo max)." },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();

    const ext =
      file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
          ? "webp"
          : "jpg";

    // Guest upload — no login required.
    const path = `guests/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await admin.storage
      .from("avatars")
      .upload(path, await file.arrayBuffer(), {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("AVATAR UPLOAD ERROR:", uploadError);

      return NextResponse.json(
        { error: "Échec de l'envoi de l'image." },
        { status: 500 }
      );
    }

    const { data } = admin.storage
      .from("avatars")
      .getPublicUrl(path);

    return NextResponse.json(
      { url: data.publicUrl },
      { status: 200 }
    );
  } catch (error) {
    console.error("AVATAR UPLOAD UNEXPECTED ERROR:", error);

    return NextResponse.json(
      { error: "Échec de l'envoi de l'image." },
      { status: 500 }
    );
  }
}