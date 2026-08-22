// =============================================
// E-GIFT PLATFORM — DATA LAYER (localStorage)
// =============================================

export interface SlideField {
  id: string;
  label: string;
  type: "text" | "textarea" | "image";
  defaultValue: string;
}

export interface SlideDefinition {
  slideNumber: number;
  title: string;
  description: string;
  fields: SlideField[];
}

export interface Product {
  id: string;
  name: string;
  tagline: string;
  category: "birthday" | "proposal" | "anniversary" | "friendship" | "love" | "wedding";
  price: number; // in INR paise (multiply by 100)
  cuttedPrice?: number; // in INR paise (optional, for strikethrough display)
  badge?: "hot" | "new" | "specials" | "premium" | ""; // Product badge overlay
  visible: boolean;
  thumbnail: string; // emoji or image url
  previewRoute: string; // e.g. "/preview/birthday-magic-box"
  slides: SlideDefinition[];
  createdAt: string;
  previewMode?: "original" | "mp4";
  previewVideoUrl?: string;
  previewVideoVersions?: Array<{ id: string; name: string; url: string; size?: number; createdAt: string }>;
  checkoutMethod?: "global" | "cash" | "ads" | "free";
  requiredAdsCount?: number;
  frameStripEnabled?: boolean;
  frameStripTexts?: string[];
  frameStripBgColor?: string;
  frameStripTextColor?: string;
}

export interface Order {
  id: string;
  productId: string;
  productName: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  userId?: string;
  amount: number;
  status: "pending" | "paid" | "editing" | "finalized";
  customizations: Record<string, string>; // fieldId -> value
  finalizedAt?: string;
  couponCode?: string; // Optional coupon code used
  discountAmount?: number; // Optional discount applied in paise
  affiliateCouponCreatorId?: string; // Creator UID if coupon was affiliate
  commissionAmount?: number; // Commission to credit to creator (in paise)
  createdAt: string;
  lastOpenedAt?: string;
  paymentMode?: "pre-pay" | "post-pay";
}

export interface Coupon {
  id: string; // The coupon code itself, uppercase (e.g., "FESTIVAL50")
  active: boolean;
  discountType: "percentage" | "value";
  discountAmount: number; // 10 for 10%, or 5000 for ₹50 off
  totalStocks: number; // How many times it can be used overall
  usedCount: number; // How many times it has been used
  validFrom: string; // ISO
  validTo: string; // ISO
  perPersonLimit: number; // Limit per email
  minimumOrderValue: number; // Minimum order in paise
  description: string;
  createdAt: string;
  // Affiliate extension fields (optional — only set for creator coupons)
  creatorId?: string; // UID of the affiliated creator
  commissionPercentage?: number; // e.g. 10 means 10% commission to creator
}

export interface SongPart {
  label: string; // e.g. "Part 1", "Chorus", etc.
  url: string;
}

export interface Song {
  id: string;
  name: string;
  description: string;
  url: string;
  type?: "direct" | "youtube";
  youtubeId?: string;
  startTime?: number;
  endTime?: number;
  isMultiPart?: boolean;       // true for multi-part songs
  parts?: SongPart[];          // array of parts (only when isMultiPart = true)
  createdAt: string;
}

// ─── STATIC PRODUCT REGISTRY ─────────────────────────────────────────────────
// Products are code-defined (not added via UI). Admin can only toggle visibility & price.

export const PRODUCT_REGISTRY: Product[] = [
  {
    id: "birthday-magic-box",
    name: "Birthday Magic Box 🎂",
    tagline: "A pastel-kawaii birthday surprise: love letters, cake, wishes & a final sealed message",
    category: "birthday",
    price: 9900, // ₹99
    visible: true,
    thumbnail: "🎂",
    previewRoute: "/preview/birthday-magic-box",
    createdAt: new Date().toISOString(),
    slides: [
      {
        slideNumber: 0,
        title: "Background Music",
        description: "Plays continuously throughout the website",
        fields: [
          { id: "bg_song_name", label: "Background Song Name", type: "text", defaultValue: "Piano Cover" },
          { id: "bg_song_url", label: "Background Song URL", type: "text", defaultValue: "" },
        ],
      },
      {
        slideNumber: 1,
        title: "Welcome Slide",
        description: "The opening birthday greeting",
        fields: [
          { id: "s1_name", label: "Birthday Person's Name", type: "text", defaultValue: "Beautiful" },
          { id: "s1_heading", label: "Main Heading", type: "text", defaultValue: "Happy Birthday, Beautiful! 🎂✨" },
          { id: "s1_message", label: "Opening Message", type: "textarea", defaultValue: "Today is all about celebrating the most amazing person in my world. I've created something magical just for you on your special day…" },
          { id: "s1_cta", label: "Button Text", type: "text", defaultValue: "Let's Gooo 🎉" },
        ],
      },
      {
        slideNumber: 2,
        title: "Envelope Slide",
        description: "An interactive envelope opening animation",
        fields: [
          { id: "s2_title", label: "Envelope Title", type: "text", defaultValue: "A Special Surprise Awaits You" },
          { id: "s2_subtitle", label: "Envelope Subtitle", type: "text", defaultValue: "Click the envelope to reveal your birthday message..." },
        ],
      },
      {
        slideNumber: 3,
        title: "Love Letter",
        description: "A heartfelt birthday letter",
        fields: [
          { id: "s3_greeting", label: "Letter Greeting", type: "text", defaultValue: "My dearest birthday girl," },
          { id: "s3_para1", label: "First Paragraph", type: "textarea", defaultValue: "Today marks another year of your incredible existence, and I couldn't be more grateful to celebrate it with you." },
          { id: "s3_para2", label: "Second Paragraph", type: "textarea", defaultValue: "You bring so much joy, laughter, and love into this world – and into my life. You deserve all the magic, all the dreams, and all the love this world has to offer. ❤️" },
          { id: "s3_sign", label: "Sign-off", type: "text", defaultValue: "Forever yours 💗🫧" },
        ],
      },
      {
        slideNumber: 4,
        title: "Cake Cutting",
        description: "Animated cake with candles",
        fields: [
          { id: "s4_age", label: "Age Turning", type: "text", defaultValue: "21" },
          { id: "s4_wish", label: "Cake Wish Text", type: "textarea", defaultValue: "May all your birthday wishes come true!" },
        ],
      },
      {
        slideNumber: 5,
        title: "Make a Wish",
        description: "Birthday wish moment",
        fields: [
          { id: "s5_title", label: "Section Title", type: "text", defaultValue: "It's Cake Time! 🎂" },
          { id: "s5_message", label: "Wish Message", type: "textarea", defaultValue: "Close your eyes and make your birthday wish! 💥 Think of something wonderful for your new year…" },
        ],
      },
      {
        slideNumber: 6,
        title: "Playlist",
        description: "A curated birthday playlist",
        fields: [
          { id: "s6_song1", label: "Song 1 Name", type: "text", defaultValue: "Happy Birthday (Classic)" },
          { id: "s6_artist1", label: "Song 1 Artist", type: "text", defaultValue: "Traditional" },
          { id: "s6_url1", label: "Song 1 URL", type: "text", defaultValue: "" },
          { id: "s6_song2", label: "Song 2 Name", type: "text", defaultValue: "A Million Dreams" },
          { id: "s6_artist2", label: "Song 2 Artist", type: "text", defaultValue: "Pink (The Greatest Showman)" },
          { id: "s6_url2", label: "Song 2 URL", type: "text", defaultValue: "" },
          { id: "s6_song3", label: "Song 3 Name", type: "text", defaultValue: "Count On Me" },
          { id: "s6_artist3", label: "Song 3 Artist", type: "text", defaultValue: "Bruno Mars" },
          { id: "s6_url3", label: "Song 3 URL", type: "text", defaultValue: "" },
          { id: "s6_note", label: "Playlist Note", type: "textarea", defaultValue: "A playlist curated just for you 🎵" },
        ],
      },
      {
        slideNumber: 7,
        title: "Wish Cards",
        description: "3 flip cards with birthday wishes",
        fields: [
          { id: "s7_card1", label: "Card 1 Message", type: "textarea", defaultValue: "Happy Birthday to the girl who makes every day feel like a celebration! 🎉🌹" },
          { id: "s7_card2", label: "Card 2 Message", type: "textarea", defaultValue: "You make the world brighter just by being in it. Love you endlessly! 💖" },
          { id: "s7_card3", label: "Card 3 Message", type: "textarea", defaultValue: "Wishing you a year full of laughter, love, and tiny magical moments. ✨" },
        ],
      },
      {
        slideNumber: 9,
        title: "Final Letter",
        description: "The closing birthday message",
        fields: [
          { id: "s9_greeting", label: "Final Greeting", type: "text", defaultValue: "My dearest birthday princess," },
          { id: "s9_message", label: "Final Message", type: "textarea", defaultValue: "May this new year bring you everything your heart desires and more joy than you can imagine." },
          { id: "s9_closing", label: "Closing Line", type: "text", defaultValue: "Happy Birthday, my love. You deserve the world and so much more. 🎂✨" },
        ],
      },
    ],
  },
  {
    id: "sweet-apology-box",
    name: "Sweet Apology Box 💌",
    tagline: "A heartfelt apology page with interactive hearts, gift cards, a music player & a final love letter",
    category: "love" as const,
    price: 9900,
    visible: true,
    thumbnail: "💌",
    previewRoute: "/preview/sweet-apology-box",
    createdAt: new Date().toISOString(),
    slides: [
      {
        slideNumber: -1,
        title: "Background Music",
        description: "Plays continuously throughout the website",
        fields: [
          { id: "bg_song_name", label: "Background Song Name", type: "text", defaultValue: "Romantic Piano" },
          { id: "bg_song_url", label: "Background Song URL", type: "text", defaultValue: "" },
        ],
      },
      {
        slideNumber: 0,
        title: "Apology Intro",
        description: "The opening sorry message",
        fields: [
          { id: "s1_recipient", label: "Recipient Name", type: "text" as const, defaultValue: "KUCHUPUCHU" },
          { id: "s1_message", label: "Opening Message", type: "textarea" as const, defaultValue: "I made this specially just for you, for moments when you're mad. Take a deep breath, read slowly, and check what I made for you ❤️." },
        ],
      },
      {
        slideNumber: 1,
        title: "Heart Grid",
        description: "Interactive 3x3 heart flip game",
        fields: [
          { id: "s2_title", label: "Grid Title", type: "text" as const, defaultValue: "Fill the heart to continue" },
        ],
      },
      {
        slideNumber: 2,
        title: "Gift Cards",
        description: "Carousel of love cards",
        fields: [
          { id: "s3_card1", label: "Card 1 Title", type: "text" as const, defaultValue: "Some Flowers For You" },
          { id: "s3_card2", label: "Card 2 Title", type: "text" as const, defaultValue: "Some Tulips For You" },
          { id: "s3_card3", label: "Card 3 Title", type: "text" as const, defaultValue: "Always Thinking Of You" },
          { id: "s3_img1", label: "Card 1 Image", type: "text" as const, defaultValue: "" },
          { id: "s3_img2", label: "Card 2 Image", type: "text" as const, defaultValue: "" },
          { id: "s3_img3", label: "Card 3 Image", type: "text" as const, defaultValue: "" },
          { id: "s3_sign", label: "Sign-off", type: "text" as const, defaultValue: "with love, Your Madam Ji 📩" },
        ],
      },
      {
        slideNumber: 3,
        title: "Music Player",
        description: "Dedicated songs",
        fields: [
          { id: "s4_song1", label: "Song 1 Name", type: "text", defaultValue: "Dil Cheez Tujhe Dedi" },
          { id: "s4_artist1", label: "Song 1 Artist", type: "text", defaultValue: "Arijit Singh" },
          { id: "s4_url1", label: "Song 1 URL", type: "text", defaultValue: "" },
          { id: "s4_song2", label: "Song 2 Name", type: "text", defaultValue: "Tere Bina" },
          { id: "s4_artist2", label: "Song 2 Artist", type: "text", defaultValue: "A.R. Rahman" },
          { id: "s4_url2", label: "Song 2 URL", type: "text", defaultValue: "" },
          { id: "s4_song3", label: "Song 3 Name", type: "text", defaultValue: "Tera Hone Laga Hoon" },
          { id: "s4_artist3", label: "Song 3 Artist", type: "text", defaultValue: "Atif Aslam" },
          { id: "s4_url3", label: "Song 3 URL", type: "text", defaultValue: "" },
        ],
      },
      {
        slideNumber: 4,
        title: "Transition",
        description: "Animated heart transition",
        fields: [],
      },
      {
        slideNumber: 5,
        title: "Final Letter",
        description: "Closing love message",
        fields: [
          { id: "s6_heading", label: "Heading", type: "text" as const, defaultValue: "Thank You" },
          { id: "s6_subheading", label: "Sub-heading", type: "text" as const, defaultValue: "FOR BEING MINE 🖤" },
          { id: "s6_message", label: "Final Message", type: "textarea" as const, defaultValue: "I hope this little space made you smile. You are my favorite part of every day — always. ❤️" },
        ],
      },
    ],
  },
  {
    id: "birthday-bliss-microsite",
    name: "Birthday Bliss ✨",
    tagline: "An interactive birthday microsite with balloons, cake, music & a sealed letter.",
    category: "birthday" as const,
    price: 9900,
    visible: true,
    thumbnail: "✨",
    previewRoute: "/preview/birthday-bliss-microsite",
    createdAt: new Date().toISOString(),
    slides: [
      { slideNumber: -1, title: "Background Music", description: "Plays continuously", fields: [
        { id: "bg_song_name", label: "BG Song Name", type: "text", defaultValue: "Background Music" },
        { id: "bg_song_url", label: "BG Song URL", type: "text", defaultValue: "" },
      ]},
      { slideNumber: 0, title: "Intro", description: "Opening animated messages", fields: [
        { id: "s0_recipient", label: "Recipient Name", type: "text", defaultValue: "Madam Ji" },
        { id: "s0_sub", label: "Subtitle", type: "text", defaultValue: "it's your day to shine." },
        { id: "s0_p1", label: "Paragraph 1", type: "text", defaultValue: "I've set up something" },
        { id: "s0_p1_sub", label: "Paragraph 1 Sub", type: "text", defaultValue: "a little special — just for you." },
        { id: "s0_p2", label: "Paragraph 2", type: "text", defaultValue: "Your light" },
        { id: "s0_p2_sub", label: "Paragraph 2 Sub", type: "text", defaultValue: "is pretty much your magic." },
      ]},
      { slideNumber: 1, title: "Balloons", description: "Pop balloons to unlock cake", fields: [] },
      { slideNumber: 2, title: "Cake", description: "Light candles & cut the cake", fields: [] },
      { slideNumber: 3, title: "Memories & Playlist", description: "Photos & songs", fields: [
        { id: "p_song1", label: "Song 1 Title", type: "text", defaultValue: "Sia" },
        { id: "p_artist1", label: "Song 1 Artist", type: "text", defaultValue: "Special Vibe" },
        { id: "p_img1", label: "Song 1 Image URL", type: "text", defaultValue: "https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?auto=format&fit=crop&w=600" },
        { id: "p_cap1", label: "Song 1 Caption", type: "textarea", defaultValue: "Happy Birthday to the one who knows all my secrets and still chooses to stay." },
        { id: "p_url1", label: "Song 1 Audio URL", type: "text", defaultValue: "" },
        { id: "p_song2", label: "Song 2 Title", type: "text", defaultValue: "Tum Hi Ho" },
        { id: "p_artist2", label: "Song 2 Artist", type: "text", defaultValue: "Forever Mood" },
        { id: "p_img2", label: "Song 2 Image URL", type: "text", defaultValue: "https://images.unsplash.com/photo-1518199266791-5375a83164ba?auto=format&fit=crop&w=600" },
        { id: "p_cap2", label: "Song 2 Caption", type: "textarea", defaultValue: "My love will love you through every season, every reason." },
        { id: "p_url2", label: "Song 2 Audio URL", type: "text", defaultValue: "" },
        { id: "p_song3", label: "Song 3 Title", type: "text", defaultValue: "Whenever You Need" },
        { id: "p_artist3", label: "Song 3 Artist", type: "text", defaultValue: "Always Yours" },
        { id: "p_img3", label: "Song 3 Image URL", type: "text", defaultValue: "https://images.unsplash.com/photo-1478147424044-16b7eb0a006c?auto=format&fit=crop&w=600" },
        { id: "p_cap3", label: "Song 3 Caption", type: "textarea", defaultValue: "Whenever you need me, I'll be right there. Always." },
        { id: "p_url3", label: "Song 3 Audio URL", type: "text", defaultValue: "" },
      ]},
      { slideNumber: 4, title: "Envelope", description: "Slide up to open letter", fields: [] },
      { slideNumber: 5, title: "Letter", description: "Personalised birthday letter", fields: [
        { id: "l_greeting", label: "Letter Greeting", type: "textarea", defaultValue: "Happy Birthday, my favorite person." },
        { id: "l_msg", label: "Main Message", type: "textarea", defaultValue: "Thanks for coming into my life and making it better with your presence." },
        { id: "l_closing", label: "Closing", type: "textarea", defaultValue: "Here's to your laughter, your light, and every wish I'm quietly making for you tonight." },
        { id: "l_signoff", label: "Sign Off", type: "text", defaultValue: "— with all my heart ❤" },
      ]},
    ],
  },
  {
    id: "my-love-s-universe",
    name: "My Love's Universe 🪐",
    tagline: "An immersive 7-slide love journey featuring GSAP rose petals, interactive heart puzzles, memory jars & a starry-night letter",
    category: "love" as const,
    price: 9900,
    visible: true,
    thumbnail: "🪐",
    previewRoute: "/preview/my-love-s-universe",
    createdAt: new Date().toISOString(),
    slides: [
      {
        slideNumber: -1,
        title: "Background Music",
        description: "Plays continuously throughout the website",
        fields: [
          { id: "bg_song_name", label: "Background Song Name", type: "text", defaultValue: "Piano Cover" },
          { id: "bg_song_url", label: "Background Song URL", type: "text", defaultValue: "" },
        ],
      },
      {
        slideNumber: 0,
        title: "Welcome Slide",
        description: "Opening universe greeting with animated couple bears",
        fields: [
          { id: "beloved_name", label: "Beloved Name", type: "text", defaultValue: "My Jaan" },
          { id: "s1_title", label: "Intro Title", type: "text", defaultValue: "✦ For My ✦" },
          { id: "s1_tagline", label: "Intro Tagline", type: "textarea", defaultValue: "I built this little universe, just because you exist in mine." },
          { id: "s1_cta", label: "Button Text", type: "text", defaultValue: "Begin Our Story →" },
        ],
      },
      {
        slideNumber: 1,
        title: "Envelope Slide",
        description: "Interactive envelope opening animation",
        fields: [
          { id: "s2_title", label: "Envelope Title", type: "text", defaultValue: "A Letter From My Heart 💌" },
          { id: "s2_envelope_hint", label: "Envelope Hint", type: "text", defaultValue: "Click to open ✨" },
          { id: "s2_letter_greeting", label: "Letter Greeting", type: "text", defaultValue: "My Dearest Love," },
          { id: "s2_letter_body", label: "Letter Message", type: "textarea", defaultValue: "Every single day I find a new reason to fall deeper. You're not just the person I love — you're the person who makes me want to be better, feel more, and live louder. This page is my heart, laid out just for you. ♡" },
          { id: "s2_letter_sign", label: "Letter Sign-off", type: "text", defaultValue: "Forever yours," },
        ],
      },
      {
        slideNumber: 2,
        title: "Heart Puzzle",
        description: "Interactive drag and drop heart puzzle game",
        fields: [
          { id: "s3_title", label: "Puzzle Title", type: "text", defaultValue: "Put My Heart Together 💔→💖" },
          { id: "s3_subtitle", label: "Puzzle Subtitle", type: "text", defaultValue: "Drag each piece to the matching glow in the heart" },
          { id: "s3_win_text", label: "Success Message", type: "text", defaultValue: "You complete me. ♡" },
        ],
      },
      {
        slideNumber: 3,
        title: "Memory Jar",
        description: "Interactive memory pull jar",
        fields: [
          { id: "s4_title", label: "Jar Title", type: "text", defaultValue: "Our Memory Jar 🫙" },
          { id: "s4_subtitle", label: "Jar Subtitle", type: "text", defaultValue: "Tap the jar to pull out a memory" },
          { id: "s4_mem1", label: "Memory 1", type: "textarea", defaultValue: "The first time I saw you smile at me 🌸" },
          { id: "s4_mem2", label: "Memory 2", type: "textarea", defaultValue: "Our late night conversations about everything ✨" },
          { id: "s4_mem3", label: "Memory 3", type: "textarea", defaultValue: "The way you laugh — it's my favourite sound 🎶" },
          { id: "s4_mem4", label: "Memory 4", type: "textarea", defaultValue: "Every moment I get to hold your hand 🤝" },
          { id: "s4_mem5", label: "Memory 5", type: "textarea", defaultValue: "Right now. Reading this. You. ♡" },
        ],
      },
      {
        slideNumber: 4,
        title: "Dedicated Playlist",
        description: "A custom interactive music player",
        fields: [
          { id: "s5_title", label: "Playlist Title", type: "text", defaultValue: "Songs That Remind Me Of You 🎵" },
          { id: "s5_song1_name", label: "Song 1 Name", type: "text", defaultValue: "Tum Hi Ho" },
          { id: "s5_song1_artist", label: "Song 1 Artist", type: "text", defaultValue: "Arijit Singh" },
          { id: "s5_song1_url", label: "Song 1 URL", type: "text", defaultValue: "" },
          { id: "s5_song2_name", label: "Song 2 Name", type: "text", defaultValue: "Tera Ban Jaunga" },
          { id: "s5_song2_artist", label: "Song 2 Artist", type: "text", defaultValue: "Akhil Sachdeva" },
          { id: "s5_song2_url", label: "Song 2 URL", type: "text", defaultValue: "" },
          { id: "s5_song3_name", label: "Song 3 Name", type: "text", defaultValue: "Mere Naam Tu" },
          { id: "s5_song3_artist", label: "Song 3 Artist", type: "text", defaultValue: "Abbas–Mustan" },
          { id: "s5_song3_url", label: "Song 3 URL", type: "text", defaultValue: "" },
        ],
      },
      {
        slideNumber: 5,
        title: "Wish Stars",
        description: "Interactive starry night sky flip stars",
        fields: [
          { id: "s6_title", label: "Stars Title", type: "text", defaultValue: "Wish Upon Our Stars ⭐" },
          { id: "s6_subtitle", label: "Stars Subtitle", type: "text", defaultValue: "Click each star to unlock a reason I love you" },
          { id: "s6_star1", label: "Reason 1", type: "textarea", defaultValue: "The way your eyes light up when you're happy" },
          { id: "s6_star2", label: "Reason 2", type: "textarea", defaultValue: "How you make even ordinary days feel magical" },
          { id: "s6_star3", label: "Reason 3", type: "textarea", defaultValue: "Your laugh — it's my favorite melody" },
          { id: "s6_star4", label: "Reason 4", type: "textarea", defaultValue: "The way you care, deeply and genuinely" },
          { id: "s6_star5", label: "Reason 5", type: "textarea", defaultValue: "How safe I feel just being near you" },
          { id: "s6_star6", label: "Reason 6", type: "textarea", defaultValue: "Your kindness — it radiates from everything you do" },
          { id: "s6_star7", label: "Reason 7", type: "textarea", defaultValue: "Simply — you. All of you. Always." },
          { id: "s6_win_text", label: "Success Message", type: "text", defaultValue: "You are my universe. ♡" },
        ],
      },
      {
        slideNumber: 6,
        title: "Final Page",
        description: "Finale sealed message with animated bears couple",
        fields: [
          { id: "s7_title", label: "Finale Title", type: "text", defaultValue: "✦ A Love Letter To ✦" },
          { id: "s7_letter_body", label: "Finale Body", type: "textarea", defaultValue: "You walked into my life and rearranged everything — in the most beautiful way imaginable. I love you not just on special days, but in every quiet, ordinary, perfect moment. Always yours." },
          { id: "s7_closing", label: "Finale Closing", type: "text", defaultValue: "— Forever & Always ♡" },
          { id: "s7_seal_btn", label: "Seal Button Text", type: "text", defaultValue: "Seal It With Love 💌" },
          { id: "s7_replay_btn", label: "Replay Button Text", type: "text", defaultValue: "Experience Again 🔄" },
        ],
      },
    ],
  },
  {
    id: "lovers-enchanted-journey",
    name: "Lovers' Enchanted Journey ✨",
    tagline: "An immersive 9-slide love path featuring a cozy dark room, interactive polaroids, music tape, scratch surprise, stargazing constellation, spinner wheel, drift bottle, love garden, and grand fireworks finale",
    category: "love" as const,
    price: 9900,
    visible: true,
    thumbnail: "✨",
    previewRoute: "/preview/lovers-enchanted-journey",
    createdAt: new Date().toISOString(),
    slides: [
      {
        slideNumber: 1,
        title: "Cozy Dark Room 💡",
        description: "A dark room silhouette with diwali strings to light up and warm greetings.",
        fields: [
          { id: "s1_light_text", label: "Greeting Text", type: "text", defaultValue: "I lit up the world for you, just like you lit up mine. ✨" }
        ]
      },
      {
        slideNumber: 2,
        title: "Moments Polaroids 📸",
        description: "6 beautiful polaroid memory cards with custom captions.",
        fields: [
          { id: "s2_title", label: "Polaroids Title", type: "text", defaultValue: "Our Moments Together 📸" },
          { id: "s2_p1_caption", label: "Card 1 Caption", type: "text", defaultValue: "The day everything changed 🌸" },
          { id: "s2_p2_caption", label: "Card 2 Caption", type: "text", defaultValue: "Always laughing with you ✨" },
          { id: "s2_p3_caption", label: "Card 3 Caption", type: "text", defaultValue: "My favourite view 🌅" },
          { id: "s2_p4_caption", label: "Card 4 Caption", type: "text", defaultValue: "Us, always ♡" },
          { id: "s2_p5_caption", label: "Card 5 Caption", type: "text", defaultValue: "Golden hours with you 🌻" },
          { id: "s2_p6_caption", label: "Card 6 Caption", type: "text", defaultValue: "Forever in my heart 💕" }
        ]
      },
      {
        slideNumber: 3,
        title: "Tape Playlist 🎵",
        description: "3 customizable romantic soundtracks on an interactive cassette player.",
        fields: [
          { id: "s3_song1_title", label: "Song 1 Title", type: "text", defaultValue: "Tere Bina" },
          { id: "s3_song1_artist", label: "Song 1 Artist", type: "text", defaultValue: "Arijit Singh" },
          { id: "s3_song1_url", label: "Song 1 Audio URL", type: "text", defaultValue: "" },
          { id: "s3_song2_title", label: "Song 2 Title", type: "text", defaultValue: "Pehli Nazar Mein" },
          { id: "s3_song2_artist", label: "Song 2 Artist", type: "text", defaultValue: "Atif Aslam" },
          { id: "s3_song2_url", label: "Song 2 Audio URL", type: "text", defaultValue: "" },
          { id: "s3_song3_title", label: "Song 3 Title", type: "text", defaultValue: "Tu Hi Meri Shab Hai" },
          { id: "s3_song3_artist", label: "Song 3 Artist", type: "text", defaultValue: "Mohit Chauhan" },
          { id: "s3_song3_url", label: "Song 3 Audio URL", type: "text", defaultValue: "" }
        ]
      },
      {
        slideNumber: 4,
        title: "Scratch Card 🔮",
        description: "Interactive scratch surface that reveals a hidden message.",
        fields: [
          { id: "s4_reveal_title", label: "Scratch Title", type: "text", defaultValue: "You are my favourite person" },
          { id: "s4_reveal_body", label: "Scratch Hidden Message", type: "textarea", defaultValue: "Not just today. Not just on special days.\nEvery single day." }
        ]
      },
      {
        slideNumber: 5,
        title: "Starry Constellation 🌌",
        description: "Connect-the-stars constellation puzzle showing a celestial note.",
        fields: [
          { id: "s5_title", label: "Constellation Title", type: "text", defaultValue: "Connect the stars to reveal what I see ✨" },
          { id: "s5_reveal_text", label: "Constellation Message", type: "textarea", defaultValue: "That's how I see you — a constellation I'll always find ♡" }
        ]
      },
      {
        slideNumber: 6,
        title: "Lottery Wheel 🎡",
        description: "A spin wheel containing 8 different heart-touching messages.",
        fields: [
          { id: "s6_seg1", label: "Segment 1 Message", type: "text", defaultValue: "You deserve every love song ever written" },
          { id: "s6_seg2", label: "Segment 2 Message", type: "text", defaultValue: "I choose you. Every single day." },
          { id: "s6_seg3", label: "Segment 3 Message", type: "text", defaultValue: "Being loved by you is my greatest gift" },
          { id: "s6_seg4", label: "Segment 4 Message", type: "text", defaultValue: "You make ordinary moments extraordinary" },
          { id: "s6_seg5", label: "Segment 5 Message", type: "text", defaultValue: "My heart plays your favourite song on repeat" },
          { id: "s6_seg6", label: "Segment 6 Message", type: "text", defaultValue: "You give me butterflies, always" },
          { id: "s6_seg7", label: "Segment 7 Message", type: "text", defaultValue: "I think of you in every quiet moment" },
          { id: "s6_seg8", label: "Segment 8 Message", type: "text", defaultValue: "You are the best part of my story" }
        ]
      },
      {
        slideNumber: 7,
        title: "Ocean Drift Bottle 🍾",
        description: "A message in a bottle floating on water waves that opens on shaking or rapid taps.",
        fields: [
          { id: "s7_letter_body", label: "Drift Letter Message", type: "textarea", defaultValue: "No matter where life takes us,\nI will always find my way back to you.\nYou are my home, my peace,\nmy favourite place to be.\nWith every wave, I think of you. ♡" },
          { id: "s7_sign", label: "Drift Letter Sign", type: "text", defaultValue: "— Yours, always" }
        ]
      },
      {
        slideNumber: 8,
        title: "Garden of Love 🪴",
        description: "Grow 8 colorful rose pots one-by-one, unlocking different reasons why you love them.",
        fields: [
          { id: "s8_title", label: "Garden Title", type: "text", defaultValue: "Grow our garden of love 🌹" },
          { id: "s8_reason1", label: "Reason 1", type: "text", defaultValue: "Your laugh 😄" },
          { id: "s8_reason2", label: "Reason 2", type: "text", defaultValue: "The way you care ♡" },
          { id: "s8_reason3", label: "Reason 3", type: "text", defaultValue: "Your kindness 🌸" },
          { id: "s8_reason4", label: "Reason 4", type: "text", defaultValue: "Being with you ✨" },
          { id: "s8_reason5", label: "Reason 5", type: "text", defaultValue: "Your eyes 🌟" },
          { id: "s8_reason6", label: "Reason 6", type: "text", defaultValue: "How you make me feel 💕" },
          { id: "s8_reason7", label: "Reason 7", type: "text", defaultValue: "Your strength 🦁" },
          { id: "s8_reason8", label: "Reason 8", type: "text", defaultValue: "All of you. Always. 💘" }
        ]
      },
      {
        slideNumber: 9,
        title: "Grand Fireworks Finale 🎆",
        description: "Grand closing letter with a wax stamp seal button, romantic couple bears, and particle fireworks.",
        fields: [
          { id: "s9_title", label: "Finale Title", type: "text", defaultValue: "You Are My Everything ♡" },
          { id: "s9_viewer_name", label: "Viewer Name (Stamp & Finale)", type: "text", defaultValue: "MY LOVE" },
          { id: "s9_body", label: "Finale Message", type: "textarea", defaultValue: "From the lights we lit together,\nto every song, every memory, every moment —\nit has all been for you.\nThank you for existing.\nThank you for being mine." },
          { id: "s9_sign", label: "Finale Sign", type: "text", defaultValue: "— Yours, in every lifetime ♡" }
        ]
      }
    ]
  },
  {
    id: "royal-wedding-card",
    name: "Royal Wedding Invitation 💒",
    tagline: "A majestic, interactive Indian wedding invitation featuring a cinematic preloader, unrolling scrolls, secret tree parted garden, and a grand fireworks finale",
    category: "wedding" as const,
    price: 14900,
    visible: true,
    thumbnail: "💒",
    previewRoute: "/preview/royal-wedding-card",
    createdAt: new Date().toISOString(),
    slides: [
      {
        slideNumber: 1,
        title: "Bride & Groom",
        description: "Names of the wedding couple and basic details",
        fields: [
          { id: "bride_name", label: "Bride's Name", type: "text", defaultValue: "Tanya" },
          { id: "groom_name", label: "Groom's Name", type: "text", defaultValue: "Rohan" },
          { id: "wedding_date", label: "Wedding Date", type: "text", defaultValue: "12 December 2026" },
          { id: "wedding_venue", label: "Wedding Venue", type: "text", defaultValue: "The Oberoi Udaivilas, Udaipur" },
          { id: "hashtag", label: "Wedding Hashtag", type: "text", defaultValue: "#TanyaWedsRohan" },
        ]
      },
      {
        slideNumber: 2,
        title: "Invitation & Blessings",
        description: "Blessing line and parents details",
        fields: [
          { id: "blessings", label: "Blessings line", type: "text", defaultValue: "Late Smt. Kamla Kapoor & Shri Harish Kapoor" },
          { id: "blessings_2", label: "Blessings line 2", type: "text", defaultValue: "Smt. Leela Sharma & Shri Mohan Sharma" },
          { id: "bride_parents", label: "Bride's Parents", type: "text", defaultValue: "D/O Mr. Rajesh Sharma & Mrs. Kavita Sharma" },
          { id: "groom_parents", label: "Groom's Parents", type: "text", defaultValue: "S/O Mr. Sanjay Kapoor & Mrs. Neeta Kapoor" },
        ]
      },
      {
        slideNumber: 3,
        title: "Events Schedule",
        description: "Timings and venues for wedding events",
        fields: [
          { id: "mehendi_date", label: "Mehendi Date & Time", type: "text", defaultValue: "11 Dec 2026 · 4:00 PM" },
          { id: "mehendi_venue", label: "Mehendi Venue", type: "text", defaultValue: "Lotus Courtyard" },
          { id: "mehendi_note", label: "Mehendi Dress Code/Note", type: "text", defaultValue: "Greens & florals encouraged" },
          
          { id: "haldi_date", label: "Haldi Date & Time", type: "text", defaultValue: "12 Dec 2026 · 10:00 AM" },
          { id: "haldi_venue", label: "Haldi Venue", type: "text", defaultValue: "Poolside Courtyard" },
          { id: "haldi_note", label: "Haldi Dress Code/Note", type: "text", defaultValue: "Yellow / ivory tones" },
          
          { id: "sangeet_date", label: "Sangeet Date & Time", type: "text", defaultValue: "12 Dec 2026 · 7:30 PM" },
          { id: "sangeet_venue", label: "Sangeet Venue", type: "text", defaultValue: "Royal Ballroom" },
          { id: "sangeet_note", label: "Sangeet Dress Code/Note", type: "text", defaultValue: "An evening of music and performances" },
          
          { id: "shaadi_date", label: "Shaadi Date & Time", type: "text", defaultValue: "13 Dec 2026 · 9:30 AM" },
          { id: "shaadi_venue", label: "Shaadi Venue", type: "text", defaultValue: "Lake Mandap" },
          { id: "shaadi_note", label: "Shaadi Dress Code/Note", type: "text", defaultValue: "Traditional Indian attire" },

          { id: "reception_date", label: "Reception Date & Time", type: "text", defaultValue: "13 Dec 2026 · 7:30 PM" },
          { id: "reception_venue", label: "Reception Venue", type: "text", defaultValue: "Palace Lawns" },
          { id: "reception_note", label: "Reception Dress Code/Note", type: "text", defaultValue: "Candlelit dinner and celebration" },
        ]
      },
      {
        slideNumber: 4,
        title: "Our Story",
        description: "Brief background text of the couple",
        fields: [
          { id: "story_body", label: "Our Story Paragraph", type: "textarea", defaultValue: "A monsoon evening in Udaipur, a marigold archway, and a girl laughing in the rain — that was all it took. Three years, countless chai mornings, and one nervous rooftop proposal in Jaipur later, Aarav & Meera are ready to begin their most beautiful chapter yet." }
        ]
      },
      {
        slideNumber: 5,
        title: "Memories Gallery",
        description: "Hanging photo frames",
        fields: [
          { id: "photo1", label: "Photo 1 URL (Portrait)", type: "image", defaultValue: "/templates/royal-wedding/Arch_Demo2.png" },
          { id: "photo2", label: "Photo 2 URL (Portrait)", type: "image", defaultValue: "/templates/royal-wedding/Arch_demo.png" },
          { id: "photo3", label: "Photo 3 URL (Landscape)", type: "image", defaultValue: "/templates/royal-wedding/landscape_demo.png" },
          { id: "photo4", label: "Photo 4 URL (Portrait)", type: "image", defaultValue: "/templates/royal-wedding/hero-arch_demo.png" },
        ]
      },
      {
        slideNumber: 6,
        title: "RSVP & Music",
        description: "RSVP details, background music, etc.",
        fields: [
          { id: "rsvp_headline", label: "RSVP Headline", type: "text", defaultValue: "Will you JOIN US?" },
          { id: "rsvp_body", label: "RSVP Body Message", type: "textarea", defaultValue: "We've saved a seat for you — at our table, in our hearts, and under the royal sky. Come celebrate with us as we begin this new chapter together." },
          { id: "rsvp_phone", label: "RSVP WhatsApp Number (including Country Code)", type: "text", defaultValue: "910000000000" },
          { id: "bg_song_url", label: "Background Music URL (.mp3)", type: "text", defaultValue: "" },
        ]
      }
    ]
  },
  {
    id: "royal-wedding-card-2",
    name: "South Indian Wedding Invitation 🪔",
    tagline: "A traditional South Indian grand wedding invitation featuring layered parallax gopuram, water flow swan animation, silk curtains reveal, and flower petal bursts",
    category: "wedding" as const,
    price: 14900,
    visible: true,
    thumbnail: "🪔",
    previewRoute: "/preview/royal-wedding-card-2",
    createdAt: new Date().toISOString(),
    slides: [
      {
        slideNumber: 1,
        title: "Bride & Groom",
        description: "Names of the wedding couple and basic details",
        fields: [
          { id: "bride_name", label: "Bride's Name", type: "text", defaultValue: "Priya" },
          { id: "groom_name", label: "Groom's Name", type: "text", defaultValue: "Arjun" },
          { id: "wedding_date", label: "Wedding Date", type: "text", defaultValue: "12 December 2026" },
          { id: "wedding_venue", label: "Wedding Venue", type: "text", defaultValue: "Kapaleeshwarar Temple, Chennai" },
          { id: "hashtag", label: "Wedding Hashtag", type: "text", defaultValue: "#PriyaWedsArjun" },
        ]
      },
      {
        slideNumber: 2,
        title: "Invitation & Blessings",
        description: "Blessing line and parents details",
        fields: [
          { id: "blessings", label: "Blessings line", type: "text", defaultValue: "Late Smt. Kamla Kapoor & Shri Harish Kapoor" },
          { id: "blessings_2", label: "Blessings line 2", type: "text", defaultValue: "Smt. Leela Sharma & Shri Mohan Sharma" },
          { id: "bride_parents", label: "Bride's Parents", type: "text", defaultValue: "Mr. & Mrs. Suresh Iyer" },
          { id: "groom_parents", label: "Groom's Parents", type: "text", defaultValue: "Mr. & Mrs. Ramesh Nair" },
        ]
      },
      {
        slideNumber: 3,
        title: "Events Schedule",
        description: "Timings and venues for wedding events",
        fields: [
          { id: "mehendi_date", label: "Mehendi Date & Time", type: "text", defaultValue: "11 Dec 2026 · 3:00 PM" },
          { id: "mehendi_venue", label: "Mehendi Venue", type: "text", defaultValue: "Garden Pavilion" },
          { id: "mehendi_note", label: "Mehendi Dress Code/Note", type: "text", defaultValue: "Henna, jasmine, folk music and afternoon warmth." },
          
          { id: "haldi_date", label: "Haldi Date & Time", type: "text", defaultValue: "11 Dec 2026 · 9:00 AM" },
          { id: "haldi_venue", label: "Haldi Venue", type: "text", defaultValue: "The Mandapam" },
          { id: "haldi_note", label: "Haldi Dress Code/Note", type: "text", defaultValue: "Turmeric, coconut water, mango leaves and laughter." },
          
          { id: "cocktail_date", label: "Cocktail Date & Time", type: "text", defaultValue: "11 Dec 2026 · 7:00 PM" },
          { id: "cocktail_venue", label: "Cocktail Venue", type: "text", defaultValue: "The Terrace" },
          { id: "cocktail_note", label: "Cocktail Dress Code/Note", type: "text", defaultValue: "Fresh coconut, mocktails and a night breeze." },

          { id: "sagan_date", label: "Nischayathartham Date & Time", type: "text", defaultValue: "11 Dec 2026 · 5:00 PM" },
          { id: "sagan_venue", label: "Nischayathartham Venue", type: "text", defaultValue: "Family Hall" },
          { id: "sagan_note", label: "Nischayathartham Dress Code/Note", type: "text", defaultValue: "Sacred engagement ceremony with family blessings." },
          
          { id: "shaadi_date", label: "Kalyanam Date & Time", type: "text", defaultValue: "12 Dec 2026 · 8:00 AM" },
          { id: "shaadi_venue", label: "Kalyanam Venue", type: "text", defaultValue: "The Grand Mandapam" },
          { id: "shaadi_note", label: "Kalyanam Dress Code/Note", type: "text", defaultValue: "The sacred Saptapadi — seven steps, one lifetime." },

          { id: "reception_date", label: "Reception Date & Time", type: "text", defaultValue: "12 Dec 2026 · 7:00 PM" },
          { id: "reception_venue", label: "Reception Venue", type: "text", defaultValue: "Grand Ballroom" },
          { id: "reception_note", label: "Reception Dress Code/Note", type: "text", defaultValue: "Celebrate under the stars with a feast fit for royalty." },
        ]
      },
      {
        slideNumber: 4,
        title: "Our Story",
        description: "Brief background text of the couple",
        fields: [
          { id: "story_body", label: "Our Story Paragraph", type: "textarea", defaultValue: "Two souls, one sacred thread, a lifetime of grace." }
        ]
      },
      {
        slideNumber: 5,
        title: "Memories Gallery",
        description: "Kolam framed gallery photos",
        fields: [
          { id: "photo1", label: "Photo 1 URL (Portrait)", type: "image", defaultValue: "/templates/royal-wedding-2/photo1.jpg" },
          { id: "photo2", label: "Photo 2 URL (Portrait)", type: "image", defaultValue: "/templates/royal-wedding-2/photo2.jpg" },
          { id: "photo3", label: "Photo 3 URL (Landscape)", type: "image", defaultValue: "/templates/royal-wedding-2/photo3.png" },
          { id: "photo4", label: "Photo 4 URL (Portrait)", type: "image", defaultValue: "/templates/royal-wedding-2/photo4.png" },
        ]
      },
      {
        slideNumber: 6,
        title: "RSVP & Music",
        description: "RSVP details, background music, etc.",
        fields: [
          { id: "rsvp_headline", label: "RSVP Headline", type: "text", defaultValue: "Will you join us?" },
          { id: "rsvp_body", label: "RSVP Body Message", type: "textarea", defaultValue: "We have lit the kuthuvillakku, spread the kolam, and saved a seat for you in our mandapam. Come celebrate as we begin this sacred and joyful chapter of our lives." },
          { id: "rsvp_phone", label: "RSVP WhatsApp Number (including Country Code)", type: "text", defaultValue: "910000000000" },
          { id: "bg_song_url", label: "Background Music URL (.mp3)", type: "text", defaultValue: "" },
        ]
      }
    ]
  },
  {
    id: "pastel-dudu-birthday",
    name: "Dudu Bear's Birthday Dreamland 🌸",
    tagline: "A super cute pink-pastel love microsite featuring balloon popping, claw machine capsule grabber, kitchen cake baking, interactive blow-and-slice cake cutting, wishing well, rhythm dance, scratch card, and wax seal stamp lock.",
    category: "birthday" as const,
    price: 15900,
    visible: true,
    thumbnail: "🌸",
    previewRoute: "/preview/pastel-dudu-birthday",
    createdAt: new Date().toISOString(),
    slides: [
      {
        slideNumber: 0,
        title: "Background Music",
        description: "Curated ambient sound controls",
        fields: [
          { id: "bg_song_name", label: "Soundtrack Name", type: "text", defaultValue: "Sweet Pastel Melodies" },
          { id: "bg_song_url", label: "Soundtrack URL (.mp3)", type: "text", defaultValue: "https://pub-1cc0f6e993214be9a36badeeb631f4b6.r2.dev/templates/template09/assets/song/Template_09.mp3" },
        ]
      },
      {
        slideNumber: 1,
        title: "Balloon Parade",
        description: "Welcome slide popping balloons",
        fields: [
          { id: "s1_name", label: "Celebrant Name", type: "text", defaultValue: "Cutie" },
          { id: "s1_heading", label: "Welcome Heading", type: "text", defaultValue: "Happy Birthday to my favorite person! 🧸💕" },
          { id: "s1_message", label: "Opening Message", type: "textarea", defaultValue: "Welcome to Dudu & Bubu's Pastel Dreamland. I've custom-made this romantic journey for you. Let's start the celebration by popping the balloons!" },
          { id: "s1_cta", label: "Unlock Button Text", type: "text", defaultValue: "Unwrap Surprise ✨" }
        ]
      },
      {
        slideNumber: 2,
        title: "Claw Machine",
        description: "Interactive capsule claw game",
        fields: [
          { id: "s2_joystick_label", label: "Claw Joystick Text", type: "text", defaultValue: "Drag joystick & press Drop!" },
          { id: "s2_win_message", label: "Capsule Message", type: "text", defaultValue: "You grabbed my heart! 💖" }
        ]
      },
      {
        slideNumber: 3,
        title: "Polaroid Memories",
        description: "Stack of swipeable photos that flip",
        fields: [
          { id: "photo1", label: "Photo 1 (Portrait)", type: "image", defaultValue: "/templates/royal-wedding-2/photo1.jpg" },
          { id: "photo1_note", label: "Photo 1 Note", type: "text", defaultValue: "Remember this day? 🌸" },
          { id: "photo2", label: "Photo 2 (Portrait)", type: "image", defaultValue: "/templates/royal-wedding-2/photo2.jpg" },
          { id: "photo2_note", label: "Photo 2 Note", type: "text", defaultValue: "Our best trip together..." },
          { id: "photo3", label: "Photo 3 (Portrait)", type: "image", defaultValue: "/templates/royal-wedding-2/photo3.png" },
          { id: "photo3_note", label: "Photo 3 Note", type: "text", defaultValue: "You make me laugh so much!" },
          { id: "photo4", label: "Photo 4 (Portrait)", type: "image", defaultValue: "/templates/royal-wedding-2/photo4.png" },
          { id: "photo4_note", label: "Photo 4 Note", type: "text", defaultValue: "Loving you more every day ❤️" }
        ]
      },
      {
        slideNumber: 4,
        title: "Bake Cake",
        description: "Drag ingredients and stir the cake",
        fields: [
          { id: "s4_recipe_title", label: "Recipe Box Title", type: "text", defaultValue: "Chef Dudu's Kitchen" },
          { id: "s4_success_message", label: "Success Message", type: "text", defaultValue: "Stirring complete! Time to bake 🎂" }
        ]
      },
      {
        slideNumber: 5,
        title: "Cake Cutting",
        description: "Blow candles and slice the cake",
        fields: [
          { id: "s5_age", label: "Age Turning", type: "text", defaultValue: "21" },
          { id: "s5_wish_message", label: "Wish Inside Cake", type: "textarea", defaultValue: "May all your birthday wishes come true, my favorite human! 🧸✨" }
        ]
      },
      {
        slideNumber: 6,
        title: "Wishing Well",
        description: "Drop shooting stars into the well",
        fields: [
          { id: "s6_well_label", label: "Well Caption", type: "text", defaultValue: "Make a wish! Drop a star in the well ✨" },
          { id: "s6_sender_wish", label: "Personalized Wish", type: "textarea", defaultValue: "I wish for your infinite smiles, countless filter coffees together, and endless warm hugs! Happy Birthday!" }
        ]
      },
      {
        slideNumber: 7,
        title: "Rhythm Dance",
        description: "Interactive rhythm tap dance game",
        fields: [
          { id: "s7_dance_label", label: "Rhythm Game Title", type: "text", defaultValue: "Dudu & Bubu's Rhythm Dance" },
          { id: "s7_success_banner", label: "Dance Victory Banner", type: "text", defaultValue: "You got the rhythm! 🎀" }
        ]
      },
      {
        slideNumber: 8,
        title: "Scratch Card",
        description: "Rub off glitter to read a love letter",
        fields: [
          { id: "s8_scratch_label", label: "Scratch Header", type: "text", defaultValue: "Glitter Scratch Card ✨" },
          { id: "s8_secret_letter", label: "Hidden Letter Text", type: "textarea", defaultValue: "Dearest Cutie,\n\nYou make my world brighter and warmer every day. Thank you for being the sweetest, most wonderful partner I could ask for. Have the best birthday!\n\nWith all my love 💗" }
        ]
      },
      {
        slideNumber: 9,
        title: "Finale",
        description: "Slam wax seal stamp to lock",
        fields: [
          { id: "s9_seal_label", label: "Wax Seal Text", type: "text", defaultValue: "Seal with Love" },
          { id: "s9_footer_sig", label: "Footer Signature", type: "text", defaultValue: "Dudu & Bubu Approved 💖" }
        ]
      }
    ]
  },
  {
    id: "propose3",
    name: "Interactive Cat Proposal 🐱💖",
    tagline: "A beautiful multi-stage cat-themed interactive proposal site with fun escape buttons, memory carousel, heart envelope, and fireworks celebration",
    category: "proposal" as const,
    price: 12900,
    visible: true,
    thumbnail: "🐱",
    previewRoute: "/preview/propose3",
    createdAt: new Date().toISOString(),
    slides: [
      {
        slideNumber: 0,
        title: "Background Music",
        description: "Plays continuously in the background",
        fields: [
          { id: "bg_song_name", label: "Soundtrack Name", type: "text", defaultValue: "Sweet Romantic Piano" },
          { id: "bg_song_url", label: "Soundtrack URL (.mp3)", type: "text", defaultValue: "" }
        ]
      },
      {
        slideNumber: 1,
        title: "Intro Slide",
        description: "Welcome introduction page",
        fields: [
          { id: "s1_name", label: "Beloved Name", type: "text", defaultValue: "Kinza" },
          { id: "s1_heading", label: "Intro Heading", type: "text", defaultValue: "I have something special to tell you..." },
          { id: "s1_subtext", label: "Intro Subtext", type: "text", defaultValue: "Something that will change everything for us" },
          { id: "s1_btn", label: "Intro Button Text", type: "text", defaultValue: "Tap to Begin" },
          { id: "s1_img", label: "Intro Mascot Image", type: "image", defaultValue: "/templates/propose3/cat-cute.png" }
        ]
      },
      {
        slideNumber: 2,
        title: "Trust Question",
        description: "The first check question",
        fields: [
          { id: "s2_heading", label: "Heading", type: "text", defaultValue: "Be honest with me..." },
          { id: "s2_subtext", label: "Subtext", type: "text", defaultValue: "This is important to me 💕" },
          { id: "s2_question", label: "Question", type: "text", defaultValue: "Do you trust me?" },
          { id: "s2_yes_btn", label: "Yes Button Text", type: "text", defaultValue: "Yes, I do 💕" },
          { id: "s2_no_btn", label: "No Button Text", type: "text", defaultValue: "No 😔" },
          { id: "s2_no_msg", label: "No Message Warning", type: "text", defaultValue: "Aww, please give me a chance! Just say yes 🥺💕" },
          { id: "s2_img", label: "Honest Mascot Image", type: "image", defaultValue: "/templates/propose3/cat-sad.png" }
        ]
      },
      {
        slideNumber: 3,
        title: "Love Question",
        description: "The second check question",
        fields: [
          { id: "s3_heading", label: "Heading", type: "text", defaultValue: "One more thing..." },
          { id: "s3_subtext", label: "Subtext", type: "text", defaultValue: "I need to know this 💖" },
          { id: "s3_question", label: "Question", type: "text", defaultValue: "Do you also love me?" },
          { id: "s3_yes_btn", label: "Yes Button Text", type: "text", defaultValue: "Yes, I love you! 💖" },
          { id: "s3_no_btn", label: "No Button Text", type: "text", defaultValue: "No 😢" },
          { id: "s3_no_msg", label: "No Message Warning", type: "text", defaultValue: "Come on, I know you do! Just admit it 🥰💕" },
          { id: "s3_img", label: "Love Mascot Image", type: "image", defaultValue: "/templates/propose3/cat-flowers.png" }
        ]
      },
      {
        slideNumber: 4,
        title: "Final Confirm",
        description: "The third check question",
        fields: [
          { id: "s4_heading", label: "Heading", type: "text", defaultValue: "Last question, I promise!" },
          { id: "s4_subtext", label: "Subtext", type: "text", defaultValue: "This one is the most important 🌟" },
          { id: "s4_question", label: "Question", type: "text", defaultValue: "Will you be mine forever?" },
          { id: "s4_yes_btn", label: "Yes Button Text", type: "text", defaultValue: "Yes, forever! 💝" },
          { id: "s4_no_btn", label: "No Button Text", type: "text", defaultValue: "Let me think... 🤔" },
          { id: "s4_no_msg", label: "No Message Warning", type: "text", defaultValue: "Don't overthink it! Your heart knows the answer 💕" },
          { id: "s4_img", label: "Final Mascot Image", type: "image", defaultValue: "/templates/propose3/doodle-love.png" }
        ]
      },
      {
        slideNumber: 5,
        title: "Memories Carousel",
        description: "Slider of 3 couple photos & notes",
        fields: [
          { id: "s5_heading", label: "Carousel Heading", type: "text", defaultValue: "From the first day I met you..." },
          { id: "s5_subtext", label: "Carousel Subtext", type: "text", defaultValue: "Every single moment has been magical" },
          { id: "s5_footer", label: "Carousel Footer", type: "text", defaultValue: "And there are so many more memories to make..." },
          { id: "s5_btn", label: "Next Button Text", type: "text", defaultValue: "Open My Letter 💌" },
          { id: "photo1", label: "Photo 1 (Meadow)", type: "image", defaultValue: "/templates/propose3/couple-meadow.png" },
          { id: "photo1_caption", label: "Photo 1 Caption", type: "text", defaultValue: "The times we spend together in quiet peace 🌸" },
          { id: "photo2", label: "Photo 2 (Beach)", type: "image", defaultValue: "/templates/propose3/couple-beach.png" },
          { id: "photo2_caption", label: "Photo 2 Caption", type: "text", defaultValue: "Every sunset beach walk feels like a dream 🌅" },
          { id: "photo3", label: "Photo 3 (Stars)", type: "image", defaultValue: "/templates/propose3/couple-stars.png" },
          { id: "photo3_caption", label: "Photo 3 Caption", type: "text", defaultValue: "Under the stars, you're the brightest light ✨" }
        ]
      },
      {
        slideNumber: 6,
        title: "Heart Letter",
        description: "An envelope reveal and handwritten letter",
        fields: [
          { id: "s6_heading", label: "Letter Title", type: "text", defaultValue: "This is just for you..." },
          { id: "s6_tap_text", label: "Letter Open Hint", type: "text", defaultValue: "Click the envelope to open and read..." },
          { id: "s6_letter_body", label: "Letter Content", type: "textarea", defaultValue: "Dearest,\n\nFrom the moment you entered my life, everything changed. You are my laughter on hard days, my peace when things are chaotic, and my absolute favorite person. I want to build a future together, side-by-side, holding your hand.\n\nWith all my heart," },
          { id: "s6_signoff", label: "Letter Sign-off", type: "text", defaultValue: "Forever yours 💝" },
          { id: "s6_img_closed", label: "Closed Envelope Mascot", type: "image", defaultValue: "/templates/propose3/cat-hearts.png" },
          { id: "s6_img_open", label: "Open Letter Mascot", type: "image", defaultValue: "/templates/propose3/cat-aiming.png" }
        ]
      },
      {
        slideNumber: 7,
        title: "Final Decision",
        description: "The ultimate proposal selection screen",
        fields: [
          { id: "s7_heading", label: "Ultimate Choice Heading", type: "text", defaultValue: "The ultimate choice..." },
          { id: "s7_question", label: "Proposal Question", type: "text", defaultValue: "Will you make me the happiest person in the world?" },
          { id: "s7_btn", label: "Yes Button Text", type: "text", defaultValue: "Yes, I'm Yours Forever! 💝" }
        ]
      },
      {
        slideNumber: 8,
        title: "Celebration",
        description: "Yay celebration fireworks page",
        fields: [
          { id: "s8_heading", label: "Celebration Title", type: "text", defaultValue: "YAY! She Said YES! 🎉" },
          { id: "s8_subtext", label: "Celebration Subtext", type: "text", defaultValue: "Together Forever 💖" },
          { id: "s8_promise", label: "Final Promise Text", type: "textarea", defaultValue: "I promise to love you, cherish you, and hold you close through all of life's seasons." }
        ]
      }
    ]
  },
  {
    id: "confess",
    name: "Interactive Love Confession 💖",
    tagline: "A beautiful premium love confession site with interactive slides, chat simulator, memory gallery, 3D envelope letter, cute matching heart quiz, and romantic promise page",
    category: "proposal" as const,
    price: 13900,
    visible: true,
    thumbnail: "💌",
    previewRoute: "/preview/confess",
    createdAt: new Date().toISOString(),
    slides: [
      {
        slideNumber: -1,
        title: "Background Music & Setup",
        description: "Background music configuration",
        fields: [
          { id: "bg_song_name", label: "Soundtrack Name", type: "text", defaultValue: "Ed Sheeran - Perfect" },
          { id: "bg_song_url", label: "Soundtrack URL (.mp3)", type: "text", defaultValue: "https://listenplaycreate.wordpress.com/wp-content/uploads/2019/06/ed-sheeran-perfect.mp3" }
        ]
      },
      {
        slideNumber: 0,
        title: "Landing Slide",
        description: "Welcoming landing slide with intro mascot",
        fields: [
          { id: "s1_name", label: "Beloved Name", type: "text", defaultValue: "Kinza" },
          { id: "s1_welcome_text", label: "Welcome Message", type: "textarea", defaultValue: "I created a little something just for you, because there are words my heart needs you to hear." },
          { id: "s1_signature", label: "Intro Signature", type: "text", defaultValue: "— this is my heart, speaking to yours 💕" },
          { id: "s1_btn_text", label: "Button Text", type: "text", defaultValue: "Open My Heart 💌" }
        ]
      },
      {
        slideNumber: 1,
        title: "Why It's You",
        description: "List of reasons why you love them",
        fields: [
          { id: "s2_heading", label: "Slide Heading", type: "text", defaultValue: "Why It's You, Kinza." },
          { id: "s2_subtext", label: "Slide Subtext", type: "textarea", defaultValue: "There are billions of people in the world, yet my soul exclusively chose you out of the crowd. Here's exactly why." },
          { id: "reason1", label: "Reason 1", type: "text", defaultValue: "Because you make the completely mundane feel extraordinary." },
          { id: "reason2", label: "Reason 2", type: "text", defaultValue: "Because no one else can read my mind exactly the way you endlessly do." },
          { id: "reason3", label: "Reason 3", type: "text", defaultValue: "Because my restless heart finally found its quiet, safe place residing with you." },
          { id: "reason4", label: "Reason 4", type: "text", defaultValue: "Because you naturally challenge me to be a beautifully better version of myself." },
          { id: "reason5", label: "Reason 5", type: "text", defaultValue: "Because loving you is the easiest, most peaceful thing I've ever inexplicably done." },
          { id: "s2_btn_text", label: "Button Text", type: "text", defaultValue: "And so much more 💖" }
        ]
      },
      {
        slideNumber: 2,
        title: "Every Version of You",
        description: "Accordion showing appreciation of all their moods",
        fields: [
          { id: "s3_heading", label: "Slide Heading", type: "text", defaultValue: "Every Version of Kinza." },
          { id: "s3_subtext", label: "Slide Subtext", type: "textarea", defaultValue: "I don't just love you at your absolute best. I completely accept, cherish, and adore every single phase of you." },
          { id: "s3_rad_title", label: "Radiant Title", type: "text", defaultValue: "The Radiant You" },
          { id: "s3_rad_sub", label: "Radiant Subtitle", type: "text", defaultValue: "When you're absolutely glowing" },
          { id: "s3_rad_desc", label: "Radiant Description", type: "textarea", defaultValue: "There is nothing more infectious than your pure happiness. Your smile lights up every room, and seeing you genuinely happy is my favorite sight in the world." },
          { id: "s3_rad_img", label: "Radiant Mascot Image", type: "image", defaultValue: "/templates/confess/bear4.gif" },
          { id: "s3_exh_title", label: "Exhausted Title", type: "text", defaultValue: "The Exhausted You" },
          { id: "s3_exh_sub", label: "Exhausted Subtitle", type: "text", defaultValue: "When the world gets too heavy" },
          { id: "s3_exh_desc", label: "Exhausted Description", type: "textarea", defaultValue: "When you're burnt out and need a quiet place to hide, my arms will always be that safe space. You never have to pretend to be strong around me." },
          { id: "s3_exh_img", label: "Exhausted Mascot Image", type: "image", defaultValue: "/templates/confess/bear6.gif" },
          { id: "s3_pas_title", label: "Passionate Title", type: "text", defaultValue: "The Passionate You" },
          { id: "s3_pas_sub", label: "Passionate Subtitle", type: "text", defaultValue: "When you talk about what you love" },
          { id: "s3_pas_desc", label: "Passionate Description", type: "textarea", defaultValue: "The way your eyes physically light up and you start talking faster when explaining something you deeply care about—it's incredibly captivating. I could listen forever." },
          { id: "s3_pas_img", label: "Passionate Mascot Image", type: "image", defaultValue: "/templates/confess/bear5.gif" },
          { id: "s3_fla_title", label: "Flawed Title", type: "text", defaultValue: "The Imperfect You" },
          { id: "s3_fla_sub", label: "Flawed Subtitle", type: "text", defaultValue: "When you doubt yourself" },
          { id: "s3_fla_desc", label: "Flawed Description", type: "textarea", defaultValue: "The parts of yourself you try to hide or feel insecure about? Those are the very pieces that make you entirely irreplaceable. I love every single flaw." },
          { id: "s3_fla_img", label: "Flawed Mascot Image", type: "image", defaultValue: "/templates/confess/bear9.gif" },
          { id: "s3_btn_text", label: "Button Text", type: "text", defaultValue: "Continue Our Story" }
        ]
      },
      {
        slideNumber: 3,
        title: "Chat Simulator",
        description: "A cute automated messaging screen representing a personal conversation",
        fields: [
          { id: "s4_title", label: "Chat Window Title", type: "text", defaultValue: "My Favorite Person Kinza ❤️" },
          { id: "s4_status", label: "Online Status Text", type: "text", defaultValue: "Online" },
          { id: "s4_btn_text", label: "Continue Button Text", type: "text", defaultValue: "Continue" }
        ]
      },
      {
        slideNumber: 4,
        title: "Memory Gallery",
        description: "Grid of 3 couple photos & captions",
        fields: [
          { id: "s5_title", label: "Gallery Title", type: "text", defaultValue: "Our memories" },
          { id: "s5_name", label: "Beloved Name", type: "text", defaultValue: "Kinza" },
          { id: "s5_subtext", label: "Gallery Subtext", type: "textarea", defaultValue: "Every photo tells a piece of our story ✨" },
          { id: "photo1", label: "Memory Photo 1", type: "image", defaultValue: "/templates/confess/bear11.gif" },
          { id: "photo1_caption", label: "Photo 1 Caption", type: "text", defaultValue: "Our first adventure 🌄" },
          { id: "photo2", label: "Memory Photo 2", type: "image", defaultValue: "/templates/confess/bear12.gif" },
          { id: "photo2_caption", label: "Photo 2 Caption", type: "text", defaultValue: "That perfect sunset 🌅" },
          { id: "photo3", label: "Memory Photo 3", type: "image", defaultValue: "/templates/confess/bear13.gif" },
          { id: "photo3_caption", label: "Photo 3 Caption", type: "text", defaultValue: "Laughing together 😂" },
          { id: "s5_btn_text", label: "Continue Button Text", type: "text", defaultValue: "Continue 💘" }
        ]
      },
      {
        slideNumber: 5,
        title: "3D Love Letter Envelope",
        description: "An envelope reveal and letter reading interaction",
        fields: [
          { id: "s6_heading", label: "Letter Title Prefix", type: "text", defaultValue: "A" },
          { id: "s6_span", label: "Letter Highlighted Title", type: "text", defaultValue: "secret" },
          { id: "s6_suffix", label: "Letter Title Suffix", type: "text", defaultValue: "for you" },
          { id: "s6_hint", label: "Envelope Open Text Hint", type: "text", defaultValue: "Open Heart" },
          { id: "s6_letter_title", label: "Letter Inner Title", type: "text", defaultValue: "My Dearest Kinza," },
          { id: "s6_letter_tag", label: "Letter Stamp Tag", type: "text", defaultValue: "Confidential" },
          { id: "s6_letter_p1", label: "Letter Paragraph 1", type: "textarea", defaultValue: "There are things I carry in my heart that words can barely hold. You are the quiet peace in my chaos, the warmth in my coldest days, and the reason I believe in forever." },
          { id: "s6_letter_p2", label: "Letter Paragraph 2", type: "textarea", defaultValue: "Every time you smile, I fall in love all over again. Every time you hold my hand, I know I'm exactly where I'm meant to be." },
          { id: "s6_letter_p3", label: "Letter Paragraph 3", type: "textarea", defaultValue: "This isn't just a letter; it's a piece of my soul left here for you to keep, always." },
          { id: "s6_signoff", label: "Letter Sign-off", type: "text", defaultValue: "Forever yours" },
          { id: "s6_btn_text", label: "Letter Continue Button", type: "text", defaultValue: "Continue 💘" }
        ]
      },
      {
        slideNumber: 6,
        title: "Soulmates Quiz",
        description: "Interactive relationship quiz screen",
        fields: [
          { id: "s7_heading", label: "Quiz Heading", type: "text", defaultValue: "Match My Heart" },
          { id: "q1_text", label: "Question 1 Text", type: "text", defaultValue: "If I could be anywhere in the universe right now, where would it be?" },
          { id: "q1_o1", label: "Q1 Option 1 Text", type: "text", defaultValue: "Exploring a beautiful new country ✈️" },
          { id: "q1_o2", label: "Q1 Option 2 Text", type: "text", defaultValue: "Right here, by your side indefinitely 💕" },
          { id: "q1_o3", label: "Q1 Option 3 Text", type: "text", defaultValue: "Stargazing on a quiet mountain 🌌" },
          { id: "q2_text", label: "Question 2 Text", type: "text", defaultValue: "When I look at you, what is my very first thought?" },
          { id: "q2_o1", label: "Q2 Option 1 Text", type: "text", defaultValue: "'How did I get so incredibly lucky?' ✨" },
          { id: "q2_o2", label: "Q2 Option 2 Text", type: "text", defaultValue: "'I love their gorgeous smile.' 😊" },
          { id: "q2_o3", label: "Q2 Option 3 Text", type: "text", defaultValue: "'We are going to have so much fun today.' 🎉" },
          { id: "q3_text", label: "Question 3 Text", type: "text", defaultValue: "What is my absolute favorite thing about 'us'?" },
          { id: "q3_o1", label: "Q3 Option 1 Text", type: "text", defaultValue: "The way we can laugh about anything 🤣" },
          { id: "q3_o2", label: "Q3 Option 2 Text", type: "text", defaultValue: "Our deep, late-night conversations 🌙" },
          { id: "q3_o3", label: "Q3 Option 3 Text", type: "text", defaultValue: "Knowing I found my forever best friend 💖" },
          { id: "s7_res_high_title", label: "High Score Result Title", type: "text", defaultValue: "Absolute Soulmates, Kinza 💫" },
          { id: "s7_res_high_msg", label: "High Score Result Msg", type: "textarea", defaultValue: "You know my heart inside and out! Every perfectly answered question just proves what I already knew: we are absolutely meant to be forever." },
          { id: "s7_res_med_title", label: "Medium Score Result Title", type: "text", defaultValue: "My Favorite Person, Kinza 💖" },
          { id: "s7_res_med_msg", label: "Medium Score Result Msg", type: "textarea", defaultValue: "You know me so wonderfully well. I love that no matter what, we're always learning new beautiful things about each other." },
          { id: "s7_res_low_title", label: "Low Score Result Title", type: "text", defaultValue: "A Never-ending Discovery, Kinza ✨" },
          { id: "s7_res_low_msg", label: "Low Score Result Msg", type: "textarea", defaultValue: "The best part of this relationship isn't knowing everything perfectly—it's that I get to spend the rest of my life letting you explore my heart." },
          { id: "s7_btn_text", label: "Continue Button Text", type: "text", defaultValue: "See my final promise" }
        ]
      },
      {
        slideNumber: 7,
        title: "Promise & Replay Slide",
        description: "The final page containing your core love promise",
        fields: [
          { id: "s8_title", label: "Promise Title", type: "text", defaultValue: "My promise to Kinza" },
          { id: "s8_promise_bold", label: "Bold Promise Text", type: "textarea", defaultValue: "I promise to be your safe place, your biggest cheerleader, and your forever person." },
          { id: "s8_promise_italic", label: "Italic Promise Text", type: "textarea", defaultValue: "Through every storm and every beautiful sunrise — I'm here. Because you are my everything." },
          { id: "s8_footer", label: "Footer Heading", type: "text", defaultValue: "Forever & Always" },
          { id: "s8_btn_text", label: "Replay Button Text", type: "text", defaultValue: "Replay Story" }
        ]
      }
    ]
  },
  {
    id: "birthday-serenade",
    name: "Birthday Serenade 🎂",
    tagline: "A cinematic 7-chapter birthday surprise: envelope letter, 3D cake box, fireworks, photo album, scratch card gift reveal, love letter with seal stamp & grand outro",
    category: "birthday" as const,
    price: 14900,
    visible: true,
    badge: "new" as const,
    thumbnail: "🎂",
    previewRoute: "/preview/birthday-serenade",
    createdAt: new Date().toISOString(),
    slides: [
      {
        slideNumber: 0,
        title: "Background Music",
        description: "Choose a beautiful background song for your gift.",
        fields: [
          { id: "bs_bg_song_name", label: "Background Song Name", type: "text" as const, defaultValue: "" },
          { id: "bs_bg_song_url", label: "Background Song URL", type: "text" as const, defaultValue: "" },
        ],
      },
      {
        slideNumber: 1,
        title: "Envelope & Letter",
        description: "Animated envelope with sliding letter — recipient name, sender name & letter message",
        fields: [
          { id: "bs_recipient", label: "Recipient Name", type: "text" as const, defaultValue: "Priya" },
          { id: "bs_sender", label: "Sender Name", type: "text" as const, defaultValue: "Rohan" },
          { id: "bs_letter_msg", label: "Letter Message", type: "textarea" as const, defaultValue: "Every single day I spend knowing you exist in this world feels like a gift I never deserved. You walk into a room and everything gets a little warmer. Happy Birthday, my love." },
        ],
      },
      {
        slideNumber: 2,
        title: "Cake Box Opening",
        description: "Animated gift box with lid opening + video overlay transition",
        fields: [
          { id: "bs_box_video_url", label: "Box Opening Video URL (optional)", type: "text" as const, defaultValue: "" },
        ],
      },
      {
        slideNumber: 3,
        title: "3D Cake Cutting",
        description: "Interactive 3D cake you can rotate and cut",
        fields: [
          { id: "bs_cake_name", label: "Name on Cake", type: "text" as const, defaultValue: "Beautiful" },
          { id: "bs_cake_stick", label: "Cake Stick Topper", type: "text" as const, defaultValue: "61d180843a856e0004c63347.png" },
        ],
      },
      {
        slideNumber: 4,
        title: "Fireworks & Wishes",
        description: "Canvas fireworks with 3 custom birthday wish messages",
        fields: [
          { id: "bs_wish1", label: "Birthday Wish 1", type: "text" as const, defaultValue: "May every dream you've whispered to the stars finally come true this year 🌟" },
          { id: "bs_wish2", label: "Birthday Wish 2", type: "text" as const, defaultValue: "May joy follow you like a loyal friend wherever you go 💛" },
          { id: "bs_wish3", label: "Birthday Wish 3", type: "text" as const, defaultValue: "May this chapter of your life be your most magical, most beautiful yet ✨" },
        ],
      },
      {
        slideNumber: 5,
        title: "Photo Album",
        description: "3 polaroid photos with custom captions in a beautiful masonry grid layout",
        fields: [
          { id: "bs_p_img1", label: "Photo 1", type: "image" as const, defaultValue: "https://picsum.photos/seed/bday1/400/500" },
          { id: "bs_p_cap1", label: "Photo 1 Caption", type: "text" as const, defaultValue: "Our first adventure together 🌊" },
          { id: "bs_p_img2", label: "Photo 2", type: "image" as const, defaultValue: "https://picsum.photos/seed/bday2/400/600" },
          { id: "bs_p_cap2", label: "Photo 2 Caption", type: "text" as const, defaultValue: "The day we laughed till we cried 😂" },
          { id: "bs_p_img3", label: "Photo 3", type: "image" as const, defaultValue: "https://picsum.photos/seed/bday3/400/500" },
          { id: "bs_p_cap3", label: "Photo 3 Caption", type: "text" as const, defaultValue: "This moment is everything 💕" },
        ],
      },
      {
        slideNumber: 6,
        title: "Scratch Card Gift",
        description: "Scratch to reveal a Myntra/brand gift code",
        fields: [
          { id: "bs_gift_brand", label: "Gift Brand (e.g. Myntra)", type: "text" as const, defaultValue: "Myntra" },
          { id: "bs_gift_code", label: "Gift Code", type: "text" as const, defaultValue: "BDAY2025LOVE" },
          { id: "bs_gift_worth", label: "Gift Worth (₹)", type: "text" as const, defaultValue: "500" },
          { id: "bs_gift_valid", label: "Valid Till", type: "text" as const, defaultValue: "31 Dec 2025" },
        ],
      },
      {
        slideNumber: 7,
        title: "Birthday Letter + Seal",
        description: "A heartfelt letter with animated wax seal stamp",
        fields: [
          { id: "bs_l_greeting", label: "Letter Greeting", type: "text" as const, defaultValue: "Happy Birthday, my favorite person." },
          { id: "bs_l_msg", label: "Main Message", type: "textarea" as const, defaultValue: "Thanks for coming into my life and making it better with your presence." },
          { id: "bs_l_closing", label: "Closing Line", type: "textarea" as const, defaultValue: "Here's to your laughter, your light, and every wish I'm quietly making for you tonight." },
          { id: "bs_l_signoff", label: "Sign Off", type: "text" as const, defaultValue: "— with all my heart ❤" },
        ],
      },
      {
        slideNumber: 8,
        title: "Grand Outro",
        description: "Cinematic final screen with confetti, frosted glass card & final message",
        fields: [
          { id: "bs_final_msg", label: "Final Message", type: "textarea" as const, defaultValue: "You make the world a more beautiful place just by being in it. Thank you for being you. Here's to you — the most incredible person I know. Happy Birthday, always and forever." },
        ],
      },
    ],
  },
  {
    id: "my-love-language",
    name: "My Love Language 💍",
    tagline: "A cinematic 8-scene romantic proposal experience: dark room reveal, collage flip book, TV memory room, beach bottle message, scratch card, fireworks, 3D ring box & final love letter",
    category: "proposal" as const,
    price: 19900,
    visible: true,
    badge: "new" as const,
    thumbnail: "💍",
    previewRoute: "/preview/my-love-language",
    createdAt: new Date().toISOString(),
    slides: [
      {
        slideNumber: 1,
        title: "Scene 1 — Dark Room",
        description: "Opening hint text shown above the light switch",
        fields: [
          { id: "mll_scene1_hint", label: "Hint Text", type: "text" as const, defaultValue: "Something is waiting for you in the dark..." },
          { id: "mll_video_light_on", label: "Light On Video URL", type: "text" as const, defaultValue: "/videos/LIGHT_ON.mp4" },
          { id: "mll_btn_go_to_book", label: "Go to Book Button Text", type: "text" as const, defaultValue: "Go to Book" },
          { id: "mll_video_book_showing", label: "Book Showing Video URL", type: "text" as const, defaultValue: "/videos/BOOK_SHOWING.mp4" },
          { id: "mll_btn_open_book", label: "Open Book Button Text", type: "text" as const, defaultValue: "Open Book" },
          { id: "mll_video_book_open", label: "Book Open Video URL", type: "text" as const, defaultValue: "/videos/BOOK_OPENING.mp4" },
        ],
      },
      {
        slideNumber: 2,
        title: "Scene 2 — Collage Book",
        description: "The romantic flip book with 4 pages of messages, photos & captions",
        fields: [
          { id: "mll_book_author", label: "Book Author (e.g. by Your Name)", type: "text" as const, defaultValue: "by Your Name" },
          { id: "mll_img1", label: "Page 1 Photo", type: "image" as const, defaultValue: "/templates/my-love-language/collage-1.png" },
          { id: "mll_caption1", label: "Page 1 Photo Caption", type: "text" as const, defaultValue: "The First Meet" },
          { id: "mll_page1", label: "Page 1 Text", type: "textarea" as const, defaultValue: "The moment our eyes first met, the world around us softened. Time slowed, and somewhere deep within me, a quiet voice whispered: this one. This is the one." },
          { id: "mll_img2", label: "Page 2 Photo", type: "image" as const, defaultValue: "/templates/my-love-language/collage-2.png" },
          { id: "mll_caption2", label: "Page 2 Photo Caption", type: "text" as const, defaultValue: "Laughing Together" },
          { id: "mll_page2", label: "Page 2 Text", type: "textarea" as const, defaultValue: "Every laugh we've shared has rewritten my idea of joy. You turn ordinary mornings into something I'd trade kingdoms for. You are my favorite season, my favorite weather, my favorite song." },
          { id: "mll_img3", label: "Page 3 Photo", type: "image" as const, defaultValue: "/templates/my-love-language/collage-3.png" },
          { id: "mll_caption3", label: "Page 3 Photo Caption", type: "text" as const, defaultValue: "Stargazing" },
          { id: "mll_page3", label: "Page 3 Text", type: "textarea" as const, defaultValue: "I've memorized the way your eyes catch the light, the small constellations of freckles, the way your laugh begins. Every detail of you feels like a love letter the universe wrote for me." },
          { id: "mll_img4", label: "Page 4 Photo", type: "image" as const, defaultValue: "/templates/my-love-language/collage-4.png" },
          { id: "mll_caption4", label: "Page 4 Photo Caption", type: "text" as const, defaultValue: "Together Always" },
          { id: "mll_page4", label: "Page 4 Text", type: "textarea" as const, defaultValue: "And so here, on this page, I'm gathering all my courage and all my wonder to ask you the only question that has ever mattered to me. Turn the page, my love." },
        ],
      },
      {
        slideNumber: 3,
        title: "Scene 3 — TV Room",
        description: "Cozy room with a memory video playing on the TV",
        fields: [
          { id: "mll_video_story", label: "Story Video URL", type: "text" as const, defaultValue: "/videos/our-story.mp4" },
          { id: "mll_tv_caption", label: "TV Caption", type: "text" as const, defaultValue: "A moment I never want to forget." },
        ],
      },
      {
        slideNumber: 4,
        title: "Scene 4 — Beach Bottle",
        description: "Shake the phone to open a secret bottle message",
        fields: [
          { id: "mll_shake_hint", label: "Shake Hint Text", type: "text" as const, defaultValue: "Shake your phone to open the bottle... 🍾" },
          { id: "mll_bottle_message", label: "Bottle Message", type: "textarea" as const, defaultValue: "You are the message I've been writing my whole life." },
        ],
      },
      {
        slideNumber: 5,
        title: "Scene 5 — Scratch Card",
        description: "Scratch to reveal the hidden message",
        fields: [
          { id: "mll_scratch_message", label: "Scratch Reveal Message", type: "textarea" as const, defaultValue: "You are my greatest adventure. ❤" },
        ],
      },
      {
        slideNumber: 6,
        title: "Scene 6 — Fireworks",
        description: "Canvas fireworks with overlay text",
        fields: [
          { id: "mll_fireworks_text", label: "Fireworks Overlay Text", type: "text" as const, defaultValue: "Almost there... 🎇" },
        ],
      },
      {
        slideNumber: 7,
        title: "Scene 7 — 3D Ring Box",
        description: "Interactive 3D ring box with proposal question",
        fields: [
          { id: "mll_proposal_question", label: "Proposal Question", type: "text" as const, defaultValue: "Will you be mine? 💍" },
          { id: "mll_no_button_text", label: "'No' Button Text", type: "text" as const, defaultValue: "Not yet..." },
        ],
      },
      {
        slideNumber: 8,
        title: "Scene 8 — Final Love Letter",
        description: "The final letter with wax seal and share button",
        fields: [
          { id: "mll_final_letter", label: "Final Letter Text", type: "textarea" as const, defaultValue: "From the very first moment I saw you, I knew. Through every quiet morning and every loud, beautiful chaos — you were it for me. You are my home, my favorite story, my forever. Forever yours, Your Name" },
        ],
      },
    ],
  },
  {
    id: "raksha-bandhan",
    name: "Raksha Bandhan 🎀",
    tagline: "An interactive Raksha Bandhan microsite: tie the rakhi, light the diyas, flip promise cards & read a heartfelt letter",
    category: "friendship" as const,
    price: 9900,
    visible: true,
    thumbnail: "🎀",
    previewRoute: "/preview/raksha-bandhan",
    createdAt: new Date().toISOString(),
    slides: [
      {
        slideNumber: -1,
        title: "Background Music",
        description: "Plays continuously throughout the website",
        fields: [
          { id: "bg_song_name", label: "Background Song Name", type: "text" as const, defaultValue: "Classic Saffron Tune" },
          { id: "bg_song_url", label: "Background Song URL (.mp3)", type: "text" as const, defaultValue: "" },
        ],
      },
      {
        slideNumber: 0,
        title: "Intro",
        description: "Opening animated greeting with sibling name",
        fields: [
          { id: "rb_sibling_name", label: "Sibling's Name (receiving)", type: "text" as const, defaultValue: "Didi" },
        ],
      },
      {
        slideNumber: 1,
        title: "Tie the Rakhi",
        description: "Interactive drag-thread game — shown tied in preview",
        fields: [],
      },
      {
        slideNumber: 2,
        title: "Apply Tilak 🔴",
        description: "Upload sibling face photo & swipe up on forehead to apply Tilak",
        fields: [
          { id: "rb_face_img",   label: "Sibling Face Photo", type: "image" as const, defaultValue: "/templates/raksha-bandhan/default_brother.png" },
          { id: "rb_tilak_x",    label: "Forehead Spot X % (10 - 90)", type: "text" as const, defaultValue: "50" },
          { id: "rb_tilak_y",    label: "Forehead Spot Y % (10 - 90)", type: "text" as const, defaultValue: "28" },
          { id: "rb_tilak_size", label: "Tilak Size in px (30 - 100)", type: "text" as const, defaultValue: "60" },
        ],
      },
      {
        slideNumber: 3,
        title: "Light the Diyas",
        description: "Tap 5 oil-lamp diyas to light them — shown lit in preview",
        fields: [],
      },
      {
        slideNumber: 4,
        title: "Promise Cards",
        description: "4 flip cards revealing your heartfelt promises",
        fields: [
          { id: "rb_promise1", label: "Promise 1", type: "textarea" as const, defaultValue: "I'll always be\nyour safe space" },
          { id: "rb_promise2", label: "Promise 2", type: "textarea" as const, defaultValue: "I'll protect you,\nalways & forever" },
          { id: "rb_promise3", label: "Promise 3", type: "textarea" as const, defaultValue: "I'll celebrate\nevery win with you" },
          { id: "rb_promise4", label: "Promise 4", type: "textarea" as const, defaultValue: "I'll be there\nin every storm" },
        ],
      },
      {
        slideNumber: 5,
        title: "Letter",
        description: "The final heartfelt Raksha Bandhan letter",
        fields: [
          { id: "rb_sender_name",   label: "Sender's Name (sign-off)", type: "text"     as const, defaultValue: "Your Bhai" },
          { id: "rb_final_message", label: "Final Letter Message",      type: "textarea" as const, defaultValue: "No matter how far life takes us, this thread always finds its way back to you." },
        ],
      },
    ],
  },
  {
    id: "raksha-bandhan-brother",
    name: "Raksha Bandhan — Sister to Brother 🎁",
    tagline: "Heartfelt gift experience with 4 Rakhi choices, multi-photo collage, Bhaiya defaults, & 9:16 poster export",
    category: "friendship" as const,
    price: 9900,
    visible: true,
    badge: "new",
    thumbnail: "🎁",
    previewRoute: "/preview/raksha-bandhan-brother",
    createdAt: new Date().toISOString(),
    slides: [
      {
        slideNumber: -1,
        title: "Background Music",
        description: "Plays continuously throughout the website",
        fields: [
          { id: "bg_song_name", label: "Background Song Name", type: "text" as const, defaultValue: "Classic Saffron Tune" },
          { id: "bg_song_url", label: "Background Song URL (.mp3)", type: "text" as const, defaultValue: "" },
        ],
      },
      {
        slideNumber: 0,
        title: "Intro",
        description: "Opening animated greeting with brother name",
        fields: [
          { id: "rb_sibling_name", label: "Brother's Name (receiving)", type: "text" as const, defaultValue: "Bhaiya" },
        ],
      },
      {
        slideNumber: 1,
        title: "Select Rakhi 🎀",
        description: "Choose from 4 Rakhi options (Diet Coke, Spiderman, Om, Traditional)",
        fields: [
          { id: "rb_selected_rakhi", label: "Selected Rakhi ID", type: "text" as const, defaultValue: "dietcoke" },
        ],
      },
      {
        slideNumber: 2,
        title: "Photo Collage 📸",
        description: "Upload multiple photos for brother-sister memories",
        fields: [
          { id: "rb_collage_img_1", label: "Collage Photo 1", type: "image" as const, defaultValue: "/templates/raksha-bandhan/default_brother.png" },
          { id: "rb_collage_img_2", label: "Collage Photo 2", type: "image" as const, defaultValue: "" },
          { id: "rb_collage_img_3", label: "Collage Photo 3", type: "image" as const, defaultValue: "" },
        ],
      },
      {
        slideNumber: 3,
        title: "Light the Diyas",
        description: "Tap 5 oil-lamp diyas to light them",
        fields: [],
      },
      {
        slideNumber: 4,
        title: "Promise Cards",
        description: "4 flip cards revealing promises for Bhaiya",
        fields: [
          { id: "rb_promise1", label: "Promise 1", type: "textarea" as const, defaultValue: "I'll always save the last slice of pizza for you" },
          { id: "rb_promise2", label: "Promise 2", type: "textarea" as const, defaultValue: "I'll always cover for you when you're late" },
          { id: "rb_promise3", label: "Promise 3", type: "textarea" as const, defaultValue: "I'll always celebrate every one of your big wins" },
          { id: "rb_promise4", label: "Promise 4", type: "textarea" as const, defaultValue: "I'll always be here whenever you need me" },
        ],
      },
      {
        slideNumber: 5,
        title: "Letter",
        description: "The final heartfelt Raksha Bandhan letter for Bhaiya",
        fields: [
          { id: "rb_sender_name",   label: "Sender's Name (sign-off)", type: "text"     as const, defaultValue: "Your Didi" },
          { id: "rb_final_message", label: "Final Letter Message",      type: "textarea" as const, defaultValue: "No matter how much we fight, you'll always be my favorite protector & partner in crime." },
        ],
      },
    ],
  },
];


// ─── LOCALSTORAGE HELPERS ─────────────────────────────────────────────────────

const PRODUCTS_KEY = "egift_products";
const ORDERS_KEY = "egift_orders";
const ADMIN_KEY = "egift_admin_logged_in";

// Products (only stores overrides: visibility + price)
export interface ProductOverride {
  id: string;
  visible?: boolean;
  price?: number;
}

function getProductOverrides(): Record<string, ProductOverride> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(PRODUCTS_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveProductOverride(id: string, data: Partial<ProductOverride>) {
  const overrides = getProductOverrides();
  overrides[id] = { ...overrides[id], id, ...data };
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(overrides));
}

export function getProducts(): Product[] {
  const overrides = getProductOverrides();
  return PRODUCT_REGISTRY.map((p) => ({
    ...p,
    ...(overrides[p.id] || {}),
  }));
}

export function getProduct(id: string): Product | undefined {
  return getProducts().find((p) => p.id === id);
}

export function updateProductVisibility(id: string, visible: boolean) {
  saveProductOverride(id, { visible });
}

export function updateProductPrice(id: string, price: number) {
  saveProductOverride(id, { price });
}

// Orders
function getOrdersRaw(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveOrders(orders: Order[]) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export function getOrders(): Order[] {
  return getOrdersRaw();
}

export function getOrder(id: string): Order | undefined {
  return getOrdersRaw().find((o) => o.id === id);
}

export function getOrdersByProduct(productId: string): Order[] {
  return getOrdersRaw().filter((o) => o.productId === productId);
}

export function createOrder(data: Omit<Order, "id" | "createdAt" | "status" | "customizations">): Order {
  const orders = getOrdersRaw();
  const order: Order = {
    ...data,
    id: `order_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    status: "paid",
    customizations: {},
    createdAt: new Date().toISOString(),
  };
  orders.push(order);
  saveOrders(orders);
  return order;
}

export function updateOrderCustomizations(
  orderId: string,
  customizations: Record<string, string>
) {
  const orders = getOrdersRaw();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx !== -1) {
    orders[idx].customizations = customizations;
    orders[idx].status = "editing";
    saveOrders(orders);
  }
}

export function finalizeOrder(orderId: string) {
  const orders = getOrdersRaw();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx !== -1) {
    orders[idx].status = "finalized";
    orders[idx].finalizedAt = new Date().toISOString();
    saveOrders(orders);
  }
}

// Admin auth (simple password)
export const ADMIN_PASSWORD = "aradhya2024";

export function adminLogin(password: string): boolean {
  if (password === ADMIN_PASSWORD) {
    localStorage.setItem(ADMIN_KEY, "1");
    return true;
  }
  return false;
}

export function adminLogout() {
  localStorage.removeItem(ADMIN_KEY);
}

export function isAdminLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(ADMIN_KEY) === "1";
}

// ─── DISPLAY SECTIONS (Blinkit-style occasion banners) ──────────────────────

export type TemplateType = "sweet-apology" | "birthday-magic" | "birthday-bliss" | "valentine-love" | "anniversary-gold";

export type SectionTheme =
  | "birthday"
  | "birthday_plus"
  | "valentine"
  | "valentine_plus"
  | "love"
  | "love_plus"
  | "friendship"
  | "friendship_plus"
  | "anniversary"
  | "anniversary_plus"
  | "wedding"
  | "wedding_plus"
  | "festival"
  | "festival_plus"
  | "general";

export interface SectionThemeConfig {
  id: SectionTheme;
  label: string;
  emoji: string;
  gradient: string;    // CSS gradient for banner
  accent: string;      // accent color
  bgLight: string;     // card bg
  tagline: string;     // default tagline
  isPremium?: boolean; // full-width themed body with effects
}

export const SECTION_THEMES: SectionThemeConfig[] = [
  { id: "birthday", label: "Birthday", emoji: "🎂🎁🎈🎉", gradient: "linear-gradient(135deg,#FF8C42,#FFD166)", accent: "#FF8C42", bgLight: "#FFF9F0", tagline: "Birthday surprises they'll never forget" },
  { id: "birthday_plus", label: "Birthday++", emoji: "🎂✨🎁🎉", gradient: "linear-gradient(135deg,#FF6B6B,#FFD93D)", accent: "#FF6B6B", bgLight: "#FFF4E6", tagline: "Premium full-theme birthday experience", isPremium: true },
  { id: "valentine", label: "Valentine", emoji: "💕🌹💌💗", gradient: "linear-gradient(135deg,#FF4D6D,#FF758F)", accent: "#E91E63", bgLight: "#FFF0F3", tagline: "Tell them how much you care" },
  { id: "valentine_plus", label: "Valentine++", emoji: "💖🔥🌹✨", gradient: "linear-gradient(135deg,#E80054,#FF5277)", accent: "#E80054", bgLight: "#FFEBF0", tagline: "Premium romantic full-theme design", isPremium: true },
  { id: "love", label: "Love", emoji: "❤️💘💋🫶", gradient: "linear-gradient(135deg,#FF6B6B,#EE5A24)", accent: "#E74C3C", bgLight: "#FFF5F5", tagline: "Express your deepest feelings" },
  { id: "love_plus", label: "Love++", emoji: "❤️🔥💋✨", gradient: "linear-gradient(135deg,#D63031,#FF7675)", accent: "#D63031", bgLight: "#FFEDED", tagline: "Premium deep love full-theme design", isPremium: true },
  { id: "friendship", label: "Friendship", emoji: "🤝🌟😄💛", gradient: "linear-gradient(135deg,#F7B731,#F39C12)", accent: "#F39C12", bgLight: "#FFFEF0", tagline: "Celebrate your bestie" },
  { id: "friendship_plus", label: "Friendship++", emoji: "🤝✨💛🌟", gradient: "linear-gradient(135deg,#E67E22,#D35400)", accent: "#D35400", bgLight: "#FFF7EB", tagline: "Premium full-theme friendship", isPremium: true },
  { id: "anniversary", label: "Anniversary", emoji: "💑💍🥂✨", gradient: "linear-gradient(135deg,#C59B76,#8B6914)", accent: "#B8860B", bgLight: "#FFF8F0", tagline: "Mark the milestones of your love" },
  { id: "anniversary_plus", label: "Anniversary++", emoji: "💍✨🥂💖", gradient: "linear-gradient(135deg,#B33939,#FF5252)", accent: "#B33939", bgLight: "#FFEDED", tagline: "Premium red full-theme anniversary", isPremium: true },
  { id: "wedding", label: "Wedding", emoji: "💒🤵👰💐", gradient: "linear-gradient(135deg,#A8937A,#7A5C3C)", accent: "#8B7355", bgLight: "#FFFDF5", tagline: "Perfect gifts for the big day" },
  { id: "wedding_plus", label: "Wedding++", emoji: "💒✨💍🕊️", gradient: "linear-gradient(135deg,#CCA876,#A67D3D)", accent: "#A67D3D", bgLight: "#FFF8EB", tagline: "Premium golden full-theme wedding", isPremium: true },
  { id: "festival", label: "Festival", emoji: "🎊🪔🎆✨", gradient: "linear-gradient(135deg,#9B59B6,#6C3483)", accent: "#9B59B6", bgLight: "#F8F0FF", tagline: "Festive season specials" },
  { id: "festival_plus", label: "Festival++", emoji: "🎊✨🪔🎆", gradient: "linear-gradient(135deg,#8E44AD,#5B2C6F)", accent: "#5B2C6F", bgLight: "#F5E6FF", tagline: "Premium bright festival full-theme", isPremium: true },
  { id: "general", label: "General", emoji: "✨🎁💝🌈", gradient: "linear-gradient(135deg,#667EEA,#764BA2)", accent: "#667EEA", bgLight: "#F0F4FF", tagline: "Gifts for every occasion" },
];

export function getSectionTheme(id: SectionTheme): SectionThemeConfig {
  return SECTION_THEMES.find(t => t.id === id) || SECTION_THEMES[SECTION_THEMES.length - 1];
}

export interface DisplaySection {
  id: string;
  title: string;
  subtitle?: string;
  theme: SectionTheme;
  productIds: string[]; // which products to show
  visible: boolean;
  order?: number; // for reordering

  // Plus features
  gridChange?: "horizontal" | "vertical";
  countdownEnabled?: boolean;
  countdownEndTime?: string; // ISO string
  titleSize?: "small" | "normal" | "medium" | "big" | "bigger";
  headerStyle?: "normal" | "new";
  headerFontFamily?: string;
  headerCutout?: "none" | "wavy" | "zigzag" | "wavy_stretched" | "circular" | "liquid_wave" | "hearts" | "clouds" | "spikes" | "bubbles" | "castles" | "stamps";
  bottomCutout?: "none" | "wavy" | "zigzag" | "wavy_stretched" | "circular" | "liquid_wave" | "hearts" | "clouds" | "spikes" | "bubbles" | "castles" | "stamps";
  fadeEnabled?: boolean;
  fadeLength?: number;
  bottomSpaceEnabled?: boolean;
  bottomSpacePx?: number;
  headerNote?: string;
  headerNoteEnabled?: boolean;

  // Heading features
  isHeading?: boolean;
  headingColor?: string;
  headingBgType?: "blank" | "solid" | "theme";
  headingBgColor?: string;

  createdAt: string;
}

const SECTIONS_KEY = "egift_sections";

function getSectionsRaw(): DisplaySection[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(SECTIONS_KEY) || "[]");
  } catch { return []; }
}

function saveSections(sections: DisplaySection[]) {
  localStorage.setItem(SECTIONS_KEY, JSON.stringify(sections));
}

export function getSections(): DisplaySection[] {
  return getSectionsRaw().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function getVisibleSections(): DisplaySection[] {
  return getSections().filter(s => s.visible);
}

export function getSection(id: string): DisplaySection | undefined {
  return getSectionsRaw().find(s => s.id === id);
}

export function createSection(data: Omit<DisplaySection, "id" | "createdAt">): DisplaySection {
  const sections = getSectionsRaw();
  const section: DisplaySection = {
    ...data,
    id: `sec_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
    createdAt: new Date().toISOString(),
  };
  sections.push(section);
  saveSections(sections);
  return section;
}

export function updateSection(id: string, updates: Partial<DisplaySection>) {
  const sections = getSectionsRaw();
  const idx = sections.findIndex(s => s.id === id);
  if (idx !== -1) {
    sections[idx] = { ...sections[idx], ...updates };
    saveSections(sections);
  }
}

export function deleteSection(id: string) {
  saveSections(getSectionsRaw().filter(s => s.id !== id));
}
