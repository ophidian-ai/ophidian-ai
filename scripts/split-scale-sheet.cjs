/**
 * Split the scale-sheet.png into 8 individual particle images.
 * Crops each cell from the 4x2 grid and removes white background.
 *
 * Usage: node scripts/split-scale-sheet.cjs
 * Requires: canvas npm package (dev dependency)
 */

const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

const INPUT = path.join(__dirname, "../public/particles/scale-sheet.png");
const OUTPUT_DIR = path.join(__dirname, "../public/particles");

const COLS = 4;
const ROWS = 2;

async function main() {
  const img = await loadImage(INPUT);
  const cellW = Math.floor(img.width / COLS);
  const cellH = Math.floor(img.height / ROWS);

  console.log(`Sheet: ${img.width}x${img.height}, cells: ${cellW}x${cellH}`);

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const index = row * COLS + col + 1;
      const canvas = createCanvas(cellW, cellH);
      const ctx = canvas.getContext("2d");

      // Draw the cell
      ctx.drawImage(img, col * cellW, row * cellH, cellW, cellH, 0, 0, cellW, cellH);

      // Remove white/light background (make transparent)
      const imageData = ctx.getImageData(0, 0, cellW, cellH);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // If pixel is white-ish or very light gray, make transparent
        if (r > 200 && g > 200 && b > 200) {
          data[i + 3] = 0; // fully transparent
        }
        // Soft edge: light gray gets partial transparency
        else if (r > 160 && g > 160 && b > 160) {
          const lightness = (r + g + b) / 3;
          const alpha = Math.round(255 * (1 - (lightness - 160) / 95));
          data[i + 3] = Math.min(data[i + 3], alpha);
        }
      }

      ctx.putImageData(imageData, 0, 0);

      const outputFile = path.join(OUTPUT_DIR, `scale-${index}.png`);
      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(outputFile, buffer);
      console.log(`Saved: scale-${index}.png (${(buffer.length / 1024).toFixed(0)} KB)`);
    }
  }

  console.log("\nDone! 8 scale particles saved to public/particles/");
}

main().catch(console.error);
