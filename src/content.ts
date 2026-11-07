/**
 * Everything on the site that is a fact about 18K Intelligence rather than design.
 *
 * Sections built on lists (stats, videos, testimonials) are hidden while
 * their list is empty, so the live site never shows invented numbers or
 * quotes. A product only takes payment once `live` is true.
 */

export type Product = {
  slug: string;
  name: string;
  kind: string;
  /** The two lines of type on the product cover; the second is gold. */
  cover: [string, string];
  flagship?: boolean;
  summary: string;
  points: string[];
  /** Short facts under the cover, e.g. "12 lessons", "3h 40m". */
  meta: string[];
  /** In the smallest currency unit: 9700 = $97.00. */
  price: number;
  /**
   * Off until the price is final and the access link is set
   * (ACCESS_URL_<SLUG> in the environment). While off, the card says
   * "Coming soon" and points to the email list instead of checkout.
   */
  live: boolean;
};

export const CURRENCY = "usd";

export const site = {
  name: "18K Intelligence",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  /** Shown in the footer and privacy page when set. */
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
  instagram: "https://instagram.com/18kintelligence",
  /** Path to a portrait in /public, e.g. "/portrait.jpg". Shown as the "Now" chapter of the journey when set. */
  portrait: "",
  socials: [
    { label: "Instagram", href: "https://instagram.com/18kintelligence" },
    { label: "YouTube", href: "https://www.youtube.com/@18kintelligence" },
  ] as { label: string; href: string }[],

  /**
   * The free Creator-Builder Starter Kit, served at /kit (link it with KIT_URL).
   * A part only appears on the kit page, the hero card and the welcome email
   * once it has content, so the site never promises a part that isn't there.
   */
  kitParts: {
    checklist: [
      {
        stage: "Before you build",
        items: [
          "Buy a domain you'd happily say out loud, at a registrar where you can edit the DNS yourself.",
          "Write one sentence: who the site is for and what they should do next.",
          "Pick one main action: book a call, buy, or join your email list. Everything on the page points at it.",
        ],
      },
      {
        stage: "Build",
        items: [
          "Start with one page: headline, what you do, proof, the action, then a short FAQ.",
          "Keep the headline to about six words. Put the detail in the line underneath.",
          "Use real photos of you and your work. Stock photos make you look like everyone else.",
          "Never invent numbers, logos or testimonials. Leave the section out until you have real ones.",
          "Set up an email on your own domain that forwards to the inbox you already check.",
          "Design for your phone first. Most visitors will see it there.",
        ],
      },
      {
        stage: "Launch",
        items: [
          "Connect the domain and check the padlock (HTTPS) shows.",
          "Fill in every form and click every button yourself, using a real email address.",
          "Run payments in test mode first, then switch to live keys and make one real purchase.",
          "Add a privacy page if you collect emails or take payments.",
          "Add the site to Google Search Console so you can see how people find it.",
        ],
      },
      {
        stage: "After launch",
        items: ["Read your enquiries every week.", "Change one thing a month, and note what happened."],
      },
    ],
    /** Confirm these are the tools you use before this ships. */
    aiTools: [
      { name: "Claude Code", use: "Builds and edits my websites and apps from plain-English instructions, including this one." },
      { name: "Higgsfield", use: "AI images and video for ads, b-roll and concept frames." },
      { name: "ElevenLabs", use: "AI voiceover when a video needs narration." },
    ],
    /** The stack this site runs on, listed under the AI tools. */
    stack: [
      { name: "Next.js", use: "The website framework" },
      { name: "Hostinger", use: "Hosting and domain email" },
      { name: "Resend", use: "Emails and the mailing list" },
      { name: "Stripe", use: "Payments" },
      { name: "Cal.com", use: "Paid call bookings" },
    ],
    /** e.g. { name: "Sony FX3", use: "Main camera" } */
    gear: [] as { name: string; use: string }[],
    /** A file in /public, e.g. "/kit/18k-presets.zip". */
    presetsFile: "",
  },

  /**
   * Instagram Insights for the reach reel, each backed by a screenshot in /public/proof.
   * Reported by Kwame; the same numbers appear on 4anglesagency.com.
   */
  stats: [
    { value: "280,776", label: "views on one 7‑second reel", period: "Nov 2026", proof: "/proof/reel-summary.jpg" },
    { value: "101,678", label: "of those in its first week", period: "June 2026", proof: "/proof/reel-views.jpg" },
    { value: "396", label: "new followers from that reel", period: "Nov 2026", proof: "/proof/reel-summary.jpg" },
    { value: "3,349", label: "saves and 3,110 reposts", period: "Nov 2026", proof: "/proof/reel-engagement.jpg" },
  ] as { value: string; label: string; period: string; proof: string }[],
  /** Looping clips of real posts. Each tile opens the post on Instagram. */
  videos: [
    { title: "A 7‑second reel that reached the most people", tag: "Reach", src: "/work/reach.mp4", poster: "/work/reach.jpg", href: "https://www.instagram.com/reel/DZ5alo8M8sv/" },
    { title: "Losing £70k and starting again", tag: "Story", src: "/work/story.mp4", poster: "/work/story.jpg", href: "https://www.instagram.com/reel/DVLc9KQDDKr/" },
    { title: "Five mistakes I made building bybhub", tag: "Lessons", src: "/work/mistakes.mp4", poster: "/work/mistakes.jpg", href: "https://www.instagram.com/reel/DXMA3zWjNEL/" },
    { title: "My process in five steps, on a real client job", tag: "Tutorial", src: "/work/process.mp4", poster: "/work/process.jpg", href: "https://www.instagram.com/reel/DavWhHGMfwq/" },
  ] as { title: string; tag: string; src: string; poster: string; href: string }[],
  testimonials: [] as { quote: string; name: string; role: string }[],

  consult: {
    length: "60 min",
    format: "Google Meet",
    /** Shown on the card when set. The real price is charged by Cal.com, so change both together. */
    priceLabel: "£99",
    /** Short form of the policy on the Cal.com event. Change both together. */
    policy: "Free to reschedule, or a full refund if you cancel, up to 2 business days before your call.",
    focuses: [
      { name: "Brand & content strategy", detail: "What to post, where, and how to turn views into customers." },
      { name: "Website or app review", detail: "A live teardown of your site or product idea, with fixes ranked by impact." },
      { name: "Film & production", detail: "Gear, workflow and storytelling for your next shoot or campaign." },
    ],
  },

  products: [
    {
      slug: "film-it-yourself",
      name: "Film It Yourself",
      kind: "Course",
      cover: ["Film It", "Yourself"],
      summary: "Shoot and edit cinematic brand videos on a phone or camera.",
      points: [
        "Camera settings and framing that look expensive",
        "My editing workflow, start to export",
        "Lighting and audio on a small budget",
      ],
      meta: [],
      price: 9700,
      live: false,
    },
    {
      slug: "build-with-ai",
      name: "Build With AI",
      kind: "Course",
      cover: ["Build With", "AI"],
      flagship: true,
      summary:
        "Plan, build and launch software with AI: websites, apps, AI agents, automations and content pipelines. If you can describe it, you can build it, and I'll show you how step by step, even if you've never written code.",
      points: [
        "Turn any idea into a clear plan an AI can build from",
        "Websites and apps, from the first screen to taking payments",
        "AI agents and automations that take repetitive work off your plate",
        "Content pipelines that turn one idea into posts for every platform",
        "Launch it, get your first users and keep improving it",
      ],
      meta: [],
      price: 29700,
      live: false,
    },
    {
      slug: "content-os",
      name: "Content OS",
      kind: "Template pack",
      cover: ["Content", "OS"],
      summary: "The planning system behind my weekly posting, ready to copy.",
      points: ["Content calendar and idea bank", "Shot lists and script templates", "A weekly routine for one-person teams"],
      meta: ["Notion + Sheets"],
      price: 3700,
      live: false,
    },
  ] as Product[],
};

/** The kit's parts that have content, in the order they're listed everywhere. */
/** `phrase` is how the welcome email names each part. */
export function kitItems(): { id: string; item: string; format: string; phrase: string }[] {
  const k = site.kitParts;
  return [
    k.gear.length > 0 && { id: "gear", item: "My filmmaking gear list", format: "LIST", phrase: "my filmmaking gear list" },
    k.presetsFile && { id: "presets", item: "Editing presets & LUTs", format: "PACK", phrase: "my editing presets and LUTs" },
    k.aiTools.length > 0 && { id: "ai-tools", item: "The AI tools I build with", format: "GUIDE", phrase: "the AI tools I build with" },
    k.checklist.length > 0 && { id: "checklist", item: "First-website checklist", format: "CHECKLIST", phrase: "a first-website checklist" },
  ].filter((x): x is { id: string; item: string; format: string; phrase: string } => Boolean(x));
}

export function formatPrice(minor: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: CURRENCY.toUpperCase(),
    minimumFractionDigits: minor % 100 === 0 ? 0 : 2,
  }).format(minor / 100);
}

export function productBySlug(slug: string): Product | undefined {
  return site.products.find((p) => p.slug === slug);
}

export type JourneyStep = {
  /** Shown as the chapter's date, and as the big type when it has no media. */
  when: string;
  year: string;
  title: string;
  body: string[];
  /** Optional: a looping clip or photo. Landscape screen recordings use fit "contain". */
  media?: { kind: "video" | "image"; src: string; poster?: string; alt: string; caption: string; fit?: "contain" };
  /** What this chapter turned into on 18K, linked to that part of the page. */
  became?: { label: string; href: string };
  links?: { label: string; href: string }[];
};

/**
 * The About section: Kwame's journey, told by Kwame (Nov 2026).
 * Chapters without media show their year until a photo or clip is added.
 * The 2021 and June 2023 clips are made from Kwame's Canva uploads (Aug 2022 to Apr 2025), so their captions name no dates.
 * Wanted: a music video or shoot from 2024, and a portrait for "Now".
 */
export const journey: JourneyStep[] = [
  {
    when: "September 2021",
    year: "2021",
    title: "The idea: Book Your Booth",
    body: [
      "In 2020, during Covid, I went to a studio for the first time, Pirate Studios, with friends. I loved it. Booking one was hard and jarring, so in September 2021 I came up with the idea: the Airbnb for studios.",
      "My co-founder and I put our own money in and bootstrapped it.",
    ],
    media: { kind: "video", src: "/journey/byb-2021.mp4", poster: "/journey/byb-2021.jpg", alt: "", caption: "Before launch: our first logos and app designs" },
    became: { label: "Build With AI", href: "#next" },
  },
  {
    when: "March 2022",
    year: "2022",
    title: "Paying a developer",
    body: [
      "In March 2022 I found a developer in India on LinkedIn and messaged him. That month I made the first payment, and development started.",
      "It was a struggle from the start, with delay after delay. I paid him every month until the end of 2024.",
    ],
    became: { label: "Build With AI", href: "#next" },
  },
  {
    when: "June 2023",
    year: "2023",
    title: "Launch day, and everything that broke",
    body: [
      "We planned to launch in March 2023. While we waited, I started filming on my iPhone in November 2022 to build our Instagram and a waiting list.",
      "We launched in June 2023, three months late. There were bugs and problems everywhere, and every fix cost money we didn't have. So we downsized, fixed what mattered most first, and learned to move slowly and patiently.",
    ],
    media: { kind: "video", src: "/journey/byb-2023.mp4", poster: "/journey/byb-2023.jpg", alt: "", caption: "Our app: studios near you, on a map, by the hour" },
    became: { label: "Build With AI", href: "#next" },
  },
  {
    when: "2023 to January 2024",
    year: "2024",
    title: "Learning to film, because I had to",
    body: [
      "Around launch, studios started asking me to make content for them. I said no, to stay focused on Book Your Booth. I didn't see it then, but that was a business.",
      "From May to November 2023 I hired videographers and photographers, but they couldn't put what was in my head on screen. So in January 2024 I picked up a camera and taught myself, and spent that month in LA learning the craft.",
    ],
    became: { label: "Film It Yourself", href: "#next" },
  },
  {
    when: "July 2024",
    year: "2024",
    title: "Filming for other people",
    body: [
      "I started shooting for others: music videos, photography for brands and models, friends and family.",
      "It sharpened my skills and brought in extra cash. That kept me afloat, and every bit of it went back into Book Your Booth.",
    ],
    became: { label: "1:1 calls", href: "#consult" },
  },
  {
    when: "February 2025",
    year: "2025",
    title: "Studio Crash",
    body: [
      "In February 2025 I started Studio Crash, an event series. Artists came into studios on Book Your Booth and freestyled on camera, and the only way in was to book through the app.",
      "It marketed the studios and brought bookings to the app. But I ran all of it myself: hosting, shooting, editing, and running the business.",
    ],
    media: { kind: "video", src: "/work/bybhub-crash.mp4", poster: "/work/bybhub-crash.jpg", alt: "", caption: "An ad I made for Studio Crash. The only way in was through the app." },
    became: { label: "Film It Yourself", href: "#next" },
  },
  {
    when: "April 2025",
    year: "2025",
    title: "Putting it on hold",
    body: [
      "Momentum was picking up, but by then it was too late. The technical problems never stopped, and I couldn't find product-market fit while fighting the app.",
      "I was burned out and carrying all of it, and the money was running out. In April 2025 I put Book Your Booth on hold. Building the app had cost more than £70,000.",
    ],
    media: { kind: "video", src: "/work/bybhub-cypher.mp4", poster: "/work/bybhub-cypher.jpg", alt: "", caption: "Beyond The Booth, our live cypher night" },
  },
  {
    when: "February 2026",
    year: "2026",
    title: "Starting again, in public",
    body: [
      "I started posting with no fixed plan, trying out what I cared about: the gym, business, marketing and tech. My first video was the story of losing that £70k.",
      "4angles was born around the same time and started paying. That gave me room to step back and properly learn AI.",
    ],
    media: { kind: "video", src: "/work/story.mp4", poster: "/work/story.jpg", alt: "", caption: "My first post: losing £70k and starting again" },
    became: { label: "Content OS", href: "#next" },
    links: [{ label: "4angles", href: "https://4anglesagency.com" }],
  },
  {
    when: "April to November 2026",
    year: "2026",
    title: "Rebuilding it with AI",
    body: [
      "In April 2026 I went back to Book Your Booth and worked out how AI could cut my costs and let me build faster. In September, development on bybhub began.",
      "The first version took nearly three years of paying a developer. Within a few months, bybhub was fully built, bigger and better.",
    ],
    media: { kind: "video", src: "/work/bybhub-site.mp4", poster: "/work/bybhub-site-poster.jpg", alt: "", caption: "bybhub.io, built with AI", fit: "contain" },
    became: { label: "Build With AI", href: "#next" },
    links: [{ label: "See bybhub", href: "https://bybhub.io" }],
  },
  {
    when: "Now",
    year: "18K",
    title: "18K Intelligence",
    body: [
      "Somewhere between January 2026 and now, it all connected. Everything from the last five years, the slow build, the bugs, the camera, the money I lost and the rebuild, is what I teach here.",
      "18K Intelligence is that whole journey, laid out so you can learn it without the expensive parts.",
    ],
    media: site.portrait
      ? { kind: "image", src: site.portrait, alt: "Kwame, 18K Intelligence", caption: "Me, now" }
      : { kind: "video", src: "/work/process.mp4", poster: "/work/process.jpg", alt: "", caption: "How I work now" },
    links: [
      { label: "Get the free kit", href: "#join" },
      { label: "Book a 1:1 call", href: "#consult" },
    ],
  },
];
