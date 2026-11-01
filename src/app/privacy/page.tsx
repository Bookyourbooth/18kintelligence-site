import type { Metadata } from "next";
import { site } from "@/content";

export const metadata: Metadata = { title: "Privacy" };

export default function Privacy() {
  return (
    <main className="gut">
      <div className="wrap page">
        <a className="label g" href="/" style={{ textDecoration: "none" }}>
          ← 18K Intelligence
        </a>
        <h1>Privacy policy</h1>
        <p>This page explains what 18K Intelligence collects through this website and what I do with it.</p>
        <h2>What I collect</h2>
        <ul>
          <li>Your email address when you get the free kit, join the weekly email or join the community waitlist.</li>
          <li>Your name, email and payment when you buy a product. Card details go to Stripe and never reach me.</li>
          <li>Your booking details when you book a call through Cal.com.</li>
        </ul>
        <h2>How I use it</h2>
        <ul>
          <li>To send what you signed up for: the kit, the weekly email or waitlist news.</li>
          <li>To deliver products you buy and help if something goes wrong.</li>
          <li>Every email has an unsubscribe link, and you can leave at any time.</li>
        </ul>
        <h2>Who processes it</h2>
        <p>
          Emails and the mailing list run on Resend, payments on Stripe, call bookings on Cal.com, and the site is hosted on
          Vercel. I don&apos;t sell your information.
        </p>
        <h2>Your choices</h2>
        <p>
          You can ask to see, correct or delete what I hold about you
          {site.email ? (
            <>
              {" "}by emailing <a href={`mailto:${site.email}`}>{site.email}</a>
            </>
          ) : (
            " by replying to any email from me"
          )}
          .
        </p>
      </div>
    </main>
  );
}
