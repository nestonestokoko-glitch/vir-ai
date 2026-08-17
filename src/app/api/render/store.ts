export interface RenderJob {
  id: string;
  status: "queued" | "rendering" | "completed" | "failed";
  progress?: number;
  videoUrl?: string;
  error?: string;
  createdAt: number;
}

// In-memory job store (shared between POST /api/render and GET /api/render/[jobId])
export const renderJobs: Map<string, RenderJob> = new Map();
