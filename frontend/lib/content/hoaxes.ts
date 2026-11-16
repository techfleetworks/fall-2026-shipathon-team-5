// Images live in public/images/hoaxes/.
export type Hoax = {
  year: string; // e.g. "2023 · AI image"
  title: string;
  description: string;
  tell: string; // the clue that would have caught it ("The tell:" is added by the card)
  image?: {
    src: string;
    alt: string;
    position?: string; // which part of the photo to keep when it's cropped, e.g. "center top"
  };
  featured?: boolean; // show on the Learn to spot the slop page
};

export const hoaxes: Hoax[] = [
  {
    year: "2024 · Deepfake video",
    title: "The $25 Million “Virtual Boardroom” Heist",
    description:
      "A finance employee at the firm Arup was invited to a confidential video call with what seemed the company’s UK-based CFO and several coworkers, who asked to authorize urgent transfers. Seeing and hearing familiar faces live on camera erased any doubts, and he sent $25.6 million (HK $200 million) across 15 transactions.",
    tell: "Everyone on the call, except for the victim, was a real-time deepfake built from public videos and meeting recordings. The fraud surfaced only days later, when he checked the transfers through separate internal channels.",
    image: {
      src: "/images/hoaxes/video-conference.webp",
      alt: "A person gestures at a laptop showing a smiling man on a video call.",
      position: "center 30%",
    },
    featured: true,
  },
  {
    year: "2024 · AI voice clone",
    title: "The New Hampshire Joe Biden Robocall",
    description:
      "Thousands of voters got a robocall featuring an AI-cloned voice of President Biden urging them to stay home and “save [their] vote” on election day. Within weeks, the FCC outlawed AI-generated voices in robocalls, while the operative responsible was hit with a $6 million fine.",
    tell: "Audio analysis found the unnatural cadence that is typical of voice cloning, with no micro-pauses for breath and a slightly flattened vocal melody.",
    image: {
      src: "/images/hoaxes/voice-call.webp",
      alt: "A woman holds a phone to her ear.",
    },
    featured: true,
  },
  {
    year: "2024 · AI voice clone",
    title: "The Celebrity Cookware Giveaway",
    description:
      "Ads used an AI copy of Taylor Swift’s voice over real clips to offer free Le Creuset cookware. A small “shipping fee” led to surprise monthly charges.",
    tell: "Too good to be true, and the brand’s own site and social accounts had no giveaway.",
    image: {
      src: "/images/hoaxes/cookware.webp",
      alt: "Copper and nonstick pots and pans hanging from hooks on a kitchen wall.",
    },
  },
  {
    year: "2023 · AI image",
    title: "The Pope in a White Puffer Coat",
    description:
      "An AI-generated image of Pope Francis in a designer puffer jacket fooled millions before it was traced to an image generator.",
    tell: "Look at the hands, the glasses and the crucifix chain. They blur and warp up close.",
    image: {
      src: "/images/hoaxes/pope-ai-jacket.webp",
      alt: "AI-generated image of Pope Francis walking in a long white puffer coat.",
      position: "center top",
    },
    featured: true,
  },
  {
    year: "2023 · AI image",
    title: "An “Explosion” Near the Pentagon",
    description:
      "An AI image of smoke near the Pentagon was posted by a fake “Bloomberg” account with a paid checkmark. Stocks dipped briefly before officials said there was no explosion.",
    tell: "The building and fence are warped, and no other photos or news reports exist.",
    image: {
      src: "/images/hoaxes/pentagon-ai.webp",
      alt: "AI-generated image of a column of smoke near a large government building.",
    },
  },
  {
    year: "2011 · Edited photo",
    title: "The Shark on the Flooded Highway",
    description:
      "A photo of a shark swimming down a flooded highway spread during Hurricane Irene in 2011. It has come back during nearly every big storm since.",
    tell: "A reverse image search finds the shark in a real wildlife photo from South Africa, pasted onto a flooded road.",
    image: {
      src: "/images/hoaxes/shark-highway.webp",
      alt: "A Facebook post showing the edited photo of a shark in floodwater on a highway, seen through a car window.",
      position: "center 80%",
    },
  },
];

export const featuredHoaxes = hoaxes.filter((h) => h.featured);

// The longest title, description and tell in a list of hoaxes. Every card in that
// list reserves room for these (invisibly), so all the cards and "The tell" boxes
// come out the same size no matter how much text each one has.
export type HoaxSizers = Pick<Hoax, "title" | "description" | "tell">;

export function hoaxSizers(list: Hoax[]): HoaxSizers {
  const longest = (key: keyof HoaxSizers) =>
    list.reduce((a, b) => (b[key].length > a.length ? b[key] : a), "");
  return { title: longest("title"), description: longest("description"), tell: longest("tell") };
}
