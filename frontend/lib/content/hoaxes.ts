// Real-life AI hoaxes. The Learn page shows the first three; the full
// "Real-life AI hoaxes that went viral" page shows them all.
export type Hoax = {
  year: string; // e.g. "2023 · AI image"
  title: string;
  tell: string; // the clue that would have caught it
};

export const hoaxes: Hoax[] = [
  {
    year: "2011 · Edited photo",
    title: "The shark on the flooded highway",
    tell: "Reverse image search finds the shark in an older photo.",
  },
  {
    year: "2023 · AI image",
    title: "The Pope in a white puffer coat",
    tell: "The hands, glasses and chain warp up close.",
  },
  {
    year: "2024 · Voice clone ad",
    title: "The celebrity cookware giveaway",
    tell: "The brand's own site had no giveaway.",
  },
];
