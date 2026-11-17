// Talking to the Veritas backend (see backend/README.md for the full contract).
//
// The address comes from NEXT_PUBLIC_API_URL (set it in frontend/.env.local,
// or in Vercel under Settings → Environment Variables). It's built into the
// page when the site is built, so redeploy after changing it.
export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "https://team5-backend-lnzk.onrender.com"
).replace(/\/$/, "");

// The checker accepts these picture types, up to this size.
export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_BYTES = 10 * 1024 * 1024;

export type Signal = { label: string; explanation: string };

export type ImageCheckResult = {
  verdict: "likely_ai" | "uncertain" | "likely_real";
  ai_likelihood: number | null; // null = no evidence either way
  content_credentials: {
    found: boolean;
    status: "none" | "trusted" | "trusted_legacy" | "untrusted_signer" | "invalid" | "unreadable";
    source: "ai_generated" | "ai_modified" | "camera" | "computer_made" | "unknown";
    signed_by: string | null;
    issuer: string | null;
    generator: string | null;
    signed_at: string | null;
  };
  signals: Signal[];
  message: string;
};

// An error with a sentence we can show the visitor as it is.
export class CheckError extends Error {}

const TIMEOUT_MS = 90_000; // the free server can take up to a minute to wake up

export async function checkImage(file: File, signal?: AbortSignal): Promise<ImageCheckResult> {
  const body = new FormData();
  body.append("file", file);

  const timeout = AbortSignal.timeout(TIMEOUT_MS);
  const signals = signal ? AbortSignal.any([signal, timeout]) : timeout;

  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/check-image`, { method: "POST", body, signal: signals });
  } catch (error) {
    if (signal?.aborted) throw error;
    if (timeout.aborted) {
      throw new CheckError("The checker took too long to answer. Please try again in a minute.");
    }
    throw new CheckError(
      "We couldn't reach the checker. Check your internet connection and try again."
    );
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    // The backend sends a plain-language "detail" for errors it expects
    // (too large, not a picture, too many checks).
    const detail = data && typeof data.detail === "string" ? data.detail : null;
    throw new CheckError(detail ?? "Something went wrong while checking. Please try again.");
  }
  return data as ImageCheckResult;
}
