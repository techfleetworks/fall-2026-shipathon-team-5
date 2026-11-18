// Annotated examples on each "AI on your feed" guide page. The numbered markers
// are drawn on the images; the notes here must stay in the same order.
// Images live in public/images/guides/.

export type Note = { title: string; text: string };

export type PlatformExamples = {
  browser: { alt: string; notes: Note[] };
  mobile: { alt: string; notes: Note[]; checkAlt: string };
};

// Image file names follow the pattern <slug>-browser / -mobile / -mobile-check.
export const exampleImage = (slug: string, kind: "browser" | "mobile" | "mobile-check") =>
  `/images/guides/${slug}-${kind}.webp`;

const WHO_POSTED: Note = {
  title: "Who posted it?",
  text: "Tap the account. Is it new? Does it post the same thing over and over?",
};
const AI_LABEL: Note = {
  title: "Is there an AI label?",
  text: "Some content is marked with a label as being AI-generated, though this is not always a guarantee.",
};
const COMMENTS: Note = {
  title: "Do the comments have any additional context?",
  text: "People sometimes post the real source or a correction.",
};
const SOUND: Note = {
  title: "What is the sound?",
  text: "“Original sound” with an AI voice over real footage is a common trick.",
};

export const platformExamples: Record<string, PlatformExamples> = {
  tiktok: {
    browser: {
      alt: "A TikTok video in a web browser with Veritas labels: an old clip with an AI voice, and context from Veritas.",
      notes: [
        { title: "Who posted it?", text: "The account is 6 days old and only posts “breaking news”." },
        {
          title: "TikTok’s own label.",
          text: "“Creator labeled as AI-generated” means the poster said AI was used.",
        },
        { title: "Veritas label.", text: "Veritas flags an old clip with an AI voiceover. Tap “Why?” for the clues." },
        { title: "Context from Veritas.", text: "Where the clip really came from, with sources." },
      ],
    },
    mobile: {
      alt: "The same TikTok video on a phone, with numbered markers on the account, AI label, comments and sound.",
      notes: [WHO_POSTED, AI_LABEL, COMMENTS, SOUND],
      checkAlt: "The Veritas quick check on the phone: likely misleading, an old storm clip with an AI voiceover.",
    },
  },
  youtube: {
    browser: {
      alt: "A YouTube video in a web browser with a Veritas likely-deepfake label and context from Veritas.",
      notes: [
        { title: "Who posted it?", text: "The channel is 3 weeks old and only posts shocking “news”." },
        {
          title: "YouTube’s own label.",
          text: "“Altered or synthetic content” means the creator said it was changed or made with AI.",
        },
        {
          title: "Veritas label.",
          text: "Veritas marks the video as a likely deepfake right on the player. Tap “Why?” to see the clues.",
        },
        { title: "Context from Veritas.", text: "A short note with the real story and links to sources." },
      ],
    },
    mobile: {
      alt: "The same YouTube video on a phone, with numbered markers on the channel, label, video, comments and description.",
      notes: [
        WHO_POSTED,
        AI_LABEL,
        // DRAFT: no text was given for marker 3 (top corner of the video). Replace as needed.
        {
          title: "Are there watermarks on the video?",
          text: "Check the corners for logos from AI tools, or blurry patches where a watermark might have been removed.",
        },
        COMMENTS,
        SOUND,
      ],
      checkAlt: "The Veritas quick check on the phone: likely misleading, this interview is likely a deepfake.",
    },
  },
  instagram: {
    browser: {
      alt: "An Instagram post in a web browser with a Veritas likely-AI-generated label and context from Veritas.",
      notes: [
        {
          title: "The handle.",
          text: "Compare it with the brand’s real account. Fakes add extra words, dots or underscores.",
        },
        { title: "Instagram’s own label.", text: "“AI info” under the name means Instagram found signs of AI." },
        { title: "Veritas label.", text: "Veritas flags the photo as likely AI-generated. Tap “Why?” for the clues." },
        {
          title: "Context from Veritas.",
          text: "Why the giveaway looks like a scam, with a link to the brand’s real page.",
        },
      ],
    },
    mobile: {
      alt: "An Instagram Reel on a phone, with numbered markers on the account, AI info label, comments, sound and menu.",
      notes: [
        WHO_POSTED,
        AI_LABEL,
        COMMENTS,
        SOUND,
        {
          title: "Is there additional information?",
          text: "Instagram sometimes provides additional context in the “About this reel” section.",
        },
      ],
      checkAlt: "The Veritas quick check on the phone, showing the result and its reasons.",
    },
  },
  "facebook-messenger": {
    browser: {
      alt: "A Facebook post in a web browser with a Veritas likely-AI-generated label and context from Veritas.",
      notes: [
        { title: "Who posted it?", text: "Tap the page name. “Page transparency” shows it was made last month." },
        { title: "Facebook’s own label.", text: "“AI info” next to the time means Facebook found signs of AI." },
        { title: "Veritas label.", text: "Veritas flags the photo as likely AI-generated. Tap “Why?” for the clues." },
        { title: "Context from Veritas.", text: "What’s really known about the story, with sources." },
      ],
    },
    mobile: {
      alt: "The same Facebook post on a phone, with numbered markers on the page name, AI info, caption, comments and menu.",
      notes: [
        { title: "Who posted it?", text: "Tap the page name. “Page transparency” shows it was made last month." },
        { title: "Facebook’s own label.", text: "“AI info” next to the time means Facebook found signs of AI." },
        {
          title: "What do the contents of the caption say?",
          text: "Are they urging you to perform a hasty action?",
        },
        COMMENTS,
        { title: "Is there additional context?", text: "Facebook sometimes shows why you are seeing this post." },
      ],
      checkAlt: "The Veritas quick check on the phone, showing the result and its reasons.",
    },
  },
  whatsapp: {
    browser: {
      alt: "A WhatsApp group chat in a web browser with Veritas labels on a forwarded photo and voice note.",
      notes: [
        {
          title: "The forwarded label.",
          text: "“Forwarded many times” means it didn’t start with the person who sent it.",
        },
        {
          title: "Veritas label on the photo.",
          text: "Veritas found the same photo online from 2021, in a different city.",
        },
        {
          title: "Veritas label on the voice note.",
          text: "The voice matches voice-cloning patterns. Call the person on a number you know.",
        },
        { title: "Context from Veritas.", text: "The real story behind the photo, and a kind way to reply." },
      ],
    },
    mobile: {
      alt: "The same WhatsApp group chat on a phone, with numbered markers on the label, photo, message, voice note and reply.",
      notes: [
        {
          title: "Is there a “Forwarded many times” label?",
          text: "This label usually indicates a heavy use of messaging loops to spread information.",
        },
        { title: "Take a closer look at the photo used.", text: "Does it seem realistic and plausible?" },
        { title: "What is the tone of the message?", text: "Are they urging you to perform a hasty action?" },
        {
          title: "Listen closely to the voice note.",
          text: "Mark any signs for breathing or natural pauses.",
        },
        {
          title: "If you already know the sender, ask for their source of information.",
          text: "For unknown senders, report and block them.",
        },
      ],
      checkAlt: "The Veritas quick check on the phone, showing the result and its reasons.",
    },
  },
  x: {
    browser: {
      alt: "A post on X in a web browser with a community note and a Veritas likely-AI-generated label.",
      notes: [
        {
          title: "Who posted it?",
          text: "The handle uses a zero instead of an “o”. It copies a real news account.",
        },
        { title: "The checkmark.", text: "A checkmark can be bought, so it doesn’t prove who someone is." },
        {
          title: "Community note.",
          text: "“Readers added context” means other users added facts and sources.",
        },
        { title: "Veritas label.", text: "Veritas flags the photo as likely AI-generated. Tap “Why?” for the clues." },
      ],
    },
    mobile: {
      alt: "The same post on X on a phone, with numbered markers on the handle, checkmark, community note and replies.",
      notes: [
        WHO_POSTED,
        {
          title: "Check the verified account badge.",
          text: "Although a blue checkmark on X usually only implies a paid subscription, some accounts are further verified by their association with a known organization.",
        },
        {
          title: "Is Community Notes available?",
          text: "This section shows crowd-sourced fact-checking or links to original sources.",
        },
        COMMENTS,
      ],
      checkAlt: "The Veritas quick check on the phone: likely misleading, no explosion and the image is AI-made.",
    },
  },
};
