/**
 * Generate the end frame (awakened/exploded serpent) via Gemini API.
 * Uses the start frame as a reference image for visual consistency.
 *
 * Usage: node scripts/generate-serpent-end.cjs
 * Output: scripts/output/serpent-end.png
 */

const fs = require("fs");
const path = require("path");
const https = require("https");

// Load GEMINI_API_KEY from .env.local
const envFile = fs.readFileSync(path.join(__dirname, "../.env.local"), "utf8");
const keyMatch = envFile.match(/GEMINI_API_KEY="?([^"\n]+)"?/);
const API_KEY = process.env.GEMINI_API_KEY || (keyMatch && keyMatch[1]);
if (!API_KEY) { console.error("GEMINI_API_KEY not set in .env.local"); process.exit(1); }
const MODEL = "nano-banana-pro-preview";
const OUTPUT_DIR = path.join(__dirname, "output");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "serpent-end.png");
const RAW_RESPONSE = path.join(OUTPUT_DIR, "response-end.json");
const START_FRAME = path.join(OUTPUT_DIR, "serpent-start.png");

// Read start frame as base64 reference
const startImageData = fs.readFileSync(START_FRAME).toString("base64");
console.log(`Reference image loaded: ${(Buffer.byteLength(startImageData, 'base64') / 1024 / 1024).toFixed(2)} MB`);

const prompt = `Using the attached reference image as the starting point, create the end state of this subject's transformation.

The subject has scales cracked and lifted away from the body, sections of the serpent split apart revealing the interior.
The interior reveals glowing venom-green (#39FF14) circuits, pulsing neural pathways, streams of data flowing through translucent conduits, all glowing with #39FF14 light.
The environment has faint green-lit particles floating around the deconstructed form, wisps of luminous fog, illuminated by the internal glow.
Background remains pure black #000000 -- completely solid, no gradients, no floor reflection.
Same studio lighting setup as the reference, but now the #39FF14 internal glow is the dominant light source.
8K resolution, cinematic, photorealistic. Aspect ratio: 16:9.`;

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const requestBody = JSON.stringify({
  contents: [
    {
      parts: [
        {
          inlineData: {
            mimeType: "image/png",
            data: startImageData,
          },
        },
        { text: prompt },
      ],
    },
  ],
  generationConfig: {
    responseModalities: ["TEXT", "IMAGE"],
  },
});

const options = {
  hostname: "generativelanguage.googleapis.com",
  path: `/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(requestBody),
  },
};

console.log(`Calling Gemini API (${MODEL}) for end frame...`);

const req = https.request(options, (res) => {
  const writeStream = fs.createWriteStream(RAW_RESPONSE);
  res.pipe(writeStream);

  writeStream.on("finish", () => {
    console.log("Response received, parsing...");

    const data = fs.readFileSync(RAW_RESPONSE, "utf8");

    try {
      const response = JSON.parse(data);

      if (response.error) {
        console.error("API Error:", JSON.stringify(response.error, null, 2));
        process.exit(1);
      }

      const candidates = response.candidates || [];
      let imageFound = false;

      for (const candidate of candidates) {
        const parts = candidate.content?.parts || [];
        for (const part of parts) {
          if (part.inlineData) {
            const imageData = Buffer.from(part.inlineData.data, "base64");
            fs.writeFileSync(OUTPUT_FILE, imageData);
            console.log(`End frame saved to: ${OUTPUT_FILE}`);
            console.log(`File size: ${(imageData.length / 1024 / 1024).toFixed(2)} MB`);
            imageFound = true;
          }
          if (part.text) {
            console.log("Model text:", part.text.substring(0, 200));
          }
        }
      }

      if (!imageFound) {
        const summary = JSON.stringify(response, (key, val) => {
          if (key === "data" && typeof val === "string" && val.length > 100) {
            return `[base64 data: ${val.length} chars]`;
          }
          return val;
        }, 2);
        console.error("No image found. Response structure:");
        console.error(summary.substring(0, 2000));
        process.exit(1);
      }

      fs.unlinkSync(RAW_RESPONSE);
      console.log("Done!");
    } catch (e) {
      console.error("Parse error:", e.message);
      console.error("Response saved to:", RAW_RESPONSE);
      process.exit(1);
    }
  });
});

req.on("error", (e) => {
  console.error("Request failed:", e.message);
  process.exit(1);
});

req.write(requestBody);
req.end();
