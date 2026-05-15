import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aradhya E-Gifts — Personalised Digital Surprises",
  description:
    "Send magical, customised digital gifting pages for birthdays, proposals, anniversaries & more. Preview, personalise and share instantly.",
  keywords: "e-gift, digital gift, birthday surprise, personalised webpage, proposal gift, anniversary",
  openGraph: {
    title: "Aradhya E-Gifts",
    description: "Magical personalised digital gift pages",
    type: "website",
  },
};

import MaintenanceWrapper from "@/components/MaintenanceWrapper";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Dancing+Script:wght@600;700&family=Nunito:wght@400;600;700;800;900&family=Special+Elite&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Cormorant+Garamond:wght@500;700&display=swap"
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

