/**
 * OphidianAI Site Asset Generator
 * Generates all AI-produced image assets via Nano Banana 2 (Gemini API).
 *
 * Usage:
 *   node scripts/generate-site-assets.cjs --all
 *   node scripts/generate-site-assets.cjs --portraits
 *   node scripts/generate-site-assets.cjs --textures
 *   node scripts/generate-site-assets.cjs --og
 *   node scripts/generate-site-assets.cjs --hero
 *
 * Outputs:
 *   public/portraits/        -- Photorealistic testimonial headshots
 *   public/textures/         -- Biomechanical section background textures
 *   public/og/               -- Open Graph images (1200x630)
 *   scripts/output/          -- Hero frame images (start + end, 1080p)
 *
 * Note: Hero VIDEO step (start -> end transition) requires Veo API
 * (separate paid step). This script generates the still frames only.
 */

"use strict";

const fs = require("fs");
const path = require("path");
const https = require("https");

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const envFile = fs.readFileSync(path.join(__dirname, "../.env.local"), "utf8");
const keyMatch = envFile.match(/GEMINI_API_KEY="?([^"\n]+)"?/);
const API_KEY = process.env.GEMINI_API_KEY || (keyMatch && keyMatch[1]);
if (!API_KEY) {
  console.error("GEMINI_API_KEY not set in .env.local");
  process.exit(1);
}

const MODEL = "nano-banana-pro-preview";
const BASE_URL = "generativelanguage.googleapis.com";
const SCRIPT_DIR = __dirname;
const PUBLIC_DIR = path.join(SCRIPT_DIR, "../public");
const OUTPUT_DIR = path.join(SCRIPT_DIR, "output");

// Parse CLI flags
const args = process.argv.slice(2);
const runAll = args.includes("--all");
const runPortraits = runAll || args.includes("--portraits");
const runTextures = runAll || args.includes("--textures");
const runOg = runAll || args.includes("--og");
const runHero = runAll || args.includes("--hero");

if (!runPortraits && !runTextures && !runOg && !runHero) {
  console.log("Usage: node generate-site-assets.cjs [--all | --portraits | --textures | --og | --hero]");
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function callGemini(prompt, referenceImages = []) {
  return new Promise((resolve, reject) => {
    const parts = [];

    for (const img of referenceImages) {
      if (fs.existsSync(img.path)) {
        const data = fs.readFileSync(img.path).toString("base64");
        parts.push({ inlineData: { mimeType: img.mimeType || "image/webp", data } });
      }
    }
    parts.push({ text: prompt });

    const requestBody = JSON.stringify({
      contents: [{ parts }],
      generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
    });

    const options = {
      hostname: BASE_URL,
      path: `/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(requestBody),
      },
    };

    const chunks = [];
    const req = https.request(options, (res) => {
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        try {
          const raw = Buffer.concat(chunks).toString("utf8");
          const response = JSON.parse(raw);
          if (response.error) {
            reject(new Error(`API error: ${JSON.stringify(response.error)}`));
            return;
          }
          const images = [];
          const texts = [];
          for (const candidate of response.candidates || []) {
            for (const part of candidate.content?.parts || []) {
              if (part.inlineData) images.push(Buffer.from(part.inlineData.data, "base64"));
              if (part.text) texts.push(part.text);
            }
          }
          resolve({ images, texts });
        } catch (e) {
          reject(new Error(`Parse error: ${e.message}`));
        }
      });
    });

    req.on("error", reject);
    req.write(requestBody);
    req.end();
  });
}

async function generateAndSave(label, prompt, outputPath, referenceImages = []) {
  console.log(`\n[${label}] Generating...`);
  const { images, texts } = await callGemini(prompt, referenceImages);
  if (texts.length) console.log(`  Model note: ${texts[0].substring(0, 120)}`);
  if (!images.length) throw new Error(`No image returned for ${label}`);
  fs.writeFileSync(outputPath, images[0]);
  const kb = (images[0].length / 1024).toFixed(0);
  console.log(`  Saved: ${outputPath} (${kb} KB)`);
  return outputPath;
}

// ---------------------------------------------------------------------------
// Portrait generation
// ---------------------------------------------------------------------------

const PORTRAIT_SUBJECTS = [
  {
    file: "portrait-1.png",
    name: "Sarah Mitchell",
    desc: "professional woman in her mid-30s, small business owner, warm and confident expression, light complexion, dark brown hair",
  },
  {
    file: "portrait-2.png",
    name: "James Rodriguez",
    desc: "professional man in his early 40s, operations manager, serious and capable expression, Hispanic, dark hair, slight stubble",
  },
  {
    file: "portrait-3.png",
    name: "Emily Chen",
    desc: "professional woman in her late 20s, marketing director, creative and energetic expression, East Asian, straight black hair",
  },
  {
    file: "portrait-4.png",
    name: "David Park",
    desc: "professional man in his mid-40s, CEO, authoritative and thoughtful expression, East Asian, well-groomed salt-and-pepper hair",
  },
  {
    file: "portrait-5.png",
    name: "Lisa Thompson",
    desc: "professional woman in her mid-30s, e-commerce manager, approachable and sharp expression, light complexion, auburn shoulder-length hair",
  },
];

function portraitPrompt(subject) {
  return `Generate a photorealistic professional headshot portrait of ${subject.name}: ${subject.desc}.

Style requirements:
- Professional business headshot, corporate photography style
- Neutral or very subtly dark/grey background (not pure black -- allow slight gradient for realism)
- Soft studio lighting, no harsh shadows
- The subject is dressed in smart professional attire (suit, blazer, or professional top)
- Natural, confident expression -- not overly posed
- Sharp focus on face, slight background blur (shallow depth of field)
- Square or slightly portrait crop (head and shoulders)
- Photorealistic, cinematic quality
- No text, no watermarks, no borders

Do NOT make the image look obviously AI-generated. The goal is a believable, real-looking professional photograph.`;
}

async function generatePortraits() {
  console.log("\n=== PORTRAITS ===");
  const dir = path.join(PUBLIC_DIR, "portraits");
  ensureDir(dir);

  // Generate sequentially to avoid rate limits
  for (const subject of PORTRAIT_SUBJECTS) {
    const outputPath = path.join(dir, subject.file);
    if (fs.existsSync(outputPath)) {
      console.log(`  Skipping ${subject.file} (already exists)`);
      continue;
    }
    await generateAndSave(subject.name, portraitPrompt(subject), outputPath);
    // Small delay between API calls
    await new Promise((r) => setTimeout(r, 1500));
  }
  console.log("\nPortraits complete.");
}

// ---------------------------------------------------------------------------
// Texture generation
// ---------------------------------------------------------------------------

const TEXTURES = [
  {
    file: "texture-scales-dormant.png",
    label: "Dormant scales texture",
    prompt: `Generate a close-up macro photograph texture of biomechanical serpent scales in their dormant state.

Visual requirements:
- Extreme close-up, filling the entire frame with the scale texture
- Organic reptilian scales with dark metallic undertones -- deep charcoal, near-black
- Hints of brushed stainless steel or titanium at scale edges
- Very faint, barely-visible geometric circuitry etched into the surface (like PCB traces, subtle and dark)
- The circuitry is not glowing -- the serpent is dormant. Only the texture and pattern are visible.
- Dramatic raking light from one side, creating deep shadows in scale seams
- Pure black background/border at edges
- Aspect ratio: 16:9, approximately 1920x1080
- Ultra-high detail, photorealistic macro photography style`,
  },
  {
    file: "texture-scales-awakened.png",
    label: "Awakened scales texture",
    prompt: `Generate a close-up macro photograph texture of biomechanical serpent scales in their awakened/transformed state.

Visual requirements:
- Extreme close-up, filling the entire frame
- The scales are cracked and fracturing -- each crack reveals glowing venom-green (#39FF14) energy beneath
- The cracks follow the circuit patterns etched into the scales
- Green bioluminescent light bleeds through the fractures, casting green glow on surrounding surfaces
- Dark organic scale surface contrasting sharply with the intense green glow
- Some scales appear to be lifting and separating
- Pure black background at the very edges
- Aspect ratio: 16:9, approximately 1920x1080
- Ultra-high detail, cinematic, photorealistic`,
  },
  {
    file: "texture-circuit-organic.png",
    label: "Circuit-organic hybrid texture",
    prompt: `Generate an abstract macro texture that blends biological and technological patterns.

Visual requirements:
- A seamless-feeling abstract background texture
- Combines organic cellular/biological patterns (like enlarged skin cells or tissue cross-sections) with technical circuit board geometry
- Color palette: very dark backgrounds (near-black #0A0A0A), with extremely subtle dark green (#1a3a1a) highlights -- understated, not bright
- The pattern should suggest intelligence and technology without being explicit
- Very fine detail, like looking at something through a microscope
- No glowing effects -- this is a subtle, dark, textural piece for use as a section background
- Aspect ratio: 16:9, tileable/repeatable feeling
- Ultra-high detail, editorial photography style`,
  },
  {
    file: "texture-dark-abstract.png",
    label: "Dark abstract section texture",
    prompt: `Generate a very dark abstract texture suitable as a subtle website section background.

Visual requirements:
- Extremely dark -- near-black (#050505 to #111111 tonal range)
- Very subtle, organic flowing patterns -- like dark smoke, or dark water ripples, or extremely dark iridescent fabric
- No bright colors -- maximum chroma should be extremely desaturated
- Barely-there venom green (#39FF14) present at 3-5% opacity -- just a hint of green, not visible at a glance
- The texture should add depth and visual interest to a dark web page section without competing with content
- No objects, no recognizable shapes, pure abstract
- Aspect ratio: 16:9
- High-end editorial feel`,
  },
];

async function generateTextures() {
  console.log("\n=== TEXTURES ===");
  const dir = path.join(PUBLIC_DIR, "textures");
  ensureDir(dir);

  const startFrame = path.join(PUBLIC_DIR, "frames/serpent/frame-0001.webp");
  const endFrame = path.join(PUBLIC_DIR, "frames/serpent/frame-0120.webp");

  for (const texture of TEXTURES) {
    const outputPath = path.join(dir, texture.file);
    if (fs.existsSync(outputPath)) {
      console.log(`  Skipping ${texture.file} (already exists)`);
      continue;
    }
    // Reference the serpent frames for scale/awakened textures for consistency
    const refs = texture.file.includes("scales") && fs.existsSync(startFrame)
      ? [{ path: startFrame, mimeType: "image/webp" }, { path: endFrame, mimeType: "image/webp" }]
      : [];
    await generateAndSave(texture.label, texture.prompt, outputPath, refs);
    await new Promise((r) => setTimeout(r, 1500));
  }
  console.log("\nTextures complete.");
}

// ---------------------------------------------------------------------------
// OG image generation
// ---------------------------------------------------------------------------

const OG_PAGES = [
  {
    file: "og-home.png",
    title: "OphidianAI",
    subtitle: "Intelligence. Engineered.",
    desc: "AI agency and integrations company",
  },
  {
    file: "og-services.png",
    title: "Services",
    subtitle: "OphidianAI",
    desc: "AI assistants, workflow automation, document intelligence",
  },
  {
    file: "og-pricing.png",
    title: "Pricing",
    subtitle: "OphidianAI",
    desc: "Transparent pricing for websites, AI tools, and integrations",
  },
  {
    file: "og-about.png",
    title: "About",
    subtitle: "OphidianAI",
    desc: "Solo AI agency built in Columbus, Indiana",
  },
  {
    file: "og-contact.png",
    title: "Start a Project",
    subtitle: "OphidianAI",
    desc: "Get in touch — we respond within 24 hours",
  },
  {
    file: "og-blog.png",
    title: "Blog",
    subtitle: "OphidianAI",
    desc: "Insights on AI, automation, and building for the future",
  },
];

function ogPrompt(page) {
  return `Generate a professional Open Graph social sharing image (1200x630 pixels, landscape).

Brand: OphidianAI — an AI agency and integrations company
Page: ${page.title}
Tagline: ${page.subtitle}
Description: ${page.desc}

Visual design requirements:
- Pure black or very near-black background (#000000 to #0A0A0A)
- Clean, modern typographic composition (the text IS the design)
- Large, prominent text: "${page.title}" on the left or center
- Secondary text: "${page.subtitle}" smaller
- Accent color: venom green (#39FF14) used sparingly -- a horizontal rule, a subtle glow, or accent on one word
- Abstract serpent scale texture or circuit pattern very subtly visible in the background (5-10% opacity) to suggest brand imagery without cluttering
- White or near-white text (#F0F0F0) for the main title
- Extremely high contrast -- readable at small sizes
- Professional, tech-industry aesthetic -- no stock photo clichés
- 1200x630 pixels exactly, horizontal/landscape format
- No watermarks, no borders, no drop shadows on the frame itself`;
}

async function generateOgImages() {
  console.log("\n=== OG IMAGES ===");
  const dir = path.join(PUBLIC_DIR, "og");
  ensureDir(dir);

  for (const page of OG_PAGES) {
    const outputPath = path.join(dir, page.file);
    if (fs.existsSync(outputPath)) {
      console.log(`  Skipping ${page.file} (already exists)`);
      continue;
    }
    await generateAndSave(page.title, ogPrompt(page), outputPath);
    await new Promise((r) => setTimeout(r, 1500));
  }
  console.log("\nOG images complete.");
}

// ---------------------------------------------------------------------------
// Hero frame generation (1080p stills only -- video step is separate)
// ---------------------------------------------------------------------------

const HERO_FRAMES = [
  {
    file: "serpent-start-hd.png",
    label: "Hero start frame (HD)",
    prompt: `Create a photorealistic, cinematic image of a biomechanical serpent in its dormant state for use as a hero scroll-scrub animation start frame.

The serpent:
- Coiled and dormant, tightly wound, head resting gently on its body
- Organic reptilian scales with brushed dark metallic undertones (deep charcoal, near-black)
- Very faint circuit traces etched into scale surfaces -- not glowing, barely visible
- Eyes closed or at rest -- no visible energy or power yet
- Studio lighting from above-left, dramatic shadows in scale seams
- The serpent fills approximately 60-70% of the frame height, centered, with breathing room on all sides

Background:
- Pure black #000000 -- completely solid, zero gradients, no reflections, no floor
- The serpent floats in absolute darkness
- No environment, no ambient light spill at edges

Technical:
- 16:9 aspect ratio, 1920x1080 equivalent quality
- Ultra-high resolution, 8K detail
- Cinematic, photorealistic rendering
- Suitable for frame-by-frame scroll animation (must work on pure black background)`,
  },
  {
    file: "serpent-end-hd.png",
    label: "Hero end frame (HD)",
    prompt: `Create a photorealistic, cinematic image of a biomechanical serpent in its fully awakened/transformed state for use as a hero scroll-scrub animation end frame.

The serpent:
- Fully uncoiled, rearing up, head raised -- powerful and alert
- The organic scales are fracturing and separating, with intense venom-green (#39FF14) bioluminescent energy blazing through every crack and seam
- Digital circuitry is now fully visible and glowing beneath/through the scales -- like a living circuit board cracking open
- The green glow casts colored light on the serpent's own body
- Eyes wide open, glowing green or with a vertical slit pupil lit from within
- Dynamic, powerful posture -- the sense of a transformation completed

Background:
- Pure black #000000 -- completely solid
- The green glow from the serpent creates the only illumination
- No environment, no reflections, no floor

Technical:
- 16:9 aspect ratio, 1920x1080 equivalent quality
- Ultra-high resolution, 8K detail
- Cinematic, photorealistic rendering
- Suitable for frame-by-frame scroll animation (must work on pure black background)`,
  },
];

async function generateHeroFrames() {
  console.log("\n=== HERO FRAMES (HD stills) ===");
  ensureDir(OUTPUT_DIR);

  for (const frame of HERO_FRAMES) {
    const outputPath = path.join(OUTPUT_DIR, frame.file);
    if (fs.existsSync(outputPath)) {
      console.log(`  Skipping ${frame.file} (already exists)`);
      continue;
    }
    await generateAndSave(frame.label, frame.prompt, outputPath);
    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log("\nHero frames complete.");
  console.log("Next step: feed these into the Google Flow / Veo API for transition video generation.");
  console.log("See: .claude/skills/exploding-scroll-hero/SKILL.md for the full 3-prompt pipeline.");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("OphidianAI Site Asset Generator");
  console.log(`Model: ${MODEL}`);
  console.log(`Running: ${[
    runPortraits && "portraits",
    runTextures && "textures",
    runOg && "og",
    runHero && "hero",
  ].filter(Boolean).join(", ")}`);

  if (runPortraits) await generatePortraits();
  if (runTextures) await generateTextures();
  if (runOg) await generateOgImages();
  if (runHero) await generateHeroFrames();

  console.log("\n✓ All requested assets generated.");
  console.log("\nNext steps:");
  if (runPortraits) console.log("  - Update TestimonialsEditorial.tsx to use portrait images from public/portraits/");
  if (runTextures) console.log("  - Apply textures as section backgrounds in globals.css or component inline styles");
  if (runOg) console.log("  - Reference OG images in page metadata (layout.tsx openGraph.images)");
  if (runHero) console.log("  - Run Google Flow video generation with the HD still frames");
}

main().catch((err) => {
  console.error("\nFatal error:", err.message);
  process.exit(1);
});
