import React from 'react';
import Link from 'next/link';

export default function LegalPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0F172A",
      color: "#F8FAFC",
      fontFamily: "'Nunito', sans-serif",
      padding: "80px 20px"
    }}>
      <div style={{ maxWidth: 800, margin: "0 auto", background: "rgba(30, 41, 59, 0.5)", padding: "40px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)" }}>
        
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#A78BFA", textDecoration: "none", fontWeight: 700, marginBottom: 32 }}>
          ← Back to Home
        </Link>

        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#FFF", marginBottom: 16 }}>Legal Information</h1>
        <p style={{ color: "#94A3B8", fontSize: "1.1rem", marginBottom: 40 }}>
          Comprehensive details covering our Terms & Conditions and Privacy Policy for Aradhya E-Gifts. 
          Please read them carefully to understand how we operate and handle your data.
        </p>

        <hr style={{ borderColor: "rgba(255,255,255,0.1)", marginBottom: 40 }} />

        {/* ── Terms and Conditions ── */}
        <section style={{ marginBottom: 60 }}>
          <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "#38BDF8", marginBottom: 24 }}>Terms & Conditions</h2>
          <p style={{ color: "#CBD5E1", lineHeight: 1.7, marginBottom: 16 }}>
            Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#FFF", marginTop: 32, marginBottom: 12 }}>1. Introduction & Services</h3>
          <p style={{ color: "#94A3B8", lineHeight: 1.7, marginBottom: 16 }}>
            Welcome to Aradhya E-Gifts ("we," "our," "us"). We provide a platform for creating, personalizing, and sharing premium interactive digital greeting cards and microsites ("E-Gifts"). By accessing or using our platform, you agree to be bound by these Terms and Conditions.
          </p>

          <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#FFF", marginTop: 32, marginBottom: 12 }}>2. User Generated Content (UGC)</h3>
          <p style={{ color: "#94A3B8", lineHeight: 1.7, marginBottom: 16 }}>
            Our service allows you to input custom names, write personal messages, embed audio links (e.g., from YouTube or Spotify), and upload images to personalize your E-Gifts.
          </p>
          <ul style={{ color: "#94A3B8", lineHeight: 1.7, paddingLeft: 20, marginBottom: 16 }}>
            <li><strong>Responsibility:</strong> You are solely responsible for the content you upload. Do not upload copyrighted, illegal, offensive, or explicit material.</li>
            <li><strong>Audio Links:</strong> Embedded audio links must respect the terms of service of the respective third-party platforms.</li>
            <li><strong>Rights Granted:</strong> You grant us a temporary license to process, host, and display your uploaded content strictly for the purpose of generating your personalized E-Gift.</li>
          </ul>

          <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#FFF", marginTop: 32, marginBottom: 12 }}>3. "Share Proof" & Third-Party Integrations</h3>
          <p style={{ color: "#94A3B8", lineHeight: 1.7, marginBottom: 16 }}>
            Some of our interactive E-Gifts include a "Share Proof" feature, allowing you to capture a screenshot of your sealed digital letter.
          </p>
          <ul style={{ color: "#94A3B8", lineHeight: 1.7, paddingLeft: 20, marginBottom: 16 }}>
            <li><strong>Image Hosting:</strong> If your device does not support native file sharing, the screenshot is temporarily uploaded to a third-party image hosting provider (ImgBB) to generate a shareable link.</li>
            <li><strong>WhatsApp Integration:</strong> We utilize WhatsApp deep links (`wa.me`) to format a pre-filled message for your convenience. We do not have access to your WhatsApp account or contacts.</li>
          </ul>

          <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#FFF", marginTop: 32, marginBottom: 12 }}>4. Intellectual Property</h3>
          <p style={{ color: "#94A3B8", lineHeight: 1.7, marginBottom: 16 }}>
            All original designs, animations, UI elements, and templates provided by Aradhya E-Gifts are our intellectual property. You may not copy, reverse-engineer, or resell our templates or platform code.
          </p>
        </section>

        {/* ── Privacy Policy ── */}
        <section>
          <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "#10B981", marginBottom: 24 }}>Privacy Policy</h2>
          <p style={{ color: "#CBD5E1", lineHeight: 1.7, marginBottom: 16 }}>
            We take your privacy seriously. This section details exactly what data we collect, how we store it, and how it is processed.
          </p>

          <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#FFF", marginTop: 32, marginBottom: 12 }}>1. Information We Collect</h3>
          <p style={{ color: "#94A3B8", lineHeight: 1.7, marginBottom: 16 }}>
            When you create an E-Gift, we temporarily process the text, images, and media URLs you provide. 
          </p>
          <ul style={{ color: "#94A3B8", lineHeight: 1.7, paddingLeft: 20, marginBottom: 16 }}>
            <li><strong>Images & Media:</strong> Images you upload directly to the template may be processed securely. If you use the "Share Proof" feature on devices lacking native sharing, the generated screenshot is uploaded to ImgBB to create a temporary public URL.</li>
            <li><strong>Analytics & Logs:</strong> We may collect standard technical information such as IP addresses, browser types, and device information to ensure platform security and optimize user experience.</li>
          </ul>

          <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#FFF", marginTop: 32, marginBottom: 12 }}>2. Local Storage & Cookies</h3>
          <p style={{ color: "#94A3B8", lineHeight: 1.7, marginBottom: 16 }}>
            Our platform utilizes browser `localStorage` to improve your experience.
          </p>
          <ul style={{ color: "#94A3B8", lineHeight: 1.7, paddingLeft: 20, marginBottom: 16 }}>
            <li><strong>Popups & Notifications:</strong> We use local storage to remember your preferences for homepage announcements (e.g., tracking if you clicked "Don't show again today").</li>
            <li><strong>Drafts:</strong> Your ongoing customizations may be saved locally in your browser so you don't lose progress.</li>
          </ul>

          <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#FFF", marginTop: 32, marginBottom: 12 }}>3. Third-Party Data Processors</h3>
          <p style={{ color: "#94A3B8", lineHeight: 1.7, marginBottom: 16 }}>
            We leverage secure third-party services to deliver functionality. Their use of data is governed by their respective privacy policies:
          </p>
          <ul style={{ color: "#94A3B8", lineHeight: 1.7, paddingLeft: 20, marginBottom: 16 }}>
            <li><strong>Firebase:</strong> Used for secure database storage and authentication (if applicable).</li>
            <li><strong>ImgBB:</strong> Used strictly for temporary hosting of "Share Proof" screenshots to generate shareable links.</li>
            <li><strong>EmailJS:</strong> Used to securely route contact form submissions to our support inbox without exposing our private email servers.</li>
          </ul>

          <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#FFF", marginTop: 32, marginBottom: 12 }}>4. Data Security</h3>
          <p style={{ color: "#94A3B8", lineHeight: 1.7, marginBottom: 16 }}>
            We implement industry-standard security measures to protect your personalized gifts. However, because E-Gifts are meant to be shared via URLs, any person who possesses the unique link to your E-Gift will be able to view its contents. Do not include highly sensitive personal information (like passwords or financial data) in your E-Gifts.
          </p>
        </section>

      </div>
    </div>
  );
}
