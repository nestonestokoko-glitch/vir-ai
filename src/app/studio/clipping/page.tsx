"use client";

import { Inter } from "next/font/google";
import StudioNav from "@/components/studio/StudioNav";
import AIClippingStudio from "@/components/studio/AIClippingStudio";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export default function ClippingPage() {
  return (
    <div
      className={`${inter.variable} relative min-h-screen overflow-x-hidden bg-deep font-[family-name:var(--font-inter)] text-ink flex flex-col`}
    >
      {/* Barely-visible brand radial lighting */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[620px] w-[920px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(2,54,86,0.2),transparent_70%)] blur-3xl" />
      </div>

      <StudioNav activeTool="clipping" onSelectTool={() => {}} />

      <main className="relative flex-1">
        <AIClippingStudio />
      </main>
    </div>
  );
}
