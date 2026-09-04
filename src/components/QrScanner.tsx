"use client";

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
import Badge from "./Badge";

const READER_ID = "qr-reader-viewport";

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
    // QR is not a URL.
  }

  return value;
}

async function findCamera(): Promise<string | null> {
  if (!navigator.mediaDevices?.enumerateDevices) {
    return null;
  }

  const devices =
    await navigator.mediaDevices.enumerateDevices();

  const cameras = devices.filter(
    (device) => device.kind === "videoinput"
  );

  if (cameras.length === 0) {
    return null;
  }

  /*
   * Prefer a rear/environment camera when the browser
   * exposes one. On Windows desktop, there may only be
   * an integrated or USB camera, so fall back to it.
   */
  const preferred = cameras.find((camera) => {
    const label = camera.label.toLowerCase();

    return (
      label.includes("back") ||
      label.includes("rear") ||
      label.includes("environment")
    );
  });

  return (preferred ?? cameras[0]).deviceId;
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

  const readerRef =
    useRef<BrowserQRCodeReader | null>(null);

  const controlsRef =
    useRef<IScannerControls | null>(null);

  const videoRef =
    useRef<HTMLVideoElement | null>(null);

  const mountedRef =
    useRef(false);

  const processingRef =
    useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    processingRef.current = false;

    let cancelled = false;

    async function cleanup() {
      const controls = controlsRef.current;
      controlsRef.current = null;

      if (controls) {
        try {
          controls.stop();
        } catch {
          // Ignore cleanup errors.
        }
      }

      const video = videoRef.current;
      videoRef.current = null;

      if (video) {
        const stream = video.srcObject;

        if (stream instanceof MediaStream) {
          for (const track of stream.getTracks()) {
            try {
              track.stop();
            } catch {
              // Ignore already stopped tracks.
            }
          }
        }

        video.srcObject = null;

        /*
         * Only remove the exact video element that we created.
         * Never clear the entire scanner container.
         */
        if (video.parentNode) {
          try {
            video.parentNode.removeChild(video);
          } catch {
            // Ignore DOM teardown races.
          }
        }
      }

      readerRef.current = null;
    }

    async function startScanner() {
      try {
        setStatus("loading");
        setErrorMessage("");

        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error(
            "Votre navigateur ne prend pas en charge l'accès à la caméra."
          );
        }

        const container =
          document.getElementById(READER_ID);

        if (!container) {
          throw new Error(
            "Le conteneur du scanner QR est introuvable."
          );
        }

        /*
         * First request permission.
         *
         * This is important because many browsers don't
         * expose useful camera labels until permission has
         * been granted.
         */
        let permissionStream: MediaStream;

        try {
          permissionStream =
            await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: false,
            });
        } catch {
          throw new Error(
            "Impossible d'accéder à la caméra. Vérifiez l'autorisation de la caméra dans votre navigateur."
          );
        }

        for (const track of permissionStream.getTracks()) {
          track.stop();
        }

        if (cancelled || !mountedRef.current) {
          return;
        }

        const cameraId = await findCamera();

        if (cancelled || !mountedRef.current) {
          return;
        }

        /*
         * Configure ZXing specifically for QR codes.
         */
        const hints = new Map();

        hints.set(DecodeHintType.POSSIBLE_FORMATS, [
          BarcodeFormat.QR_CODE,
        ]);

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
         * Create exactly one video element.
         */
        const video =
          document.createElement("video");

        video.className =
          "block h-full w-full object-cover";

        video.autoplay = true;
        video.muted = true;
        video.playsInline = true;

        video.setAttribute(
          "playsinline",
          "true"
        );

        video.setAttribute(
          "muted",
          "true"
        );

        videoRef.current = video;

        container.appendChild(video);

        if (cancelled || !mountedRef.current) {
          await cleanup();
          return;
        }

        let controls: IScannerControls;

        /*
         * If we found an actual camera device, use it
         * explicitly. This is more reliable on Windows
         * than relying only on facingMode.
         */
        if (cameraId) {
          controls =
            await reader.decodeFromVideoDevice(
              cameraId,
              video,
              (result) => {
                if (
                  !result ||
                  cancelled ||
                  !mountedRef.current ||
                  processingRef.current
                ) {
                  return;
                }

                const text =
                  result.getText();

                const token =
                  extractToken(text);

                if (!token) {
                  return;
                }

                processingRef.current = true;

                void cleanup().finally(() => {
                  if (
                    !cancelled &&
                    mountedRef.current
                  ) {
                    router.push(
                      `/verify/${encodeURIComponent(
                        token
                      )}?type=${encodeURIComponent(
                        type
                      )}`
                    );
                  }
                });
              }
            );
        } else {
          /*
           * Fallback when the browser doesn't expose
           * a camera device ID.
           */
          controls =
            await reader.decodeFromConstraints(
              {
                video: {
                  facingMode: {
                    ideal: "environment",
                  },
                  width: {
                    ideal: 1280,
                  },
                  height: {
                    ideal: 720,
                  },
                  frameRate: {
                    ideal: 30,
                    max: 30,
                  },
                },
                audio: false,
              },
              video,
              (result) => {
                if (
                  !result ||
                  cancelled ||
                  !mountedRef.current ||
                  processingRef.current
                ) {
                  return;
                }

                const text =
                  result.getText();

                const token =
                  extractToken(text);

                if (!token) {
                  return;
                }

                processingRef.current = true;

                void cleanup().finally(() => {
                  if (
                    !cancelled &&
                    mountedRef.current
                  ) {
                    router.push(
                      `/verify/${encodeURIComponent(
                        token
                      )}?type=${encodeURIComponent(
                        type
                      )}`
                    );
                  }
                });
              }
            );
        }

        if (
          cancelled ||
          !mountedRef.current
        ) {
          try {
            controls.stop();
          } catch {
            // Ignore cleanup errors.
          }

          await cleanup();
          return;
        }

        controlsRef.current = controls;

        setStatus("scanning");
      } catch (error) {
        await cleanup();

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
    }

    void startScanner();

    return () => {
      cancelled = true;
      mountedRef.current = false;
      processingRef.current = true;

      void cleanup();
    };
  }, [router, type]);

  return (
    <div className="relative mx-auto h-[70vh] min-h-[500px] w-full max-w-md overflow-hidden bg-black">
      {/* Camera */}
      <div
        id={READER_ID}
        className="relative z-0 h-full w-full overflow-hidden bg-black"
      />

      {/* Top bar */}
      {status === "scanning" && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between bg-gradient-to-b from-navy-dark/95 to-transparent px-4 pb-6 pt-4">
          <p className="text-sm font-semibold text-white/80">
            Placer le QR code
          </p>

          <Badge size={28} />
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

      {/* Bottom status */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-navy-dark/95 to-transparent px-6 pb-8 pt-16 text-center">
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
          <p className="break-words text-sm font-semibold text-red">
            {errorMessage}
          </p>
        )}
      </div>

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