/**
 * Generate placeholder frames for scroll-scrub hero development.
 * Creates 60 simple dark frames with a green circle that progressively
 * "cracks" and fragments -- simulating the dormant-to-awakening animation.
 *
 * These are throwaway dev assets. They get replaced by real AI-generated
 * frames from the exploding-scroll-hero skill pipeline.
 *
 * Usage: npx tsx scripts/generate-placeholder-frames.ts
 */

import { createCanvas } from "canvas";
import { mkdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const WIDTH = 1920;
const HEIGHT = 1080;
const TOTAL_FRAMES = 60;
const OUT_DIR = join(__dirname, "../public/frames/serpent");

// Brand colors
const BG_COLOR = "#0A0A0A";
const GLOW_COLOR = "#39FF14";

mkdirSync(OUT_DIR, { recursive: true });

for (let i = 1; i <= TOTAL_FRAMES; i++) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");
  const progress = (i - 1) / (TOTAL_FRAMES - 1); // 0 to 1

  // Dark background
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const cx = WIDTH / 2;
  const cy = HEIGHT / 2;
  const baseRadius = 150;

  if (progress < 0.25) {
    // Phase 1: Dormant -- solid green circle
    ctx.beginPath();
    ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
    ctx.fillStyle = GLOW_COLOR;
    ctx.globalAlpha = 0.8;
    ctx.fill();
    ctx.globalAlpha = 1;
  } else if (progress < 0.65) {
    // Phase 2: Cracks appearing -- circle with radiating lines
    const crackProgress = (progress - 0.25) / 0.4; // 0 to 1 within phase

    // Base circle (dimming)
    ctx.beginPath();
    ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
    ctx.fillStyle = GLOW_COLOR;
    ctx.globalAlpha = 0.8 - crackProgress * 0.4;
    ctx.fill();
    ctx.globalAlpha = 1;

    // Crack lines radiating outward
    const numCracks = Math.floor(crackProgress * 12) + 3;
    ctx.strokeStyle = GLOW_COLOR;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.9;
    for (let c = 0; c < numCracks; c++) {
      const angle = (c / numCracks) * Math.PI * 2 + 0.3;
      const len = baseRadius * (0.5 + crackProgress * 0.8);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * len, cy + Math.sin(angle) * len);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  } else {
    // Phase 3: Fragmentation -- pieces flying outward, particles
    const fragProgress = (progress - 0.65) / 0.35; // 0 to 1 within phase

    // Scattered fragments
    const numFragments = 8;
    for (let f = 0; f < numFragments; f++) {
      const angle = (f / numFragments) * Math.PI * 2 + 0.5;
      const dist = baseRadius * (0.3 + fragProgress * 2.5);
      const size = 20 + Math.random() * 30;
      const fx = cx + Math.cos(angle) * dist;
      const fy = cy + Math.sin(angle) * dist;

      ctx.save();
      ctx.translate(fx, fy);
      ctx.rotate(angle + fragProgress * 2);
      ctx.fillStyle = GLOW_COLOR;
      ctx.globalAlpha = 0.7 - fragProgress * 0.4;
      ctx.fillRect(-size / 2, -size / 2, size, size * 0.6);
      ctx.restore();
    }

    // Particles
    const numParticles = Math.floor(fragProgress * 30) + 5;
    for (let p = 0; p < numParticles; p++) {
      const px = cx + (Math.random() - 0.5) * WIDTH * 0.6;
      const py = cy + (Math.random() - 0.5) * HEIGHT * 0.6;
      const pr = 1 + Math.random() * 3;
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fillStyle = GLOW_COLOR;
      ctx.globalAlpha = 0.3 + Math.random() * 0.4;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // Frame number label (dev only)
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.font = "14px monospace";
  ctx.fillText(`frame ${i}/${TOTAL_FRAMES} | progress: ${(progress * 100).toFixed(0)}%`, 20, HEIGHT - 20);

  // Save as PNG (we'll note this outputs PNG -- the hook will need .webp in prod
  // but for dev placeholders PNG is fine since we're testing the scroll mechanism)
  const pad = String(i).padStart(4, "0");
  const buffer = canvas.toBuffer("image/png");
  writeFileSync(join(OUT_DIR, `frame-${pad}.webp`), buffer);
  // Note: these are actually PNG bytes saved with .webp extension for dev compatibility.
  // The browser will render them fine. Real assets will be actual WebP.

  if (i % 10 === 0) {
    console.log(`Generated frame ${i}/${TOTAL_FRAMES}`);
  }
}

console.log(`Done! ${TOTAL_FRAMES} frames saved to ${OUT_DIR}`);
