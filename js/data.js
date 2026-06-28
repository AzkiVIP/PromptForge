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

  /* ---------- Watermark Positions ---------- */
  const WATERMARK_POSITIONS = [
    { value: "Center",        phrase: "centered watermark" },
    { value: "Top Center",    phrase: "top-center watermark" },
    { value: "Bottom Center", phrase: "bottom-center watermark" },
    { value: "Top Left",      phrase: "top-left watermark" },
    { value: "Top Right",     phrase: "top-right watermark" },
    { value: "Bottom Left",   phrase: "bottom-left watermark" },
    { value: "Bottom Right",  phrase: "bottom-right watermark" },
    { value: "Custom Position", phrase: "custom-position watermark" }
  ];

  /* ---------- Subject Importance ---------- */
  const SUBJECT_IMPORTANCE = [
    { value: "Primary",    phrase: "primary subject" },
    { value: "Secondary",  phrase: "secondary subject" },
    { value: "Tertiary",   phrase: "tertiary subject" },
    { value: "Background", phrase: "background subject" }
  ];

  /* =========================================================
     AUTO-TRANSLATION DICTIONARY (Issue #9)
     Best-effort English → Indonesian word-by-word translation.
     No external API. If a word isn't in the dictionary, it's
     passed through unchanged. Indonesian input is detected and
     passed through untouched.
     ========================================================= */
  const ID_MARKER_WORDS = [
    "yang", "dan", "atau", "di", "ke", "dari", "untuk", "pada", "dengan",
    "adalah", "ini", "itu", "saya", "kamu", "dia", "mereka", "kita",
    "kami", "akan", "sudah", "telah", "bisa", "dapat", "harus", "juga",
    "tidak", "bukan", "jangan", "seorang", "sebuah", "para", "sang",
    "sih", "lah", "kah", "pun", "nya"
  ];

  const EN_ID_DICT = {
    // articles / prepositions
    "a": "seorang", "an": "seorang", "the": "", "of": "", "in": "di",
    "on": "di", "at": "di", "with": "dengan", "and": "dan", "or": "atau",
    "to": "ke", "from": "dari", "for": "untuk", "by": "oleh",
    "under": "di bawah", "above": "di atas", "near": "dekat", "far": "jauh",
    "into": "ke dalam", "onto": "ke atas", "over": "di atas", "between": "di antara",
    "through": "melalui", "during": "selama", "before": "sebelum", "after": "setelah",
    "is": "adalah", "are": "adalah", "was": "adalah", "were": "adalah",
    "be": "menjadi", "being": "menjadi", "been": "telah menjadi",
    "has": "memiliki", "have": "memiliki", "had": "memiliki",
    "do": "melakukan", "does": "melakukan", "did": "melakukan",
    "this": "ini", "that": "itu", "these": "ini", "those": "itu",
    "as": "sebagai", "like": "seperti", "than": "dari", "then": "kemudian",
    "but": "tapi", "however": "namun", "because": "karena", "so": "jadi",
    "if": "jika", "when": "ketika", "while": "saat", "where": "di mana",
    "what": "apa", "who": "siapa", "which": "yang mana",
    // common nouns — nature / scene
    "warrior": "prajurit", "soldier": "tentara", "knight": "kesatria",
    "king": "raja", "queen": "ratu", "prince": "pangeran", "princess": "putri",
    "wizard": "penyihir", "witch": "penyihir perempuan", "mage": "penyihir",
    "hero": "pahlawan", "villain": "penjahat", "hunter": "pemburu",
    "dragon": "naga", "monster": "monster", "demon": "iblis", "angel": "malaikat",
    "ghost": "hantu", "spirit": "roh", "phoenix": "feniks", "unicorn": "unicorn",
    "wolf": "serigala", "lion": "singa", "tiger": "harimau", "bear": "beruang",
    "eagle": "elang", "hawk": "elang", "owl": "burung hantu", "raven": "gagak",
    "horse": "kuda", "cat": "kucing", "dog": "anjing", "bird": "burung",
    "fish": "ikan", "snake": "ular", "spider": "laba-laba",
    "castle": "kastil", "fortress": "benteng", "tower": "menara", "cave": "gua",
    "city": "kota", "village": "desa", "town": "kota kecil", "kingdom": "kerajaan",
    "forest": "hutan", "jungle": "hutan belantara", "mountain": "gunung",
    "ocean": "samudra", "sea": "laut", "river": "sungai", "lake": "danau",
    "waterfall": "air terjun", "island": "pulau", "desert": "gurun",
    "valley": "lembah", "cliff": "tebing", "rock": "batu", "stone": "batu",
    "tree": "pohon", "flower": "bunga", "grass": "rumput", "leaf": "daun",
    "sky": "langit", "cloud": "awan", "star": "bintang", "moon": "bulan",
    "sun": "matahari", "planet": "planet", "galaxy": "galaksi",
    "fire": "api", "water": "air", "wind": "angin", "earth": "tanah",
    "ice": "es", "snow": "salju", "rain": "hujan", "storm": "badai",
    "thunder": "guntur", "lightning": "kilat", "fog": "kabut", "mist": "kabut",
    "light": "cahaya", "shadow": "bayangan", "darkness": "kegelapan",
    "night": "malam", "day": "siang", "morning": "pagi", "evening": "sore",
    "dawn": "fajar", "dusk": "senja", "midnight": "tengah malam", "noon": "tengah hari",
    "sword": "pedang", "shield": "perisai", "bow": "busur", "arrow": "panah",
    "axe": "kapak", "spear": "tombak", "dagger": "belati", "staff": "tongkat",
    "armor": "baju zirah", "helmet": "helm", "crown": "mahkota", "cape": "jubah",
    "robe": "jubah", "cloak": "mantel",
    "book": "buku", "scroll": "gulungan", "crystal": "kristal", "gem": "permata",
    "gold": "emas", "silver": "perak", "iron": "besi", "steel": "baja",
    "wood": "kayu", "metal": "logam", "glass": "kaca", "silk": "sutra",
    "ship": "kapal", "boat": "perahu", "car": "mobil", "cart": "gerobak",
    "building": "gedung", "bridge": "jembatan", "road": "jalan", "path": "jalur",
    "garden": "taman", "temple": "kuil", "church": "gereja", "shrine": "altar",
    "throne": "tahta", "door": "pintu", "window": "jendela", "wall": "dinding",
    "floor": "lantai", "ceiling": "langit-langit", "roof": "atap",
    // adjectives
    "beautiful": "indah", "ugly": "jelek", "dark": "gelap", "bright": "terang",
    "epic": "epik", "mysterious": "misterius", "ancient": "kuno", "modern": "modern",
    "futuristic": "futuristik", "magical": "magis", "mystical": "mistis",
    "powerful": "kuat", "weak": "lemah", "brave": "berani", "cowardly": "penakut",
    "lone": "kesepian", "solitary": "sendiri", "lonely": "kesepian",
    "big": "besar", "small": "kecil", "huge": "raksasa", "tiny": "mungil",
    "giant": "raksasa", "massive": "masif", "old": "tua", "new": "baru",
    "young": "muda", "ancient": "kuno", "fresh": "segar",
    "red": "merah", "blue": "biru", "green": "hijau", "yellow": "kuning",
    "black": "hitam", "white": "putih", "purple": "ungu", "orange": "oranye",
    "pink": "merah muda", "brown": "coklat", "gray": "abu-abu", "grey": "abu-abu",
    "gold": "emas", "silver": "perak", "crimson": "merah tua", "scarlet": "merah cerah",
    "azure": "biru langit", "emerald": "hijau zamrud", "violet": "ungu tua",
    "tall": "tinggi", "short": "pendek", "wide": "lebar", "narrow": "sempit",
    "long": "panjang", "round": "bulat", "square": "persegi", "sharp": "tajam",
    "smooth": "halus", "rough": "kasar", "soft": "lembut", "hard": "keras",
    "warm": "hangat", "cold": "dingin", "hot": "panas", "cool": "sejuk",
    "fast": "cepat", "slow": "lambat", "quick": "cepat", "sudden": "mendadak",
    // verbs / actions
    "standing": "berdiri", "sitting": "duduk", "running": "berlari",
    "walking": "berjalan", "flying": "terbang", "jumping": "melompat",
    "fighting": "bertarung", "holding": "memegang", "looking": "melihat",
    "wearing": "mengenakan", "carrying": "membawa", "wielding": "menggenggam",
    "flying": "terbang", "swimming": "berenang", "climbing": "memanjat",
    "falling": "jatuh", "rising": "naik", "glowing": "bersinar",
    "burning": "membakar", "freezing": "membekukan", "shining": "bersinar",
    "smiling": "tersenyum", "crying": "menangis", "laughing": "tertawa",
    "sleeping": "tidur", "awake": "terjaga",
    // misc
    "with": "dengan", "without": "tanpa", "having": "memiliki",
    "very": "sangat", "quite": "cukup", "extremely": "sangat",
    "and": "dan", "but": "tapi", "also": "juga",
    "two": "dua", "three": "tiga", "four": "empat", "five": "lima",
    "six": "enam", "seven": "tujuh", "eight": "delapan", "nine": "sembilan",
    "ten": "sepuluh", "many": "banyak", "few": "beberapa", "several": "beberapa",
    "all": "semua", "each": "setiap", "every": "setiap",
    "lone": "kesepian", "alone": "sendirian",
    "cliff": "tebing", "edge": "tepi", "top": "atas", "bottom": "bawah",
    "front": "depan", "back": "belakang", "side": "sisi",
    "inside": "di dalam", "outside": "di luar",
    "wearing": "mengenakan", "holding": "memegang"
  };

  /* Detect if a text appears to already be Indonesian.
     Heuristic: if it contains ≥2 marker words, treat as Indonesian. */
  function isIndonesian(text) {
    if (!text) return true;
    var words = text.toLowerCase().split(/[^a-z']+|(?=[A-Z])/).filter(Boolean);
    if (words.length === 0) return true;
    var hits = 0;
    for (var i = 0; i < words.length; i++) {
      if (ID_MARKER_WORDS.indexOf(words[i]) >= 0) hits++;
      if (hits >= 2) return true;
    }
    return false;
  }

  /* Translate text to Indonesian using the dictionary.
     Returns { translated: string, changed: bool, untranslated: array }. */
  function translateToIndonesian(text) {
    if (!text || !text.trim()) {
      return { translated: text || "", changed: false, untranslated: [] };
    }
    if (isIndonesian(text)) {
      return { translated: text, changed: false, untranslated: [] };
    }
    var untranslated = [];
    // Preserve non-word segments (punctuation, etc.) by tokenizing
    var tokens = text.split(/(\s+|[^\w\s'-]+)/);
    var out = tokens.map(function (tok) {
      if (!tok) return tok;
      // Skip whitespace and punctuation
      if (/^[\s]+$/.test(tok) || /^[^\w]+$/.test(tok)) return tok;
      var lower = tok.toLowerCase();
      if (EN_ID_DICT.hasOwnProperty(lower)) {
        var replacement = EN_ID_DICT[lower];
        // Preserve capitalization of first letter
        if (tok[0] && tok[0] === tok[0].toUpperCase() && replacement) {
          replacement = replacement.charAt(0).toUpperCase() + replacement.slice(1);
        }
        return replacement;
      }
      untranslated.push(tok);
      return tok;
    });
    var translated = out.join("").replace(/\s+/g, " ").replace(/\s+([.,;:!?])/g, "$1").trim();
    return { translated: translated, changed: true, untranslated: untranslated };
  }

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
    WATERMARK_POSITIONS,
    SUBJECT_IMPORTANCE,
    ENRICHMENT_RULES,
    NEGATIVE_BASE,
    NEGATIVE_BY_MOOD,
    colorName,
    translateToIndonesian,
    isIndonesian
  };

})(typeof window !== "undefined" ? window : this);
