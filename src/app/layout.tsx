import type { Metadata } from "next";
import "./globals.css";
import { getSettingsDB } from "@/lib/db";
import MaintenanceWrapper from "@/components/MaintenanceWrapper";

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aradhyagifts.in";
  return {
    metadataBase: new URL(siteUrl),
    title: "Aradhya E-Gifts — Personalised Digital Surprises",
    description:
      "Send magical, customised digital gifting pages for birthdays, proposals, anniversaries & more. Preview, personalise and share instantly.",
    keywords: "e-gift, digital gift, birthday surprise, personalised webpage, proposal gift, anniversary, India",
    alternates: {
      canonical: siteUrl,
    },
    openGraph: {
      title: "Aradhya E-Gifts — Personalised Digital Surprises",
      description: "Send magical, customised digital gifting pages for birthdays, proposals, anniversaries & more.",
      type: "website",
      url: siteUrl,
      siteName: "Aradhya E-Giftings",
    },
    // ⚠️ Always use a real hosted URL here — Google cannot crawl base64 data URLs.
    // The admin-uploaded favicon is injected via <link> in <head> below for browser tabs.
    icons: {
      icon: [
        { url: `${siteUrl}/favicon.png`, type: "image/png" },
        { url: `${siteUrl}/favicon.ico` },
      ],
      shortcut: `${siteUrl}/favicon.png`,
      apple: `${siteUrl}/favicon.png`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSettingsDB();

  return (
    <html lang="en">
      <head>
        {/* ✅ Real URL favicon — Google crawls this one (must be first) */}
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="shortcut icon" href="/favicon.png" />
        {/* Browser tab override: admin-uploaded favicon (base64 or URL). Browsers use the last matching <link>, so this wins for the tab display. Google uses the first one above. */}
        {settings.faviconUrl && settings.faviconUrl !== "/favicon.ico" && (
          <link rel="icon" type="image/png" href={settings.faviconUrl} />
        )}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Dancing+Script:wght@600;700&family=Nunito:wght@400;600;700;800;900&family=Special+Elite&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Cormorant+Garamond:wght@500;700&family=Cinzel:wght@400;700&family=Great+Vibes&family=Sacramento&family=Pacifico&family=Parisienne&family=Montserrat:wght@300;400;500;600;700&family=Alex+Brush&family=Lobster&display=swap"
          rel="stylesheet"
        />
        {/* JSON-LD: WebSite schema — tells Google the site name to show in search results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Aradhya E-Giftings",
              "alternateName": "Aradhya E-Gifts",
              "url": "https://aradhyagifts.in",
              "description": "Send magical, customised digital gifting pages for birthdays, proposals, anniversaries & more.",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://aradhyagifts.in/?s={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </head>
      <body>
        <MaintenanceWrapper>
          {children}
        </MaintenanceWrapper>
      </body>
    </html>
  );
}
