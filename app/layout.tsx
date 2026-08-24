import type { Metadata, Viewport } from "next";
import { Public_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Polices auto-hébergées : next/font les télécharge au build et les sert
// depuis le site — aucune requête vers Google côté visiteur (RGPD).
const publicSans = Public_Sans({ subsets: ["latin"], variable: "--font-public-sans" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-jetbrains-mono" });

export const metadata: Metadata = {
  title: "Bruz en Action — Suivi des engagements municipaux",
  description: "Veille citoyenne sur les promesses du mandat 2026-2032 — Bruz (35)",
  openGraph: {
    title: "Bruz en Action — Suivi des engagements municipaux",
    description: "Association citoyenne de Bruz (35) — suivi des 50 engagements du mandat 2026-2032",
    url: "https://sylvain35170.github.io/bruz-en-action",
    siteName: "Bruz en Action",
    images: [{ url: "https://sylvain35170.github.io/bruz-en-action/og-image-wide.jpg", width: 1200, height: 630, alt: "Bruz en Action — association citoyenne de Bruz" }],
    locale: "fr_FR",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/bruz-en-action/icons/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/bruz-en-action/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/bruz-en-action/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/bruz-en-action/icons/apple-touch-icon.png",
  },
  manifest: "/bruz-en-action/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Bruz en Action",
  },
};

export const viewport: Viewport = {
  themeColor: "#1a397a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${publicSans.variable} ${jetbrainsMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
