/**
 * Generate the start frame (dormant serpent) via Gemini API.
 * Streams the response to disk to handle large image payloads.
 *
 * Usage: node scripts/generate-serpent-start.cjs
 * Output: scripts/output/serpent-start.png
 */

const fs = require("fs");
const path = require("path");
const https = require("https");

const API_KEY = "AIzaSyDfHqBT3f-l_UNiRPaH-GWR85DDB-1Ihec";
const MODEL = "nano-banana-pro-preview";
const OUTPUT_DIR = path.join(__dirname, "output");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "serpent-start.png");
const RAW_RESPONSE = path.join(OUTPUT_DIR, "response-start.json");

const prompt = `Create a photorealistic, 8K resolution image of a biomechanical serpent with organic scales and subtle metallic undertones in a coiled and dormant, tightly wound, head resting on its body position.
The subject should have photorealistic organic reptilian scales transitioning to brushed dark metal at the edges, hints of circuitry visible at scale seams.
The background must be pure black #000000 -- completely solid, no gradients, no environment, no floor reflection, no ambient light spill. The serpent floats in absolute darkness.
Studio lighting from above-left, creating dramatic shadows.
The mood is still, latent power, potential energy, dormant intelligence.
The image should feel cinematic, professional, and high-end.
Aspect ratio: 16:9.`;

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const requestBody = JSON.stringify({
  contents: [{ parts: [{ text: prompt }] }],
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

console.log(`Calling Gemini API (${MODEL}) for start frame...`);

const req = https.request(options, (res) => {
  // Stream response to file to avoid OOM
  const writeStream = fs.createWriteStream(RAW_RESPONSE);
  res.pipe(writeStream);

  writeStream.on("finish", () => {
    console.log("Response received, parsing...");

    // Read and parse in chunks to handle large base64 data
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
            console.log(`Start frame saved to: ${OUTPUT_FILE}`);
            console.log(`File size: ${(imageData.length / 1024 / 1024).toFixed(2)} MB`);
            imageFound = true;
          }
          if (part.text) {
            console.log("Model text:", part.text.substring(0, 200));
          }
        }
      }

      if (!imageFound) {
        // Print just the structure, not the full base64
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

      // Clean up raw response
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
