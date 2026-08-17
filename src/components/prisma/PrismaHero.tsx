"use client";

import { ButtonWithIcon } from "@/components/ui/button-witn-icon";

const HERO_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4";

const navLinks = ["Our story", "Studio", "AI Clipping", "Pricing", "Contact"];

export function PrismaHero() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-[hsl(201_100%_13%)] font-[family-name:var(--font-inter)]">
      {/* Fullscreen looping background video */}
      <video
        className="absolute inset-0 z-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        src={HERO_VIDEO}
      />

      {/* Glassmorphic navigation */}
      <nav className="relative z-10 mx-auto flex max-w-7xl flex-row items-center justify-between px-8 py-6">
        <div
          className="text-3xl tracking-tight text-white"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          VIR AI
        </div>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link, i) => (
            <a
              key={link}
              href="#"
              className={`text-sm transition-colors ${
                i === 0
                  ? "text-white"
                  : "text-[hsl(240_4%_66%)] hover:text-white"
              }`}
            >
              {link}
            </a>
          ))}
        </div>

        <ButtonWithIcon label="Start creating" href="/studio/clipping" />
      </nav>

      {/* Hero content */}
      <div className="relative z-10 flex flex-col items-center px-6 pb-40 pt-32 text-center">
        <h1
          className="max-w-7xl animate-fade-rise break-words text-balance text-4xl font-normal leading-[0.95] tracking-tight text-white sm:text-7xl md:text-8xl md:tracking-[-2.46px]"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Where <em className="not-italic text-[hsl(240_4%_66%)]">long videos</em> become{" "}
          <em className="not-italic text-[hsl(240_4%_66%)]">scroll-stopping clips.</em>
        </h1>

        <p className="animate-fade-rise-delay mt-8 max-w-2xl text-base leading-relaxed text-[hsl(240_4%_66%)] sm:text-lg">
          VIR AI is an AI-powered studio that turns long-form video into polished,
          ready-to-post clips — built by creators, for creators hungry to ship
          faster.
        </p>

        <ButtonWithIcon
          label="Start creating"
          href="/studio/clipping"
          className="animate-fade-rise-delay-2 mt-12"
        />
      </div>
    </section>
  );
}

export default PrismaHero;
