"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

// Deterministic PRNG so the three decoy tiles render identically on every
// visit/download — only their look matters, not their content.
function mulberry32(seed: number) {
  return function random() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const MODULE_PX = 6;
const MARGIN_MODULES = 1;
const GUTTER_WHITE_PX = 0;
const GUTTER_BLACK_PX = 12;
const BORDER_BLACK_PX = 12;
const DECOY_SEEDS = [11, 22, 33];

function drawTile(
  ctx: CanvasRenderingContext2D,
  offsetX: number,
  offsetY: number,
  moduleCount: number,
  isDark: (row: number, col: number) => boolean
) {
  const tileModules = moduleCount + MARGIN_MODULES * 2;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(offsetX, offsetY, tileModules * MODULE_PX, tileModules * MODULE_PX);
  ctx.fillStyle = "#000000";
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (isDark(row, col)) {
        ctx.fillRect(
          offsetX + (col + MARGIN_MODULES) * MODULE_PX,
          offsetY + (row + MARGIN_MODULES) * MODULE_PX,
          MODULE_PX,
          MODULE_PX
        );
      }
    }
  }
}

// Builds a 2x2 tile grid matching the client's reference: three decorative
// noise tiles that only look like a QR code, and one real, scannable QR
// code (bottom-right) that encodes verifyUrl, separated by black divider
// bars and framed by a black border. The black bars sit outside each
// tile's own quiet-zone margin, so they never touch the real QR's modules
// and can't interfere with scanning.
function buildDecoyGrid(verifyUrl: string): string {
  const qr = QRCode.create(verifyUrl, {
    errorCorrectionLevel: "H",
    version: 10,
  });
  const moduleCount = qr.modules.size;
  const tilePx = (moduleCount + MARGIN_MODULES * 2) * MODULE_PX;
  const gutterPx = GUTTER_WHITE_PX * 2 + GUTTER_BLACK_PX;
  const innerSize = tilePx * 2 + gutterPx;
  const totalSize = innerSize + BORDER_BLACK_PX * 2;

  const canvas = document.createElement("canvas");
  canvas.width = totalSize;
  canvas.height = totalSize;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // Black border frame, then the white field the tiles sit on.
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, totalSize, totalSize);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(BORDER_BLACK_PX, BORDER_BLACK_PX, innerSize, innerSize);

  const firstTileOffset = BORDER_BLACK_PX;
  const secondTileOffset = firstTileOffset + tilePx + gutterPx;

  const decoyPositions: Array<[number, number]> = [
    [firstTileOffset, firstTileOffset],
    [secondTileOffset, firstTileOffset],
    [firstTileOffset, secondTileOffset],
  ];
  decoyPositions.forEach(([x, y], i) => {
    const rng = mulberry32(DECOY_SEEDS[i]);
    drawTile(ctx, x, y, moduleCount, () => rng() < 0.52);
  });

  drawTile(ctx, secondTileOffset, secondTileOffset, moduleCount, (row, col) => qr.modules.get(row, col) === 1);

  // Black divider bars forming the cross between the four tiles.
  ctx.fillStyle = "#000000";
  const barStart = firstTileOffset + tilePx + GUTTER_WHITE_PX;
  ctx.fillRect(barStart, 0, GUTTER_BLACK_PX, totalSize);
  ctx.fillRect(0, barStart, totalSize, GUTTER_BLACK_PX);

  return canvas.toDataURL("image/png");
}

export default function ProfileQr({ verifyUrl }: { verifyUrl: string }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    // buildDecoyGrid touches `document`/canvas, so it can only run after
    // mount — the resulting one extra render is unavoidable here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDataUrl(buildDecoyGrid(verifyUrl));
  }, [verifyUrl]);

  return (
    <div className="flex flex-col items-center">
      {dataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={dataUrl}
          width={380}
          height={380}
          className="h-auto w-full max-w-[380px]"
          alt="QR code du profil"
        />
      ) : (
        <div className="aspect-square w-full max-w-[380px] animate-pulse rounded-lg bg-surface-muted" />
      )}
      {dataUrl && (
        <a
          href={dataUrl}
          download="carte-professionnelle-qr.png"
          className="mt-4 rounded-lg border border-border bg-surface px-4 py-2 text-xs font-semibold text-navy hover:bg-surface-muted"
        >
          Télécharger le QR code
        </a>
      )}
    </div>
  );
}
