// Content for the "Using Veritas to verify" page.

export const usingVeritasIntro = "Check posts without leaving the page or app you’re in.";

export type VeritasFeature = {
  id: string; // #anchor
  title: string;
  intro: string;
  points: string[]; // shown with green check marks
  imageLabel: string; // describes the placeholder until the real image is added
};

export const veritasFeatures: VeritasFeature[] = [
  {
    id: "browser-extension",
    title: "Labels right in your browser",
    intro:
      "Veritas flags likely AI images and adds context notes on social sites and news pages, without you leaving the page.",
    points: [
      "Right-click any image or video to check it.",
      "Works on social media platforms you view in the browser, such as YouTube, Facebook, and X.",
    ],
    imageLabel: "Browser extension screenshot",
  },
  {
    id: "mobile-app",
    title: "An app to spot fakes",
    intro: "Tap once to check what’s on your screen, or send a post to Veritas from any app.",
    points: ["Check from the share sheet in TikTok, Instagram, or Messages.", "Listen mode for voice notes and calls."],
    imageLabel: "Mobile app screenshots",
  },
];
