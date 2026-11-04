"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import {
  PIXEL_SCRIPT,
  chooseCookies,
  cookieChoice,
  cookieSettingsOpen,
  isSilentPath,
  openCookieSettings,
  pageView,
  subscribeToCookies,
  type CookieChoice,
} from "@/lib/meta-pixel";

const useCookieChoice = () => useSyncExternalStore<CookieChoice>(subscribeToCookies, cookieChoice, () => "off");

/**
 * The cookie question, and the Pixel that hangs on the answer. The rules are
 * in lib/meta-pixel. Accept and Decline look the same, because the ICO wants
 * saying no to be as easy as saying yes.
 */
export function CookieConsent() {
  const choice = useCookieChoice();
  const open = useSyncExternalStore(subscribeToCookies, cookieSettingsOpen, () => false);
  const pathname = usePathname();
  const silent = isSilentPath(pathname);

  useEffect(() => {
    pageView(pathname);
  }, [pathname, choice]);

  if (choice === "off") return null;

  return (
    <>
      {choice === "accepted" && !silent && <Script id="meta-pixel" src={PIXEL_SCRIPT} strategy="afterInteractive" />}

      {(open || (choice === "ask" && !silent)) && (
        <section className="cookies" aria-labelledby="cookie-question">
          <h2 id="cookie-question">Can I use advertising cookies?</h2>
          <p>
            Meta&apos;s cookies show me which of my ads bring people to 18K Intelligence. Say no and everything here
            works the same.{" "}
            {choice !== "ask" && <>You&apos;ve currently said {choice === "accepted" ? "yes" : "no"}. </>}
            <a href="/privacy#cookies">Privacy policy</a>
          </p>
          <div className="cookies-btns">
            {(
              [
                ["accepted", "Accept"],
                ["declined", "Decline"],
              ] as const
            ).map(([value, label]) => (
              <button key={value} className="btn" type="button" onClick={() => chooseCookies(value)}>
                {label}
              </button>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

/** Reopens the question. Shows nothing, `before` included, when there is no Pixel to have a say over. */
export function CookieSettingsButton({ children, before }: { children: ReactNode; before?: ReactNode }) {
  const choice = useCookieChoice();
  if (choice === "off") return null;
  return (
    <>
      {before}
      <button type="button" className="link-btn" onClick={openCookieSettings}>
        {children}
      </button>
    </>
  );
}
