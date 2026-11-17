// The contract between the extension and the backend
// (POST /api/check-image and POST /api/check-frames).
// Keep this in sync with backend/app/schemas.py.

export type Verdict = 'likely_ai' | 'unclear' | 'likely_real' | 'verified_ai' | 'verified_real';

export type SignalLevel = 'bad' | 'warn' | 'good';

export interface Signal {
  level: SignalLevel;
  title: string;
  detail: string;
}

export interface CheckImageResult {
  verdict: Verdict;
  /** 0-1 likelihood that the media is AI-generated. Null when C2PA or a platform label gives a certain answer. */
  likelihood: number | null;
  /** "c2pa" | "sightengine" | "hf_model" | "mock" | "platform_label" */
  source: string;
  signals: Signal[];
  /** Video only: how many frames the verdict is based on. */
  framesChecked?: number;
  // Later: learnMoreSlug, linking to a lesson on the Veritas website once it exists.
}

export type Platform = 'x' | 'facebook' | 'youtube' | 'other';

/** A label the platform itself shows on the post, e.g. Facebook's "AI info". */
export interface PlatformLabel {
  platform: Platform;
  text: string;
}

/** What the extension stores and passes between its parts. srcUrl is the image URL, or the first frame for videos. */
export type CheckState =
  | { status: 'checking'; srcUrl: string; startedAt: number }
  | { status: 'done'; srcUrl: string; result: CheckImageResult; finishedAt: number }
  | { status: 'error'; srcUrl: string; message: string };

export const RESULT_MESSAGE = 'veritas:state' as const;

export interface ResultMessage {
  type: typeof RESULT_MESSAGE;
  state: CheckState;
}

/** Messages from the social-site content script to the background worker. */
export type SocialRequest =
  | { type: 'veritas:check-image'; srcUrl: string; label: PlatformLabel | null }
  | { type: 'veritas:check-frames'; frames: string[]; label: PlatformLabel | null }
  | { type: 'veritas:capture-tab'; rect: { x: number; y: number; width: number; height: number }; dpr: number };
