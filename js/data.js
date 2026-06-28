/* =========================================================
   PromptForge — data.js
   All option libraries + rule-based enrichment knowledge base
   Exposed on window.PF_DATA
   ========================================================= */
(function (global) {
  "use strict";

  /* ---------- Project Type ---------- */
  // Categories -> presets. Each preset has a "phrase" used in prompt generation.
  const PROJECT_TYPE = {
    Gaming: [
      { value: "Minecraft", phrase: "Minecraft-style game key art" },
      { value: "Roblox", phrase: "Roblox-style game key art" },
      { value: "Valorant", phrase: "Valorant-inspired tactical shooter key art" },
      { value: "Fortnite", phrase: "Fortnite-style vibrant game key art" },
      { value: "GTA", phrase: "GTA-inspired gritty open-world game cover" },
      { value: "Free Fire", phrase: "Free Fire battle royale key art" },
      { value: "PUBG", phrase: "PUBG military battle royale key art" },
      { value: "League of Legends", phrase: "League of Legends champion splash key art" },
      { value: "Genshin Impact", phrase: "Genshin Impact anime RPG key art" },
      { value: "Call of Duty", phrase: "Call of Duty cinematic military key art" },
      { value: "Esports Tournament", phrase: "esports tournament key art" },
      { value: "Game Thumbnail", phrase: "gaming YouTube thumbnail" }
    ],
    Marketing: [
      { value: "Product Poster", phrase: "product promotional poster" },
      { value: "Movie Poster", phrase: "cinematic movie poster" },
      { value: "Brand Advertisement", phrase: "brand advertisement" },
      { value: "Social Media Ad", phrase: "social media advertisement" },
      { value: "Sale Banner", phrase: "sale promotional banner" },
      { value: "App Promo", phrase: "mobile app promotional artwork" },
      { value: "Event Flyer", phrase: "event promotional flyer" },
      { value: "Email Header", phrase: "marketing email header" },
      { value: "Billboard", phrase: "outdoor billboard advertisement" }
    ],
    Events: [
      { value: "Concert Poster", phrase: "live concert poster" },
      { value: "Festival Poster", phrase: "music festival poster" },
      { value: "Conference Cover", phrase: "industry conference cover artwork" },
      { value: "Webinar Banner", phrase: "webinar promotional banner" },
      { value: "Birthday Invite", phrase: "birthday invitation artwork" },
      { value: "Wedding Cover", phrase: "wedding invitation cover" }
    ],
    Creative: [
      { value: "Concept Art", phrase: "concept art illustration" },
      { value: "Character Art", phrase: "character art portrait" },
      { value: "Wallpaper", phrase: "desktop wallpaper artwork" },
      { value: "Phone Wallpaper", phrase: "mobile phone wallpaper" },
      { value: "Album Cover", phrase: "music album cover artwork" },
      { value: "Book Cover", phrase: "book cover illustration" },
      { value: "Sticker Pack", phrase: "illustrated sticker pack artwork" }
    ],
    Business: [
      { value: "Pitch Deck Cover", phrase: "investor pitch deck cover slide" },
      { value: "Corporate Banner", phrase: "corporate business banner" },
      { value: "Report Cover", phrase: "annual report cover artwork" },
      { value: "LinkedIn Banner", phrase: "LinkedIn profile banner" }
    ],
    Education: [
      { value: "Course Thumbnail", phrase: "online course thumbnail" },
      { value: "Tutorial Cover", phrase: "tutorial cover artwork" },
      { value: "Infographic", phrase: "educational infographic" },
      { value: "Science Poster", phrase: "science fair poster" }
    ],
    Technology: [
      { value: "App Store Screenshot", phrase: "App Store screenshot" },
      { value: "SaaS Hero", phrase: "SaaS product hero artwork" },
      { value: "Tech Product Render", phrase: "tech product render" },
      { value: "Dashboard Mockup", phrase: "dashboard UI mockup" }
    ]
  };

  /* ---------- Art Style ---------- */
  const ART_STYLE = [
    { value: "Photorealistic", phrase: "photorealistic rendering" },
    { value: "Hyperrealistic", phrase: "hyperrealistic detailing" },
    { value: "Cinematic", phrase: "cinematic stylization" },
    { value: "Anime", phrase: "anime illustration style" },
    { value: "Pixar", phrase: "Pixar 3D animation style" },
    { value: "Minecraft", phrase: "Minecraft voxel block style" },
    { value: "Low Poly", phrase: "low poly 3D style" },
    { value: "Cyberpunk", phrase: "cyberpunk neon aesthetic" },
    { value: "Fantasy", phrase: "epic fantasy art style" },
    { value: "Dark Fantasy", phrase: "dark fantasy art style" },
    { value: "Sci-Fi", phrase: "science fiction art style" },
    { value: "Stylized 3D", phrase: "stylized 3D render" },
    { value: "Blender Render", phrase: "Blender Cycles render" },
    { value: "Oil Painting", phrase: "oil painting texture" },
    { value: "Watercolor", phrase: "watercolor illustration" },
    { value: "Concept Sketch", phrase: "concept sketch with line art" },
    { value: "Comic Book", phrase: "comic book illustration" },
    { value: "Pixel Art", phrase: "retro pixel art" },
    { value: "Studio Ghibli", phrase: "Studio Ghibli painterly style" },
    { value: "Digital Painting", phrase: "digital painting" },
    { value: "Matte Painting", phrase: "matte painting" },
    { value: "Claymation", phrase: "claymation stop-motion style" },
    { value: "Vaporwave", phrase: "vaporwave aesthetic" },
    { value: "Ukiyo-e", phrase: "ukiyo-e Japanese woodblock style" },
    { value: "Gothic", phrase: "gothic art style" },
    { value: "Noir", phrase: "film noir monochrome style" }
  ];

  /* ---------- Camera Angle ---------- */
  const CAMERA_ANGLE = [
    { value: "Front View", phrase: "front view" },
    { value: "Side View", phrase: "side profile view" },
    { value: "Back View", phrase: "back view" },
    { value: "High Angle", phrase: "high angle shot" },
    { value: "Low Angle", phrase: "low angle hero shot" },
    { value: "Bird's Eye View", phrase: "bird's eye aerial view" },
    { value: "Worm's Eye View", phrase: "worm's eye upward view" },
    { value: "Close-Up", phrase: "close-up shot" },
    { value: "Extreme Close-Up", phrase: "extreme close-up macro shot" },
    { value: "Medium Shot", phrase: "medium shot" },
    { value: "Wide Shot", phrase: "wide establishing shot" },
    { value: "Over-the-Shoulder", phrase: "over-the-shoulder shot" },
    { value: "Hero Shot", phrase: "hero shot composition" },
    { value: "Action Shot", phrase: "dynamic action shot" },
    { value: "Dutch Angle", phrase: "dutch angle tilted shot" },
    { value: "POV Shot", phrase: "first-person POV shot" },
    { value: "Tracking Shot", phrase: "cinematic tracking shot" }
  ];

  /* ---------- Lighting ---------- */
  const LIGHTING = [
    { value: "Daylight", phrase: "natural daylight" },
    { value: "Golden Hour", phrase: "warm golden hour lighting" },
    { value: "Studio Light", phrase: "professional studio lighting" },
    { value: "Volumetric", phrase: "volumetric god-ray lighting" },
    { value: "Rim Light", phrase: "rim lighting edge highlights" },
    { value: "Back Light", phrase: "backlighting silhouette glow" },
    { value: "Neon", phrase: "neon glow lighting" },
    { value: "Moonlight", phrase: "soft moonlight" },
    { value: "Horror Lighting", phrase: "high-contrast horror lighting" },
    { value: "Candlelight", phrase: "warm candlelight" },
    { value: "Cinematic Lighting", phrase: "cinematic dramatic lighting" },
    { value: "Soft Box", phrase: "soft diffused softbox lighting" },
    { value: "Hard Sunlight", phrase: "hard direct sunlight" },
    { value: "Bioluminescent", phrase: "bioluminescent glow" },
    { value: "Underwater Light", phrase: "underwater caustic lighting" },
    { value: "Firelight", phrase: "flickering firelight" }
  ];

  /* ---------- Background ---------- */
  const BACKGROUND = [
    { value: "City", phrase: "urban city background" },
    { value: "Cyberpunk City", phrase: "cyberpunk neon city background" },
    { value: "Forest", phrase: "lush forest background" },
    { value: "Space", phrase: "deep space starfield background" },
    { value: "Castle", phrase: "medieval castle background" },
    { value: "Minecraft World", phrase: "Minecraft blocky world background" },
    { value: "Cave", phrase: "mysterious cave background" },
    { value: "Abstract", phrase: "abstract gradient background" },
    { value: "Mountain", phrase: "misty mountain range background" },
    { value: "Ocean", phrase: "vast ocean horizon background" },
    { value: "Desert", phrase: "vast desert dunes background" },
    { value: "Snow Field", phrase: "snowy frozen field background" },
    { value: "Ruins", phrase: "ancient ruins background" },
    { value: "Laboratory", phrase: "high-tech laboratory background" },
    { value: "Studio Backdrop", phrase: "clean studio backdrop" },
    { value: "Sky", phrase: "open sky with clouds background" },
    { value: "Volcano", phrase: "volcanic eruption background" },
    { value: "Underwater", phrase: "underwater reef background" },
    { value: "Rooftop", phrase: "city rooftop at dusk background" },
    { value: "Interior", phrase: "detailed interior background" }
  ];

  /* ---------- Mood ---------- */
  const MOOD = [
    { value: "Epic", phrase: "epic grand mood" },
    { value: "Professional", phrase: "professional clean mood" },
    { value: "Luxury", phrase: "luxurious premium mood" },
    { value: "Energetic", phrase: "high-energy dynamic mood" },
    { value: "Dark", phrase: "dark moody atmosphere" },
    { value: "Horror", phrase: "eerie horror atmosphere" },
    { value: "Friendly", phrase: "friendly approachable mood" },
    { value: "Dramatic", phrase: "dramatic tension" },
    { value: "Emotional", phrase: "emotional heartfelt mood" },
    { value: "Futuristic", phrase: "futuristic sleek mood" },
    { value: "Nostalgic", phrase: "nostalgic vintage mood" },
    { value: "Mystical", phrase: "mystical ethereal mood" },
    { value: "Playful", phrase: "playful cheerful mood" },
    { value: "Calm", phrase: "calm serene mood" },
    { value: "Tense", phrase: "tense suspenseful mood" }
  ];

  /* ---------- Typography ---------- */
  const TYPOGRAPHY = [
    { value: "Modern", phrase: "modern sans-serif typography" },
    { value: "Luxury", phrase: "elegant luxury serif typography" },
    { value: "Bold", phrase: "bold heavy display typography" },
    { value: "Minimalist", phrase: "minimalist clean typography" },
    { value: "Corporate", phrase: "corporate professional typography" },
    { value: "Esports", phrase: "aggressive esports display typography" },
    { value: "Minecraft Pixel", phrase: "Minecraft pixel font typography" },
    { value: "Futuristic", phrase: "futuristic sci-fi typography" },
    { value: "Hand-Lettered", phrase: "hand-lettered script typography" },
    { value: "Vintage", phrase: "vintage retro typography" },
    { value: "Gothic", phrase: "gothic blackletter typography" },
    { value: "Graffiti", phrase: "graffiti street typography" }
  ];

  /* ---------- Effects (multi-select) ---------- */
  const EFFECTS = [
    { value: "Particles", phrase: "floating particle effects" },
    { value: "Smoke", phrase: "swirling smoke effects" },
    { value: "Fire", phrase: "dynamic fire effects" },
    { value: "Rain", phrase: "rain droplet effects" },
    { value: "Lightning", phrase: "crackling lightning effects" },
    { value: "Fog", phrase: "atmospheric fog effects" },
    { value: "Dust", phrase: "floating dust mote effects" },
    { value: "Magic Energy", phrase: "magic energy aura effects" },
    { value: "Glitch", phrase: "digital glitch distortion effects" },
    { value: "Motion Blur", phrase: "motion blur effects" },
    { value: "Lens Flare", phrase: "anamorphic lens flare" },
    { value: "Bokeh", phrase: "soft bokeh highlights" },
    { value: "Sparks", phrase: "shower of sparks" },
    { value: "Snow", phrase: "falling snow particles" },
    { value: "Embers", phrase: "glowing embers" }
  ];

  /* ---------- Aspect Ratio ---------- */
  // value = label, ratio = css aspect for preview, param = generator hint
  const ASPECT_RATIOS = [
    { value: "1:1",  w: 1,  h: 1,  param: "--ar 1:1" },
    { value: "4:5",  w: 4,  h: 5,  param: "--ar 4:5" },
    { value: "16:9", w: 16, h: 9,  param: "--ar 16:9" },
    { value: "9:16", w: 9,  h: 16, param: "--ar 9:16" },
    { value: "2:3",  w: 2,  h: 3,  param: "--ar 2:3" },
    { value: "3:2",  w: 3,  h: 2,  param: "--ar 3:2" },
    { value: "21:9", w: 21, h: 9,  param: "--ar 21:9" },
    { value: "A4",   w: 3,  h: 4,  param: "--ar 3:4 (A4 portrait)" },
    { value: "A3",   w: 4,  h: 3,  param: "--ar 4:3 (A3 landscape)" }
  ];

  /* ---------- Advanced ---------- */
  const COMPOSITION = [
    { value: "Center Focus", phrase: "centered focus composition" },
    { value: "Rule of Thirds", phrase: "rule-of-thirds composition" },
    { value: "Symmetrical", phrase: "symmetrical balanced composition" },
    { value: "Dynamic Layout", phrase: "dynamic asymmetric composition" },
    { value: "Minimalist", phrase: "minimalist negative-space composition" },
    { value: "Golden Ratio", phrase: "golden-ratio spiral composition" }
  ];

  const RENDERING_QUALITY = [
    { value: "Standard",   boost: ["sharp focus", "balanced detail"] },
    { value: "High",       boost: ["high detail", "sharp focus", "clean rendering"] },
    { value: "Ultra",      boost: ["ultra-detailed", "8K resolution", "razor-sharp focus", "professional rendering"] },
    { value: "Masterpiece",boost: ["masterpiece quality", "ultra-detailed", "8K resolution", "award-winning render", "professional composition", "photographic detail"] }
  ];

  const PROMPT_EXPANSION = [
    { value: "Short",    weight: 0 },
    { value: "Medium",   weight: 1 },
    { value: "Detailed", weight: 2 },
    { value: "Extreme",  weight: 3 }
  ];

  const AI_PRESETS = [
    {
      value: "ChatGPT Images",
      suffix: "",
      negativeSuffix: "",
      preferNatural: true
    },
    {
      value: "Flux",
      suffix: "",
      negativeSuffix: "",
      preferNatural: true
    },
    {
      value: "SDXL",
      suffix: ", masterpiece, best quality, highly detailed",
      negativeSuffix: ", lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, deformed, disfigured, mutation, mutated, extra limbs, missing limbs, distorted"
    },
    {
      value: "Midjourney",
      suffix: " --v 6 --style raw",
      negativeSuffix: "",
      paramStyle: true
    },
    {
      value: "Gemini",
      suffix: "",
      negativeSuffix: "",
      preferNatural: true
    }
  ];

  /* =========================================================
     RULE-BASED ENRICHMENT KNOWLEDGE BASE
     Each rule: when any "trigger" keyword matches a selected
     option's value (case-insensitive substring), the listed
     enrichment phrases are appended (de-duplicated).
     ========================================================= */
  const ENRICHMENT_RULES = [
    {
      triggers: ["minecraft", "roblox", "pixel"],
      add: ["blocky voxel geometry", "low-resolution pixel texture", "stylized game-art render"]
    },
    {
      triggers: ["valorant", "tactical", "call of duty", "pubg", "free fire", "fortnite"],
      add: ["cinematic atmosphere", "dramatic shadows", "high detail environment", "professional composition", "epic action mood"]
    },
    {
      triggers: ["dark fantasy", "gothic", "horror", "dark"],
      add: ["cinematic atmosphere", "dramatic shadows", "high detail environment", "professional composition", "epic fantasy mood"]
    },
    {
      triggers: ["epic", "festival", "concert"],
      add: ["cinematic atmosphere", "dramatic lighting", "sweeping scale", "professional composition", "epic grandeur"]
    },
    {
      triggers: ["volumetric", "god-ray", "volumetric lighting"],
      add: ["cinematic atmosphere", "dramatic shadows", "god rays piercing the scene", "high detail environment"]
    },
    {
      triggers: ["neon", "cyberpunk", "vaporwave"],
      add: ["neon glow reflections", "rain-soaked surfaces", "high detail environment", "futuristic mood", "professional composition"]
    },
    {
      triggers: ["luxury", "premium", "corporate"],
      add: ["clean professional composition", "soft gradient backdrop", "studio-quality rendering", "high-end commercial polish"]
    },
    {
      triggers: ["anime", "studio ghibli", "pixar"],
      add: ["expressive character design", "painterly environment", "cinematic staging", "professional composition"]
    },
    {
      triggers: ["photorealistic", "hyperrealistic", "product render", "product poster"],
      add: ["physically based rendering", "accurate material textures", "soft studio reflections", "professional commercial lighting"]
    },
    {
      triggers: ["concept art", "character art", "fantasy", "sci-fi"],
      add: ["detailed concept design", "dynamic composition", "high detail environment", "professional illustration"]
    },
    {
      triggers: ["golden hour", "moonlight", "candlelight"],
      add: ["warm atmospheric tone", "soft directional light", "cinematic color grading", "high detail environment"]
    },
    {
      triggers: ["wallpaper", "phone wallpaper", "desktop"],
      add: ["centered focal subject", "balanced negative space", "high detail environment", "wide color depth"]
    },
    {
      triggers: ["thumbnail", "youtube"],
      add: ["high-contrast subject pop", "expressive facial reaction", "bold focal composition", "clickable vibrant color grading"]
    },
    {
      triggers: ["movie poster", "album cover", "book cover"],
      add: ["cinematic key-art composition", "dramatic central focal", "professional typography hierarchy", "high detail environment"]
    }
  ];

  /* Negative-prompt library, always merged (then refined by AI preset) */
  const NEGATIVE_BASE = [
    "low quality",
    "blurry",
    "distorted",
    "deformed",
    "bad anatomy",
    "extra limbs",
    "missing limbs",
    "watermark",
    "signature",
    "text artifacts",
    "jpeg artifacts",
    "oversaturated",
    "underexposed",
    "overexposed",
    "grainy",
    "noisy",
    "poor composition",
    "cropped subject",
    "out of frame"
  ];

  /* Optional mood-driven negatives */
  const NEGATIVE_BY_MOOD = {
    Horror: ["overly bright", "cheerful palette"],
    Luxury: ["cluttered background", "messy details", "harsh shadows"],
    Professional: ["chaotic elements", "excessive effects", "amateur render"],
    Friendly: ["dark mood", "horror elements"],
    Epic: ["flat lighting", "low contrast", "bland composition"]
  };

  /* Color name hints for prompt (when user picks a palette) */
  function colorName(hex) {
    const h = hex.replace("#", "").toLowerCase();
    const map = {
      "000000": "black", "ffffff": "white", "ff0000": "red", "00ff00": "green",
      "0000ff": "blue", "ffff00": "yellow", "ff00ff": "magenta", "00ffff": "cyan",
      "3b82f6": "electric blue", "ef4444": "crimson", "10b981": "emerald",
      "f59e0b": "amber", "8b5cf6": "violet", "ec4899": "pink", "14b8a6": "teal",
      "f97316": "orange", "84cc16": "lime", "06b6d4": "sky cyan", "a855f7": "purple"
    };
    if (map[h]) return map[h];
    // crude luminance-based fallback
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    const max = Math.max(r, g, b);
    if (max < 40) return "deep black";
    if (Math.min(r, g, b) > 230) return "soft white";
    if (r > g && r > b) return g > b ? "warm orange-red" : "pure red";
    if (g > r && g > b) return "vivid green";
    if (b > r && b > g) return "deep blue";
    return "neutral grey";
  }

  global.PF_DATA = {
    PROJECT_TYPE,
    ART_STYLE,
    CAMERA_ANGLE,
    LIGHTING,
    BACKGROUND,
    MOOD,
    TYPOGRAPHY,
    EFFECTS,
    ASPECT_RATIOS,
    COMPOSITION,
    RENDERING_QUALITY,
    PROMPT_EXPANSION,
    AI_PRESETS,
    ENRICHMENT_RULES,
    NEGATIVE_BASE,
    NEGATIVE_BY_MOOD,
    colorName
  };

})(typeof window !== "undefined" ? window : this);
