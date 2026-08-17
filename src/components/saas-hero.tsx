"use client";

import Link from "next/link";
import { useState } from "react";
import type { CSSProperties, FormEvent, ReactNode } from "react";

const grassImage =
  "https://res.cloudinary.com/dy5er7kv5/image/upload/q_auto/f_auto/v1781191264/grass_eam204.png";

type IconProps = {
  className?: string;
};

const Logo = ({ className = "h-6 w-6" }: IconProps) => (
  <svg className={className} viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
    <path d="M144 256H27.598L144 139.598V256ZM256 207.5L200 256V56H0L48 0h208v207.5ZM0 204.402V112h92.402L0 204.402Z" />
  </svg>
);

const Icon = ({ name, className = "h-5 w-5" }: IconProps & { name: string }) => {
  const paths: Record<string, ReactNode> = {
    arrowUp: <path d="M12 19V5m0 0-6 6m6-6 6 6" />,
    chevronDown: <path d="m6 9 6 6 6-6" />,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    x: <path d="M18 6 6 18M6 6l12 12" />,
    play: <path d="m8 5 11 7-11 7V5Z" />,
    sparkles: <path d="M12 3l1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3ZM5 16l.8 2.2L8 19l-2.2.8L5 22l-.8-2.2L2 19l2.2-.8L5 16ZM19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14Z" />,
    panel: <path d="M4 5h16v14H4V5Zm5 0v14" />,
    left: <path d="m15 18-6-6 6-6" />,
    right: <path d="m9 18 6-6-6-6" />,
    monitor: <path d="M5 5h14v10H5V5Zm4 14h6m-3-4v4" />,
    rotate: <path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5" />,
    share: <path d="M8 12h8m-4-4 4 4-4 4M5 5h5M5 19h5" />,
    plus: <path d="M12 5v14M5 12h14" />,
    copy: <path d="M8 8h11v11H8V8Zm-3 8V5h11" />,
    grid: <path d="M5 5h5v5H5V5Zm9 0h5v5h-5V5ZM5 14h5v5H5v-5Zm9 0h5v5h-5v-5Z" />,
    compass: <path d="m16 8-2.4 5.6L8 16l2.4-5.6L16 8ZM12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" />,
    layers: <path d="m12 3 9 5-9 5-9-5 9-5Zm-7 9 7 4 7-4M5 16l7 4 7-4" />,
    list: <path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" />,
  };

  return (
    <svg className={className} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  );
};

const navItems = ["Templates", "Styles", "Pricing"];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="animate-fade-down relative z-20 px-5 py-4 sm:px-8 sm:py-5 lg:px-10">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-gray-900" aria-label="VIR AI home">
          <Logo className="h-5 w-5 sm:h-6 sm:w-6" />
          <span className="text-[15px] font-semibold tracking-normal">VIR AI</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link href="/studio" className="text-[13px] font-semibold text-gray-900 transition-colors hover:text-sky-600">
            Studio Hub
          </Link>
          <Link href="/editor" className="text-[13px] text-gray-700 transition-colors hover:text-gray-900">
            Typography Reels
          </Link>
          <Link href="/studio/clipping" className="flex items-center gap-1 text-[13px] font-semibold text-indigo-600 transition-colors hover:text-indigo-800">
            AI Clipping
            <span className="rounded-full bg-indigo-100 px-1.5 py-0.5 text-[9px] text-indigo-600 font-bold">NEW</span>
          </Link>
          <a href="#how-it-works" className="text-[13px] text-gray-700 transition-colors hover:text-gray-900">
            Workflow
          </a>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/studio" className="rounded-full bg-gradient-to-r from-gray-900 via-slate-800 to-indigo-950 px-4 py-2 text-[13px] font-semibold text-white shadow-md transition-all hover:scale-105 sm:px-5">
            Open Studio ✨
          </Link>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-900 transition-colors hover:bg-gray-900/10 md:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            <Icon name={open ? "x" : "menu"} />
          </button>
        </div>
      </div>

      {open ? (
        <div className="animate-fade-up absolute left-4 right-4 top-full rounded-2xl bg-white/95 px-5 py-3 shadow-xl ring-1 ring-gray-200 md:hidden">
          {navItems.map((item) => (
            <a key={item} href={item === "Templates" ? "#typography" : item === "Styles" ? "#animation" : "#features"} className="block border-b border-gray-200 py-3 text-[15px] text-gray-700 last:border-b-0 hover:text-gray-900">
              {item}
            </a>
          ))}
        </div>
      ) : null}
    </nav>
  );
};

const stats = [
  ["CLIPS", "184", "Ready to post"],
  ["STYLES", "32", "Motion systems"],
  ["SPEED", "8 sec", "Average draft"],
  ["REACH", "3.2M", "Monthly views"],
];

const cards = [
  ["Hook Builder", "Generate scroll-stopping openers for every reel."],
  ["Caption Sync", "Align kinetic text beats to audio timing."],
  ["Brand Kits", "Reuse fonts, colors, and layouts instantly."],
];

const rows = [
  ["Launch teaser for Instagram Reels", "9:16", "Medium", "Drafting"],
  ["Product update in bold captions", "1:1", "Easy", "Ready"],
  ["Motivational quote sequence", "9:16", "Easy", "Ready"],
  ["Shorts intro with punchy text", "16:9", "Hard", "Drafting"],
  ["Presentation opener animation", "16:9", "Medium", "Queued"],
];

const GrassLayer = ({
  className,
  style,
}: {
  className: string;
  style?: CSSProperties;
}) => (
  <div
    className={`pointer-events-none absolute left-0 w-full select-none bg-cover bg-bottom bg-repeat-x ${className}`}
    style={{ backgroundImage: `url(${grassImage})`, ...style }}
    aria-hidden="true"
  />
);

const DashboardMockup = () => (
  <div className="animate-hero-rise relative z-20 mx-auto -mb-20 w-[92%] max-w-5xl shrink-0 text-left [animation-delay:620ms] sm:-mb-32 sm:w-[84%] lg:-mb-44 lg:w-[74%]">
    <div className="overflow-hidden rounded-t-2xl bg-[#1a1a1c] text-left shadow-[0_-20px_80px_rgba(0,0,0,0.35)] ring-1 ring-white/10">
      <div className="flex items-center gap-3 border-b border-white/5 bg-[#242427] px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>
        <Icon name="panel" className="h-3.5 w-3.5 text-white/40" />
        <Icon name="left" className="h-3.5 w-3.5 text-white/25" />
        <Icon name="right" className="h-3.5 w-3.5 text-white/25" />
        <div className="mx-auto flex min-w-0 items-center gap-2 rounded-md bg-[#1a1a1c] px-6 py-1 text-[10px] text-white/60">
          <Icon name="monitor" className="h-3.5 w-3.5 shrink-0 text-white/40" />
          <span className="truncate">vir-ai.studio</span>
        </div>
        <div className="hidden gap-3 sm:flex">
          {["rotate", "share", "plus", "copy"].map((name) => (
            <Icon key={name} name={name} className="h-3.5 w-3.5 text-white/40" />
          ))}
        </div>
      </div>

      <div className="flex min-h-[200px] bg-[#171719] sm:min-h-[360px]">
        <aside className="hidden w-[22%] shrink-0 border-r border-white/5 bg-[#1e1e21] px-3 py-3.5 sm:block">
          <div className="mb-5 flex items-center justify-between">
            <Logo className="h-4 w-4 text-white/70" />
            <Icon name="grid" className="h-3.5 w-3.5 text-white/30" />
          </div>
          <div className="mb-5 flex items-center gap-2">
            <div className="flex h-4 w-4 items-center justify-center rounded bg-[#526ef5] text-[9px] font-semibold text-white">V</div>
            <span className="text-[10px] text-white/80">Creator Studio</span>
          </div>
          <div className="space-y-2">
            {[
              ["compass", "Projects"],
              ["layers", "Typography"],
              ["list", "Render Queue"],
            ].map(([icon, label]) => (
              <div key={label} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[10px] text-white/60">
                <Icon name={icon} className="h-3.5 w-3.5" />
                {label}
              </div>
            ))}
          </div>
          <div className="mt-7 space-y-2">
            <p className="text-[8px] uppercase tracking-wider text-white/25">Recent reels</p>
            {["Summer sale intro", "Founder quote", "Demo captions"].map((item) => (
              <div key={item} className="flex items-center gap-2 text-[9px] text-white/50">
                <span className="h-1.5 w-1.5 rounded-full bg-[#28c840]/70" />
                {item}
              </div>
            ))}
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-3 py-3 sm:px-6 sm:py-5">
          <div className="mb-3 flex items-center justify-between gap-3 sm:mb-5 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#526ef5] text-xs font-semibold text-white sm:h-9 sm:w-9 sm:text-sm">V</div>
              <div>
                <p className="text-xs font-medium text-white sm:text-sm">VIR AI Studio</p>
                <p className="text-[9px] text-white/45 sm:text-[10px]">Typography reels for high-speed content teams</p>
              </div>
            </div>
            <button className="flex shrink-0 items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[9px] font-medium text-gray-900 sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-[10px]">
              <Icon name="sparkles" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              Generate
            </button>
          </div>

          <div className="grid grid-cols-2 divide-x divide-y divide-white/5 rounded-xl bg-white/[0.03] ring-1 ring-white/5 sm:grid-cols-4 sm:divide-y-0">
            {stats.map(([label, value, helper], idx) => (
              <div key={label} className={`p-2 sm:p-3 ${idx >= 2 ? "hidden sm:block" : ""}`}>
                <p className="text-[8px] tracking-wider text-white/35">{label}</p>
                <p className="mt-0.5 text-base font-medium text-white sm:mt-1 sm:text-xl">{value}</p>
                <p className="mt-0.5 text-[8px] text-white/40 sm:text-[9px]">{helper}</p>
              </div>
            ))}
          </div>

          <div className="mt-2.5 hidden grid-cols-1 gap-2 sm:mt-4 sm:grid sm:gap-3 md:grid-cols-3">
            {cards.map(([title, body]) => (
              <div key={title} className="rounded-lg bg-white/[0.03] p-2.5 sm:p-3 ring-1 ring-white/5">
                <p className="text-[10px] font-medium text-white sm:text-[11px]">{title}</p>
                <p className="mt-1 text-[8px] leading-relaxed text-white/45 sm:mt-2 sm:text-[9px]">{body}</p>
              </div>
            ))}
          </div>

          <div className="mt-2.5 overflow-hidden rounded-lg bg-white/[0.03] ring-1 ring-white/5 sm:mt-4">
            <div className="grid grid-cols-[1fr_42px_50px_52px] border-b border-white/5 px-2.5 py-1.5 text-[7.5px] uppercase tracking-wider text-white/30 sm:grid-cols-[1fr_46px_58px_58px] sm:px-3 sm:py-2 sm:text-[8px]">
              <span>Drafting inbox</span>
              <span>Size</span>
              <span>Lift</span>
              <span>Status</span>
            </div>
            {rows.map(([question, size, lift, status], idx) => (
              <div key={question} className={`border-b border-white/5 px-2.5 py-1.5 text-[8.5px] text-white/55 last:border-b-0 sm:px-3 sm:py-2 sm:text-[9px] ${idx >= 2 ? "hidden sm:grid grid-cols-[1fr_46px_58px_58px]" : "grid grid-cols-[1fr_42px_50px_52px] sm:grid-cols-[1fr_46px_58px_58px]"}`}>
                <span className="truncate pr-2 sm:pr-3">{question}</span>
                <span>{size}</span>
                <span>{lift}</span>
                <span className={status === "Drafting" ? "text-[#febc2e]/80" : status === "Ready" ? "text-[#28c840]/80" : "text-white/40"}>{status}</span>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  </div>
);

export const SaasHero = () => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <section className="relative flex min-h-[100svh] flex-col overflow-hidden bg-sky-100">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
      >
        <source src="/windblowing-mobile.mp4" type="video/mp4" media="(max-width: 639px)" />
        <source src="/wind-blowing.mp4" type="video/mp4" />
      </video>
      <Navbar />
      <div className="flex-1 shrink-0 sm:min-h-12 lg:min-h-16" />

      <div className="relative z-20 mx-auto flex w-full max-w-4xl flex-col items-center px-5 text-center">
        <h1 className="font-normal leading-[1.05] tracking-tight text-gray-900 text-[40px] min-[400px]:text-[44px] sm:text-6xl lg:text-7xl xl:text-[80px]">
          <span className="animate-fade-up block">Make text move.</span>
          <span className="animate-fade-up block [animation-delay:100ms]">Effortlessly.</span>
        </h1>

        <form className="animate-fade-up mt-5 w-full max-w-xl [animation-delay:220ms] sm:mt-6" onSubmit={handleSubmit}>
          <div className="flex items-center gap-3 rounded-full bg-white/70 py-1.5 pl-5 pr-1.5 ring-1 ring-gray-200 shadow-sm">
            <input
              className="flex-1 bg-transparent py-2 text-sm text-gray-900 outline-none placeholder:text-gray-500 sm:text-base"
              placeholder="Type a hook for your next reel..."
              aria-label="Typography reel prompt"
            />
            <Link href="/editor" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-900 text-white transition-transform hover:scale-105 active:scale-95 sm:h-10 sm:w-10" aria-label="Start creating">
              <Icon name="arrowUp" className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
            </Link>
          </div>
        </form>

        <p className="animate-fade-up mt-4 max-w-md text-sm leading-relaxed text-gray-600 [animation-delay:340ms] sm:mt-5 sm:text-base lg:text-lg">
          Ship animated typography reels from raw text
          <br />
          and publish sharper stories with <Icon name="sparkles" className="-mt-1 inline h-4 w-4" /> VIR AI
        </p>

        <div className="animate-fade-up mt-4 flex flex-wrap items-center justify-center gap-3 [animation-delay:460ms] sm:mt-5">
          <Link href="/studio" className="rounded-full bg-gray-900 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-gray-800 hover:shadow-lg">
            Open AI Video Studio
          </Link>
          <Link href="/studio/clipping" className="flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:bg-indigo-700 hover:scale-105">
            <Icon name="play" className="h-4 w-4" />
            Try AI Clipping
          </Link>
        </div>
      </div>

      <div className="flex-1 min-h-10 shrink-0 sm:min-h-12 lg:min-h-16" />
      <GrassLayer
        className="bottom-24 z-10 h-28 opacity-100 sm:bottom-28 sm:h-36 lg:bottom-32 lg:h-44"
        style={{ backgroundSize: "auto 100%" }}
      />
      <DashboardMockup />
      <GrassLayer
        className="bottom-0 z-30 h-36 opacity-100 sm:h-48 lg:h-60"
        style={{ backgroundSize: "auto 112%" }}
      />
    </section>
  );
};
