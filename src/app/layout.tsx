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
      siteName: "Aradhya E-Gifts",
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
  // Use admin-uploaded favicon for browser tab if available, otherwise fall back to file
  const browserFavicon = settings.faviconUrl || "/favicon.ico";

  return (
    <html lang="en">
      <head>
        {/* Admin-configurable favicon for browser tab (base64 or URL) */}
        <link rel="icon" type="image/png" href={browserFavicon} />
        <link rel="shortcut icon" href={browserFavicon} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Dancing+Script:wght@600;700&family=Nunito:wght@400;600;700;800;900&family=Special+Elite&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Cormorant+Garamond:wght@500;700&family=Cinzel:wght@400;700&family=Great+Vibes&family=Sacramento&family=Pacifico&family=Parisienne&family=Montserrat:wght@300;400;500;600;700&family=Alex+Brush&family=Lobster&display=swap"
          rel="stylesheet"
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
