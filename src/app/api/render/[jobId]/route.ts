import { NextResponse } from "next/server";
import { renderJobs } from "../store";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const job = renderJobs.get(jobId);

    if (!job) {
      return NextResponse.json(
        { error: "Render job not found" },
        { status: 404 }
      );
    }

    // Return job status
    const response: any = {
      status: job.status,
    };

    if (job.progress !== undefined) {
      response.progress = job.progress;
    }

    if (job.videoUrl) {
      response.videoUrl = job.videoUrl;
    }

    if (job.error) {
      response.error = job.error;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json(
      { error: "Failed to check render status" },
      { status: 500 }
    );
  }
}
