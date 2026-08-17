import TypographyStyleCard from "./typography-style-card";

export const TypographyShowcase = () => {
  return (
    <section id="typography" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Typography Styles
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Professional font combinations designed for maximum impact
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <TypographyStyleCard
            name="Modern"
            description="Clean, contemporary sans-serif"
            fonts="Inter, Roboto, Poppins"
          />
          <TypographyStyleCard
            name="Minimal"
            description="Ultra-clean with plenty of whitespace"
            fonts="Manrope, Space Grotesk, DM Sans"
          />
          <TypographyStyleCard
            name="Cinematic"
            description="Bold, dramatic movie-title style"
            fonts="Bebas Neue, Anton, Oswald"
          />
          <TypographyStyleCard
            name="Kinetic"
            description="Energetic, movement-focused"
            fonts="Montserrat, League Spartan, Archivo Black"
          />
          <TypographyStyleCard
            name="Editorial"
            description="Magazine-inspired with serif accents"
            fonts="Playfair Display, Merriweather, Lora"
          />
          <TypographyStyleCard
            name="Typewriter"
            description="Classic monospace typewriter feel"
            fonts="JetBrains Mono, Space Mono, IBM Plex Mono"
          />
          <TypographyStyleCard
            name="Hook"
            description="Multi-color gradient shine title with soft drop shadow — built for typography reels"
            fonts="Coolvetica, Anton, Bebas Neue"
            accent="gradient"
          />
        </div>
      </div>
    </section>
  );
};