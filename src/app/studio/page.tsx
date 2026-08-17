"use client";

import { useState } from "react";
import StudioNav from "@/components/studio/StudioNav";
import StudioHub from "@/components/studio/StudioHub";
import AIClippingStudio from "@/components/studio/AIClippingStudio";
import TypographyStudio from "@/app/editor/page";

export default function StudioPage() {
  const [activeTool, setActiveTool] = useState<"hub" | "typography" | "clipping">("hub");

  return (
    <div className="min-h-screen bg-[#070b14] text-white flex flex-col font-sans">
      <StudioNav activeTool={activeTool} onSelectTool={setActiveTool} />

      <main className="flex-1">
        {activeTool === "hub" && (
          <StudioHub onSelectOption={(option) => setActiveTool(option)} />
        )}

        {activeTool === "clipping" && <AIClippingStudio />}

        {activeTool === "typography" && (
          <div className="h-full">
            <TypographyStudio />
          </div>
        )}
      </main>
    </div>
  );
}
