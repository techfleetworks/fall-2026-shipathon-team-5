// Sections on the "Tools to double-check" page. Each section links to its full guide.
// Cards marked "placeholder" are stand-ins until the real content is ready.

export type ToolCardContent = {
  title: string;
  text: string;
  link?: { label: string; href: string }; // outside links open in a new tab
};

export type ToolSection = {
  id: string; // the #anchor for the jump buttons
  title: string;
  intro: string;
  guideHref: string;
  guideLabel: string;
  cards?: ToolCardContent[];
  bullets?: string[]; // shown as a bulleted list instead of cards
};

export const toolSections: ToolSection[] = [
  {
    id: "using-veritas",
    title: "Using Veritas to verify",
    intro: "Check a picture where you find it, and see the reasons behind the result.",
    guideHref: "/check-before-you-believe/using-veritas",
    guideLabel: "Read the Veritas guide",
    cards: [
      { title: "Veritas the browser extension", text: "Right-click on an image or video to verify." },
      { title: "Veritas the mobile app", text: "Verify an image or video on your screen." },
    ],
  },
  {
    id: "reverse-image-search",
    title: "How to do a reverse image search",
    intro: "Search with a picture instead of words to find where it first appeared.",
    guideHref: "/check-before-you-believe/reverse-image-search",
    guideLabel: "Read the step-by-step guide",
    // Draft steps: replace with the team's wording.
    bullets: [
      "Save the picture, or take a screenshot of it.",
      "Upload it to a reverse image search tool such as Google Lens, TinEye, or Bing Visual Search.",
      "Look for the oldest result and compare it with what you saw. A different date or place is a red flag.",
    ],
  },
  {
    id: "fact-checkers",
    title: "Trusted fact-checkers",
    intro: "Teams that research viral claims and show the sources behind their answers.",
    guideHref: "/check-before-you-believe/fact-checkers",
    guideLabel: "See all fact-checkers",
    cards: [
      // suggested sites: review before launch
      {
        title: "AP Fact Check",
        text: "The Associated Press checks viral claims, photos and videos in the news.",
        link: { label: "Visit AP Fact Check", href: "https://apnews.com/ap-fact-check" },
      },
      {
        title: "Reuters Fact Check",
        text: "Reuters looks into misleading posts, images and videos shared on social media.",
        link: { label: "Visit Reuters Fact Check", href: "https://www.reuters.com/fact-check/" },
      },
      {
        title: "Snopes",
        text: "One of the oldest fact-checking sites, covering rumors, hoaxes and viral images.",
        link: { label: "Visit Snopes", href: "https://www.snopes.com" },
      },
    ],
  },
];
