"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BrowserQRCodeReader,
  type IScannerControls,
} from "@zxing/browser";
import {
  BarcodeFormat,
  DecodeHintType,
} from "@zxing/library";

type ScannerStatus = "loading" | "scanning" | "error";

function extractToken(rawValue: string): string | null {
  const value = rawValue.trim();

  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    const parts = url.pathname.split("/").filter(Boolean);
    const verifyIndex = parts.indexOf("verify");

    if (verifyIndex !== -1 && parts[verifyIndex + 1]) {
      return decodeURIComponent(parts[verifyIndex + 1]);
    }
  } catch {
    // QR code does not contain a URL.
  }

  return value;
}

export default function QrScanner({
  type,
}: {
  type: string;
}) {
  const router = useRouter();

  const [status, setStatus] =
    useState<ScannerStatus>("loading");

  const [errorMessage, setErrorMessage] =
    useState("");

  const videoRef =
    useRef<HTMLVideoElement | null>(null);

  const readerRef =
    useRef<BrowserQRCodeReader | null>(null);

  const controlsRef =
    useRef<IScannerControls | null>(null);

  const streamRef =
    useRef<MediaStream | null>(null);

  const mountedRef =
    useRef(false);

  const processingRef =
    useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    processingRef.current = false;

    let cancelled = false;

    const stopCamera = () => {
      const controls = controlsRef.current;
      controlsRef.current = null;

      if (controls) {
        try {
          controls.stop();
        } catch {
          // Ignore cleanup errors.
        }
      }

      const stream = streamRef.current;
      streamRef.current = null;

      if (stream) {
        for (const track of stream.getTracks()) {
          try {
            track.stop();
          } catch {
            // Ignore already stopped tracks.
          }
        }
      }

      const video = videoRef.current;

      if (video) {
        try {
          video.pause();
        } catch {
          // Ignore pause errors.
        }

        video.srcObject = null;
      }

      readerRef.current = null;
    };

    const handleResult = (result: any) => {
      if (
        !result ||
        cancelled ||
        !mountedRef.current ||
        processingRef.current
      ) {
        return;
      }

      const text = result.getText();

      const token = extractToken(text);

      if (!token) {
        return;
      }

      processingRef.current = true;

      stopCamera();

      router.push(
        `/verify/${encodeURIComponent(
          token
        )}?type=${encodeURIComponent(type)}`
      );
    };

    const startScanner = async () => {
      try {
        setStatus("loading");
        setErrorMessage("");

        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error(
            "Votre navigateur ne prend pas en charge l'accès à la caméra."
          );
        }

        const video = videoRef.current;

        if (!video) {
          throw new Error(
            "La vidéo du scanner est introuvable."
          );
        }

        /*
         * Open the camera only once.
         */
        let stream: MediaStream;

        try {
          stream =
            await navigator.mediaDevices.getUserMedia({
              video: {
                width: {
                  ideal: 1920,
                },
                height: {
                  ideal: 1080,
                },
                frameRate: {
                  ideal: 30,
                  max: 30,
                },
                facingMode: {
                  ideal: "environment",
                },
              },
              audio: false,
            });
        } catch {
          throw new Error(
            "Impossible d'accéder à la caméra. Vérifiez l'autorisation de la caméra dans votre navigateur."
          );
        }

        if (
          cancelled ||
          !mountedRef.current
        ) {
          for (const track of stream.getTracks()) {
            track.stop();
          }

          return;
        }

        streamRef.current = stream;

        /*
         * Give the stream directly to the React-owned
         * video element.
         */
        video.srcObject = stream;
        video.muted = true;
        video.playsInline = true;
        video.autoplay = true;

        video.setAttribute(
          "playsinline",
          "true"
        );

        video.setAttribute(
          "webkit-playsinline",
          "true"
        );

        try {
          await video.play();
        } catch {
          // Browser may already have started autoplay.
        }

        if (
          cancelled ||
          !mountedRef.current
        ) {
          stopCamera();
          return;
        }

        /*
         * ZXing QR-only configuration.
         */
        const hints = new Map();

        hints.set(
          DecodeHintType.POSSIBLE_FORMATS,
          [BarcodeFormat.QR_CODE]
        );

        hints.set(
          DecodeHintType.TRY_HARDER,
          true
        );

        const reader =
          new BrowserQRCodeReader(hints, {
            delayBetweenScanAttempts: 100,
            delayBetweenScanSuccess: 1000,
          });

        readerRef.current = reader;

        /*
         * Decode directly from the video element.
         */
        const controls =
          await reader.decodeFromVideoElement(
            video,
            handleResult
          );

        if (
          cancelled ||
          !mountedRef.current
        ) {
          try {
            controls.stop();
          } catch {
            // Ignore cleanup errors.
          }

          stopCamera();
          return;
        }

        controlsRef.current = controls;

        setStatus("scanning");
      } catch (error) {
        stopCamera();

        if (
          cancelled ||
          !mountedRef.current
        ) {
          return;
        }

        setStatus("error");

        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage(
            "Impossible d'accéder à la caméra."
          );
        }
      }
    };

    void startScanner();

    return () => {
      cancelled = true;
      mountedRef.current = false;
      processingRef.current = true;

      stopCamera();
    };
  }, [router, type]);

  return (
    <div className="relative mx-auto h-[70vh] min-h-[500px] w-full max-w-md overflow-hidden bg-black">
      {/* Camera */}
      <div className="relative z-0 h-full w-full overflow-hidden bg-black">
        <video
          ref={videoRef}
          className="block h-full w-full object-cover"
          autoPlay
          muted
          playsInline
        />
      </div>

      {/* Top bar */}
      {status === "scanning" && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between bg-gradient-to-b from-navy-dark/95 to-transparent px-4 pb-6 pt-4">
          <p className="text-sm font-semibold text-white/80">
            Placer le QR code
          </p>

          {/* Scanner logo */}
          <div className="flex h-12 w-12 items-center justify-center rounded-lg p-1 shadow-md">
            <Image
              src="/images/scan.png"
              alt="QR Scanner"
              width={60}
              height={60}
              className="h-full w-full object-contain"
              priority
            />
          </div>
        </div>
      )}

      {/* Scanner frame */}
      <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
        <div className="relative h-[280px] w-[280px] overflow-hidden rounded-lg">
          {/* Inner border */}
          <div className="absolute inset-0 rounded-lg border border-white/20" />

          {/* Top left */}
          <div className="absolute left-0 top-0 h-9 w-9 border-l-4 border-t-4 border-blue-light" />

          {/* Top right */}
          <div className="absolute right-0 top-0 h-9 w-9 border-r-4 border-t-4 border-blue-light" />

          {/* Bottom left */}
          <div className="absolute bottom-0 left-0 h-9 w-9 border-b-4 border-l-4 border-blue-light" />

          {/* Bottom right */}
          <div className="absolute bottom-0 right-0 h-9 w-9 border-b-4 border-r-4 border-blue-light" />

          {/* Animated scan line */}
          {status === "scanning" && (
            <div
              className="absolute left-1 right-1 top-0 h-1"
              style={{
                background:
                  "rgba(96, 165, 250, 0.95)",
                boxShadow:
                  "0 0 12px 3px rgba(47, 90, 168, 0.85)",
                animation:
                  "qrScannerLine 2s ease-in-out infinite",
                willChange: "transform",
              }}
            />
          )}
        </div>
      </div>

      {/* Loading status */}
      {status === "loading" && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-navy-dark/95 to-transparent px-6 pb-8 pt-16 text-center">
          <p className="text-sm font-semibold text-white/80">
            Activation de la caméra…
          </p>
        </div>
      )}

      {/* Scanning status */}
      {status === "scanning" && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-navy-dark/95 to-transparent px-6 pb-8 pt-16 text-center">
          <p className="text-sm font-semibold text-white/80">
            Placez le QR code de la carte VTC dans le cadre
          </p>
        </div>
      )}

      {/* Error status */}
      {status === "error" && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-navy-dark/95 to-transparent px-6 pb-8 pt-16 text-center">
          <p className="break-words text-sm font-semibold text-red">
            {errorMessage}
          </p>
        </div>
      )}

      <style jsx>{`
        @keyframes qrScannerLine {
          0% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(276px);
          }

          100% {
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}