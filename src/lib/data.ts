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
  category: "birthday" | "proposal" | "anniversary" | "friendship" | "love";
  price: number; // in INR paise (multiply by 100)
  cuttedPrice?: number; // in INR paise (optional, for strikethrough display)
  badge?: "hot" | "new" | "specials" | "premium" | ""; // Product badge overlay
  visible: boolean;
  thumbnail: string; // emoji or image url
  previewRoute: string; // e.g. "/preview/birthday-magic-box"
  slides: SlideDefinition[];
  createdAt: string;
}

export interface Order {
  id: string;
  productId: string;
  productName: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  amount: number;
  status: "pending" | "paid" | "editing" | "finalized";
  customizations: Record<string, string>; // fieldId -> value
  finalizedAt?: string;
  couponCode?: string; // Optional coupon code used
  discountAmount?: number; // Optional discount applied in paise
  createdAt: string;
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
}

export interface Song {
  id: string;
  name: string;
  description: string;
  url: string;
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
  subtitle: string;
  theme: SectionTheme;
  productIds: string[]; // which products appear in this section
  visible: boolean;
  order: number; // sort order
  countdownEnabled?: boolean;
  countdownEndTime?: string;
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
  return getSectionsRaw().sort((a, b) => a.order - b.order);
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
