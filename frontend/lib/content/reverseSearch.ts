// Content for the "How to do a reverse image search" page.

export const reverseSearchIntro =
  "Search with a picture instead of words to find where it first appeared, when, and whether it’s been changed.";

export const reverseSearchScenario =
  "You come across a viral post about an event that happened last night and want to verify the accuracy of this information. You perform a reverse-image search of the photo used in that post and see the following results.";

// The made-up search results in the example (oldest first).
export const exampleResults = {
  photo: "/images/reverse-search/example-photo.png",
  fileName: "viral-post.png",
  results: [
    { when: "2019", where: "stock-photo site", what: "Original photo, uploaded years earlier", oldest: true },
    { when: "2023", where: "local news site", what: "Same photo, captioned as a different event" },
    { when: "Today", where: "social post", what: "Viral copy, captioned as “last night”" },
  ],
  takeaway: "The oldest copy is from 2019, so the “last night” caption is false.",
};

// Text and links for the how-to sections. A step can start with a bold lead-in.
export type HowToStep = { lead?: string; text: string; link?: { label: string; href: string } };
export type HowToSection = {
  title: string;
  intro?: string;
  steps: HowToStep[];
  numbered?: boolean; // show steps as 1, 2, 3 instead of dots
};

export const howToSections: HowToSection[] = [
  {
    title: "Using Google Lens (desktop or mobile web)",
    intro: "Google Lens is built into Google Search and handles most reverse image searches instantly.",
    steps: [
      {
        lead: "On a computer:",
        text: "Go to images.google.com. Click the camera icon (Google Lens) in the search bar. You can drag and drop an image file, paste an image URL, or click “Upload a file” from your computer.",
        link: { label: "Open Google Images", href: "https://images.google.com/" },
      },
      {
        lead: "On mobile browsers:",
        text: "Open images.google.com, tap the camera icon in the search box, and select a photo from your phone’s gallery or take a picture.",
      },
    ],
  },
  {
    title: "Quick shortcuts on the Google app",
    steps: [
      {
        lead: "iPhone (Safari):",
        text: "Find an image online, long-press on it, and select “Search with Lens” from the pop-up menu.",
      },
      {
        lead: "Android:",
        text: "Open the Google Photos app, select any picture, and tap the “Search” or “Lens” button at the bottom.",
      },
    ],
  },
  {
    title: "Using TinEye (best for finding the exact original source)",
    intro:
      "If you want to know when an image first appeared online or track down its earliest source, specialized engines work best:",
    numbered: true,
    steps: [
      { text: "Go to tineye.com.", link: { label: "Open TinEye", href: "https://tineye.com" } },
      {
        text: "Upload your image or paste its web address. TinEye will list every exact match found across the web, sortable by “Oldest” or “Most Changed.”",
      },
    ],
  },
];

// "AI terms on this page": must match terms in lib/content/glossary.ts.
export const reverseSearchTerms = [
  "Reverse image search",
  "Misinformation",
  "Disinformation",
  "Cheapfake",
  "Lateral reading",
  "Fact-checker",
];
