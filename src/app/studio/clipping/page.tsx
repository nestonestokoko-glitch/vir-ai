"use client";

import StudioNav from "@/components/studio/StudioNav";
import AIClippingStudio from "@/components/studio/AIClippingStudio";
import { useRouter } from "next/navigation";

export default function ClippingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#070b14] text-white flex flex-col font-sans">
      <StudioNav
        activeTool="clipping"
        onSelectTool={(tool) => {
          if (tool === "hub") router.push("/studio");
          if (tool === "typography") router.push("/editor");
        }}
      />
      <main className="flex-1">
        <AIClippingStudio />
      </main>
    </div>
  );
}
