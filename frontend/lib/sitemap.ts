export type PageLink = {
  title: string;
  href: string;
  shortTitle?: string; // used in the section tabs, e.g. "Images"
};

export type Section = PageLink & {
  number: number;
  description: string;
  children: PageLink[];
};

export const sections: Section[] = [
  {
    number: 1,
    title: "Spot the Slop",
    href: "/spot-the-slop",
    description: "Checklists for spotting AI-generated audio, images and video.",
    children: [
      { title: "Checklist: audio and voice", href: "/spot-the-slop/audio-and-voice", shortTitle: "Audio" },
      { title: "Checklist: images and visuals", href: "/spot-the-slop/images-and-visuals", shortTitle: "Images" },
      { title: "Checklist: video and motion", href: "/spot-the-slop/video-and-motion", shortTitle: "Video" },
      { title: "AI on your feed", href: "/spot-the-slop/ai-on-your-feed", shortTitle: "On your feed" },
    ],
  },
  {
    number: 2,
    title: "Understand AI",
    href: "/understand-ai",
    description: "Plain-language AI terms and real hoaxes that went viral.",
    children: [
      { title: "AI terms glossary", href: "/understand-ai/glossary", shortTitle: "Glossary" },
      { title: "Real-life AI hoaxes that went viral", href: "/understand-ai/viral-hoaxes", shortTitle: "Viral hoaxes" },
    ],
  },
  {
    number: 3,
    title: "Check Before You Believe",
    href: "/check-before-you-believe",
    description: "Tools and steps for checking something before you share it.",
    children: [
      { title: "Using Veritas to verify", href: "/check-before-you-believe/using-veritas", shortTitle: "Using Veritas" },
      { title: "How to do a reverse image search", href: "/check-before-you-believe/reverse-image-search", shortTitle: "Reverse image search" },
      { title: "Trusted fact-checkers", href: "/check-before-you-believe/fact-checkers", shortTitle: "Fact-checkers" },
    ],
  },
  {
    number: 4,
    title: "Skill Check",
    href: "/skill-check",
    description: "Test yourself: can you tell what's real?",
    children: [{ title: "Real or AI?", href: "/skill-check/real-or-ai" }],
  },
  {
    number: 5,
    title: "About Us",
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

// Footer columns. Grouped like the Figma footer (Learn / Tools / About),
// but every link points at a page from sitemap #4.
export const footerGroups: { title: string; links: PageLink[] }[] = [
  {
    title: "Learn",
    links: [
      { title: "Spot the Slop", href: "/spot-the-slop" },
      { title: "AI on your feed", href: "/spot-the-slop/ai-on-your-feed" },
      { title: "Understand AI", href: "/understand-ai" },
      { title: "AI terms glossary", href: "/understand-ai/glossary" },
    ],
  },
  {
    title: "Tools",
    links: [
      { title: "Check Before You Believe", href: "/check-before-you-believe" },
      { title: "Using Veritas to verify", href: "/check-before-you-believe/using-veritas" },
      { title: "Skill Check", href: "/skill-check" },
    ],
  },
  {
    title: "About",
    links: [{ title: "About Us", href: "/about" }],
  },
];
