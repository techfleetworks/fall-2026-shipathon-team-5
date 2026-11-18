// The contract between the extension and the backend (POST /api/check-image).
// Keep this in sync with backend/app/schemas.py; the full list of fields is at
// <backend>/docs.

export type Verdict = 'likely_ai' | 'uncertain' | 'likely_real';

export interface Signal {
  label: string;
  explanation: string;
}

export interface ContentCredentials {
  found: boolean;
  status: 'none' | 'trusted' | 'trusted_legacy' | 'untrusted_signer' | 'invalid' | 'unreadable';
  source: 'ai_generated' | 'ai_modified' | 'camera' | 'computer_made' | 'unknown';
  signed_by: string | null;
  issuer: string | null;
  generator: string | null;
  signed_at: string | null;
}

/** What the backend returns. */
export interface CheckImageResult {
  verdict: Verdict;
  /** 0-1 likelihood that the picture is AI-made. Null when there's no evidence either way. */
  ai_likelihood: number | null;
  content_credentials: ContentCredentials;
  signals: Signal[];
  /** One plain-language sentence for the visitor. Show this first. */
  message: string;
  /** Added by the extension, not the backend: the site's own AI label on the post. */
  platformLabel?: PlatformLabel;
  /** Added by the extension for video checks (switched off for now): frames sent. */
  framesChecked?: number;
}

export type Platform = 'x' | 'facebook' | 'youtube' | 'other';

/** A label the platform itself shows on the post, e.g. Facebook's "AI info". */
export interface PlatformLabel {
  platform: Platform;
  text: string;
}

/**
 * What the extension stores and passes between its parts. srcUrl is the image URL, or the
 * first frame for videos. pageUrl is the page the picture was on, shown in the side panel.
 */
export type CheckState =
  | { status: 'checking'; srcUrl: string; pageUrl?: string; startedAt: number }
  | { status: 'done'; srcUrl: string; pageUrl?: string; result: CheckImageResult; finishedAt: number }
  | {
      status: 'error';
      srcUrl: string;
      pageUrl?: string;
      message: string;
      /** Set when the side panel's "Try again" can re-run this check: the tab and any site label. */
      retry?: { tabId: number; label: PlatformLabel | null };
    };

export const RESULT_MESSAGE = 'veritas:state' as const;

export interface ResultMessage {
  type: typeof RESULT_MESSAGE;
  state: CheckState;
}

/** Messages from the social-site content script to the background worker. */
export type SocialRequest =
  | { type: 'veritas:check-image'; srcUrl: string; label: PlatformLabel | null }
  // Video checks are switched off until the backend can judge video frames (see social.content.ts).
  | { type: 'veritas:check-frames'; frames: string[]; label: PlatformLabel | null }
  | { type: 'veritas:capture-tab'; rect: { x: number; y: number; width: number; height: number }; dpr: number }
  // The "Why?" button on the picture's label.
  | { type: 'veritas:open-panel' }
  // The side panel's "Try again" button, after a check failed.
  | { type: 'veritas:retry' };
