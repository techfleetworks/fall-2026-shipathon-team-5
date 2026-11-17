// Organizations on the "Educational orgs and initiatives" page, in groups.
// The Tools to double-check page features a few of them by name (see tools.ts).
import type { ToolCardContent } from "@/lib/content/tools";

export type OrgGroup = { title: string; orgs: ToolCardContent[] };

const NLP: ToolCardContent = {
  title: "News Literacy Project (NLP)",
  text: "A non-partisan educational non-profit that creates tools and lesson plans, such as their Checkology virtual classroom, to help K-12 students and the general public spot online manipulation. They maintain dedicated resource hubs for detecting AI summaries, synthetic images, and deepfakes.",
  link: { label: "Visit NLP", href: "https://newslit.org/" },
};

const IFCN: ToolCardContent = {
  title: "International Fact-Checking Network (IFCN)",
  text: "Hosted by the Poynter Institute, the IFCN brings together dozens of global fact-checking organizations (e.g., Snopes, PolitiFact, Full Fact) to set standards for verification and educate the public on emerging misinformation tactics, including generative AI deepfakes.",
  link: { label: "Visit IFCN", href: "https://www.poynter.org/ifcn/" },
};

const UNESCO: ToolCardContent = {
  title: "UNESCO (Media and Information Literacy)",
  text: "UNESCO leads global initiatives, such as Global Media and Information Literacy Week, to equip citizens worldwide with skills to navigate algorithmic newsfeeds, AI-generated content, and online manipulation.",
  link: {
    label: "Visit UNESCO",
    href: "https://www.unesco.org/en/articles/media-and-information-literacy",
  },
};

// Shown on the Tools to double-check page.
export const featuredOrgs = [NLP, IFCN, UNESCO];

export const orgGroups: OrgGroup[] = [
  {
    title: "Dedicated media literacy and AI education non-profits",
    orgs: [
      NLP,
      {
        title: "MediaWise (Poynter Institute)",
        text: "A digital media literacy initiative created by the Poynter Institute. MediaWise runs targeted campaigns (like MediaWise for Seniors and youth programs) teaching techniques like lateral reading, reverse-image searches, and spotting synthetic visual media across social media platforms.",
        link: { label: "Visit MediaWise", href: "https://www.poynter.org/mediawise/" },
      },
      {
        title: "aiEDU (The AI Education Project)",
        text: "A national non-profit specifically focused on AI literacy. They partner with schools and community leaders to build foundational knowledge about how artificial intelligence systems operate, their social impacts, and how to critically evaluate synthetic content.",
        link: { label: "Visit aiEDU", href: "https://www.aiedu.org/" },
      },
      {
        title: "AIandYou",
        text: "A non-profit dedicated to bringing AI literacy and education to marginalized and underrepresented communities. They focus on explaining generative AI technologies, algorithmic bias, deepfakes, and automated misinformation in plain, accessible language.",
        link: { label: "Visit AIandYou", href: "https://aiandyou.org/" },
      },
      {
        title: "National Association for Media Literacy Education (NAMLE)",
        text: "A national membership organization that unifies educators, researchers, and media professionals. NAMLE produces public toolkits and leads initiatives like National Media Literacy Week, with an increasing focus on AI awareness and algorithm education.",
        link: { label: "Visit NAMLE", href: "https://namle.org/" },
      },
    ],
  },
  {
    title: "Academic research labs and fact-checking networks",
    orgs: [
      {
        title: "Stanford History Education Group (SHEG) / Digital Inquiry Group",
        text: "Creators of the Civic Online Reasoning (COR) curriculum, which teaches students how to evaluate digital claims, distinguish authentic media from manipulated media, and search effectively online.",
        link: { label: "Visit the Digital Inquiry Group", href: "https://www.inquirygroup.org/" },
      },
      {
        title: "Information Futures Lab (Brown University)",
        text: "Building on the legacy of First Draft News (a pioneering network in digital verification), the Information Futures Lab researches information ecosystems and trains researchers, journalists, and community leaders to identify and combat health and political dis/misinformation.",
        link: { label: "Visit the Information Futures Lab", href: "https://sites.brown.edu/informationfutures/" },
      },
      IFCN,
      {
        title: "CIVIX (Canada)",
        text: "A civic education charity that runs the Digital Democracy Project and CTRL-F, a program designed to teach students how to fact-check online information, recognize synthetic audio/video, and evaluate sources in real time.",
        link: { label: "Visit CIVIX", href: "https://civix.ca/home/" },
      },
    ],
  },
  {
    title: "Global and international initiatives",
    orgs: [
      UNESCO,
      {
        title: "EUvsDisinfo",
        text: "An initiative of the European External Action Service's East StratCom Task Force. While focused on tracking disinformation campaigns affecting the European Union, it produces public educational guides and data breakdowns analyzing how emerging tech and AI are weaponized in information warfare.",
        link: { label: "Visit EUvsDisinfo", href: "https://euvsdisinfo.eu/" },
      },
    ],
  },
];

// "AI terms on this page": must match terms in lib/content/glossary.ts.
export const orgTerms = [
  "Deepfake",
  "Synthetic media",
  "AI-generated content",
  "Misinformation",
  "Disinformation",
  "Fact-checker",
  "Lateral reading",
  "Reverse image search",
  "Algorithm",
];
