/**
 * Generate serpent-skin scale fragment particles via Gemini API.
 * Uses the serpent start frame as visual reference to create matching
 * floating particle textures with transparent backgrounds.
 *
 * Usage: node scripts/generate-scale-particles.cjs
 * Output: public/particles/scale-1.png through scale-8.png
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
const OUTPUT_DIR = path.join(__dirname, "../public/particles");
const RAW_RESPONSE = path.join(__dirname, "output", "response-particles.json");
const START_FRAME = path.join(__dirname, "../public/frames/serpent/frame-0001.webp");
const END_FRAME = path.join(__dirname, "../public/frames/serpent/frame-0120.webp");

const prompt = `I've attached two reference images of a biomechanical serpent:
1. The first image shows the serpent in its dormant state -- dark organic scales with metallic undertones
2. The second image shows the serpent in its awakened state -- scales cracked apart with glowing venom-green (#39FF14) circuitry and energy visible through the cracks

Using BOTH images as visual reference for texture, material, and the green glow effect:

Generate a single image containing 8 individual small fragments/flakes of this serpent's skin, arranged in a 4x2 grid with generous spacing between each piece. The fragments should be a MIX of both states:

- 4 fragments showing the dark dormant scales (from image 1) -- organic reptilian texture with brushed metal edges, broken/torn edges showing hints of green circuitry underneath
- 4 fragments showing the awakened scales (from image 2) -- scales that are actively cracking with bright venom-green (#39FF14) energy glowing through the fractures, circuits visible and pulsing

ALL fragments should be:
- Isolated on a completely transparent/black background (PNG)
- Torn/broken pieces that look like they shed off the serpent during its transformation
- Varied in shape: some elongated shards, some curved scale plates, some small irregular chips
- Varied in size
- Lit from above-left matching the reference images

The overall image should be 1024x512 pixels. Pure black background. Just the 8 floating fragments arranged in a clean grid.`;

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.mkdirSync(path.join(__dirname, "output"), { recursive: true });

// Read reference images (start = dormant scales, end = glowing awakened scales)
const parts = [];

if (fs.existsSync(START_FRAME)) {
  const startData = fs.readFileSync(START_FRAME).toString("base64");
  parts.push({
    inlineData: { mimeType: "image/webp", data: startData },
  });
  console.log("Start frame loaded:", START_FRAME);
} else {
  console.log("Warning: Start frame not found");
}

if (fs.existsSync(END_FRAME)) {
  const endData = fs.readFileSync(END_FRAME).toString("base64");
  parts.push({
    inlineData: { mimeType: "image/webp", data: endData },
  });
  console.log("End frame loaded:", END_FRAME);
} else {
  console.log("Warning: End frame not found");
}

parts.push({ text: prompt });

const requestBody = JSON.stringify({
  contents: [{ parts }],
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

console.log(`Calling Gemini API (${MODEL}) for scale particles...`);
console.log(`Request size: ${(Buffer.byteLength(requestBody) / 1024 / 1024).toFixed(2)} MB`);

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
      let imageCount = 0;

      for (const candidate of candidates) {
        const cParts = candidate.content?.parts || [];
        for (const part of cParts) {
          if (part.inlineData) {
            imageCount++;
            const outputFile = path.join(OUTPUT_DIR, `scale-sheet.png`);
            const imageData = Buffer.from(part.inlineData.data, "base64");
            fs.writeFileSync(outputFile, imageData);
            console.log(`Scale sheet saved to: ${outputFile}`);
            console.log(`File size: ${(imageData.length / 1024).toFixed(0)} KB`);
          }
          if (part.text) {
            console.log("Model text:", part.text.substring(0, 200));
          }
        }
      }

      if (imageCount === 0) {
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
      console.log("\nDone! Now run the split script to cut the sheet into individual particles.");
      console.log("Or manually crop in an image editor if the grid isn't clean.");
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
