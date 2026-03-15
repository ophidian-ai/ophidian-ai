/**
 * Generate a looping particle background video via Gemini API.
 * Creates a short video of glowing serpent scale fragments drifting
 * on pure black background -- used as site-wide video background.
 *
 * Usage: node scripts/generate-particle-video.cjs
 * Output: scripts/output/particle-bg.mp4
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
const RAW_RESPONSE = path.join(OUTPUT_DIR, "response-particle-video.json");
const SCALE_SHEET = path.join(__dirname, "../public/particles/scale-sheet.png");

const prompt = `Using the attached image as visual reference for the scale/fragment textures:

Create a seamless looping video, 8 seconds long, showing:

- Pure black (#000000) background filling the entire frame
- 12-15 small biomechanical serpent scale fragments slowly drifting and floating through the frame
- Mix of dark metallic scales and scales with glowing venom-green (#39FF14) energy cracks
- Fragments should drift slowly in various directions -- some rising, some falling, some drifting sideways
- Very gentle rotation on each fragment as it drifts
- Fragments at different depths -- some slightly larger (closer), some smaller (further away), creating parallax depth
- Occasional subtle green light pulse/flicker on the glowing fragments
- Very sparse distribution -- mostly empty black space with fragments scattered throughout
- The motion should feel like weightless debris floating in zero gravity
- Cinematic quality, smooth motion, no jerky movements
- The start and end frames should match for seamless looping

Resolution: 1920x1080, 30fps
The overall feel should be atmospheric and ambient -- like shed serpent skin floating in a dark void.`;

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// Load reference image
const parts = [];
if (fs.existsSync(SCALE_SHEET)) {
  const sheetData = fs.readFileSync(SCALE_SHEET).toString("base64");
  parts.push({
    inlineData: { mimeType: "image/png", data: sheetData },
  });
  console.log("Scale sheet reference loaded");
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

console.log(`Calling Gemini API (${MODEL}) for particle background...`);
console.log("Note: This model generates images, not video.");
console.log("The output image can be used as a reference for Google Flow video generation.");
console.log("");

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
        const cParts = candidate.content?.parts || [];
        for (const part of cParts) {
          if (part.inlineData) {
            const outputFile = path.join(OUTPUT_DIR, "particle-bg-reference.png");
            const imageData = Buffer.from(part.inlineData.data, "base64");
            fs.writeFileSync(outputFile, imageData);
            console.log(`Reference frame saved to: ${outputFile}`);
            console.log(`File size: ${(imageData.length / 1024).toFixed(0)} KB`);
            imageFound = true;
          }
          if (part.text) {
            console.log("Model text:", part.text.substring(0, 300));
          }
        }
      }

      if (!imageFound) {
        console.error("No image generated.");
        process.exit(1);
      }

      fs.unlinkSync(RAW_RESPONSE);
      console.log("\n--- Next Steps ---");
      console.log("1. Open Google Flow: https://labs.google/fx/tools/flow");
      console.log("2. Use 'Image to Video' with particle-bg-reference.png");
      console.log("3. Prompt: 'Slow, weightless drift of glowing serpent scale fragments on pure black. Zero gravity feel. Seamless loop. 8 seconds.'");
      console.log("4. Save output as scripts/output/particle-bg.mp4");
    } catch (e) {
      console.error("Parse error:", e.message);
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
