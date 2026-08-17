import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Force extra files into the serverless function bundle. `ffmpeg-static` /
  // `ffprobe-static` are traced automatically via require(), but the committed
  // standalone `yt-dlp` Linux binary is referenced by a string path, so nft
  // won't include it unless we list it explicitly here.
  outputFileTracingIncludes: {
    "/api/clipping/process": [
      "./bin/linux/**",
      "./node_modules/ffmpeg-static/**",
      "./node_modules/ffprobe-static/**",
    ],
  },
};

export default nextConfig;
