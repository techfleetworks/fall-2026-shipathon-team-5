// Content for the "Use Veritas to verify" page.

export const useVeritasIntro = "Check posts without leaving the page or app you’re in.";

export type VeritasFeature = {
  id: string; // #anchor
  title: string;
  intro: string;
  points: string[]; // shown with green check marks
  // Button under the points. Leave "href" out while there's no link yet: the button then
  // stays on this section instead of going anywhere.
  action?: { label: string; href?: string };
  image: { src: string; alt: string; width: number; height: number };
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
    action: { label: "Download the extension" },
    image: {
      src: "/images/veritas/veritas-extension-new.webp",
      alt: "The Veritas browser extension on a news article: the photo is outlined and labeled Likely AI-generated, the Veritas right-click menu is open, and the side panel shows the findings.",
      width: 1600,
      height: 1075,
    },
  },
  {
    id: "mobile-app",
    title: "An app to spot fakes",
    intro: "Tap once to check what’s on your screen, or send a post to Veritas from any app.",
    points: ["Check from the share sheet in TikTok, Instagram, or Messages.", "Listen mode for voice notes and calls."],
    action: { label: "Try the prototype", href: "https://www.figma.com/proto/4jP1AhHkJ4TFfX1ejsnJQL/Team-5-Shipathon-%E2%80%93-AI-Misinformation-Detector?node-id=12-223&p=f&t=Wda5o44INL0c10Uq-1&scaling=min-zoom&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=12%3A223&show-proto-sidebar=1" },
    image: {
      src: "/images/veritas/veritas-mobile-group.webp",
      alt: "Three Veritas app screens: the home screen, a check in progress, and a result marked likely misleading.",
      width: 1639,
      height: 1170,
    },
  },
];
