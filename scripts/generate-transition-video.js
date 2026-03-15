/**
 * Generate transition video via Veo 3.1 API (image-to-video with first/last frame).
 * Uses the start and end serpent frames as interpolation anchors.
 *
 * Usage: node scripts/generate-transition-video.js
 *
 * Requires: GEMINI_API_KEY environment variable or hardcoded key below.
 * Cost: ~$0.35/sec of video (~$2-3 for a 5-8 sec clip)
 */

import { GoogleGenAI } from "@google/genai";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load GEMINI_API_KEY from .env.local
const envFile = readFileSync(join(__dirname, "../.env.local"), "utf8");
const keyMatch = envFile.match(/GEMINI_API_KEY="?([^"\n]+)"?/);
const API_KEY = process.env.GEMINI_API_KEY || (keyMatch && keyMatch[1]);
if (!API_KEY) { console.error("GEMINI_API_KEY not set in .env.local"); process.exit(1); }

const ai = new GoogleGenAI({ apiKey: API_KEY });

const OUTPUT_DIR = join(__dirname, "output");
const START_FRAME = join(OUTPUT_DIR, "serpent-start.png");
const END_FRAME = join(OUTPUT_DIR, "serpent-end.png");

const PROMPT = `Create a smooth cinematic transition of a biomechanical serpent awakening.

The serpent starts coiled and dormant with organic reptilian scales that have subtle metallic undertones and hints of circuitry at scale seams. Studio lighting from above-left on a near-black background.

The transition should show:
- Cracks of bright green (#39FF14) light slowly appearing through the scales
- Sections of the exterior beginning to lift and separate
- Internal glow intensifying as more of the digital interior is revealed
- Glowing green circuits, pulsing neural pathways, and data streams becoming visible
- Atmospheric particles beginning to drift and catch the green light
- Wisps of luminous green fog forming around the deconstructed form

The transformation should feel like an awakening, not an explosion -- controlled, inevitable, alive.
The organic and digital are becoming something greater together.

Duration: 8 seconds
Style: Cinematic, smooth, professional studio quality. Dark background throughout.`;

async function main() {
  console.log("Loading reference frames...");

  // Read start frame
  const startImageBytes = readFileSync(START_FRAME);
  const startImage = {
    imageBytes: startImageBytes.toString("base64"),
    mimeType: "image/png",
  };

  // Read end frame
  const endImageBytes = readFileSync(END_FRAME);
  const endImage = {
    imageBytes: endImageBytes.toString("base64"),
    mimeType: "image/png",
  };

  console.log("Submitting video generation request to Veo 3.1...");
  console.log("This will take a few minutes. Polling every 10 seconds.\n");

  let operation = await ai.models.generateVideos({
    model: "veo-3.1-generate-preview",
    prompt: PROMPT,
    image: startImage,
    config: {
      lastFrame: endImage,
    },
  });

  // Poll until completion
  let pollCount = 0;
  while (!operation.done) {
    pollCount++;
    const elapsed = pollCount * 10;
    process.stdout.write(`\r  Generating... ${elapsed}s elapsed`);
    await new Promise((resolve) => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({
      operation: operation,
    });
  }

  console.log("\n\nVideo generation complete!");

  if (!operation.response?.generatedVideos?.length) {
    console.error("No videos were generated. Response:", JSON.stringify(operation.response, null, 2));
    process.exit(1);
  }

  // Download the video
  const outputPath = join(OUTPUT_DIR, "transition.mp4");
  console.log(`Downloading to ${outputPath}...`);

  await ai.files.download({
    file: operation.response.generatedVideos[0].video,
    downloadPath: outputPath,
  });

  console.log("Done! Transition video saved to scripts/output/transition.mp4");
  console.log("\nNext step: Run frame extraction with:");
  console.log("  node scripts/extract-frames.js");
}

main().catch((err) => {
  console.error("Error:", err.message || err);
  if (err.message?.includes("PERMISSION_DENIED")) {
    console.error("\nMake sure billing is enabled on your Google Cloud project.");
  }
  if (err.message?.includes("quota")) {
    console.error("\nYou may have hit a quota limit. Check your Google AI Studio dashboard.");
  }
  process.exit(1);
});
