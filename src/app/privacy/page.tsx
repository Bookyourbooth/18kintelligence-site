import type { Metadata } from "next";
import { CookieSettingsButton } from "@/components/cookie-consent";
import { site } from "@/content";
import { PIXEL_ID } from "@/lib/meta-pixel";

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
          Hostinger. I don&apos;t sell your information.
          {PIXEL_ID && (
            <>
              {" "}Meta only gets details of your visit if you accept advertising cookies (see{" "}
              <a href="#cookies">Cookies</a>). Meta is a controller in its own right for this; see{" "}
              <a href="https://www.facebook.com/privacy/policy/">Meta&apos;s privacy policy</a>.
            </>
          )}
        </p>
        {PIXEL_ID && (
          <>
            <h2 id="cookies">Cookies</h2>
            <p>
              Advertising cookies only run if you say yes when this site asks. They come from Meta, which runs Facebook
              and Instagram, and show me which of my ads bring people here. Meta sets its own cookies (_fbp, and _fbc if
              you arrived from one of my ads), and your browser tells Meta the address of each page you visit here,
              apart from the page you see after paying, and when you sign up with your email. Meta also sees your IP
              address and browser, and may link all this to a Facebook or Instagram account. I don&apos;t give it your
              name, email address, phone number or what you buy.
            </p>
            <p>
              If you decline, none of this loads and nothing about your visit goes to Meta. One small cookie of mine
              keeps your answer for six months. <CookieSettingsButton>Change your answer</CookieSettingsButton>
            </p>
          </>
        )}
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
