import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legal & Policy Centre — Aradhya E-Gifts | Terms, Privacy, Refund, Return, Disclaimer",
  description:
    "Complete legal information for Aradhya E-Gifts including Terms & Conditions, Privacy Policy, Refund Policy, Return Policy, and Disclaimer. Read our policies before using our digital gifting platform.",
  keywords:
    "legal, terms and conditions, privacy policy, refund policy, return policy, disclaimer, Aradhya E-Gifts, digital gifts, e-gifts India",
  robots: {
    index: true,
    follow: true,
  },
};

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
