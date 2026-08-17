import { Almarai, Instrument_Serif, Inter } from "next/font/google";
import { PrismaHero } from "@/components/prisma/PrismaHero";
import { PrismaAbout } from "@/components/prisma/PrismaAbout";
import { PrismaFeatures } from "@/components/prisma/PrismaFeatures";

const almarai = Almarai({
  subsets: ["latin"],
  weight: ["300", "400", "700", "800"],
  variable: "--font-almarai",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["italic", "normal"],
  variable: "--font-instrument",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
  display: "swap",
});

export default function Home() {
  return (
    <main
      className={`${almarai.variable} ${instrumentSerif.variable} ${inter.variable} overflow-x-hidden bg-black text-[#E1E0CC]`}
      style={{
        fontFamily:
          "var(--font-almarai), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      <PrismaHero />
      <PrismaAbout />
      <PrismaFeatures />
    </main>
  );
}
