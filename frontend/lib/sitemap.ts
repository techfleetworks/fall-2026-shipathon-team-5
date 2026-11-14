export type PageGroup = "checklists" | "platforms";

export type PageLink = {
  title: string;
  href: string;
  shortTitle?: string; // used in the section tabs, e.g. "Images"
  group?: PageGroup; // pages in the same group share a tab bar
};

export type Section = PageLink & {
  number: number;
  description: string;
  children: PageLink[];
};

// Groups of related pages inside a section. "backHref" is where the
// "← All ..." link in the tab bar goes.
export const pageGroups: Record<PageGroup, { title: string; backLabel: string; backHref: string }> = {
  checklists: {
    title: "Checklist",
    backLabel: "All checklists",
    backHref: "/spot-the-slop#checklists",
  },
  platforms: {
    title: "AI on your feed",
    backLabel: "All platforms",
    backHref: "/spot-the-slop#ai-on-your-feed",
  },
};

export const sections: Section[] = [
  {
    number: 1,
    title: "Learn to spot the slop",
    href: "/spot-the-slop",
    description:
      "Click on a section below to get started.",
    children: [
      { title: "Checklist: audio and voice", href: "/spot-the-slop/audio-and-voice", shortTitle: "Audio", group: "checklists" },
      { title: "Checklist: images and visuals", href: "/spot-the-slop/images-and-visuals", shortTitle: "Images", group: "checklists" },
      { title: "Checklist: video and motion", href: "/spot-the-slop/video-and-motion", shortTitle: "Video", group: "checklists" },
      { title: "TikTok: what to check before you share", href: "/spot-the-slop/ai-on-your-feed/tiktok", shortTitle: "TikTok", group: "platforms" },
      { title: "YouTube: what to check before you share", href: "/spot-the-slop/ai-on-your-feed/youtube", shortTitle: "YouTube", group: "platforms" },
      { title: "Instagram: what to check before you share", href: "/spot-the-slop/ai-on-your-feed/instagram", shortTitle: "Instagram", group: "platforms" },
      { title: "Facebook and Messenger: what to check before you share", href: "/spot-the-slop/ai-on-your-feed/facebook-messenger", shortTitle: "Facebook and Messenger", group: "platforms" },
      { title: "WhatsApp: what to check before you share", href: "/spot-the-slop/ai-on-your-feed/whatsapp", shortTitle: "WhatsApp", group: "platforms" },
      { title: "X (formerly Twitter): what to check before you share", href: "/spot-the-slop/ai-on-your-feed/x", shortTitle: "X (formerly Twitter)", group: "platforms" },
      { title: "Real-life AI hoaxes that went viral", href: "/spot-the-slop/viral-hoaxes", shortTitle: "Viral hoaxes" },
      { title: "AI terms glossary", href: "/spot-the-slop/glossary", shortTitle: "Glossary" },
    ],
  },
  {
    number: 2,
    title: "Tools to double-check",
    href: "/check-before-you-believe",
    description: "Tools and steps for checking content before you share it.",
    children: [
      { title: "Using Veritas to verify", href: "/check-before-you-believe/using-veritas", shortTitle: "Using Veritas" },
      { title: "How to do a reverse image search", href: "/check-before-you-believe/reverse-image-search", shortTitle: "Reverse image search" },
      { title: "Trusted fact-checkers", href: "/check-before-you-believe/fact-checkers", shortTitle: "Fact-checkers" },
    ],
  },
  {
    number: 3,
    title: "Quiz your skills",
    href: "/skill-check",
    description: "Test yourself: can you tell what's real?",
    children: [{ title: "Real or AI?", href: "/skill-check/real-or-ai" }],
  },
  {
    number: 4,
    title: "About us",
    href: "/about",
    description: "Who we are and why we built this.",
    children: [],
  },
];

export function findSection(href: string): Section {
  const section = sections.find((s) => s.href === href);
  if (!section) throw new Error(`No section in sitemap for ${href}`);
  return section;
}

export function findPage(href: string): { page: PageLink; section: Section } {
  for (const section of sections) {
    const page = section.children.find((p) => p.href === href);
    if (page) return { page, section };
  }
  throw new Error(`No page in sitemap for ${href}`);
}

// Footer columns (desktop only). Grouped like the Figma footer: Learn / Tools / About.
export const footerGroups: { title: string; links: PageLink[] }[] = [
  {
    title: "Learn",
    links: [
      { title: "Learn to spot the slop", href: "/spot-the-slop" },
      { title: "AI on your feed", href: "/spot-the-slop#ai-on-your-feed" },
      { title: "Real-life AI hoaxes", href: "/spot-the-slop/viral-hoaxes" },
      { title: "AI terms glossary", href: "/spot-the-slop/glossary" },
    ],
  },
  {
    title: "Tools",
    links: [
      { title: "Tools to double-check", href: "/check-before-you-believe" },
      { title: "Using Veritas to verify", href: "/check-before-you-believe/using-veritas" },
      { title: "Quiz your skills", href: "/skill-check" },
    ],
  },
  {
    title: "About",
    links: [{ title: "About us", href: "/about" }],
  },
];
