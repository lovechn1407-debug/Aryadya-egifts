"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getSettingsDB } from "@/lib/db";
import type { Settings } from "@/lib/db";

/* ──────────────────────────────────────────────
   SVG Icon Components
   ────────────────────────────────────────────── */
function ScrollIcon({ size = 22, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function ShieldLockIcon({ size = 22, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <rect x="9" y="10" width="6" height="5" rx="1" />
      <path d="M10 10V8a2 2 0 1 1 4 0v2" />
    </svg>
  );
}

function WalletIcon({ size = 22, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  );
}

function UndoIcon({ size = 22, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  );
}

function AlertTriangleIcon({ size = 22, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function ShieldBadgeIcon({ size = 18, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

/* ── Section definitions ── */
const SECTIONS = [
  { id: "terms", label: "Terms & Conditions", Icon: ScrollIcon },
  { id: "privacy", label: "Privacy Policy", Icon: ShieldLockIcon },
  { id: "refund", label: "Refund Policy", Icon: WalletIcon },
  { id: "return", label: "Return Policy", Icon: UndoIcon },
  { id: "disclaimer", label: "Disclaimer", Icon: AlertTriangleIcon },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

/* ── Shared styling helpers ── */
const heading2Style: React.CSSProperties = {
  fontSize: "clamp(22px, 4vw, 30px)",
  fontWeight: 900,
  color: "#0F172A",
  marginBottom: 0,
  letterSpacing: -0.5,
  fontFamily: "'Nunito', sans-serif",
};

const heading3Style: React.CSSProperties = {
  fontSize: "clamp(14px, 2.5vw, 1.15rem)",
  fontWeight: 800,
  color: "#1E293B",
  marginTop: 28,
  marginBottom: 10,
  fontFamily: "'Nunito', sans-serif",
};

const paragraphStyle: React.CSSProperties = {
  color: "#475569",
  lineHeight: 1.75,
  marginBottom: 14,
  fontSize: "clamp(13px, 2vw, 14px)",
};

const ulStyle: React.CSSProperties = {
  color: "#475569",
  lineHeight: 1.75,
  paddingLeft: 20,
  marginBottom: 14,
  fontSize: "clamp(13px, 2vw, 14px)",
};

const liStyle: React.CSSProperties = {
  marginBottom: 8,
};

const LAST_UPDATED = "June 2, 2025";
let BUSINESS_NAME = "Aradhya E-Giftings";
let BUSINESS_ENTITY = "AS-Studios";

/* ────────────────────────────────────────────────────────────
   SECTION CONTENT COMPONENTS
   ──────────────────────────────────────────────────────────── */

function TermsContent({ siteUrl, contactEmail }: { siteUrl: string; contactEmail: string }) {
  return (
    <section id="terms">
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <span style={{ display: "inline-flex", color: "#7C3AED" }}><ScrollIcon size={26} /></span>
        <h2 style={heading2Style}>Terms &amp; Conditions</h2>
      </div>
      <p style={{ color: "#7C3AED", fontSize: 12, fontWeight: 700, marginBottom: 20 }}>Last Updated: {LAST_UPDATED}</p>

      <h3 style={heading3Style}>1. Introduction &amp; Acceptance of Terms</h3>
      <p style={paragraphStyle}>
        Welcome to {BUSINESS_NAME} (&ldquo;we,&rdquo; &ldquo;our,&rdquo; &ldquo;us&rdquo;), a product of {BUSINESS_ENTITY}. These Terms and Conditions (&ldquo;Terms&rdquo;) govern your access to and use of our website located at{" "}
        <a href={siteUrl} style={{ color: "#7C3AED", textDecoration: "none", fontWeight: 700 }}>{siteUrl}</a>{" "}
        and all related services, features, content, and applications (collectively, the &ldquo;Platform&rdquo;).
      </p>
      <p style={paragraphStyle}>
        By accessing, browsing, or using the Platform in any manner, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree with any part of these Terms, you must immediately discontinue the use of the Platform.
      </p>

      <h3 style={heading3Style}>2. Description of Services</h3>
      <p style={paragraphStyle}>
        {BUSINESS_NAME} provides a platform for creating, personalizing, and sharing premium interactive digital greeting cards, digital surprise webpages, and microsites (collectively referred to as &ldquo;E-Gifts&rdquo; or &ldquo;Digital Gifts&rdquo;). Our services include but are not limited to:
      </p>
      <ul style={ulStyle}>
        <li style={liStyle}><strong>Digital Gift Template Selection:</strong> Browsing and selecting from a curated collection of professionally designed, fully animated digital gift templates for various occasions including birthdays, anniversaries, proposals, confessions, farewells, and more.</li>
        <li style={liStyle}><strong>Live Preview:</strong> Previewing the selected template before purchase to view its complete look, feel, and interactive features.</li>
        <li style={liStyle}><strong>Secure One-Time Payment:</strong> Making a single, non-recurring payment via secure payment gateways (UPI, Credit/Debit Card, Net Banking, Wallets) to purchase a selected template.</li>
        <li style={liStyle}><strong>Personalisation via Live Editor:</strong> After purchase, customising the E-Gift with personal names, messages, images, audio tracks, and other content through our intuitive Live Editor.</li>
        <li style={liStyle}><strong>Finalisation &amp; Sharing:</strong> Generating a unique, permanent URL and a scannable QR code to share the finalized E-Gift with the intended recipient via WhatsApp, email, social media, or direct link sharing.</li>
      </ul>

      <h3 style={heading3Style}>3. User Eligibility</h3>
      <p style={paragraphStyle}>
        To use the Platform, you must be at least 13 years of age. If you are a minor (under 18 years of age), you must have the consent and supervision of a parent or legal guardian who agrees to be bound by these Terms on your behalf. By using the Platform, you represent and warrant that you meet these eligibility requirements.
      </p>

      <h3 style={heading3Style}>4. User Accounts &amp; Orders</h3>
      <p style={paragraphStyle}>
        Our Platform does not require traditional user account registration. Instead, each purchase generates a unique order identified by an Order ID and secured with a buyer-provided passkey. You are solely responsible for:
      </p>
      <ul style={ulStyle}>
        <li style={liStyle}>Safeguarding your Order ID and passkey. Anyone with access to these credentials can access and edit your E-Gift.</li>
        <li style={liStyle}>The accuracy of all personal information provided during checkout, including your email address and phone number used for order confirmations.</li>
        <li style={liStyle}>Ensuring the content you upload and customise within your E-Gift complies with applicable laws and these Terms.</li>
      </ul>

      <h3 style={heading3Style}>5. User Generated Content (UGC)</h3>
      <p style={paragraphStyle}>
        Our service allows you to input custom names, write personal messages, embed audio links (e.g., from YouTube, Spotify, or SoundCloud), and upload images to personalize your E-Gifts. Regarding User Generated Content:
      </p>
      <ul style={ulStyle}>
        <li style={liStyle}><strong>Sole Responsibility:</strong> You are solely responsible for all content you upload, submit, or embed into your E-Gift. You must ensure that you have all necessary rights, licenses, and permissions for any content you use.</li>
        <li style={liStyle}><strong>Prohibited Content:</strong> You must not upload, embed, or include any content that is: (a) copyrighted material without proper authorization, (b) defamatory, obscene, pornographic, or sexually explicit, (c) promoting violence, hatred, discrimination, or illegal activities, (d) containing personally identifiable information of third parties without their consent, (e) containing malicious code, malware, viruses, or any harmful digital content.</li>
        <li style={liStyle}><strong>Audio Links &amp; Third-Party Embeds:</strong> Embedded audio links or media must respect the terms of service of the respective third-party platforms (YouTube, Spotify, etc.). We are not responsible for the availability or legality of third-party embedded content.</li>
        <li style={liStyle}><strong>License Grant:</strong> By uploading content to the Platform, you grant {BUSINESS_NAME} a limited, non-exclusive, royalty-free, temporary license to process, host, display, and render your uploaded content strictly for the purpose of generating and serving your personalized E-Gift. This license terminates when the E-Gift or associated data is deleted.</li>
        <li style={liStyle}><strong>Right to Remove:</strong> We reserve the right to remove, disable, or restrict access to any E-Gift or User Generated Content that we determine, in our sole discretion, violates these Terms, applicable laws, or community standards, without prior notice.</li>
      </ul>

      <h3 style={heading3Style}>6. &ldquo;Share Proof&rdquo; &amp; Third-Party Integrations</h3>
      <p style={paragraphStyle}>
        Some of our interactive E-Gift templates include a &ldquo;Share Proof&rdquo; feature, which allows the recipient to capture a screenshot of a sealed digital letter or card for sharing. Regarding this feature:
      </p>
      <ul style={ulStyle}>
        <li style={liStyle}><strong>Image Hosting:</strong> If the recipient&apos;s device does not support the native Web Share API, the generated screenshot may be temporarily uploaded to a third-party image hosting provider (e.g., ImgBB) to create a shareable URL link. These images are uploaded on a temporary basis.</li>
        <li style={liStyle}><strong>WhatsApp Integration:</strong> We utilize WhatsApp deep links (wa.me) to format a pre-filled message for your convenience. We do not have access to your WhatsApp account, messages, contacts, or any private information.</li>
      </ul>

      <h3 style={heading3Style}>7. Intellectual Property Rights</h3>
      <p style={paragraphStyle}>
        All original designs, animations, illustrations, UI/UX elements, templates, source code, logos, branding, and other creative materials provided by {BUSINESS_NAME} and {BUSINESS_ENTITY} are protected by intellectual property laws and remain the exclusive property of {BUSINESS_ENTITY}. You may not:
      </p>
      <ul style={ulStyle}>
        <li style={liStyle}>Copy, reproduce, modify, adapt, translate, reverse-engineer, decompile, or disassemble any part of the Platform or its templates.</li>
        <li style={liStyle}>Sell, resell, sublicense, distribute, or commercially exploit any templates, designs, or content provided by the Platform.</li>
        <li style={liStyle}>Use any automated means (bots, scrapers, crawlers) to extract data, designs, or content from the Platform.</li>
        <li style={liStyle}>Remove, alter, or obscure any copyright, trademark, or other proprietary notices from the Platform.</li>
      </ul>
      <p style={paragraphStyle}><strong>Your Content:</strong> You retain ownership of any original content you upload to the Platform. The limited license granted to us is solely for the purpose of delivering the E-Gift service.</p>

      <h3 style={heading3Style}>8. Payment Terms</h3>
      <ul style={ulStyle}>
        <li style={liStyle}><strong>One-Time Payment:</strong> All E-Gift purchases require a single, one-time payment. There are no recurring charges, subscriptions, or hidden fees.</li>
        <li style={liStyle}><strong>Pricing:</strong> All prices are displayed in Indian Rupees (INR) and are inclusive of all applicable taxes (GST) unless stated otherwise.</li>
        <li style={liStyle}><strong>Payment Processing:</strong> Payments are securely processed through Razorpay, a PCI-DSS compliant payment gateway. We do not store or have direct access to your credit/debit card details, UPI PIN, or net banking credentials.</li>
        <li style={liStyle}><strong>Payment Confirmation:</strong> Upon successful payment, you will receive an order confirmation via the email address provided at checkout. Your unique Order ID and access passkey will be displayed on-screen and sent to your email.</li>
        <li style={liStyle}><strong>Failed Payments:</strong> If a payment fails or is interrupted, no order will be created and no charges will be applied. If the amount is debited but the order is not confirmed, please contact us immediately with your transaction reference number for resolution.</li>
      </ul>

      <h3 style={heading3Style}>9. Order Delivery</h3>
      <p style={paragraphStyle}>Since {BUSINESS_NAME} deals exclusively in digital products, delivery is instant and electronic:</p>
      <ul style={ulStyle}>
        <li style={liStyle}>Upon successful payment, you gain immediate access to the Live Editor for your purchased E-Gift template.</li>
        <li style={liStyle}>Once finalized, a permanent URL and QR code are generated for sharing.</li>
        <li style={liStyle}>There is no physical product or physical delivery involved at any stage.</li>
        <li style={liStyle}>The E-Gift link remains active and accessible indefinitely, subject to our data retention policies.</li>
      </ul>

      <h3 style={heading3Style}>10. Limitation of Liability</h3>
      <p style={paragraphStyle}>To the maximum extent permitted by applicable law, {BUSINESS_NAME} and {BUSINESS_ENTITY}, including their owners, directors, employees, affiliates, and agents, shall not be liable for:</p>
      <ul style={ulStyle}>
        <li style={liStyle}>Any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, business opportunities, or goodwill.</li>
        <li style={liStyle}>Any damages arising from your use or inability to use the Platform or its services.</li>
        <li style={liStyle}>Any unauthorized access to or alteration of your content or data.</li>
        <li style={liStyle}>Any third-party conduct, content, services, or links accessed through the Platform.</li>
        <li style={liStyle}>Service interruptions, downtime, errors, or bugs in the Platform.</li>
      </ul>
      <p style={paragraphStyle}>Our total aggregate liability for any claims arising from or related to these Terms or the use of the Platform shall not exceed the amount paid by you for the specific E-Gift in question.</p>

      <h3 style={heading3Style}>11. Indemnification</h3>
      <p style={paragraphStyle}>You agree to indemnify, defend, and hold harmless {BUSINESS_NAME}, {BUSINESS_ENTITY}, and their owners, directors, employees, and agents from and against any and all claims, liabilities, damages, losses, costs, and expenses (including reasonable attorney&apos;s fees) arising from or related to:</p>
      <ul style={ulStyle}>
        <li style={liStyle}>Your use of the Platform or any E-Gift created through it.</li>
        <li style={liStyle}>Your User Generated Content or any content you upload, embed, or share.</li>
        <li style={liStyle}>Your violation of these Terms or any applicable laws or regulations.</li>
        <li style={liStyle}>Your infringement of any intellectual property or other rights of any third party.</li>
      </ul>

      <h3 style={heading3Style}>12. Governing Law &amp; Jurisdiction</h3>
      <p style={paragraphStyle}>These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with these Terms or the use of the Platform shall be subject to the exclusive jurisdiction of the courts located in India.</p>

      <h3 style={heading3Style}>13. Amendments to Terms</h3>
      <p style={paragraphStyle}>We reserve the right to modify, update, or revise these Terms at any time without prior notice. The updated Terms will be posted on this page with a revised &ldquo;Last Updated&rdquo; date. Your continued use of the Platform after any changes constitutes your acceptance of the revised Terms. We encourage you to review this page periodically.</p>

      <h3 style={heading3Style}>14. Severability</h3>
      <p style={paragraphStyle}>If any provision of these Terms is held to be invalid, illegal, or unenforceable by a court of competent jurisdiction, the remaining provisions shall continue in full force and effect. The invalid provision shall be modified to the minimum extent necessary to make it valid and enforceable.</p>

      <h3 style={heading3Style}>15. Contact Us</h3>
      <p style={paragraphStyle}>If you have any questions, concerns, or feedback regarding these Terms and Conditions, please contact us at:</p>
      <ul style={ulStyle}>
        <li style={liStyle}><strong>Business Name:</strong> {BUSINESS_NAME} (a product of {BUSINESS_ENTITY})</li>
        <li style={liStyle}><strong>Email:</strong> <a href={`mailto:${contactEmail}`} style={{ color: "#7C3AED", textDecoration: "none", fontWeight: 700 }}>{contactEmail}</a></li>
        <li style={liStyle}><strong>Website:</strong> <a href={siteUrl} style={{ color: "#7C3AED", textDecoration: "none", fontWeight: 700 }}>{siteUrl}</a></li>
      </ul>
    </section>
  );
}

function PrivacyContent({ siteUrl, contactEmail }: { siteUrl: string; contactEmail: string }) {
  return (
    <section id="privacy">
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <span style={{ display: "inline-flex", color: "#7C3AED" }}><ShieldLockIcon size={26} /></span>
        <h2 style={heading2Style}>Privacy Policy</h2>
      </div>
      <p style={{ color: "#7C3AED", fontSize: 12, fontWeight: 700, marginBottom: 20 }}>Last Updated: {LAST_UPDATED}</p>

      <p style={paragraphStyle}>{BUSINESS_NAME} (&ldquo;we,&rdquo; &ldquo;our,&rdquo; &ldquo;us&rdquo;), a product of {BUSINESS_ENTITY}, is committed to protecting the privacy and personal data of all visitors and users of our website <a href={siteUrl} style={{ color: "#7C3AED", textDecoration: "none", fontWeight: 700 }}>{siteUrl}</a> (the &ldquo;Platform&rdquo;). This Privacy Policy explains what information we collect, how we use it, how we store it, who we share it with, and what rights you have regarding your data.</p>
      <p style={paragraphStyle}>By using the Platform, you consent to the collection, use, and storage of your information as described in this Privacy Policy. If you do not agree to this Privacy Policy, please do not use the Platform.</p>

      <h3 style={heading3Style}>1. Information We Collect</h3>
      <p style={paragraphStyle}>We collect information in the following categories:</p>
      <p style={{ ...paragraphStyle, fontWeight: 700, marginBottom: 6 }}>a) Information You Provide Directly:</p>
      <ul style={ulStyle}>
        <li style={liStyle}><strong>Order Information:</strong> When you make a purchase, we collect your email address, phone number (optional), and the buyer passkey you create for accessing your order.</li>
        <li style={liStyle}><strong>E-Gift Content:</strong> The personalised text (names, messages, wishes), images you upload, and audio/media URLs you embed in your E-Gift.</li>
        <li style={liStyle}><strong>Payment Information:</strong> We do NOT directly collect or store any credit/debit card numbers, UPI PINs, CVVs, or net banking passwords. All payment processing is handled securely by our payment gateway provider (Razorpay), which is PCI-DSS compliant.</li>
        <li style={liStyle}><strong>Contact Form Submissions:</strong> If you contact us via email or a contact form, we collect your name, email address, and the content of your message.</li>
      </ul>
      <p style={{ ...paragraphStyle, fontWeight: 700, marginBottom: 6 }}>b) Information Collected Automatically:</p>
      <ul style={ulStyle}>
        <li style={liStyle}><strong>Device &amp; Browser Information:</strong> IP address, browser type and version, operating system, device type (mobile/desktop), screen resolution, and language preferences.</li>
        <li style={liStyle}><strong>Usage Data:</strong> Pages visited, time spent on pages, click interactions, referral source (how you arrived at our site), and navigation patterns.</li>
        <li style={liStyle}><strong>Analytics Data:</strong> We may use privacy-respecting analytics tools to understand user behaviour and improve the Platform experience.</li>
      </ul>

      <h3 style={heading3Style}>2. How We Use Your Information</h3>
      <p style={paragraphStyle}>We use the collected information for the following purposes:</p>
      <ul style={ulStyle}>
        <li style={liStyle}><strong>Service Delivery:</strong> To process your order, generate your E-Gift, provide access to the Live Editor, and deliver the finalized shareable link and QR code.</li>
        <li style={liStyle}><strong>Order Communication:</strong> To send you order confirmations, receipt emails, and important updates related to your purchase.</li>
        <li style={liStyle}><strong>Customer Support:</strong> To respond to your inquiries, troubleshoot issues, and provide assistance.</li>
        <li style={liStyle}><strong>Platform Improvement:</strong> To analyse usage patterns, identify bugs, and improve the overall user experience, design, and performance of the Platform.</li>
        <li style={liStyle}><strong>Security:</strong> To detect, prevent, and address fraud, abuse, unauthorized access, and other security threats.</li>
        <li style={liStyle}><strong>Legal Compliance:</strong> To comply with applicable laws, regulations, legal processes, or enforceable governmental requests.</li>
      </ul>

      <h3 style={heading3Style}>3. Local Storage &amp; Cookies</h3>
      <p style={paragraphStyle}>Our Platform utilises browser technologies to enhance your experience:</p>
      <ul style={ulStyle}>
        <li style={liStyle}><strong>Local Storage (localStorage):</strong> We use browser local storage to save your preferences (e.g., popup dismissal preferences, draft customization progress). This data stays on your device and is not transmitted to our servers.</li>
        <li style={liStyle}><strong>Session Storage:</strong> Used temporarily for maintaining your active session data while editing an E-Gift.</li>
        <li style={liStyle}><strong>Cookies:</strong> We may use essential cookies for site functionality and optional analytics cookies to understand user behaviour. No advertising or tracking cookies are used. You can manage cookie preferences through your browser settings.</li>
      </ul>

      <h3 style={heading3Style}>4. Third-Party Service Providers &amp; Data Processors</h3>
      <p style={paragraphStyle}>We use trusted third-party services to deliver and improve our Platform. These providers process data on our behalf and are bound by their respective privacy policies:</p>
      <ul style={ulStyle}>
        <li style={liStyle}><strong>Razorpay (Payment Gateway):</strong> Securely processes all payments. Razorpay is PCI-DSS Level 1 certified. Their privacy policy governs how they handle your payment data. We do not store your payment credentials.</li>
        <li style={liStyle}><strong>Firebase / Google Cloud (Database &amp; Hosting):</strong> Used for secure database storage, hosting, and server-side functionality. Data is stored on Google Cloud infrastructure.</li>
        <li style={liStyle}><strong>ImgBB (Image Hosting):</strong> Used strictly for temporary hosting of &ldquo;Share Proof&rdquo; screenshots to generate shareable links on devices that do not support the native Web Share API.</li>
        <li style={liStyle}><strong>EmailJS (Email Routing):</strong> Used to securely route contact form submissions and order-related emails to our support inbox without exposing private email server credentials.</li>
        <li style={liStyle}><strong>Vercel (Deployment &amp; CDN):</strong> Our website may be hosted and served through Vercel&apos;s global CDN for fast, secure access.</li>
      </ul>

      <h3 style={heading3Style}>5. Data Sharing &amp; Disclosure</h3>
      <p style={paragraphStyle}>We do <strong>NOT</strong> sell, rent, trade, or otherwise commercially share your personal information with any third party for marketing or advertising purposes. We may disclose your information only in the following circumstances:</p>
      <ul style={ulStyle}>
        <li style={liStyle}><strong>Service Providers:</strong> To the trusted third-party providers listed above, strictly for the purpose of delivering our services.</li>
        <li style={liStyle}><strong>Legal Obligations:</strong> If required by law, court order, subpoena, or governmental request.</li>
        <li style={liStyle}><strong>Safety &amp; Protection:</strong> To protect the rights, property, or safety of {BUSINESS_NAME}, our users, or the public.</li>
        <li style={liStyle}><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of all or a portion of our assets, your data may be transferred as part of the transaction.</li>
      </ul>

      <h3 style={heading3Style}>6. Data Security</h3>
      <p style={paragraphStyle}>We implement industry-standard security measures to protect your data, including:</p>
      <ul style={ulStyle}>
        <li style={liStyle}>HTTPS/SSL encryption for all data transmitted between your browser and our servers.</li>
        <li style={liStyle}>Secure, encrypted database storage for order and user data.</li>
        <li style={liStyle}>PCI-DSS compliant payment processing through Razorpay.</li>
        <li style={liStyle}>Access controls and authentication for administrative functions.</li>
      </ul>
      <p style={paragraphStyle}><strong>Important:</strong> Since E-Gifts are designed to be shared via unique URLs, any person who possesses the link to your finalized E-Gift will be able to view its contents. Do not include highly sensitive personal information (such as passwords, Aadhaar numbers, bank details, or other financial data) in your E-Gifts.</p>

      <h3 style={heading3Style}>7. Data Retention</h3>
      <p style={paragraphStyle}>We retain your data for as long as it is necessary to provide the services and fulfil the purposes described in this Privacy Policy:</p>
      <ul style={ulStyle}>
        <li style={liStyle}><strong>Order Data:</strong> Retained for as long as your E-Gift link is active, plus a reasonable period for customer support purposes.</li>
        <li style={liStyle}><strong>Payment Records:</strong> Retained as required by applicable tax and financial regulations (typically 7 years for financial records in India).</li>
        <li style={liStyle}><strong>Analytics Data:</strong> Retained in anonymised or aggregated form and is not linked to individual identities.</li>
      </ul>

      <h3 style={heading3Style}>8. Your Rights</h3>
      <p style={paragraphStyle}>As a user of our Platform, you have the following rights regarding your personal data:</p>
      <ul style={ulStyle}>
        <li style={liStyle}><strong>Right to Access:</strong> You may request access to the personal data we hold about you.</li>
        <li style={liStyle}><strong>Right to Correction:</strong> You may request correction of inaccurate or incomplete personal data.</li>
        <li style={liStyle}><strong>Right to Deletion:</strong> You may request the deletion of your personal data and associated E-Gift, subject to our legal obligations to retain certain records.</li>
        <li style={liStyle}><strong>Right to Withdraw Consent:</strong> Where processing is based on your consent, you may withdraw consent at any time by contacting us.</li>
      </ul>
      <p style={paragraphStyle}>To exercise any of these rights, please contact us at <a href={`mailto:${contactEmail}`} style={{ color: "#7C3AED", textDecoration: "none", fontWeight: 700 }}>{contactEmail}</a>. We will respond to all legitimate requests within 30 business days.</p>

      <h3 style={heading3Style}>9. Children&apos;s Privacy</h3>
      <p style={paragraphStyle}>Our Platform is not directed at children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that a child under 13 has provided us with personal data, we will take steps to delete such information promptly. If you are a parent or guardian and believe your child has provided us with personal data, please contact us.</p>

      <h3 style={heading3Style}>10. Changes to This Privacy Policy</h3>
      <p style={paragraphStyle}>We may update this Privacy Policy from time to time to reflect changes in our practices, technologies, legal requirements, or other factors. The revised Privacy Policy will be posted on this page with an updated &ldquo;Last Updated&rdquo; date. Your continued use of the Platform after any changes constitutes your acceptance of the revised Privacy Policy.</p>

      <h3 style={heading3Style}>11. Contact Us</h3>
      <p style={paragraphStyle}>If you have any questions, concerns, or requests regarding this Privacy Policy or how we handle your personal data, please contact us:</p>
      <ul style={ulStyle}>
        <li style={liStyle}><strong>Business Name:</strong> {BUSINESS_NAME} (a product of {BUSINESS_ENTITY})</li>
        <li style={liStyle}><strong>Email:</strong> <a href={`mailto:${contactEmail}`} style={{ color: "#7C3AED", textDecoration: "none", fontWeight: 700 }}>{contactEmail}</a></li>
        <li style={liStyle}><strong>Website:</strong> <a href={siteUrl} style={{ color: "#7C3AED", textDecoration: "none", fontWeight: 700 }}>{siteUrl}</a></li>
      </ul>
    </section>
  );
}

function RefundContent({ contactEmail }: { contactEmail: string }) {
  return (
    <section id="refund">
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <span style={{ display: "inline-flex", color: "#7C3AED" }}><WalletIcon size={26} /></span>
        <h2 style={heading2Style}>Refund Policy</h2>
      </div>
      <p style={{ color: "#7C3AED", fontSize: 12, fontWeight: 700, marginBottom: 20 }}>Last Updated: {LAST_UPDATED}</p>

      <p style={paragraphStyle}>At {BUSINESS_NAME}, we strive to ensure that every customer has a positive experience with our digital gifting platform. Please read our Refund Policy carefully before making a purchase. By completing a purchase on our Platform, you acknowledge and agree to the following refund terms.</p>

      <h3 style={heading3Style}>1. Nature of Products</h3>
      <p style={paragraphStyle}>All products sold on {BUSINESS_NAME} are <strong>digital products</strong> — specifically, personalised digital greeting cards, surprise webpages, and interactive microsites (E-Gifts). These are non-physical, intangible goods that are delivered instantly and electronically upon successful payment.</p>

      <h3 style={heading3Style}>2. No Refund Policy (General Rule)</h3>
      <p style={paragraphStyle}>Due to the instant, digital nature of our products, <strong>all sales are final and non-refundable</strong> under normal circumstances. Once a payment is successfully processed and you gain access to the Live Editor for your purchased E-Gift, we consider the product as delivered. Reasons for this policy include:</p>
      <ul style={ulStyle}>
        <li style={liStyle}>The product (digital template access) is delivered instantly and cannot be &ldquo;returned&rdquo; once accessed.</li>
        <li style={liStyle}>You have the opportunity to fully preview every template before making a purchase decision.</li>
        <li style={liStyle}>The E-Gift is personalised with your own custom content, making it a bespoke digital product.</li>
      </ul>

      <h3 style={heading3Style}>3. Exceptions — When Refunds May Be Considered</h3>
      <p style={paragraphStyle}>Despite the general no-refund policy, we understand that exceptional situations may arise. We may issue a partial or full refund at our sole discretion in the following scenarios:</p>
      <ul style={ulStyle}>
        <li style={liStyle}><strong>Duplicate Payment:</strong> If you were charged multiple times for the same order due to a payment gateway error or network issue, we will refund the duplicate charge(s) in full.</li>
        <li style={liStyle}><strong>Payment Debited but Order Not Created:</strong> If the payment was debited from your account but no order was created or confirmed on our Platform due to a technical error, we will issue a full refund.</li>
        <li style={liStyle}><strong>Critical Technical Defect:</strong> If the purchased E-Gift template has a critical technical defect (e.g., the template fails to load, the editor is completely non-functional for your specific purchase, or the finalized link does not work), and we are unable to resolve the issue within a reasonable timeframe (72 hours from the report), we may issue a refund.</li>
        <li style={liStyle}><strong>Service Discontinuation:</strong> If we permanently discontinue the Platform or specific E-Gift services before you have had a reasonable opportunity to customize and share your purchased E-Gift.</li>
      </ul>

      <h3 style={heading3Style}>4. Non-Refundable Scenarios</h3>
      <p style={paragraphStyle}>Refunds will <strong>NOT</strong> be provided in the following situations:</p>
      <ul style={ulStyle}>
        <li style={liStyle}>Change of mind or dissatisfaction after purchase (you had the opportunity to preview the template before buying).</li>
        <li style={liStyle}>Failure to customize or use the E-Gift within the editing window.</li>
        <li style={liStyle}>Issues caused by the buyer&apos;s own device, browser incompatibility, poor internet connection, or user error.</li>
        <li style={liStyle}>Dissatisfaction with the recipient&apos;s reaction or the recipient not viewing the E-Gift.</li>
        <li style={liStyle}>E-Gifts that have already been fully customized and finalized with a shareable link.</li>
        <li style={liStyle}>Content-related issues arising from User Generated Content (e.g., spelling mistakes in your personalised messages).</li>
        <li style={liStyle}>Third-party service issues (e.g., YouTube/Spotify audio link not working, ImgBB image hosting downtime).</li>
      </ul>

      <h3 style={heading3Style}>5. How to Request a Refund</h3>
      <p style={paragraphStyle}>If you believe your situation qualifies for a refund under the exceptions listed above, please follow these steps:</p>
      <ul style={ulStyle}>
        <li style={liStyle}><strong>Step 1:</strong> Send an email to <a href={`mailto:${contactEmail}`} style={{ color: "#7C3AED", textDecoration: "none", fontWeight: 700 }}>{contactEmail}</a> with the subject line: &ldquo;Refund Request — [Your Order ID]&rdquo;</li>
        <li style={liStyle}><strong>Step 2:</strong> Include the following details in your email: (a) Order ID, (b) Email address used during purchase, (c) Date and time of purchase, (d) Payment transaction reference ID (if available), (e) A clear description of the issue with screenshots if applicable.</li>
        <li style={liStyle}><strong>Step 3:</strong> Our support team will review your request and respond within <strong>3-5 business days</strong>.</li>
      </ul>

      <h3 style={heading3Style}>6. Refund Processing</h3>
      <p style={paragraphStyle}>If a refund is approved:</p>
      <ul style={ulStyle}>
        <li style={liStyle}>The refund will be processed through the original payment method used for the purchase.</li>
        <li style={liStyle}>Refunds typically take <strong>5-10 business days</strong> to reflect in your account, depending on your bank or payment provider&apos;s processing times.</li>
        <li style={liStyle}>We will notify you via email once the refund has been initiated from our end.</li>
        <li style={liStyle}>Upon refund, access to the associated E-Gift and editor will be revoked, and any finalized links may be deactivated.</li>
      </ul>

      <h3 style={heading3Style}>7. Chargebacks &amp; Payment Disputes</h3>
      <p style={paragraphStyle}>We encourage you to contact us directly before initiating a chargeback or payment dispute with your bank or payment provider. Unauthorized chargebacks may result in suspension of your access to the Platform and further investigation.</p>

      <h3 style={heading3Style}>8. Contact Us</h3>
      <p style={paragraphStyle}>For any refund-related queries, please reach out to:</p>
      <ul style={ulStyle}>
        <li style={liStyle}><strong>Email:</strong> <a href={`mailto:${contactEmail}`} style={{ color: "#7C3AED", textDecoration: "none", fontWeight: 700 }}>{contactEmail}</a></li>
        <li style={liStyle}><strong>Response Time:</strong> 3-5 business days</li>
      </ul>
    </section>
  );
}

function ReturnContent({ siteUrl, contactEmail }: { siteUrl: string; contactEmail: string }) {
  return (
    <section id="return">
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <span style={{ display: "inline-flex", color: "#7C3AED" }}><UndoIcon size={26} /></span>
        <h2 style={heading2Style}>Return Policy</h2>
      </div>
      <p style={{ color: "#7C3AED", fontSize: 12, fontWeight: 700, marginBottom: 20 }}>Last Updated: {LAST_UPDATED}</p>

      <h3 style={heading3Style}>1. Digital-Only Products — No Physical Returns</h3>
      <p style={paragraphStyle}>{BUSINESS_NAME} exclusively sells <strong>digital products</strong> — personalised interactive digital greeting cards, surprise webpages, and microsites (E-Gifts). Since our products are entirely digital and intangible in nature, there is <strong>no physical product to return</strong>.</p>
      <p style={paragraphStyle}>The concept of a traditional &ldquo;return&rdquo; (sending back a physical item) does not apply to our business model. Once a digital product is purchased and delivered (i.e., access to the Live Editor is granted), the product is considered consumed and cannot be &ldquo;returned.&rdquo;</p>

      <h3 style={heading3Style}>2. Why Returns Are Not Applicable</h3>
      <ul style={ulStyle}>
        <li style={liStyle}><strong>Instant Digital Delivery:</strong> The E-Gift template and editor access are delivered instantly upon successful payment. There is no shipping or physical logistics involved.</li>
        <li style={liStyle}><strong>Non-Tangible Product:</strong> Digital products cannot be physically returned, repackaged, or resold once delivered to the buyer.</li>
        <li style={liStyle}><strong>Preview Before Purchase:</strong> Every E-Gift template can be fully previewed (with live animations and interactions) before purchase, allowing you to make an informed decision.</li>
        <li style={liStyle}><strong>Personalized &amp; Customized:</strong> Once purchased, the E-Gift is personalized with your unique content, making it a bespoke product created specifically for you.</li>
      </ul>

      <h3 style={heading3Style}>3. Issues After Purchase?</h3>
      <p style={paragraphStyle}>If you experience any technical issues, defects, or problems with your purchased E-Gift, please do not hesitate to contact us. We are committed to resolving any legitimate technical issues:</p>
      <ul style={ulStyle}>
        <li style={liStyle}><strong>Technical Support:</strong> If your E-Gift template is not functioning correctly (e.g., template not loading, editor crashing, finalized link not working), our technical team will work to resolve the issue promptly.</li>
        <li style={liStyle}><strong>Template Replacement:</strong> In rare cases where a template is severely defective and cannot be fixed, we may offer a replacement with an equivalent template at no additional cost.</li>
        <li style={liStyle}><strong>Refund Consideration:</strong> For critical unresolvable issues, please refer to our <a href="#refund" style={{ color: "#7C3AED", textDecoration: "none", fontWeight: 700 }}>Refund Policy</a> for scenarios where a refund may be considered.</li>
      </ul>

      <h3 style={heading3Style}>4. Order Cancellation</h3>
      <p style={paragraphStyle}>Since digital product delivery is instant, orders cannot be cancelled after payment is completed. If you wish to cancel an order:</p>
      <ul style={ulStyle}>
        <li style={liStyle}><strong>Before Payment:</strong> You can freely exit the checkout process at any time before completing payment without any charges.</li>
        <li style={liStyle}><strong>After Payment:</strong> The order is considered fulfilled upon instant delivery of editor access. Cancellation after payment is not possible, but you may refer to our Refund Policy for applicable exceptions.</li>
      </ul>

      <h3 style={heading3Style}>5. Contact Us</h3>
      <p style={paragraphStyle}>For any questions about our Return Policy or for technical assistance with your E-Gift, please contact us:</p>
      <ul style={ulStyle}>
        <li style={liStyle}><strong>Email:</strong> <a href={`mailto:${contactEmail}`} style={{ color: "#7C3AED", textDecoration: "none", fontWeight: 700 }}>{contactEmail}</a></li>
        <li style={liStyle}><strong>Website:</strong> <a href={siteUrl} style={{ color: "#7C3AED", textDecoration: "none", fontWeight: 700 }}>{siteUrl}</a></li>
      </ul>
    </section>
  );
}

function DisclaimerContent({ siteUrl, contactEmail }: { siteUrl: string; contactEmail: string }) {
  return (
    <section id="disclaimer">
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <span style={{ display: "inline-flex", color: "#7C3AED" }}><AlertTriangleIcon size={26} /></span>
        <h2 style={heading2Style}>Disclaimer</h2>
      </div>
      <p style={{ color: "#7C3AED", fontSize: 12, fontWeight: 700, marginBottom: 20 }}>Last Updated: {LAST_UPDATED}</p>

      <p style={paragraphStyle}>The information, content, and services provided on {BUSINESS_NAME} (<a href={siteUrl} style={{ color: "#7C3AED", textDecoration: "none", fontWeight: 700 }}>{siteUrl}</a>) are provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. Please read this disclaimer carefully before using our Platform.</p>

      <h3 style={heading3Style}>1. General Disclaimer</h3>
      <p style={paragraphStyle}>{BUSINESS_NAME} and {BUSINESS_ENTITY} make no representations or warranties of any kind, express or implied, regarding the operation, availability, accuracy, completeness, or reliability of the Platform, its content, or the E-Gift services provided. To the fullest extent permissible by applicable law, we disclaim all warranties, including but not limited to:</p>
      <ul style={ulStyle}>
        <li style={liStyle}>Implied warranties of merchantability, fitness for a particular purpose, and non-infringement.</li>
        <li style={liStyle}>Warranties that the Platform will be uninterrupted, error-free, secure, or free from viruses or other harmful components.</li>
        <li style={liStyle}>Warranties that the results obtained from the use of the Platform will be accurate, reliable, or meet your expectations.</li>
      </ul>

      <h3 style={heading3Style}>2. No Professional Advice</h3>
      <p style={paragraphStyle}>The content on this Platform is provided for informational and entertainment purposes only. Nothing on this website constitutes professional, legal, financial, medical, or any other form of advice. You should not rely on any content on this Platform as a substitute for professional consultation.</p>

      <h3 style={heading3Style}>3. User Content Disclaimer</h3>
      <p style={paragraphStyle}>{BUSINESS_NAME} is a platform that enables users to create personalised digital gifts using their own content. We do not review, monitor, endorse, or take responsibility for User Generated Content, including:</p>
      <ul style={ulStyle}>
        <li style={liStyle}>The accuracy, truthfulness, or appropriateness of text, messages, names, or other content entered by users.</li>
        <li style={liStyle}>The legality, ownership rights, or licensing of images uploaded by users.</li>
        <li style={liStyle}>The content, availability, or licensing status of third-party audio/video links embedded by users (e.g., YouTube, Spotify, SoundCloud links).</li>
        <li style={liStyle}>Any emotional or personal impact resulting from the content of an E-Gift on its intended or unintended recipient.</li>
      </ul>

      <h3 style={heading3Style}>4. Third-Party Links &amp; Services</h3>
      <p style={paragraphStyle}>Our Platform may contain links to or integrations with third-party websites, services, and content (including but not limited to Razorpay, Firebase, ImgBB, EmailJS, YouTube, Spotify, and WhatsApp). These third-party services are independent entities and are not under our control. We disclaim all responsibility for:</p>
      <ul style={ulStyle}>
        <li style={liStyle}>The content, privacy practices, security measures, or terms of service of any third-party website or service.</li>
        <li style={liStyle}>The availability, functionality, or accuracy of third-party services integrated into the Platform.</li>
        <li style={liStyle}>Any damage, loss, or harm resulting from your interaction with any third-party service accessed through our Platform.</li>
      </ul>
      <p style={paragraphStyle}>We encourage you to review the privacy policies and terms of service of any third-party services you interact with through our Platform.</p>

      <h3 style={heading3Style}>5. E-Gift Availability &amp; Link Permanence</h3>
      <p style={paragraphStyle}>While we endeavour to keep all finalized E-Gift links active and accessible permanently, we cannot guarantee indefinite availability. Circumstances that may affect link availability include:</p>
      <ul style={ulStyle}>
        <li style={liStyle}>Server outages, infrastructure changes, or technical maintenance.</li>
        <li style={liStyle}>Discontinuation of the Platform or specific services.</li>
        <li style={liStyle}>Removal of E-Gifts that violate our Terms &amp; Conditions.</li>
        <li style={liStyle}>Force majeure events beyond our reasonable control.</li>
      </ul>

      <h3 style={heading3Style}>6. Accuracy of Information</h3>
      <p style={paragraphStyle}>We make reasonable efforts to ensure the accuracy of product descriptions, pricing, features, and other information displayed on the Platform. However, errors, inaccuracies, or omissions may occur. We reserve the right to correct any errors, inaccuracies, or omissions and to update information at any time without prior notice. In the event of a pricing error, we reserve the right to cancel any orders placed at the incorrect price.</p>

      <h3 style={heading3Style}>7. Limitation of Liability</h3>
      <p style={paragraphStyle}>Under no circumstances shall {BUSINESS_NAME}, {BUSINESS_ENTITY}, or their owners, directors, employees, affiliates, or agents be held liable for any direct, indirect, incidental, special, consequential, exemplary, or punitive damages arising from:</p>
      <ul style={ulStyle}>
        <li style={liStyle}>Your access to or use of (or inability to access or use) the Platform.</li>
        <li style={liStyle}>Any conduct or content of any third party on or through the Platform.</li>
        <li style={liStyle}>Any User Generated Content created, uploaded, or shared through the Platform.</li>
        <li style={liStyle}>Unauthorized access, use, or alteration of your content or data.</li>
        <li style={liStyle}>Any loss of data, revenue, profits, or goodwill.</li>
      </ul>

      <h3 style={heading3Style}>8. Indemnification</h3>
      <p style={paragraphStyle}>By using this Platform, you agree to indemnify and hold harmless {BUSINESS_NAME}, {BUSINESS_ENTITY}, and their respective owners, directors, employees, and agents from any claims, damages, liabilities, costs, or expenses arising from your use of the Platform, your violation of these Terms, or your violation of any rights of any third party.</p>

      <h3 style={heading3Style}>9. Changes to This Disclaimer</h3>
      <p style={paragraphStyle}>We reserve the right to modify this Disclaimer at any time. Any changes will be effective immediately upon posting the revised Disclaimer on this page with an updated &ldquo;Last Updated&rdquo; date. Your continued use of the Platform after changes are posted constitutes your acceptance of the revised Disclaimer.</p>

      <h3 style={heading3Style}>10. Contact Us</h3>
      <p style={paragraphStyle}>If you have any questions about this Disclaimer, please contact us:</p>
      <ul style={ulStyle}>
        <li style={liStyle}><strong>Email:</strong> <a href={`mailto:${contactEmail}`} style={{ color: "#7C3AED", textDecoration: "none", fontWeight: 700 }}>{contactEmail}</a></li>
        <li style={liStyle}><strong>Website:</strong> <a href={siteUrl} style={{ color: "#7C3AED", textDecoration: "none", fontWeight: 700 }}>{siteUrl}</a></li>
      </ul>
    </section>
  );
}


/* ════════════════════════════════════════════════════════════
   MAIN LEGAL PAGE
   ════════════════════════════════════════════════════════════ */
export default function LegalPage() {
  const [activeSection, setActiveSection] = useState<SectionId>("terms");
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);

  /* Fetch settings from DB */
  useEffect(() => {
    getSettingsDB().then(s => {
      setSettings(s);
      if (s?.businessName) BUSINESS_NAME = s.businessName;
      if (s?.businessEntity) BUSINESS_ENTITY = s.businessEntity;
    });
  }, []);

  /* Sync hash -> active tab on mount and hash changes */
  useEffect(() => {
    const syncHash = () => {
      const hash = window.location.hash.replace("#", "") as SectionId;
      const valid = SECTIONS.some((s) => s.id === hash);
      if (valid) setActiveSection(hash);
    };
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  const handleSectionChange = (id: SectionId) => {
    setActiveSection(id);
    setIsMobileNavOpen(false);
    window.history.replaceState(null, "", `#${id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* Derive contact info from settings or use defaults */
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aradhyagifts.in";
  const contactEmail = settings?.contactEmail || "support@aradhyagifts.in";

  const activeLabel = SECTIONS.find((s) => s.id === activeSection)?.label || "Terms & Conditions";
  const ActiveIcon = SECTIONS.find((s) => s.id === activeSection)?.Icon || ScrollIcon;

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAFA", color: "#334155", fontFamily: "'Nunito', sans-serif" }}>

      {/* ── Sticky Header ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(255,255,255,0.92)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        padding: "0 clamp(12px, 4vw, 48px)",
        display: "flex", alignItems: "center", height: 56, gap: 10,
      }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", flexShrink: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={settings?.logoUrl || "/logo.png"} alt="Aradhya E-Giftings" style={{ height: 38, objectFit: "contain" }} />
        </Link>
        <div style={{ flex: 1 }} />
        <Link href="/" style={{
          fontSize: 12, fontWeight: 800, color: "#7C3AED", padding: "0 14px", height: 36, borderRadius: 8,
          background: "rgba(124, 58, 237, 0.08)", textDecoration: "none", whiteSpace: "nowrap",
          display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s",
        }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(124, 58, 237, 0.15)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(124, 58, 237, 0.08)")}
        >
          Back to Home
        </Link>
      </header>

      {/* ── Hero Banner ── */}
      <div style={{
        position: "relative", overflow: "hidden",
        padding: "clamp(28px, 6vw, 48px) clamp(16px, 4vw, 48px) clamp(24px, 4vw, 40px)",
        background: "linear-gradient(135deg, #F8F0FF 0%, #FFF0F5 50%, #F0F4FF 100%)",
        textAlign: "center",
      }}>
        <div style={{ position: "absolute", top: -80, right: -60, width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.08), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, left: -80, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(233,30,140,0.06), transparent 70%)", pointerEvents: "none" }} />

        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 14px", borderRadius: 999,
          fontSize: 11, fontWeight: 800,
          background: "linear-gradient(135deg, rgba(124,58,237,0.1), rgba(233,30,140,0.1))",
          color: "#7C3AED", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1,
        }}>
          <ShieldBadgeIcon size={14} color="#7C3AED" /> Legal Information
        </div>
        <h1 style={{
          fontSize: "clamp(22px, 5vw, 36px)", fontWeight: 900, color: "#0F172A",
          margin: "0 0 8px", letterSpacing: -0.5, lineHeight: 1.2,
        }}>
          Legal &amp; Policy Centre
        </h1>
        <p style={{
          fontSize: "clamp(12px, 2vw, 15px)", color: "#64748B", maxWidth: 520,
          margin: "0 auto", lineHeight: 1.6,
        }}>
          All the legal details, policies, and guidelines you need to know about using {BUSINESS_NAME}.
          We believe in complete transparency with our customers.
        </p>
      </div>

      {/* ── Mobile Section Selector (visible < 768px) ── */}
      <div className="legal-mobile-nav" style={{ padding: "16px clamp(12px, 4vw, 48px) 0" }}>
        <button
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          style={{
            width: "100%", padding: "12px 16px", borderRadius: 12,
            border: "1px solid rgba(0,0,0,0.08)", background: "#fff", cursor: "pointer",
            fontSize: 13, fontWeight: 800, color: "#7C3AED",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            fontFamily: "'Nunito', sans-serif", boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ActiveIcon size={18} color="#7C3AED" />
            {activeLabel}
          </span>
          <span style={{ transform: isMobileNavOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.3s", fontSize: 11 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
          </span>
        </button>

        <div style={{
          maxHeight: isMobileNavOpen ? 400 : 0, overflow: "hidden",
          transition: "max-height 0.3s ease",
          borderRadius: "0 0 12px 12px",
          border: isMobileNavOpen ? "1px solid rgba(0,0,0,0.06)" : "none",
          borderTop: "none", background: "#fff",
          boxShadow: isMobileNavOpen ? "0 8px 24px rgba(0,0,0,0.06)" : "none",
        }}>
          {SECTIONS.map((sec) => {
            const isActive = activeSection === sec.id;
            return (
              <button key={sec.id} onClick={() => handleSectionChange(sec.id)} style={{
                width: "100%", padding: "11px 16px", border: "none",
                borderBottom: "1px solid rgba(0,0,0,0.04)", cursor: "pointer",
                fontSize: 13, fontWeight: isActive ? 800 : 600,
                color: isActive ? "#7C3AED" : "#475569",
                background: isActive ? "rgba(124,58,237,0.04)" : "transparent",
                display: "flex", alignItems: "center", gap: 10, textAlign: "left",
                fontFamily: "'Nunito', sans-serif",
              }}>
                <sec.Icon size={16} color={isActive ? "#7C3AED" : "#94A3B8"} />
                {sec.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main Content with Sidebar ── */}
      <div className="legal-layout" style={{
        maxWidth: 1140, margin: "0 auto",
        padding: "24px clamp(12px, 4vw, 48px) 60px",
        display: "flex", gap: 32, alignItems: "flex-start",
      }}>

        {/* ── Desktop Sidebar Navigation (visible >= 768px) ── */}
        <nav className="legal-sidebar" style={{
          position: "sticky", top: 76, width: 250, flexShrink: 0,
          background: "#fff", borderRadius: 14, border: "1px solid rgba(0,0,0,0.06)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.03)", padding: "18px 10px",
          display: "flex", flexDirection: "column", gap: 3,
        }}>
          <span style={{
            fontSize: 10, fontWeight: 900, color: "#94A3B8", textTransform: "uppercase",
            letterSpacing: 1.5, padding: "0 10px", marginBottom: 6,
          }}>
            Policy Sections
          </span>
          {SECTIONS.map((sec) => {
            const isActive = activeSection === sec.id;
            return (
              <button key={sec.id} id={`nav-${sec.id}`} onClick={() => handleSectionChange(sec.id)} style={{
                display: "flex", alignItems: "center", gap: 9, padding: "10px 12px", borderRadius: 8,
                border: "none", cursor: "pointer", fontSize: 13,
                fontWeight: isActive ? 800 : 600,
                color: isActive ? "#7C3AED" : "#475569",
                background: isActive ? "linear-gradient(135deg, rgba(124,58,237,0.08), rgba(233,30,140,0.04))" : "transparent",
                transition: "all 0.2s", textAlign: "left", width: "100%",
                fontFamily: "'Nunito', sans-serif", position: "relative",
              }}
                onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = "rgba(0,0,0,0.02)"; e.currentTarget.style.color = "#1E293B"; } }}
                onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#475569"; } }}
              >
                {isActive && (
                  <div style={{
                    position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
                    width: 3, height: 18, borderRadius: 4,
                    background: "linear-gradient(180deg, #7C3AED, #E91E8C)",
                  }} />
                )}
                <sec.Icon size={16} color={isActive ? "#7C3AED" : "#94A3B8"} />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </nav>

        {/* ── Content Area ── */}
        <main style={{
          flex: 1, minWidth: 0,
          background: "#fff", borderRadius: 14, border: "1px solid rgba(0,0,0,0.06)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
          padding: "clamp(20px, 4vw, 40px)",
        }}>
          {activeSection === "terms" && <TermsContent siteUrl={siteUrl} contactEmail={contactEmail} />}
          {activeSection === "privacy" && <PrivacyContent siteUrl={siteUrl} contactEmail={contactEmail} />}
          {activeSection === "refund" && <RefundContent contactEmail={contactEmail} />}
          {activeSection === "return" && <ReturnContent siteUrl={siteUrl} contactEmail={contactEmail} />}
          {activeSection === "disclaimer" && <DisclaimerContent siteUrl={siteUrl} contactEmail={contactEmail} />}

          {/* ── Quick Navigation Footer ── */}
          <div style={{ marginTop: 36, padding: "20px 0 0", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
              Jump to another policy:
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {SECTIONS.filter((s) => s.id !== activeSection).map((sec) => (
                <button key={sec.id} onClick={() => handleSectionChange(sec.id)} style={{
                  display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 12px",
                  borderRadius: 7, border: "1px solid rgba(0,0,0,0.08)", background: "#FAFAFA",
                  cursor: "pointer", fontSize: 11, fontWeight: 700, color: "#475569",
                  fontFamily: "'Nunito', sans-serif", transition: "all 0.2s",
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(124,58,237,0.06)"; e.currentTarget.style.color = "#7C3AED"; e.currentTarget.style.borderColor = "rgba(124,58,237,0.2)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#FAFAFA"; e.currentTarget.style.color = "#475569"; e.currentTarget.style.borderColor = "rgba(0,0,0,0.08)"; }}
                >
                  <sec.Icon size={13} color="currentColor" />
                  {sec.label}
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* ── Bottom Bar ── */}
      <div style={{
        background: "linear-gradient(to bottom, #0F172A, #020617)",
        padding: "24px clamp(12px, 4vw, 48px)", textAlign: "center",
        color: "#64748B", fontSize: 11, fontFamily: "'Nunito', sans-serif",
      }}>
        <div style={{
          maxWidth: 800, margin: "0 auto", display: "flex", flexWrap: "wrap",
          justifyContent: "center", alignItems: "center", gap: "6px 20px",
        }}>
          <span>
            {new Date().getFullYear()} {BUSINESS_NAME} — A Product of <strong style={{ color: "#94A3B8" }}>{BUSINESS_ENTITY}</strong>
          </span>
          <span style={{ color: "#334155" }}>|</span>
          <Link href="/" style={{ color: "#7C3AED", textDecoration: "none", fontWeight: 700, transition: "color 0.2s" }}>Home</Link>
          <span style={{ color: "#334155" }}>|</span>
          <span>Made with care in India</span>
        </div>
      </div>

      {/* ── Responsive CSS ── */}
      <style dangerouslySetInnerHTML={{ __html: `
        .legal-sidebar { display: flex !important; }
        .legal-mobile-nav { display: none !important; }
        @media (max-width: 768px) {
          .legal-sidebar { display: none !important; }
          .legal-mobile-nav { display: block !important; }
          .legal-layout { flex-direction: column !important; gap: 0 !important; padding-top: 0 !important; }
        }
      `}} />
    </div>
  );
}
