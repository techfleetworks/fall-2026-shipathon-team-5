// "AI on your feed" cards on the Learn to spot the slop page.
// Each card links to /spot-the-slop/ai-on-your-feed/<slug>.
// Logos live in public/images/platforms/ (square images).
export type Platform = {
  slug: string; // must match a page folder in app/spot-the-slop/ai-on-your-feed/
  name: string;
  guideName: string; // used in the button: "Read the ___ guide"
  description: string;
  checks: string[];
  logo?: string; // leave out to show the first letter instead
};

export const platforms: Platform[] = [
  {
    slug: "tiktok",
    name: "TikTok",
    guideName: "TikTok",
    description: "Edited clips, AI voiceovers, and old footage reposted as new.",
    checks: ["Find the original upload and its date", "Read the comments for context and corrections"],
    logo: "/images/platforms/tiktok-v3.webp",
  },
  {
    slug: "youtube",
    name: "YouTube",
    guideName: "YouTube",
    description: "AI “news” channels and deepfake interviews.",
    checks: [
      "Check the channel’s history and other videos",
      "Look for an AI-generated or altered content label",
    ],
    logo: "/images/platforms/youtube-v3.webp",
  },
  {
    slug: "instagram",
    name: "Instagram",
    guideName: "Instagram",
    description: "AI images and fake giveaway ads from look-alike accounts.",
    checks: [
      "Check the account’s handle, age, and followers",
      "Visit the brand’s real site before you click",
    ],
    logo: "/images/platforms/instagram-v3.webp",
  },
  {
    slug: "facebook-messenger",
    name: "Facebook and Messenger",
    guideName: "Facebook",
    description: "Forwarded hoaxes, fake pages, and impersonation scams.",
    checks: [
      "Call the person on a number you already have",
      "Search the claim before you share it to a group",
    ],
    logo: "/images/platforms/facebook-v3.webp",
  },
  {
    slug: "whatsapp",
    name: "WhatsApp",
    guideName: "WhatsApp",
    description: "Voice notes and images forwarded with no source.",
    checks: ["A “Forwarded many times” label means slow down", "Ask the sender where it came from"],
    logo: "/images/platforms/whatsapp-v3.webp",
  },
  {
    slug: "x",
    name: "X (formerly Twitter)",
    guideName: "X",
    description: "Viral images shared out of context.",
    checks: [
      "A checkmark can be bought, so it doesn’t prove identity",
      "Look for a community note or a fact-check",
    ],
    logo: "/images/platforms/x-v3.webp",
  },
];
