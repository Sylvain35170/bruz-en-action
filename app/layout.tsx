import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "Bruz en Action — Suivi des engagements municipaux",
  description: "Veille citoyenne sur les promesses du mandat 2026-2031 — Bruz (35)",
  openGraph: {
    title: "Bruz en Action — Suivi des engagements municipaux",
    description: "Association citoyenne de Bruz (35) — suivi des 50 engagements du mandat 2026-2031",
    url: "https://sylvain35170.github.io/bruz-en-action",
    siteName: "Bruz en Action",
    images: [{ url: "https://upload.wikimedia.org/wikipedia/commons/7/74/Bruz-place.jpg", width: 3648, height: 2352, alt: "La place de Bruz (CC BY-SA 4.0 Yves LC)" }],
    locale: "fr_FR",
    type: "website",
  },
  icons: { icon: "/bruz-en-action/logo.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-gray-50 text-gray-900" style={{ fontFamily: "var(--font-geist-sans), Arial, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
