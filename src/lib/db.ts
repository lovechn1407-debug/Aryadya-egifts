// =============================================
// FIREBASE DATA LAYER
// =============================================
import { ref, get, set, update, remove, query, orderByChild, equalTo, push } from "firebase/database";
import { database } from "./firebase";
import { PRODUCT_REGISTRY } from "./data";
import type { Product, DisplaySection, Order, Coupon } from "./data";

// ── SETTINGS ─────────────────────────────────────────────────────────────────
export interface Marquee {
  id: string;
  text: string;
  color: string;
  order: number;
}

export interface PopupData {
  id: string;
  enabled: boolean;
  order: number;
  contentHtml: string;
  imageUrl?: string;
  linkedProductIds?: string[];
  showCountdown?: boolean;
  countdownTarget?: string;
  frequency: "always" | "once_a_day" | "dont_show_again";
  autoCloseSeconds?: number;
}

export interface Settings {
  maintenance: {
    enabled: boolean;
    title: string;
    description: string;
    note: string;
    countdownEnabled: boolean;
    countdownTarget: string;
  };
  marquees?: Marquee[];
  popups?: PopupData[];
  contactEmail?: string;
  showContactEmail?: boolean;
  contactPhone?: string;
  showContactPhone?: boolean;
  contactAddress?: string;
  showContactAddress?: boolean;
  emailServiceBuy?: boolean;
  emailServiceFinalize?: boolean;
  faviconUrl?: string;
  logoUrl?: string;
  whiteLogoUrl?: string;
  businessName?: string;
  businessEntity?: string;
  // Social Media
  instagramUrl?: string;
  showInstagram?: boolean;
  youtubeUrl?: string;
  showYoutube?: boolean;
  linkedinUrl?: string;
  showLinkedin?: boolean;
  facebookUrl?: string;
  showFacebook?: boolean;
  // Checkout Settings
  paymentMode?: "pre-pay" | "post-pay";
  enableLinkAds?: boolean;
  enableBannerAds?: boolean;
  // (Legacy field, kept for backwards compatibility if needed)
  unlockAdType?: "link" | "banner";
  
  // Rate Limiting Settings
  rateLimitAuthMaxIP?: number;
  rateLimitAuthMaxAccount?: number;
  rateLimitAuthWindowMs?: number;
  rateLimitPublicMax?: number;
  rateLimitPublicWindowMs?: number;
  rateLimitAuthUserMax?: number;
  rateLimitAuthUserWindowMs?: number;
  // Authentication Settings
  authGoogleEnabled?: boolean;
  authPhoneEnabled?: boolean;
  whatsappBotUrl?: string;
  whatsappBotSecret?: string;
  whatsappOtpEnabled?: boolean;
}

export async function getSettingsDB(): Promise<Settings> {
  const snap = await get(ref(database, "settings"));
  if (snap.exists()) {
    const val = snap.val() as Settings;
    if (val.showContactEmail === undefined) val.showContactEmail = true;
    if (val.showContactPhone === undefined) val.showContactPhone = true;
    if (val.showContactAddress === undefined) val.showContactAddress = true;
    if (val.showInstagram === undefined) val.showInstagram = true;
    if (val.showYoutube === undefined) val.showYoutube = true;
    if (val.showLinkedin === undefined) val.showLinkedin = true;
    if (val.showFacebook === undefined) val.showFacebook = true;
    if (!val.businessName) val.businessName = "Aradhya E-Giftings";
    if (!val.businessEntity) val.businessEntity = "AS-Studios";
    if (!val.paymentMode) val.paymentMode = "pre-pay";
    if (val.enableLinkAds === undefined) val.enableLinkAds = true;
    if (val.enableBannerAds === undefined) val.enableBannerAds = false;
    return val;
  }
  return {
    maintenance: {
      enabled: false,
      title: "Under Maintenance",
      description: "We are currently upgrading our platform. Please check back later.",
      note: "",
      countdownEnabled: false,
      countdownTarget: ""
    },
    contactEmail: "lovechn1407@gmail.com",
    showContactEmail: true,
    contactPhone: "8383090874",
    showContactPhone: true,
    contactAddress: "main site :",
    showContactAddress: true,
    emailServiceBuy: true,
    emailServiceFinalize: true,
    businessName: "Aradhya E-Giftings",
    businessEntity: "AS-Studios",
    paymentMode: "pre-pay",
    enableLinkAds: true,
    enableBannerAds: false,
    rateLimitAuthMaxIP: 5,
    rateLimitAuthMaxAccount: 5,
    rateLimitAuthWindowMs: 900000,
    rateLimitPublicMax: 30,
    rateLimitPublicWindowMs: 60000,
    rateLimitAuthUserMax: 100,
    rateLimitAuthUserWindowMs: 60000
  };
}

export async function saveSettingsDB(settings: Settings): Promise<void> {
  await set(ref(database, "settings"), settings);
}

// ── PRODUCT OVERRIDES (price / visible / rating stored in Firebase) ──────────
export interface ProductOverride {
  id: string;
  name?: string;
  visible?: boolean;
  price?: number;
  cuttedPrice?: number;
  badge?: "hot" | "new" | "specials" | "premium" | "";
  rating?: number;
  reviewCount?: number;
  stockLeft?: number;
  showStock?: boolean;
  previewUrl?: string;
  previewData?: Record<string, string>;
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

export async function getProductsDB(): Promise<Product[]> {
  const snap = await get(ref(database, "productOverrides"));
  const overrides: Record<string, ProductOverride> = snap.exists() ? snap.val() : {};
  return PRODUCT_REGISTRY.map(p => ({ ...p, ...(overrides[p.id] || {}) }));
}

export async function getProductDB(id: string): Promise<Product | null> {
  const all = await getProductsDB();
  return all.find(p => p.id === id) ?? null;
}

export async function updateProductOverrideDB(id: string, changes: Partial<ProductOverride>): Promise<void> {
  await update(ref(database, `productOverrides/${id}`), { id, ...changes });
}

// ── SECTIONS ─────────────────────────────────────────────────────────────────
export async function getSectionsDB(): Promise<DisplaySection[]> {
  const snap = await get(ref(database, "sections"));
  if (!snap.exists()) return [];
  return Object.values(snap.val() as Record<string, DisplaySection>);
}

export async function getVisibleSectionsDB(): Promise<DisplaySection[]> {
  const all = await getSectionsDB();
  return all.filter(s => s.visible).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export async function saveSectionDB(section: DisplaySection): Promise<void> {
  await set(ref(database, `sections/${section.id}`), section);
}

export async function updateSectionDB(id: string, changes: Partial<DisplaySection>): Promise<void> {
  await update(ref(database, `sections/${id}`), changes);
}

export async function deleteSectionDB(id: string): Promise<void> {
  await remove(ref(database, `sections/${id}`));
}

// ── USER PROFILES ────────────────────────────────────────────────────────────

export interface UserProfile {
  uid: string;
  name?: string;
  email?: string;
  phone?: string;
  photoURL?: string;
  createdAt: number;
}

export async function getUserProfileDB(uid: string): Promise<UserProfile | null> {
  const snap = await get(ref(database, `users/${uid}`));
  return snap.exists() ? snap.val() : null;
}

export async function saveUserProfileDB(uid: string, data: Partial<UserProfile>): Promise<void> {
  const current = await getUserProfileDB(uid);
  const updated: UserProfile = {
    uid,
    createdAt: Date.now(),
    ...current,
    ...data,
  };
  await set(ref(database, `users/${uid}`), updated);
}

// ── ORDERS ────────────────────────────────────────────────────────────────────
export async function createPendingOrderDB(data: {
  productId: string;
  productName: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  userId?: string;
  amount: number;
  couponCode?: string;
  discountAmount?: number;
  affiliateCouponCreatorId?: string;
  commissionAmount?: number;
}): Promise<Order> {
  const settings = await getSettingsDB();
  const paymentMode = settings.paymentMode || "pre-pay";

  const id = `order_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const order: Order = {
    id,
    productId: data.productId,
    productName: data.productName,
    buyerName: data.buyerName || "Unknown",
    buyerEmail: data.buyerEmail || "Unknown",
    buyerPhone: data.buyerPhone || "Unknown",
    userId: data.userId || undefined,
    amount: data.amount,
    status: "pending",
    customizations: {},
    createdAt: new Date().toISOString(),
    paymentMode,
    // Only include optional fields if they have actual values
    ...(data.couponCode ? { couponCode: data.couponCode } : {}),
    ...(data.discountAmount !== undefined && data.discountAmount > 0
      ? { discountAmount: data.discountAmount }
      : {}),
  };
  await set(ref(database, `orders/${id}`), order);
  return order;
}

export async function getOrdersByUserIdDB(userId: string): Promise<Order[]> {
  const snap = await get(query(ref(database, "orders"), orderByChild("userId"), equalTo(userId)));
  if (!snap.exists()) return [];
  
  const orders: Order[] = [];
  snap.forEach(child => { orders.push(child.val()); });
  return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function updateOrderLastOpenedDB(orderId: string): Promise<void> {
  await update(ref(database, `orders/${orderId}`), {
    lastOpenedAt: new Date().toISOString()
  });
}

export async function createOrderDB(data: {
  productId: string;
  productName: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  amount: number;
}): Promise<Order> {
  const settings = await getSettingsDB();
  const paymentMode = settings.paymentMode || "pre-pay";

  const id = `order_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const order: Order = {
    id, ...data,
    status: "paid",
    customizations: {},
    createdAt: new Date().toISOString(),
    paymentMode,
  };
  await set(ref(database, `orders/${id}`), order);
  return order;
}

export async function getOrderDB(id: string): Promise<Order | null> {
  const snap = await get(ref(database, `orders/${id}`));
  return snap.exists() ? (snap.val() as Order) : null;
}

export async function getAllOrdersDB(): Promise<Order[]> {
  const snap = await get(ref(database, "orders"));
  if (!snap.exists()) return [];
  return Object.values(snap.val() as Record<string, Order>)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getOrdersByProductDB(productId: string): Promise<Order[]> {
  const all = await getAllOrdersDB();
  return all.filter(o => o.productId === productId);
}

export async function updateOrderCustomizationsDB(
  orderId: string,
  customizations: Record<string, string>
): Promise<void> {
  await update(ref(database, `orders/${orderId}`), { customizations, status: "editing" });
}

export async function finalizeOrderDB(orderId: string): Promise<void> {
  await update(ref(database, `orders/${orderId}`), {
    status: "finalized",
    finalizedAt: new Date().toISOString(),
  });
}

export async function updateOrderStatusDB(
  orderId: string,
  status: Order["status"],
  extra?: Partial<Order>
): Promise<void> {
  await update(ref(database, `orders/${orderId}`), { status, ...extra });
}

export async function updateOrderCouponDB(
  orderId: string,
  couponCode: string,
  discountAmount: number
): Promise<void> {
  await update(ref(database, `orders/${orderId}`), { couponCode, discountAmount });
}

// ── BUYER LOGIN LOOKUP ────────────────────────────────────────────────────────
export async function getOrdersByBuyerDB(phone: string, email: string): Promise<Order[]> {
  const all = await getAllOrdersDB();
  const ph = phone.trim().replace(/\D/g, "").slice(-10);
  const em = email.toLowerCase().trim();
  return all.filter(o => {
    const op = o.buyerPhone.replace(/\D/g, "").slice(-10);
    return op === ph && o.buyerEmail.toLowerCase().trim() === em;
  });
}

// ── COUPONS ───────────────────────────────────────────────────────────────────
export async function getCouponsDB(): Promise<Coupon[]> {
  const snap = await get(ref(database, "coupons"));
  if (!snap.exists()) return [];
  return Object.values(snap.val() as Record<string, Coupon>);
}

export async function getCouponDB(id: string): Promise<Coupon | null> {
  const snap = await get(ref(database, `coupons/${id.toUpperCase()}`));
  return snap.exists() ? (snap.val() as Coupon) : null;
}

export async function saveCouponDB(coupon: Coupon): Promise<void> {
  await set(ref(database, `coupons/${coupon.id.toUpperCase()}`), coupon);
}

export async function deleteCouponDB(id: string): Promise<void> {
  await remove(ref(database, `coupons/${id.toUpperCase()}`));
}

// ── SONGS ────────────────────────────────────────────────────────────────────
import { Song } from "./data";

export async function getSongsDB(): Promise<Song[]> {
  const snap = await get(ref(database, "songs"));
  if (!snap.exists()) return [];
  return Object.values(snap.val() as Record<string, Song>);
}

export async function getSongDB(id: string): Promise<Song | null> {
  const snap = await get(ref(database, `songs/${id}`));
  return snap.exists() ? (snap.val() as Song) : null;
}

export async function saveSongDB(song: Song): Promise<void> {
  await set(ref(database, `songs/${song.id}`), song);
}

export async function deleteSongDB(id: string): Promise<void> {
  await remove(ref(database, `songs/${id}`));
}

// ── FAQ DATABASE FUNCTIONS ───────────────────────────────────────────────────
export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  order: number;
  visible: boolean;
  createdAt: string;
}

export async function getFAQsDB(): Promise<FAQItem[]> {
  const snap = await get(ref(database, "faqs"));
  if (!snap.exists()) {
    // Default seeded FAQs
    const defaultFaqs: FAQItem[] = [
      {
        id: "faq_1",
        question: "How do I personalize my purchased e-gift?",
        answer: "After completing your order, you will instantly access our premium Web Editor. Here, you can change images, write paragraphs, customize greetings, choose music tracks, and play with cute templates! When finalized, you'll receive a live shareable link to send to your loved ones.",
        order: 1,
        visible: true,
        createdAt: new Date().toISOString()
      },
      {
        id: "faq_2",
        question: "How does the recipient open and view the gift?",
        answer: "The gift lives on a beautiful, secure, live URL (e.g., aradhya-egifts.com/view/order_id). You can copy the unique link and share it over WhatsApp, Instagram, Email, or SMS. When they click it, the customized web experience opens instantly with smooth animations, dynamic slide pages, interactive matches, and sweet background music playing automatically!",
        order: 2,
        visible: true,
        createdAt: new Date().toISOString()
      },
      {
        id: "faq_3",
        question: "Can I edit the customizations later even after sharing?",
        answer: "Yes, absolutely! You can go to the 'My Orders' portal in the header at any time, log in using your phone and email, and re-open the Web Editor to make edits to any slide, photo, or music track. The changes will update instantly on the live link without needing a new URL!",
        order: 3,
        visible: true,
        createdAt: new Date().toISOString()
      },
      {
        id: "faq_4",
        question: "Is the music playing fully supported on mobile phones?",
        answer: "Yes! Our platform uses highly optimized, cross-device HTML5 audio players that run smoothly on all iOS Safari browsers, Android Chrome versions, iPads, and desktops, ensuring zero silent experiences.",
        order: 4,
        visible: true,
        createdAt: new Date().toISOString()
      }
    ];
    // Write defaults to database so it exists
    for (const faq of defaultFaqs) {
      await set(ref(database, `faqs/${faq.id}`), faq);
    }
    return defaultFaqs;
  }
  return Object.values(snap.val() as Record<string, FAQItem>).sort((a, b) => a.order - b.order);
}

export async function saveFAQDB(faq: FAQItem): Promise<void> {
  await set(ref(database, `faqs/${faq.id}`), faq);
}

export async function deleteFAQDB(id: string): Promise<void> {
  await remove(ref(database, `faqs/${id}`));
}

// ── CUSTOMER REVIEWS DATABASE FUNCTIONS ───────────────────────────────────────
export interface CustomerReview {
  id: string;
  buyerName: string;
  rating: number; // 1 to 5 stars
  screenshotUrl: string; // Dynamic message screenshot
  order: number;
  visible: boolean;
  createdAt: string;
}

export async function getReviewsDB(): Promise<CustomerReview[]> {
  const snap = await get(ref(database, "reviews"));
  if (!snap.exists()) {
    // Standard default seeded review
    const defaultReviews: CustomerReview[] = [
      {
        id: "rev_1",
        buyerName: "Rahul Sharma",
        rating: 5,
        screenshotUrl: "https://images.unsplash.com/photo-1596524430615-b46475ddff6e?auto=format&fit=crop&w=600",
        order: 1,
        visible: true,
        createdAt: new Date().toISOString()
      }
    ];
    for (const r of defaultReviews) {
      await set(ref(database, `reviews/${r.id}`), r);
    }
    return defaultReviews;
  }
  return Object.values(snap.val() as Record<string, CustomerReview>).sort((a, b) => a.order - b.order);
}

export async function saveReviewDB(review: CustomerReview): Promise<void> {
  await set(ref(database, `reviews/${review.id}`), review);
}

export async function deleteReviewDB(id: string): Promise<void> {
  await remove(ref(database, `reviews/${id}`));
}

// ── ANALYTICS ─────────────────────────────────────────────────────────────────
export interface AnalyticsEvent {
  id: string;
  sessionId: string; // Anonymous ID stored in localStorage
  eventType: string; // e.g. 'page_view', 'product_click', 'checkout_step', 'dropoff'
  eventData: Record<string, any>;
  timestamp: string; // ISO string
}

export async function logAnalyticsEventDB(event: Omit<AnalyticsEvent, "id" | "timestamp">): Promise<void> {
  const id = `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const timestamp = new Date().toISOString();
  const fullEvent: AnalyticsEvent = { ...event, id, timestamp };
  await set(ref(database, `analytics/${id}`), fullEvent);
}

export async function getAnalyticsEventsDB(): Promise<AnalyticsEvent[]> {
  const snap = await get(ref(database, "analytics"));
  if (!snap.exists()) return [];
  return Object.values(snap.val() as Record<string, AnalyticsEvent>)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

// ── VIDEO LIBRARY DATABASE FUNCTIONS ─────────────────────────────────────────
export interface LibraryVideo {
  id: string;
  name: string;
  url: string;
  createdAt: string;
}

export async function getLibraryVideosDB(): Promise<LibraryVideo[]> {
  const snap = await get(ref(database, "libraryVideos"));
  if (!snap.exists()) {
    const defaults: LibraryVideo[] = [
      {
        id: "vid_500_days",
        name: "500 Days Of Summer (AMV)",
        url: "/videos/500_days_of_summer.mp4",
        createdAt: new Date().toISOString()
      },
      {
        id: "vid_dandelions",
        name: "Dandelions Spiderman (AMV)",
        url: "/videos/dandelions_spiderman.mp4",
        createdAt: new Date().toISOString()
      },
      {
        id: "vid_ishq",
        name: "Ishq Spiderman (AMV)",
        url: "/videos/ishq_spiderman.mp4",
        createdAt: new Date().toISOString()
      },
      {
        id: "vid_oomahi",
        name: "Oo Mahi Dr Strange (AMV)",
        url: "/videos/oomahi_drstrange.mp4",
        createdAt: new Date().toISOString()
      }
    ];
    for (const v of defaults) {
      await set(ref(database, `libraryVideos/${v.id}`), v);
    }
    return defaults;
  }
  return Object.values(snap.val() as Record<string, LibraryVideo>)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function saveLibraryVideoDB(video: LibraryVideo): Promise<void> {
  await set(ref(database, `libraryVideos/${video.id}`), video);
}

export async function deleteLibraryVideoDB(id: string): Promise<void> {
  await remove(ref(database, `libraryVideos/${id}`));
}

// ── CHAT SUPPORT ─────────────────────────────────────────────────────────────
export interface ChatMeta {
  id: string;
  name: string;
  email: string;
  status: "open" | "closed";
  createdAt: number;
  lastMessageAt: number;
  lastMessage: string;
  unreadByAdmin: number;
  unreadByUser: number;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "admin";
  text: string;
  timestamp: number;
  replyToId?: string;
  replyToText?: string;
  replyToSender?: "user" | "admin";
}

export async function createChatSessionDB(name: string, email: string): Promise<string> {
  const chatId = `chat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const now = Date.now();
  const meta: Omit<ChatMeta, "id"> = {
    name,
    email,
    status: "open",
    createdAt: now,
    lastMessageAt: now,
    lastMessage: "",
    unreadByAdmin: 0,
    unreadByUser: 0,
  };
  await set(ref(database, `chats/${chatId}/meta`), meta);
  return chatId;
}

export async function getChatSessionDB(chatId: string): Promise<ChatMeta | null> {
  const snap = await get(ref(database, `chats/${chatId}/meta`));
  if (!snap.exists()) return null;
  return { id: chatId, ...snap.val() } as ChatMeta;
}

export async function getAllChatsDB(): Promise<ChatMeta[]> {
  const snap = await get(ref(database, "chats"));
  if (!snap.exists()) return [];
  const raw = snap.val() as Record<string, { meta: Omit<ChatMeta, "id"> }>;
  return Object.entries(raw)
    .map(([id, val]) => ({ id, ...val.meta }))
    .sort((a, b) => b.lastMessageAt - a.lastMessageAt);
}

export async function getChatMessagesDB(chatId: string): Promise<ChatMessage[]> {
  const snap = await get(ref(database, `chats/${chatId}/messages`));
  if (!snap.exists()) return [];
  return Object.entries(snap.val() as Record<string, Omit<ChatMessage, "id">>)
    .map(([id, val]) => ({ id, ...val }))
    .sort((a, b) => a.timestamp - b.timestamp);
}

export async function sendChatMessageDB(
  chatId: string,
  sender: "user" | "admin",
  text: string,
  replyTo?: { id: string; text: string; sender: "user" | "admin" }
): Promise<void> {
  const now = Date.now();
  const msgRef = push(ref(database, `chats/${chatId}/messages`));
  const msg: Omit<ChatMessage, "id"> = {
    sender,
    text,
    timestamp: now,
    ...(replyTo ? { replyToId: replyTo.id, replyToText: replyTo.text, replyToSender: replyTo.sender } : {}),
  };
  await set(msgRef, msg);
  // Update meta
  const updates: Record<string, unknown> = {
    [`chats/${chatId}/meta/lastMessageAt`]: now,
    [`chats/${chatId}/meta/lastMessage`]: text.slice(0, 80),
  };
  if (sender === "user") {
    const snap = await get(ref(database, `chats/${chatId}/meta/unreadByAdmin`));
    updates[`chats/${chatId}/meta/unreadByAdmin`] = ((snap.val() as number) || 0) + 1;
  } else {
    const snap = await get(ref(database, `chats/${chatId}/meta/unreadByUser`));
    updates[`chats/${chatId}/meta/unreadByUser`] = ((snap.val() as number) || 0) + 1;
  }
  await update(ref(database), updates);
}

export async function endChatSessionDB(chatId: string): Promise<void> {
  await update(ref(database, `chats/${chatId}/meta`), { status: "closed" });
}

export async function markChatReadDB(chatId: string, by: "admin" | "user"): Promise<void> {
  const field = by === "admin" ? "unreadByAdmin" : "unreadByUser";
  await update(ref(database, `chats/${chatId}/meta`), { [field]: 0 });
}

// ── AFFILIATE PROGRAM — CREATORS ─────────────────────────────────────────────
export interface Creator {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  photoURL?: string;
  googleId: string;
  instagramHandle?: string;
  youtubeHandle?: string;
  otherHandle?: string;
  totalReferrals: number; // count of paid orders through their coupons
  totalEarningsPaise: number; // total commission earned (in paise)
  totalPaidPaise: number; // total payouts made (in paise)
  registeredAt: string;
}

export async function getCreatorDB(uid: string): Promise<Creator | null> {
  const snap = await get(ref(database, `creators/${uid}`));
  return snap.exists() ? (snap.val() as Creator) : null;
}

export async function saveCreatorDB(creator: Creator): Promise<void> {
  await set(ref(database, `creators/${creator.uid}`), creator);
}

export async function updateCreatorDB(uid: string, changes: Partial<Creator>): Promise<void> {
  await update(ref(database, `creators/${uid}`), changes);
}

export async function getAllCreatorsDB(): Promise<Creator[]> {
  const snap = await get(ref(database, "creators"));
  if (!snap.exists()) return [];
  return Object.values(snap.val() as Record<string, Creator>)
    .sort((a, b) => b.totalReferrals - a.totalReferrals);
}

/**
 * Atomically increments a creator's totalEarnings and totalReferrals.
 * Called after a successful payment on an affiliate coupon order.
 */
export async function creditCreatorCommissionDB(
  uid: string,
  commissionAmountPaise: number
): Promise<void> {
  const creator = await getCreatorDB(uid);
  if (!creator) return;
  await update(ref(database, `creators/${uid}`), {
    totalEarningsPaise: (creator.totalEarningsPaise || 0) + commissionAmountPaise,
    totalReferrals: (creator.totalReferrals || 0) + 1,
  });
}

// ── AFFILIATE PROGRAM — PAYOUTS ───────────────────────────────────────────────
export interface Payout {
  id: string;
  creatorId: string;
  creatorName: string;
  amountPaise: number;
  status: "pending" | "paid";
  method?: string; // e.g. "UPI", "Bank Transfer"
  reference?: string; // UPI transaction ID, etc.
  note?: string;
  createdAt: string;
  paidAt?: string;
}

export async function createPayoutDB(data: Omit<Payout, "id">): Promise<Payout> {
  const id = `payout_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const payout: Payout = { ...data, id };
  await set(ref(database, `payouts/${id}`), payout);
  return payout;
}

export async function getPayoutsByCreatorDB(creatorId: string): Promise<Payout[]> {
  const snap = await get(ref(database, "payouts"));
  if (!snap.exists()) return [];
  return Object.values(snap.val() as Record<string, Payout>)
    .filter(p => p.creatorId === creatorId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getAllPayoutsDB(): Promise<Payout[]> {
  const snap = await get(ref(database, "payouts"));
  if (!snap.exists()) return [];
  return Object.values(snap.val() as Record<string, Payout>)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function markPayoutPaidDB(payoutId: string, reference?: string): Promise<void> {
  await update(ref(database, `payouts/${payoutId}`), {
    status: "paid",
    paidAt: new Date().toISOString(),
    ...(reference ? { reference } : {}),
  });
  // Also update creator's totalPaid
  const payout = await get(ref(database, `payouts/${payoutId}`));
  if (payout.exists()) {
    const p = payout.val() as Payout;
    const creator = await getCreatorDB(p.creatorId);
    if (creator) {
      await update(ref(database, `creators/${p.creatorId}`), {
        totalPaidPaise: (creator.totalPaidPaise || 0) + p.amountPaise,
      });
    }
  }
}

// ── AFFILIATE PROGRAM — MILESTONES ────────────────────────────────────────────
export interface AffiliateMilestone {
  id: string;
  referrals: number; // threshold to unlock
  bonusPercentage: number; // informational bonus % shown to creator
  label: string;
  order: number;
}

export async function getMilestonesDB(): Promise<AffiliateMilestone[]> {
  const snap = await get(ref(database, "affiliateProgram/milestones"));
  if (!snap.exists()) return [];
  return Object.values(snap.val() as Record<string, AffiliateMilestone>)
    .sort((a, b) => a.referrals - b.referrals);
}

export async function saveMilestoneDB(milestone: AffiliateMilestone): Promise<void> {
  await set(ref(database, `affiliateProgram/milestones/${milestone.id}`), milestone);
}

export async function deleteMilestoneDB(id: string): Promise<void> {
  await remove(ref(database, `affiliateProgram/milestones/${id}`));
}

// ── AFFILIATE PROGRAM — REWARD MISSIONS ──────────────────────────────────────
export interface AffiliateReward {
  id: string;
  referrals: number; // threshold to unlock
  rewardAmountPaise: number; // bonus payout in paise
  label: string;
  description: string;
  order: number;
}

export async function getRewardsDB(): Promise<AffiliateReward[]> {
  const snap = await get(ref(database, "affiliateProgram/rewards"));
  if (!snap.exists()) return [];
  return Object.values(snap.val() as Record<string, AffiliateReward>)
    .sort((a, b) => a.referrals - b.referrals);
}

export async function saveRewardDB(reward: AffiliateReward): Promise<void> {
  await set(ref(database, `affiliateProgram/rewards/${reward.id}`), reward);
}

export async function deleteRewardDB(id: string): Promise<void> {
  await remove(ref(database, `affiliateProgram/rewards/${id}`));
}
