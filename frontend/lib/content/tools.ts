import { featuredOrgs } from "@/lib/content/educationalOrgs";

// Sections on the "Tools to double-check" page. Each section links to its full guide.
// Cards marked "placeholder" are stand-ins until the real content is ready.

export type ToolCardContent = {
  title: string;
  text: string;
  link?: { label: string; href: string }; // outside links open in a new tab
  // Picture for the top of the card. "contain" shows the whole picture (good for
  // tall phone screenshots); "cover" fills the space and may trim the edges.
  image?: { src: string; alt: string; fit?: "cover" | "contain" };
};

export type ToolSection = {
  id: string; // the #anchor for the jump buttons
  title: string;
  intro: string;
  guideHref: string;
  guideLabel: string;
  cards?: ToolCardContent[];
  bullets?: string[]; // shown as a bulleted list instead of cards
  hideImages?: boolean; // cards without the image area on top
};

export const toolSections: ToolSection[] = [
  {
    id: "using-veritas",
    title: "Using Veritas to verify",
    intro: "Check a picture where you find it, and see the reasons behind the result.",
    guideHref: "/tools-to-double-check/using-veritas",
    guideLabel: "Read the Veritas guide",
    cards: [
      {
        title: "Veritas the browser extension",
        text: "Right-click on an image or video to verify.",
        image: {
          src: "/images/veritas/veritas-extension.webp",
          alt: "The Veritas browser extension checking a news article.",
        },
      },
      {
        title: "Veritas the mobile app",
        text: "Verify an image or video on your screen.",
        image: {
          src: "/images/veritas/veritas-mobile-group.webp",
          alt: "Three Veritas app screens: the home screen, a check in progress, and a result.",
          fit: "contain",
        },
      },
    ],
  },
  {
    id: "reverse-image-search",
    title: "How to do a reverse image search",
    intro: "Search with a picture instead of words to find where it first appeared.",
    guideHref: "/tools-to-double-check/reverse-image-search",
    guideLabel: "Read the step-by-step guide",
    // Draft steps: replace with the team's wording.
    bullets: [
      "Save the picture, or take a screenshot of it.",
      "Upload it to a reverse image search tool such as Google Lens, TinEye, or Bing Visual Search.",
      "Look for the oldest result and compare it with what you saw. A different date or place is a red flag.",
    ],
  },
  {
    id: "educational-orgs",
    title: "Educational orgs and initiatives",
    intro: "Teams that educate on AI literacy, research viral claims, and show the sources behind their answers.",
    guideHref: "/tools-to-double-check/educational-orgs",
    guideLabel: "See all educational orgs and initiatives",
    cards: featuredOrgs, // edit these in educationalOrgs.ts
    hideImages: true,
  },
];
