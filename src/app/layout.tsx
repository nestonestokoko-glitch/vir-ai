import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VIR AI - Text Motion Reel Maker",
  description: "Convert English text into animated typography reels for Instagram, Shorts & TikTok.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <head>
        <link
          href="https://db.onlinewebfonts.com/c/bb5de19d87c09a95216dc6ccd96e37c6?family=Nimbus+Sans+TW01"
          rel="stylesheet"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Archivo+Black&family=Bebas+Neue&family=Cormorant+Garamond:wght@400;700&family=DM+Sans:wght@400;700&family=DM+Serif+Display&family=IBM+Plex+Mono:wght@400;700&family=Inter:wght@400;600;700;800&family=JetBrains+Mono:wght@400;700&family=League+Spartan:wght@700&family=Lora:ital,wght@0,400;0,700;1,400&family=Manrope:wght@400;700;800&family=Merriweather:wght@400;700&family=Montserrat:wght@400;600;700;900&family=Oswald:wght@500;700&family=Playfair+Display:ital,wght@0,600;0,800;1,600&family=Poppins:wght@400;600;700;800&family=Roboto:wght@400;500;700&family=Space+Grotesk:wght@500;700&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
