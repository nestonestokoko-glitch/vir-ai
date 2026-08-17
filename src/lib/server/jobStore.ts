/**
 * Persistent job store for the clipping pipeline.
 *
 * The pipeline runs as a serverless function on Netlify, where each request can
 * land on a fresh execution context with NO shared memory. The original
 * in-memory `Map` meant the status-poll endpoint could never see a job created
 * by the process endpoint — so the UI spinner ran forever ("clip is not
 * generating"). Netlify Blobs survive across invocations, fixing that.
 *
 * Locally (no `NETLIFY` env) we fall back to an in-memory map so `next dev`
 * keeps working unchanged (the fire-and-forget job runs in the same process).
 */

import { getStore, type Store } from "@netlify/blobs";
import type { ProcessingJob } from "@/lib/clip-types";

const useBlobs = !!process.env.NETLIFY;

const memory = new Map<string, ProcessingJob>();
let _store: Store | null = null;
let _storeInitFailed = false;

function blobStore(): Store | null {
  if (_storeInitFailed) return null;
  if (_store) return _store;
  if (!useBlobs) return null;
  try {
    _store = getStore({ name: "clip-jobs", consistency: "strong" });
    return _store;
  } catch {
    _storeInitFailed = true;
    return null;
  }
}

export async function saveJob(job: ProcessingJob): Promise<void> {
  memory.set(job.id, job);
  const s = blobStore();
  if (s) {
    try {
      await s.set(job.id, JSON.stringify(job));
    } catch {
      /* Blobs write failed — in-memory copy still serves this invocation. */
    }
  }
}

export async function getJob(id: string): Promise<ProcessingJob | undefined> {
  const s = blobStore();
  if (s) {
    try {
      const v = await s.get(id, { type: "json" });
      if (v) return v as ProcessingJob;
    } catch {
      /* fall through to memory */
    }
  }
  return memory.get(id);
}
