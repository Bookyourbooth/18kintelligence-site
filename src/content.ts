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
  /** Path to a portrait in /public, e.g. "/portrait.jpg". Shown in the About section when set. */
  portrait: "",
  socials: [{ label: "Instagram", href: "https://instagram.com/18kintelligence" }] as { label: string; href: string }[],

  /** What the free Starter Kit email delivers. Keep in step with KIT_URL. */
  kit: [
    { item: "My filmmaking gear list", format: "PDF" },
    { item: "Editing presets & LUTs", format: "PACK" },
    { item: "The AI tools I build with", format: "GUIDE" },
    { item: "First-website checklist", format: "PDF" },
  ],

  /** e.g. { value: "120k", label: "followers across platforms" } */
  stats: [] as { value: string; label: string }[],
  /** e.g. { title: "I built a booking app in a weekend", href: "https://instagram.com/reel/..." } */
  videos: [] as { title: string; href: string }[],
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
      summary: "Plan, build and launch websites and apps with AI tools, even if you've never coded.",
      points: [
        "Launch a website in a weekend",
        "Build your first app with AI coding tools",
        "Take payments and collect leads from day one",
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
