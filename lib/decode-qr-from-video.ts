import { BrowserMultiFormatReader } from "@zxing/library";
import jsQR from "jsqr";

// ─── ZXing (continuous scan, more robust) ────────────────────────────────────
let zxingReader: BrowserMultiFormatReader | null = null;

function getZxingReader(): BrowserMultiFormatReader {
  if (!zxingReader) zxingReader = new BrowserMultiFormatReader(undefined, 100);
  return zxingReader;
}

/**
 * Start continuous QR decoding from video. Uses ZXing for robust detection.
 */
export function startVideoQrScan(
  video: HTMLVideoElement,
  onResult: (text: string) => void,
  onError?: (err: unknown) => void,
  getDisplayCanvas?: () => HTMLCanvasElement | null
): () => void {
  const r = getZxingReader();
  let stopped = false;

  function drawToCanvas() {
    if (stopped) return;
    const canvas = getDisplayCanvas?.();
    if (canvas && video.readyState >= 2 && video.videoWidth > 0) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
      }
    }
  }

  function tick() {
    if (stopped) return;
    drawToCanvas();
    requestAnimationFrame(tick);
  }

  r.decodeFromVideoElementContinuously(video, (result, err) => {
    if (stopped) return;
    if (err && err.name !== "NotFoundException") onError?.(err);
    if (result) {
      const text = result.getText();
      if (text) onResult(text);
    }
  }).catch((err) => {
    if (!stopped) onError?.(err);
  });

  video.addEventListener("loadedmetadata", () => requestAnimationFrame(tick));
  if (video.readyState >= 2) requestAnimationFrame(tick);

  return () => {
    stopped = true;
    r.reset();
  };
}

// ─── jsQR (tap-to-scan, synchronous single-frame) ────────────────────────────
const MIN_SIZE = 150;
const MAX_SIZE = 1200;

function tryJsQR(imageData: ImageData): string | null {
  const r = jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: "attemptBoth",
  });
  return r?.data ?? null;
}

/**
 * Decode QR from current video frame (tap-to-scan). Uses jsQR for sync single-frame decode.
 */
export function decodeSingleFrame(
  video: HTMLVideoElement,
  displayCanvas?: HTMLCanvasElement | null
): string | null {
  if (video.readyState < 2 || video.videoWidth <= 0) return null;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const vw = video.videoWidth;
  const vh = video.videoHeight;

  // Try display canvas first
  if (displayCanvas && displayCanvas.width > 0 && displayCanvas.height > 0) {
    const dw = displayCanvas.width;
    const dh = displayCanvas.height;
    for (const s of [1, 0.75, 0.5]) {
      const sw = Math.max(MIN_SIZE, Math.floor(dw * s));
      const sh = Math.max(MIN_SIZE, Math.floor(dh * s));
      canvas.width = sw;
      canvas.height = sh;
      ctx.drawImage(displayCanvas, 0, 0, dw, dh, 0, 0, sw, sh);
      const text = tryJsQR(ctx.getImageData(0, 0, sw, sh));
      if (text) return text;
    }
  }

  // Fallback: decode from video
  const longest = Math.max(vw, vh);
  for (const target of [Math.min(longest, MAX_SIZE), 600, 400]) {
    const scale = Math.min(1, target / longest);
    const sw = Math.max(MIN_SIZE, Math.floor(vw * scale));
    const sh = Math.max(MIN_SIZE, Math.floor(vh * scale));
    canvas.width = sw;
    canvas.height = sh;
    ctx.drawImage(video, 0, 0, vw, vh, 0, 0, sw, sh);
    const text = tryJsQR(ctx.getImageData(0, 0, sw, sh));
    if (text) return text;
  }

  return null;
}
