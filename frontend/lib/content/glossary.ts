// AI terms in plain language. Add a term anywhere in the list: the glossary
// page sorts them A to Z. The Learn page previews the first four in this list.
// Draft definitions: have the team review.

export type Term = {
  term: string;
  definition: string;
};

export const glossary: Term[] = [
  {
    term: "AI (Artificial Intelligence)",
    definition:
      "A broad term for computer systems that can perform tasks with human-level intelligence.",
  },
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
  {
    term: "Bot",
    definition:
      "An account run by software instead of a person, often used to post, like, or share content in large numbers.",
  },
  {
    term: "Cheapfake",
    definition:
      "Real media edited with simple tools, such as slowing a video or cutting a quote, to mislead.",
  },
  {
    term: "Disinformation",
    definition: "False information created or spread on purpose to mislead.",
  },
  {
    term: "Fact-checker",
    definition:
      "A person or organization that researches claims and publishes whether they are true, with the sources they used.",
  },
  {
    term: "Hallucination",
    definition:
      "When an AI chatbot states something false as if it were a fact, such as a made-up quote, number, or source.",
  },
  {
    term: "Lateral reading",
    definition:
      "Leaving a page to see what other trusted sources say about it, instead of judging it by its own looks.",
  },
  {
    term: "Misinformation",
    definition:
      "False information shared without intent to deceive, often by people who believe it.",
  },
  {
    term: "Synthetic media",
    definition: "Any image, video, audio, or text made or heavily changed by AI.",
  },
  {
    term: "Watermark",
    definition:
      "A visible or hidden mark added to a file to show who made it. Some AI tools add one to everything they create.",
  },
  {
    term: "Agentic AI",
    definition:
      "AI systems designed to act as autonomous or semi-autonomous agents with minimal human oversight.",
  },
  {
    term: "AI twin/avatar",
    definition:
      "A digital clone created from a real person's photos or video footage that lets them speak or move in synthetic videos.",
  },
  {
    term: "AI-generated content",
    definition:
      "Digital content, such as images and videos, produced by AI.",
  },
  {
    term: "Algorithm",
    definition:
      "Computer code and mathematical rules that analyze a user’s behavior to decide which posts or ads to show on their feed.",
  },
  {
    term: "Catfish",
    definition:
      "A fake online account, often using stolen photos and fabricated information, on social media to deceive others.",
  },
  {
    term: "Chatbot",
    definition:
      "A computer program that is designed to simulate a conversation with humans, often through text or voice.",
  },
  {
    term: "Large Language Model (LLM)",
    definition:
      "An AI system trained on large amounts of data to understand and generate human language.",
  },
  {
    term: "Prompt",
    definition:
      "The text you type into an AI tool to guide it towards the answer it generates.",
  },
  {
    term: "Prompt engineering",
    definition:
      "The practice of crafting instructions (prompts) to guide an AI toward producing the desired outputs.",
  },
];
