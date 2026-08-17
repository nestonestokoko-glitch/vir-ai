"use client";

import { useState } from "react";
import StudioNav from "@/components/studio/StudioNav";
import AIClippingStudio from "@/components/studio/AIClippingStudio";

export default function StudioPage() {
  const [activeTool, setActiveTool] = useState<"clipping">("clipping");

  return (
    <div className="min-h-screen bg-[#070b14] text-white flex flex-col font-sans">
      <StudioNav activeTool={activeTool} onSelectTool={setActiveTool} />

      <main className="flex-1">
        {activeTool === "clipping" && <AIClippingStudio />}
      </main>
    </div>
  );
}
