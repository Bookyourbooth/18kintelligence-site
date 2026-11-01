import { button, esc, layout, mailer, saveContact } from "@/lib/server";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SOURCES = {
  kit: {
    subject: "Your Creator-Builder Starter Kit",
    body: (kitUrl: string) =>
      `<p>Hey,</p><p>Thanks for joining. Here's your Creator-Builder Starter Kit: my gear list, editing presets, the AI tools I build with and a first-website checklist.</p>
${kitUrl ? button(kitUrl, "Get the kit") : "<p>Your download link is on its way in a separate email.</p>"}
<p>Every week I'll send you one email on building, filming and marketing. Reply any time and tell me what you're working on.</p><p>who18k</p>`,
  },
  newsletter: {
    subject: "You're on the who18k list",
    body: () =>
      `<p>Hey,</p><p>You're in. Once a week I'll send you what I'm building, filming and learning, with the tools and workflows behind it.</p><p>Reply any time and tell me what you're working on.</p><p>who18k</p>`,
  },
  waitlist: {
    subject: "You're on the 18K Club waitlist",
    body: () =>
      `<p>Hey,</p><p>You're on the waitlist for the 18K Club. You'll hear first when doors open, and founding members keep their price for life.</p><p>who18k</p>`,
  },
} as const;

/** Email-list signups from the hero (free kit), footer (newsletter) and community (waitlist) forms. */
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
  if (source === "waitlist" && m.ownerTo) {
    await m.resend.emails.send({ from: m.from, to: m.ownerTo, subject: "New 18K Club waitlist signup", html: layout(`<p>${esc(email)} joined the waitlist.</p>`) });
  }
  return Response.json({ ok: true });
}
