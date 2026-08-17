/**
 * Reliable detection of the Netlify serverless runtime.
 *
 * Netlify injects several env vars into function invocations, but NOT always
 * the `NETLIFY` flag (this app's Next.js functions do not see it). The vars we
 * reliably observe injected are `URL` (site URL) and, for Blobs, `SITE_ID` /
 * `NETLIFY_API_TOKEN`. Any of these indicates we're on serverless, where the
 * runtime freezes background work after the HTTP response — so pipelines must
 * be awaited inside the request and state must persist via Netlify Blobs rather
 * than in-memory.
 */
export const IS_SERVERLESS = !!(
  process.env.NETLIFY ||
  process.env.CONTEXT ||
  process.env.DEPLOY_URL ||
  process.env.NETLIFY_DEV ||
  process.env.URL ||
  process.env.SITE_ID ||
  process.env.NETLIFY_API_TOKEN
);
