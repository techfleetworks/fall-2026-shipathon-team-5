// AI terms in plain language, A to Z. The Learn page previews the first four;
// the full glossary page shows them all. Draft definitions: have the team review.
export type Term = {
  term: string;
  definition: string;
};

export const glossary: Term[] = [
  {
    term: "AI slop",
    definition:
      "Low-effort content made quickly with AI, often to grab clicks or views rather than to inform.",
  },
  {
    term: "Content Credentials (C2PA)",
    definition:
      "A label some cameras and apps attach to a file to record where it came from and how it was edited. If it's there, it can tell you a picture was made with AI.",
  },
  {
    term: "Deepfake",
    definition:
      "A video, photo, or recording changed with AI to make someone appear to say or do something they never did.",
  },
  {
    term: "Generative AI",
    definition:
      "AI that creates new text, images, audio, or video from a short written request called a prompt.",
  },
  {
    term: "Reverse image search",
    definition:
      "Searching with a picture, instead of words, to find where else it has appeared online and when it first showed up.",
  },
  {
    term: "Voice clone",
    definition:
      "An AI copy of a real person's voice made from a short recording. Scammers use them in fake calls and ads.",
  },
];
