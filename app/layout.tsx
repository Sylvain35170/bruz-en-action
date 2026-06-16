import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "Bruz en Action — Suivi des engagements municipaux",
  description: "Veille citoyenne sur les promesses du mandat 2026-2031 — Bruz (35)",
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
