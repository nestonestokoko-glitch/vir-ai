/**
 * Persistent store for rendered clip MP4s.
 *
 * The clip is rendered inside the `process` function invocation, but it is
 * PLAYED BACK by a separate `/api/clips/[id]` invocation. On serverless the
 * local disk is neither shared across invocations nor writable outside /tmp, so
 * a file written during render is invisible to the serving route. We store the
 * rendered bytes in Netlify Blobs (cross-invocation) on serverless, and fall
 * back to the local disk (`public/generated`) for `next dev` so local behavior
 * is unchanged.
 */

import { getStore, type Store } from "@netlify/blobs";
import fs from "node:fs";
import path from "node:path";
import { IS_SERVERLESS } from "./isServerless";
import { PROJECT_ROOT } from "./paths";

const DISK_DIR = path.join(PROJECT_ROOT, "public", "generated");
const TMP_DIR = path.join("/tmp", "generated");

let _store: Store | null = null;
let _storeFailed = false;
function blobStore(): Store | null {
  if (_storeFailed) return null;
  if (_store) return _store;
  if (!IS_SERVERLESS) return null;
  try {
    _store = getStore({ name: "clips", consistency: "strong" });
    return _store;
  } catch {
    _storeFailed = true;
    return null;
  }
}

function keyFor(id: string): string {
  return id.endsWith(".mp4") ? id : `${id}.mp4`;
}

export async function saveClip(id: string, buffer: Buffer): Promise<void> {
  const key = keyFor(id);
  if (IS_SERVERLESS) {
    const s = blobStore();
    if (s) {
      try {
        const ab = buffer.buffer.slice(
          buffer.byteOffset,
          buffer.byteOffset + buffer.byteLength
        ) as ArrayBuffer;
        await s.set(key, ab);
        return;
      } catch {
        /* fall through to /tmp */
      }
    }
    // Blobs unavailable — last resort: writable /tmp (works only if the same
    // warm container serves the clip, but better than nothing).
    try {
      fs.mkdirSync(TMP_DIR, { recursive: true });
      fs.writeFileSync(path.join(TMP_DIR, key), buffer);
    } catch {
      /* ignore */
    }
    return;
  }
  try {
    fs.mkdirSync(DISK_DIR, { recursive: true });
    fs.writeFileSync(path.join(DISK_DIR, key), buffer);
  } catch {
    /* ignore */
  }
}

export async function getClip(
  id: string
): Promise<{ data: Buffer; contentType: string } | null> {
  const key = keyFor(id);
  if (IS_SERVERLESS) {
    const s = blobStore();
    if (s) {
      try {
        const data = await s.get(key, { type: "arrayBuffer" });
        if (data) return { data: Buffer.from(data), contentType: "video/mp4" };
      } catch {
        /* fall through */
      }
    }
    const p = path.join(TMP_DIR, key);
    if (fs.existsSync(p)) {
      try {
        return { data: fs.readFileSync(p), contentType: "video/mp4" };
      } catch {
        /* ignore */
      }
    }
    return null;
  }
  const p = path.join(DISK_DIR, key);
  if (fs.existsSync(p)) {
    try {
      return { data: fs.readFileSync(p), contentType: "video/mp4" };
    } catch {
      /* ignore */
    }
  }
  return null;
}
