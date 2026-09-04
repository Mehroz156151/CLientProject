"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Badge from "./Badge";

const READER_ID = "qr-reader-viewport";

function extractToken(rawValue: string): string | null {
  try {
    const url = new URL(rawValue);
    const parts = url.pathname.split("/").filter(Boolean);
    const idx = parts.indexOf("verify");
    if (idx !== -1 && parts[idx + 1]) return parts[idx + 1];
  } catch {
    // not a URL — fall through and treat rawValue as a raw token
  }
  return rawValue.trim() || null;
}

export default function QrScanner({ type }: { type: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "scanning" | "error">(
    "loading"
  );
  const [errorMessage, setErrorMessage] = useState("");
  const scannerRef = useRef<import("html5-qrcode").Html5Qrcode | null>(null);
  const stoppedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      const { Html5Qrcode } = await import("html5-qrcode");
      if (cancelled) return;

      const instance = new Html5Qrcode(READER_ID, { verbose: false });
      scannerRef.current = instance;

      try {
        await instance.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          async (decodedText) => {
            if (stoppedRef.current) return;
            stoppedRef.current = true;
            const token = extractToken(decodedText);
            try {
              await instance.stop();
            } catch {
              // scanner already stopping
            }
            router.push(`/verify/${token ?? "not-found"}?type=${type}`);
          },
          () => {
            // per-frame decode miss — expected while aiming, ignore
          }
        );
        if (!cancelled) setStatus("scanning");
      } catch {
        if (!cancelled) {
          setStatus("error");
          setErrorMessage(
            "Impossible d'accéder à la caméra. Vérifiez les autorisations de votre navigateur."
          );
        }
      }
    }

    start();

    return () => {
      cancelled = true;
      const instance = scannerRef.current;
      if (!instance) return;

      instance
        .stop()
        .catch(() => {})
        .finally(() => {
          // By the time this runs, React may have already unmounted the
          // container (route change) and removed the <video> element
          // html5-qrcode inserted itself — only ask it to clean up if
          // that container is still actually attached to the page.
          if (!document.getElementById(READER_ID)) return;
          try {
            instance.clear();
          } catch {
            // node already detached by React's own unmount — safe to ignore
          }
        });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  return (
    <div className="relative mx-auto w-full max-w-md flex-1 overflow-hidden bg-navy-dark">
      <div id={READER_ID} className="h-full w-full" />

      {status === "scanning" && (
        <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-navy-dark/95 to-transparent px-4 pb-6 pt-4">
          <p className="text-sm font-semibold text-white/80">
            Placer le QR code
          </p>
          <Badge size={28} />
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="hud-corner h-60 w-60 overflow-hidden rounded-lg">
          {status === "scanning" && (
            <div className="h-1 w-full bg-blue-light/80 shadow-[0_0_12px_2px_rgba(47,90,168,0.8)] animate-scan-sweep" />
          )}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-dark/95 to-transparent px-6 pb-8 pt-16 text-center">
        {status === "loading" && (
          <p className="text-sm font-semibold text-white/80">
            Activation de la caméra…
          </p>
        )}
        {status === "scanning" && (
          <p className="text-sm font-semibold text-white/80">
            Placez le QR code de la carte dans le cadre
          </p>
        )}
        {status === "error" && (
          <p className="text-sm font-semibold text-red">{errorMessage}</p>
        )}
      </div>
    </div>
  );
}
