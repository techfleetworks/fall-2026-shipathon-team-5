// Content for the three checklists: the cards on the Learn to spot the slop page
// and the checklist pages themselves. The key matches the page folder name.

export type ChecklistItem = { title: string; text: string };

export type ChecklistMedia =
  | {
      type: "audio";
      title: string;
      src: string;
      peaks: number[]; // bar heights (0–1) for the waveform, worked out from the file
    }
  | { type: "image"; title: string; src: string; alt: string }
  | { type: "video"; title: string; src: string; poster: string };

export type Checklist = {
  cardTitle: string; // shown on the Learn page card
  buttonLabel: string;
  cardImage: { src: string; alt: string };
  intro: string;
  media: ChecklistMedia;
  closely: { title: string; items: ChecklistItem[] };
  verify: ChecklistItem[];
  terms: string[]; // must match terms in lib/content/glossary.ts (placeholders for now)
};

export const checklists: Record<string, Checklist> = {
  "audio-and-voice": {
    cardTitle: "Audio and voice",
    buttonLabel: "Open the audio checklist",
    cardImage: {
      src: "/images/checklists/audio-card.webp",
      alt: "A sound mixing desk with lit-up sliders.",
    },
    intro:
      "Scammers can copy a voice from a few seconds of video. Here is an example you can use to practice using the checklist of items below.",
    media: {
      type: "audio",
      title: "Listen: an AI-generated voice",
      src: "/media/ai-voice-example.mp3",
      peaks: [
        0.27, 0.58, 0.64, 0.67, 0.49, 0.31, 0.73, 0.59, 0.53, 0.12, 0.38, 0.84, 0.87, 0.56, 0.41, 0.23,
        0.52, 0.42, 0.76, 0.48, 0.39, 0.12, 0.19, 0.16, 0.12, 0.12, 0.2, 0.44, 0.53, 0.31, 0.83, 0.26,
        0.46, 0.29, 0.5, 1.0, 0.47, 0.66, 0.76, 0.48, 0.39, 0.36, 0.35, 0.13, 0.31, 0.23, 0.12, 0.12,
      ],
    },
    closely: {
      title: "What to notice in potentially AI-generated audio",
      items: [
        {
          title: "Listen for breathing and pauses",
          text: "Cloned voices often run long sentences with no breaths, or pause in odd places. Real people breathe, stumble, and say “um”.",
        },
        {
          title: "Pay attention to pronunciation",
          text: "AI-generated speech often stumbles or puts odd stress over unfamiliar words, so pay attention to names, addresses, and uncommon words.",
        },
        {
          title: "Be mindful of tone and emotion",
          text: "Check for whether the tone and emotion of the voice matches the situation. Also keep in mind flat or calm delivery in what should be an urgent situation.",
        },
        {
          title: "Listen for audio artifacts and background noise",
          text: "Metallic buzzing, sudden drops in background ambiance, or spectral distortion can be indicative of an artificially generated voice.",
        },
      ],
    },
    verify: [
      {
        title: "Check where it came from",
        text: "Was it sent by someone you know, or forwarded from a stranger? If no news outlet has the “leaked” audio, treat it with suspicion.",
      },
      {
        title: "Call back on a number you trust",
        text: "If a “family member” calls asking for money, hang up and call them on the number you already have. Agree on a family code word in advance.",
      },
    ],
    terms: ["Voice clone", "Deepfake", "Synthetic media"],
  },
  "images-and-visuals": {
    cardTitle: "Images and visuals",
    buttonLabel: "Open the image checklist",
    cardImage: {
      src: "/images/checklists/photos-card.webp",
      alt: "Dozens of old photo slides scattered on a white surface.",
    },
    intro:
      "AI images can look perfect at a glance. Here is an example you can use to practice using the checklist of items below.",
    media: {
      type: "image",
      title: "Look closely at this AI-generated image",
      src: "/images/checklists/ai-image-example.webp",
      alt: "AI-generated image of a smiling woman waving at a music festival, under a banner with nonsense lettering.",
    },
    closely: {
      title: "What to notice in potentially AI-generated images",
      items: [
        { title: "Hands and fingers", text: "Count them. Extra, missing or fused fingers can be common in AI images." },
        { title: "Text and signs", text: "Letters that look like a language but don’t spell anything." },
        { title: "Light, shadows, and reflections", text: "Shadows that point different ways, or reflections that don’t match." },
        {
          title: "Skin, hair, and edges",
          text: "Skin that’s too smooth or with unnatural texture, or hair that blends into the background.",
        },
        { title: "Background details", text: "Repeating windows, melted faces in crowds, or objects that merge." },
      ],
    },
    verify: [
      { title: "Run a reverse image search", text: "See where the image first appeared and whether it’s been edited." },
      {
        title: "Look for content credentials",
        text: "Some cameras and apps attach data that shows how an image was made. You can use Veritas or other similar tools to double-check.",
      },
      { title: "Find a second source", text: "A real news photo is usually covered by more than one outlet." },
    ],
    terms: ["Generative AI", "Content Credentials (C2PA)", "Reverse image search"],
  },
  "video-and-motion": {
    cardTitle: "Video and motion",
    buttonLabel: "Open the video checklist",
    cardImage: {
      src: "/images/checklists/videos-card.webp",
      alt: "A wall of old TV screens showing glitchy, distorted images.",
    },
    intro:
      "Deepfake videos often break down when a face turns, a hand moves, or the light changes. Here is an example you can use to practice using the checklist of items below.",
    media: {
      type: "video",
      title: "Watch: an AI-generated video",
      src: "/media/ai-video-example.mp4",
      poster: "/images/checklists/ai-video-poster.webp",
    },
    closely: {
      title: "What to notice in potentially AI-generated",
      items: [
        {
          title: "Physics and lighting",
          text: "Mismatching shadows to a light source; objects or people suddenly appear, disappear, or change shape; liquid or food behaving unnaturally.",
        },
        {
          title: "Background and motion",
          text: "Completely frozen, lifeless backgrounds, zombie-like or repetitive walking patterns, and scrambled text on badges, signs, or license plates.",
        },
        {
          title: "Anatomy and micro-motions",
          text: "Unnatural or missing blinking, eyes staying completely rigid during speech.",
        },
        {
          title: "Lip sync and mouth movements",
          text: "Audio plays without corresponding lip shape, teeth appearing to shift or move.",
        },
      ],
    },
    verify: [
      { title: "Find the original upload", text: "Search for the clip’s earliest version and who first posted it." },
      {
        title: "Perform a reverse image search",
        text: "Take keyframes or screenshots from the video and run a reverse image search to see what else you can find out about this.",
      },
      {
        title: "Check for invisible watermarks and provenance signals",
        text: "Many major AI models embed hidden digital watermarks or cryptographic credentials into generated media. You can use Veritas or other similar tools to double-check.",
      },
    ],
    terms: ["Deepfake", "Watermark", "Synthetic media"],
  },
};
