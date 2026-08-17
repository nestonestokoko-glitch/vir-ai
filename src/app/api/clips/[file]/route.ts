import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { PROJECT_ROOT } from "@/lib/server/paths";

// Generated clips are written to public/generated at RUNTIME. `next start`
// (production) snapshots `public/` at boot and will 404 any file created
// afterwards — so the <video> player would never load a freshly rendered clip.
// This route serves those files directly from disk on every request, bypassing
// the static cache.
const GENERATED_DIR = path.join(PROJECT_ROOT, "public", "generated");

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ file: string }> }
) {
  try {
    const { file } = await params;
    // Strip any directory components to prevent path traversal.
    const safe = path.basename(file || "");
    if (!safe) return new NextResponse("Bad request", { status: 400 });

    const filePath = path.join(GENERATED_DIR, safe);
    if (!filePath.startsWith(GENERATED_DIR) || !fs.existsSync(filePath)) {
      return new NextResponse("Not found", { status: 404 });
    }

    const data = fs.readFileSync(filePath);
    return new NextResponse(new Blob([data as BlobPart], { type: "video/mp4" }), {
      status: 200,
      headers: {
        "Content-Type": "video/mp4",
        "Content-Length": String(data.length),
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("Server error", { status: 500 });
  }
}
