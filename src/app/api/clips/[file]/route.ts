import { NextRequest, NextResponse } from "next/server";
import path from "node:path";
import { getClip } from "@/lib/server/clipStore";

// Generated clips are stored in Netlify Blobs on serverless (the render happens
// in a different invocation than this serve route, and local disk isn't shared
// across invocations). On local dev the store falls back to public/generated.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ file: string }> }
) {
  try {
    const { file } = await params;
    // Strip any directory components to prevent path traversal.
    const safe = path.basename(file || "");
    if (!safe) return new NextResponse("Bad request", { status: 400 });

    const clip = await getClip(safe);
    if (!clip) return new NextResponse("Not found", { status: 404 });

    return new NextResponse(
      new Blob([clip.data as BlobPart], { type: clip.contentType }),
      {
        status: 200,
        headers: {
          "Content-Type": clip.contentType,
          "Content-Length": String(clip.data.length),
          "Accept-Ranges": "bytes",
          "Cache-Control": "public, max-age=3600",
        },
      }
    );
  } catch {
    return new NextResponse("Server error", { status: 500 });
  }
}
