// Canvas-based packing progress card generator (1200x630)
// Uses hardcoded hex colors matching tailwind.config.ts tokens

export interface PackingCardOptions {
  checkedItems: number;
  totalItems: number;
  departureDate?: string | null; // ISO date string e.g. "2026-03-15"
}

const COLORS = {
  ocean600: "#1d74e8",
  ocean800: "#1350b0",
  sand200: "#f4dba8",
  sand300: "#ecc471",
  coral500: "#f77f00",
  white: "#ffffff",
  whiteTranslucent: "rgba(255,255,255,0.15)",
  whiteOverlay: "rgba(255,255,255,0.25)",
  darkText: "#0e3d80",
  lightText: "rgba(255,255,255,0.8)",
} as const;

/**
 * Draw a decorative wave shape at the bottom of the card.
 */
function drawWaves(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  // Wave 1 - lighter
  ctx.fillStyle = COLORS.whiteTranslucent;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.75);
  ctx.bezierCurveTo(w * 0.25, h * 0.65, w * 0.5, h * 0.85, w, h * 0.72);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  // Wave 2 - slightly more opaque
  ctx.fillStyle = COLORS.whiteOverlay;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.82);
  ctx.bezierCurveTo(w * 0.3, h * 0.76, w * 0.65, h * 0.92, w, h * 0.8);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();
}

/**
 * Draw decorative sun circle in top-right area.
 */
function drawSun(ctx: CanvasRenderingContext2D, w: number): void {
  const sunX = w - 140;
  const sunY = 100;
  const sunRadius = 60;

  ctx.fillStyle = COLORS.sand300;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 0.25;
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunRadius + 25, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 1;
}

/**
 * Calculate countdown text from a departure date string.
 */
function getCountdownText(departureDate: string): string | null {
  const now = new Date();
  const departure = new Date(departureDate + "T00:00:00");
  const diffMs = departure.getTime() - now.getTime();

  if (diffMs < 0) {
    return null; // Past date, don't show
  }

  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (days === 0) {
    return "Hom nay la ngay di!";
  }
  return `Con ${days} ngay nua!`;
}

/**
 * Render the packing card onto a canvas 2D context.
 */
export function renderPackingCard(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: PackingCardOptions
): void {
  const { checkedItems, totalItems, departureDate } = options;
  const percent = totalItems === 0 ? 0 : Math.round((checkedItems / totalItems) * 100);

  // --- Background gradient ---
  const bgGradient = ctx.createLinearGradient(0, 0, width, height);
  bgGradient.addColorStop(0, COLORS.ocean600);
  bgGradient.addColorStop(1, COLORS.ocean800);
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // --- Decorative elements ---
  drawSun(ctx, width);
  drawWaves(ctx, width, height);

  // --- Title ---
  ctx.fillStyle = COLORS.white;
  ctx.font = "bold 52px Playfair Display, serif";
  ctx.textAlign = "left";
  ctx.fillText("Nha Trang Packing List", 80, 120);

  // --- Subtitle ---
  ctx.fillStyle = COLORS.lightText;
  ctx.font = "24px DM Sans, sans-serif";
  ctx.fillText("Bien · Vinwonders · Safari", 80, 165);

  // --- Progress percentage (large) ---
  ctx.fillStyle = COLORS.white;
  ctx.font = "bold 120px DM Sans, sans-serif";
  ctx.fillText(`${percent}%`, 80, 330);

  // --- Stats text ---
  ctx.fillStyle = COLORS.sand200;
  ctx.font = "28px DM Sans, sans-serif";
  ctx.fillText(`Da chuan bi ${checkedItems}/${totalItems} do vat`, 80, 380);

  // --- Progress bar background ---
  const barX = 80;
  const barY = 410;
  const barWidth = width - 160;
  const barHeight = 28;
  const barRadius = 14;

  ctx.fillStyle = COLORS.whiteTranslucent;
  ctx.beginPath();
  ctx.roundRect(barX, barY, barWidth, barHeight, barRadius);
  ctx.fill();

  // --- Progress bar fill ---
  if (percent > 0) {
    const fillWidth = Math.max(barHeight, (barWidth * percent) / 100); // minimum width = height for rounded appearance
    const barGradient = ctx.createLinearGradient(barX, 0, barX + fillWidth, 0);
    barGradient.addColorStop(0, COLORS.sand300);
    barGradient.addColorStop(1, COLORS.coral500);
    ctx.fillStyle = barGradient;
    ctx.beginPath();
    ctx.roundRect(barX, barY, fillWidth, barHeight, barRadius);
    ctx.fill();
  }

  // --- Countdown (if departure date set) ---
  const countdownText = departureDate ? getCountdownText(departureDate) : null;
  if (countdownText) {
    ctx.fillStyle = COLORS.sand300;
    ctx.font = "bold 32px DM Sans, sans-serif";
    ctx.fillText(countdownText, 80, 500);
  }

  // --- Footer branding ---
  ctx.fillStyle = COLORS.lightText;
  ctx.font = "20px DM Sans, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("beach-check-list", width - 80, height - 40);
  ctx.textAlign = "left";

  // --- All done badge ---
  if (percent === 100) {
    ctx.save();
    ctx.fillStyle = COLORS.sand300;
    ctx.font = "bold 36px DM Sans, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("San sang ra bien!", width - 80, 330);
    ctx.restore();
  }
}

/**
 * Download a canvas element as a PNG file.
 */
export function downloadCanvasAsPng(canvas: HTMLCanvasElement, filename: string): void {
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

/**
 * Copy canvas contents to clipboard as a PNG image.
 * Uses Promise-based blob for Safari compatibility.
 */
export async function copyCanvasToClipboard(canvas: HTMLCanvasElement): Promise<void> {
  // Safari requires the ClipboardItem to receive a Promise<Blob>
  if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
    const blobPromise = new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to create blob from canvas"));
        }
      }, "image/png");
    });

    const item = new ClipboardItem({ "image/png": blobPromise });
    await navigator.clipboard.write([item]);
  } else {
    throw new Error("Clipboard API not supported");
  }
}
