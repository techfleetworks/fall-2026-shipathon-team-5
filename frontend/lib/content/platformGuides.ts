// Content for the "AI on your feed" guide pages, one entry per platform.
// The key (e.g. "tiktok") matches the page folder in app/spot-the-slop/ai-on-your-feed/.

export type GuideCheck = {
  title: string;
  text: string;
  link?: { label: string; href: string }; // optional link shown after the text
};

export type Annotation = {
  title: string;
  text: string;
  // Where the numbered marker sits on the example image, as % from the left and top.
  x: number;
  y: number;
};

export type PlatformGuide = {
  title: string;
  checks: GuideCheck[];
  annotations: Annotation[];
  terms: string[]; // must match a term in lib/content/glossary.ts to link to it
};

// Placeholder annotations until each platform's example image is ready.
// Replace the titles, text and marker positions once the real image is in.
const placeholderAnnotations: Annotation[] = [
  { title: "Annotation title", text: "Short note on what to look for at this spot.", x: 78, y: 78 },
  { title: "Annotation title", text: "Short note on what to look for at this spot.", x: 68, y: 92 },
  { title: "Annotation title", text: "Short note on what to look for at this spot.", x: 88, y: 42 },
  { title: "Annotation title", text: "Short note on what to look for at this spot.", x: 50, y: 72 },
];

export const platformGuides: Record<string, PlatformGuide> = {
  tiktok: {
    title: "TikTok: what to check before you share",
    annotations: placeholderAnnotations,
    terms: ["Deepfake", "Voice clone", "Bot"], // placeholders
    checks: [
      {
        title: "Look for the “AI-generated” banner",
        text: "TikTok requires creators to disclose synthetic media and uses automated detection to attach an “AI-generated” banner at the bottom left of videos.",
      },
      {
        title: "Watch for temporal inconsistencies",
        text: "Because TikTok relies heavily on fast camera movements, AI-generated video models (e.g., Sora, Kling, Runway) display telltale physics glitches during camera pans, such as background objects melting, hair morphing through clothing, or extra limbs appearing mid-motion.",
      },
      {
        title: "Audit profile context",
        text: "TikTok disinformation often relies on network-driven “bot farms” using identical AI voice generator avatars. Tap the profile: accounts with low follower counts, randomized usernames (e.g., @user84920481), and dozens of high-output, highly emotional political videos uploaded in a short period are red flags.",
      },
      {
        title: "Cross-check the sound tab",
        text: "Synthetic political audio clips on TikTok frequently use re-uploaded, pitch-shifted AI voice clones. Check if reputable news outlets or verified accounts are using the same sound track.",
      },
    ],
  },
  youtube: {
    title: "YouTube: what to check before you share",
    annotations: placeholderAnnotations,
    terms: ["Deepfake", "Voice clone", "Watermark"], // placeholders
    checks: [
      {
        title: "Look for content disclosures",
        text: "YouTube requires creators to check an altered/synthetic content box during upload, which generates an “Altered or synthetic content” disclosure tag in the expanded video description or on the Shorts player.",
      },
      {
        title: "Listen for voice cloning cadence",
        text: "AI-generated YouTube voice overs (frequently used in automated “faceless” channels and clickbait news clips) lack natural vocal range, human speech pauses, and authentic breath intakes.",
      },
      {
        title: "Check channel credentials and upload logs",
        text: "Scam or disinfo channels often hijack existing channels or use generic names like “Global News Live.” Review the channel’s “About” page, join date, and video history for sudden pivots in content focus.",
      },
      {
        title: "Look for watermarks and metadata",
        text: "Check the corners of the video for any logos, such as OpenAI’s Sora or Google’s tools, or for blurry patches where a watermark might have been removed.",
      },
    ],
  },
  instagram: {
    title: "Instagram: what to check before you share",
    annotations: placeholderAnnotations,
    terms: ["Content Credentials (C2PA)", "Deepfake", "Voice clone"], // placeholders
    checks: [
      {
        title: "Check Instagram’s native AI labels",
        text: "Instagram automatically applies an “AI Info” label or tag under the account name on posts and Reels if the image/video contains C2PA metadata or was generated via Meta AI. If a photo looks synthetic but lacks the label, the metadata may have been stripped intentionally.",
      },
      {
        title: "Inspect Reels lip-sync and audio",
        text: "Deepfake audio overlaying Instagram Reels frequently slips out of sync near sentence endings or natural breaths. Watch the mouth perimeter for micro-blurring or shifting teeth.",
      },
      {
        title: "Examine high-contrast accessories",
        text: "Midjourney and FLUX images common in Instagram aesthetics often struggle with jewelry symmetry, patterned fabric continuity, and clear reflections in sunglasses.",
      },
      {
        title: "Trace audio tracks",
        text: "Tap the audio attribution at the bottom of the Reel. Synthetic or cloned voice overs are often listed as “Original Audio” from a single newly created account rather than an official or verified source track.",
      },
    ],
  },
  "facebook-messenger": {
    title: "Facebook and Messenger: what to check before you share",
    annotations: placeholderAnnotations,
    terms: ["AI slop", "Reverse image search", "Deepfake"], // placeholders
    checks: [
      {
        title: "Check AI info labels on ads",
        text: "Ads created or edited with Meta’s AI tools automatically include an AI info label. Meta tries to detect ads using third-party AI tools, though this is not always accurate. To find this label on ads, click on “About this ad,” and then “AI info.”",
      },
      {
        title: "Examine event photos in local groups",
        text: "AI images posted in Facebook Community groups (e.g., fake local accidents, miraculous rescue stories, fake artistic structures) often feature hyper-saturated lighting, unnaturally smooth skin textures, and nonsensical signage background text.",
      },
      {
        title: "Run a reverse image search",
        text: "Long-press or download the image and run it through Google Lens or TinEye to see whether it exists only on this profile or if you can find it elsewhere.",
      },
      {
        title: "Inspect videos for sync issues and digital seams",
        text: "Look for lip-sync delays, synthesized voices, and strange pacing. Also look to see whether a video abruptly jumps or combines artificial segments with real footage.",
      },
    ],
  },
  whatsapp: {
    title: "WhatsApp: what to check before you share",
    annotations: placeholderAnnotations,
    terms: ["Misinformation", "Disinformation", "Fact-checker"], // placeholders
    checks: [
      {
        title: "Check forwarding labels",
        text: "On WhatsApp, look for the “Forwarded many times” indicator. Disinformation campaigns heavily use messaging loops to spread unverified synthetic audio clips and fake press releases without context.",
      },
      {
        title: "Check for emotional manipulation",
        text: "Be skeptical of messages intended to trigger intense emotional responses, such as fear, panic, anger, or urgency.",
      },
      {
        title: "Cross-check the information with other sources",
        text: "Perform your own search to see where you can find this information, and then determine its legitimacy.",
      },
      {
        title: "Flag suspicious messages to IFCN",
        text: "WhatsApp partners with the International Fact-Checking Network (IFCN), among other local groups. You can send suspicious images, videos, links, or texts to these official groups through WhatsApp and receive a verified response. Find your local group’s number here:",
        link: {
          label: "IFCN fact-checking organizations on WhatsApp",
          href: "https://faq.whatsapp.com/5059120540855664",
        },
      },
    ],
  },
  x: {
    title: "X (formerly Twitter): what to check before you share",
    annotations: placeholderAnnotations,
    terms: ["Bot", "Reverse image search", "Fact-checker"], // placeholders
    checks: [
      {
        title: "Check Community Notes",
        text: "X relies on crowd-sourced verification. Look under suspicious posts, images, or videos for a Community Note offering context, fact-checks, or original source links.",
      },
      {
        title: "Evaluate account badges and verification",
        text: "A blue checkmark on X no longer implies verified identity, only a paid subscription. Inspect the account’s creation date, posting volume (e.g., hundreds of replies per hour indicates automated bot behavior), and handle history.",
      },
      {
        title: "Watch for “flash panic” AI photos",
        text: "Breaking news on X often features AI-generated disaster or event photos designed to drive high engagement. Look for warped background text, impossible smoke pattern physics, or nonsensical official uniforms.",
      },
      {
        title: "Run a reverse image search",
        text: "Long-press or download the image and run it through Google Lens or TinEye to see if it exists on legitimate news wire services (AP, Reuters, AFP) or if it only exists on social media.",
      },
    ],
  },
};
