import { kitItems } from "@/content";
import { button, esc, layout, mailer, saveContact } from "@/lib/server";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** "a, b and c" */
const listOf = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs.at(-1)}`);

const SOURCES = {
  kit: {
    subject: "Your Creator-Builder Starter Kit",
    body: (kitUrl: string) =>
      `<p>Hey,</p><p>Thanks for joining. Here's your Creator-Builder Starter Kit: ${listOf(kitItems().map((k) => k.phrase))}.</p>
${kitUrl ? button(kitUrl, "Get the kit") : "<p>I'll send your download link in a separate email shortly.</p>"}
<p>Every week I'll send you one email on building, filming and marketing. Reply any time and tell me what you're working on.</p><p>Kwame<br>18K Intelligence</p>`,
  },
  courses: {
    subject: "You're on the list for the 18K courses",
    body: () =>
      `<p>Hey,</p><p>You're on the list. I'll email you as soon as a course opens, before anyone else hears about it.</p><p>Reply any time and tell me what you most want to learn.</p><p>Kwame<br>18K Intelligence</p>`,
  },
  newsletter: {
    subject: "You're on the 18K Intelligence list",
    body: () =>
      `<p>Hey,</p><p>You're in. Once a week I'll send you what I'm building, filming and learning, with the tools and workflows behind it.</p><p>Reply any time and tell me what you're working on.</p><p>Kwame<br>18K Intelligence</p>`,
  },
  waitlist: {
    subject: "You're on the 18K Club waitlist",
    body: () =>
      `<p>Hey,</p><p>You're on the waitlist for the 18K Club. You'll hear first when doors open, and founding members keep their price for life.</p><p>Kwame<br>18K Intelligence</p>`,
  },
  early: {
    subject: "You're on the list for 18K courses and the Club",
    body: () =>
      `<p>Hey,</p><p>You're on the list. You'll hear first when a course or the 18K Club opens, before anyone else, and founding members keep their price for life.</p><p>Reply any time and tell me what you most want to learn.</p><p>Kwame<br>18K Intelligence</p>`,
  },
} as const;

/**
 * Email-list signups from the hero (free kit), "On the way" (early: courses and the Club) and footer (newsletter) forms.
 * "courses" and "waitlist" are the older split forms, kept so a cached page still works.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  if (body.website) return Response.json({ ok: true }); // honeypot

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 200) : "";
  const source = typeof body.source === "string" && body.source in SOURCES ? (body.source as keyof typeof SOURCES) : null;
  if (!EMAIL.test(email)) return Response.json({ error: "Enter a valid email address, like you@example.com." }, { status: 422 });
  if (!source) return Response.json({ error: "Something went wrong. Refresh the page and try again." }, { status: 400 });

  const m = mailer();
  if (!m) {
    console.error("subscribe: RESEND_API_KEY is not set");
    return Response.json({ error: "Sign-ups are paused for a moment. Please try again shortly." }, { status: 503 });
  }

  const s = SOURCES[source];
  const sent = await m.resend.emails.send({
    from: m.from,
    to: email,
    subject: s.subject,
    html: layout(s.body(process.env.KIT_URL ?? "")),
  });
  if (sent.error) {
    console.error("subscribe: email failed", sent.error);
    return Response.json({ error: "We couldn't send your email. Check the address and try again." }, { status: 502 });
  }

  await saveContact(email, source);
  // With no KIT_URL the kit can't go out automatically, so tell the owner rather than leave the promise hanging.
  if (source === "kit" && !process.env.KIT_URL && m.ownerTo) {
    await m.resend.emails.send({ from: m.from, to: m.ownerTo, subject: "Send the Starter Kit by hand", html: layout(`<p>${esc(email)} asked for the kit. KIT_URL isn't set, so they haven't got a download link yet.</p>`) });
  }
  if ((source === "waitlist" || source === "early") && m.ownerTo) {
    await m.resend.emails.send({ from: m.from, to: m.ownerTo, subject: "New 18K early-access signup", html: layout(`<p>${esc(email)} joined the list for courses and the Club.</p>`) });
  }
  return Response.json({ ok: true });
}
