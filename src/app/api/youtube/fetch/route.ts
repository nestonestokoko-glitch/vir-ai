import { NextRequest, NextResponse } from "next/server";
import { fetchVideoMetadata, isValidYouTubeUrl } from "@/lib/youtube";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "Please enter a valid YouTube video URL." },
        { status: 400 }
      );
    }

    if (!isValidYouTubeUrl(url)) {
      return NextResponse.json(
        { error: "Invalid YouTube URL. Supported formats: youtube.com/watch?v=... or youtu.be/..." },
        { status: 400 }
      );
    }

    const metadata = await fetchVideoMetadata(url);

    return NextResponse.json({
      success: true,
      metadata,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to process video metadata." },
      { status: 500 }
    );
  }
}
