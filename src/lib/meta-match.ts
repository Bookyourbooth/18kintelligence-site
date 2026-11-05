/**
 * Who a Meta event is about, scrambled the way Meta asks for it.
 *
 * WHY. Meta can only credit an ad with a sign-up, booking or sale that it can
 * tie to a Facebook or Instagram account, and the more of them it can tie, the
 * more of the ads' results it counts and the better it aims the next ones.
 * Meta calls this advanced matching. An email address, phone number and name
 * are what it matches on (chosen 5 Nov 2026, for the ads to perform as well as
 * they can).
 *
 * SCRAMBLED, NEVER SENT AS TYPED. Each value is tidied the way Meta's own
 * code tidies it, then turned into its SHA-256 code. Meta compares codes with
 * codes made from its own users' details. The same code comes out in the
 * browser and on the server, so Meta can tell the two copies of one event are
 * about the same person.
 *
 * NO SAY OVER CONSENT. lib/meta-pixel only calls this for a visitor who said
 * yes to the cookie question, and the server routes check that answer again.
 */

export type Who = {
  email?: string | null;
  phone?: string | null;
  name?: string | null;
  /** Our own account id, which Meta keeps as external_id. */
  id?: string | null;
  city?: string | null;
  /** Two letters, such as GB. */
  country?: string | null;
};

export const MATCH_KEYS = ["em", "ph", "fn", "ln", "ct", "country", "external_id"] as const;

/** Meta's names for the same things, each holding a 64-character SHA-256 code. */
export type MatchKeys = Partial<Record<(typeof MATCH_KEYS)[number], string>>;

export const isHashed = (v: unknown): v is string => typeof v === "string" && /^[a-f0-9]{64}$/.test(v);

export function normalEmail(raw: string): string | null {
  const v = raw.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? v : null;
}

/**
 * Digits only, country code first, as Meta wants. A number written the
 * British way (07700 900123) is taken to be British: nearly everyone here is,
 * and without its country code a number matches nobody. So is the (0) in
 * +44 (0)7700 900123, which nobody dials from abroad.
 */
export function normalPhone(raw: string): string | null {
  const written = raw.trim();
  let digits = written.replace(/\D/g, "");
  if (!written.startsWith("+")) {
    if (digits.startsWith("00")) digits = digits.slice(2);
    else if (digits.startsWith("0")) digits = `44${digits.slice(1)}`;
    else if (digits.length === 10 && digits.startsWith("7")) digits = `44${digits}`;
  }
  digits = digits.replace(/^0+/, "").replace(/^440/, "44");
  return digits.length >= 8 && digits.length <= 15 ? digits : null;
}

/** Lower case and letters only, accents kept: Meta's form for names and towns. */
export function normalWord(raw: string): string | null {
  const v = raw.normalize("NFC").toLowerCase().replace(/[^\p{L}]/gu, "");
  return v || null;
}

/** "Kwame Afrifah-Owusu" gives kwame and afrifahowusu. One word is a first name. */
export function splitName(full: string): { first: string | null; last: string | null } {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  return {
    first: parts.length ? normalWord(parts[0]) : null,
    last: parts.length > 1 ? normalWord(parts[parts.length - 1]) : null,
  };
}

export async function sha256(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** The keys for a person, leaving out whatever is missing or can't be used. */
export async function matchKeys(who: Who): Promise<MatchKeys> {
  const { first, last } = splitName(who.name ?? "");
  const country = who.country?.trim().toLowerCase();
  const plain: Record<keyof MatchKeys, string | null> = {
    em: who.email ? normalEmail(who.email) : null,
    ph: who.phone ? normalPhone(who.phone) : null,
    fn: first,
    ln: last,
    ct: who.city ? normalWord(who.city) : null,
    country: country && /^[a-z]{2}$/.test(country) ? country : null,
    external_id: who.id?.trim() || null,
  };
  const keys: MatchKeys = {};
  for (const key of MATCH_KEYS) {
    const value = plain[key];
    if (value) keys[key] = await sha256(value);
  }
  return keys;
}

/** Only the keys that really are codes: anything else is dropped, not sent. */
export function hashedOnly(raw: unknown): MatchKeys {
  const keys: MatchKeys = {};
  if (!raw || typeof raw !== "object") return keys;
  for (const key of MATCH_KEYS) {
    const value = (raw as Record<string, unknown>)[key];
    if (isHashed(value)) keys[key] = value;
  }
  return keys;
}
