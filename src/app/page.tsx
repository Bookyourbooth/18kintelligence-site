import type { CSSProperties } from "react";
import { BookCall } from "@/components/book-call";
import { BuyButton } from "@/components/buy-button";
import { CaptureForm } from "@/components/capture-form";
import { HeroMedia } from "@/components/hero-media";
import { KitLink } from "@/components/kit-link";
import { MobileMenu } from "@/components/mobile-menu";
import { CookieSettingsButton } from "@/components/cookie-consent";
import { Reels } from "@/components/reels";
import { Journey } from "@/components/journey";
import { CURRENCY, formatPrice, journey, kitItems, site } from "@/content";

/** "a, b and c" */
const listOf = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs.at(-1)}`);

export default function Home() {
  const calUrl = process.env.CAL_CONSULT_URL ?? "";
  const live = site.products.filter((p) => p.live);
  const coming = site.products.filter((p) => !p.live);
  const kitList = listOf(kitItems().map((k) => k.phrase));
  const sections = [
    ...(site.videos.length > 0 ? [{ label: "Work", href: "#work" }] : []),
    { label: "My story", href: "#about" },
    { label: "1:1 calls", href: "#consult" },
    { label: "Courses", href: live.length > 0 ? "#products" : "#next" },
  ];

  return (
    <>
      <header className="nav gut">
        <div className="wrap nav-in">
          <a className="wordmark" href="#top">
            <b>18k</b>intelligence
          </a>
          <nav className="nav-links" aria-label="Main">
            {sections.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
            <KitLink className="btn">Get the free kit</KitLink>
            <MobileMenu links={sections} />
          </nav>
        </div>
      </header>

      <main id="top">
        <div className="gut">
          <div className="wrap hero">
            <div className="hero-copy">
              <h1>Build it with AI and film it yourself</h1>
              <p className="lede">
                I&apos;m Kwame, founder of 4angles. My first app took nearly three years and more than £70,000. I rebuilt it with AI in a
                few months, and each week I show you how.
              </p>
              <CaptureForm
                formId="join"
                id="hero-email"
                source="kit"
                label={`Get the free Starter Kit: ${kitList}.`}
                button="Send me the kit"
                note={
                  <>
                    Plus one email a week on building, filming and marketing. Unsubscribe anytime. <a href="/privacy">Privacy</a>
                  </>
                }
              />
              <p className="hero-more">
                <a className="text-link" href="#about">
                  Read how it happened
                </a>
                <a className="text-link" href="#consult">
                  Book a 1:1 call{site.consult.priceLabel && `, ${site.consult.priceLabel}`}
                </a>
              </p>
            </div>

            <HeroMedia />
          </div>
        </div>

        {site.videos.length > 0 && (
          <section id="work" className="gut" aria-labelledby="work-h">
            <div className="wrap">
              <div className="sec-head">
                <h2 id="work-h">Filmed, edited and posted by me</h2>
                <p className="lede">
                  These are real posts from @18kintelligence. The same workflow is what I teach on the calls and in the kit.
                </p>
              </div>
              <Reels videos={site.videos} />
              {site.stats.length > 0 && (
                <>
                  <dl className="stats" style={{ "--cols": site.stats.length } as CSSProperties}>
                    {site.stats.map((s) => (
                      <div key={s.value}>
                        <dt>{s.label}</dt>
                        <dd className="stat-v">{s.value}</dd>
                        <dd className="stat-proof">
                          <a href={s.proof} target="_blank" rel="noopener noreferrer">
                            See screenshot<span className="sr-only">: {s.value} {s.label}</span>
                          </a>
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <p className="stats-note">From Instagram Insights for the first reel above, checked in June and November 2026.</p>
                </>
              )}
              <div className="reels-foot">
                <span>New videos every week.</span>
                <a className="btn" href={site.instagram} target="_blank" rel="noopener noreferrer">
                  Follow @18kintelligence
                </a>
              </div>
            </div>
          </section>
        )}

        <section id="about" className="gut" aria-labelledby="ab-h">
          <div className="wrap">
            <div className="sec-head">
              <h2 id="ab-h">I learned it the expensive way</h2>
              <p className="lede">
                Five years, two versions of the same app and more than £70,000. Here&apos;s how it happened, and what each part became.
              </p>
            </div>
            <Journey steps={journey} />
          </div>
        </section>

        <section id="consult" className="gut" aria-labelledby="con-h">
          <div className="wrap consult">
            <div className="consult-copy">
              <h2 id="con-h">Get my eyes on your business</h2>
              <p className="lede">
                One focused hour on the thing you&apos;re stuck on. Afterwards I send you a summary pack of everything we covered, with an
                action plan for what to do next.
              </p>
              <ol className="consult-steps">
                {site.consult.steps.map((st) => (
                  <li key={st.name}>
                    <b>{st.name}</b>
                    <p>{st.detail}</p>
                  </li>
                ))}
              </ol>
            </div>
            <div className="consult-card">
              <h3>1:1 strategy call</h3>
              <ul className="ticks">
                <li>{site.consult.length} on {site.consult.format}, recorded</li>
                <li>A summary pack of everything we covered</li>
                <li>An action plan with your next steps, in order</li>
              </ul>
              <dl className="consult-meta">
                {site.consult.priceLabel && (
                  <div>
                    <dt>Price</dt>
                    <dd>{site.consult.priceLabel}</dd>
                  </div>
                )}
                <div>
                  <dt>Length</dt>
                  <dd>{site.consult.length}</dd>
                </div>
                <div>
                  <dt>Where</dt>
                  <dd>{site.consult.format}</dd>
                </div>
              </dl>
              <BookCall calUrl={calUrl} focuses={site.consult.focuses} price={site.consult.priceLabel} policy={site.consult.policy} />
            </div>
          </div>
        </section>

        {live.length > 0 && (
          <section id="products" className="gut" aria-labelledby="prod-h" style={{ paddingTop: 0 }}>
            <div className="wrap">
              <div className="sec-head">
                <h2 id="prod-h">Learn the systems I use</h2>
                <p className="lede">Self-paced and practical. Buy once and keep lifetime access, including future updates.</p>
              </div>
              <div className="products">
                {live.map((p) => (
                  <article className="product" id={p.slug} key={p.slug}>
                    <div className="cover">
                      {p.flagship && (
                        <span className="hallmark">
                          <span>750</span>
                          <span>FLAGSHIP</span>
                        </span>
                      )}
                      <b>
                        {p.cover[0]} <em>{p.cover[1]}</em>
                      </b>
                      <span className="kind">{[p.kind, ...p.meta].join(", ")}</span>
                    </div>
                    <div className="product-body">
                      <p>{p.summary}</p>
                      <ul className="ticks">
                        {p.points.map((pt) => (
                          <li key={pt}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="price-row">
                      <span className="price">{formatPrice(p.price)}</span>
                      <BuyButton slug={p.slug} name={p.name} value={p.price / 100} currency={CURRENCY} />
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {site.testimonials.length > 0 && (
          <section className="gut" aria-labelledby="q-h" style={{ paddingTop: 0 }}>
            <div className="wrap">
              <div className="sec-head">
                <h2 id="q-h">What people say</h2>
              </div>
              <div className="quotes">
                {site.testimonials.map((t) => (
                  <figure className="quote" key={t.name}>
                    <blockquote>“{t.quote}”</blockquote>
                    <figcaption className="who">
                      <span className="avatar" aria-hidden="true">
                        {t.name.charAt(0)}
                      </span>
                      <span>
                        <b>{t.name}</b>
                        <small>{t.role}</small>
                      </span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Everything not open yet, with one list to hear first. */}
        <section id="next" className="gut" aria-labelledby="next-h" style={{ paddingTop: 0 }}>
          <div className="wrap upcoming">
            <div className="upcoming-head">
              <h2 id="next-h">On the way</h2>
              <p className="lede">
                {coming.length > 0 ? "Self-paced courses and a members' club. " : "A members' club. "}Join the list to hear first, and
                founding members keep their price for life.
              </p>
              <CaptureForm id="early-email" source="early" label="Get first access" button="Join the list" />
            </div>
            <ul className="upcoming-list">
              {coming.map((p) => (
                <li id={p.slug} key={p.slug}>
                  <div>
                    <b>
                      {p.name}
                      {p.flagship && <span className="flag">Flagship</span>}
                    </b>
                    <span className="kind">{[p.kind, ...p.meta].join(", ")}</span>
                  </div>
                  <p>{p.summary}</p>
                  {p.flagship && (
                    <ul className="ticks">
                      {p.points.map((pt) => (
                        <li key={pt}>{pt}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
              <li id="community">
                <div>
                  <b>The 18K Club</b>
                  <span className="kind">Community</span>
                </div>
                <p>Monthly live build sessions, feedback on your content, sites and apps, and early access to every course.</p>
              </li>
            </ul>
          </div>
        </section>

        <section className="gut" aria-labelledby="faq-h" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="faq-wrap">
            <div className="sec-head">
              <h2 id="faq-h">Good to know</h2>
              <p className="lede">Calls, courses and access, answered.</p>
            </div>
            <div className="faq">
              <details>
                <summary>What&apos;s in the free Starter Kit?</summary>
                <p>{kitList.charAt(0).toUpperCase() + kitList.slice(1)}. It&apos;s one page you can bookmark, and I add to it as I go.</p>
              </details>
              <details>
                <summary>How often will you email me?</summary>
                <p>Once a week, on building, filming and marketing. You can unsubscribe anytime.</p>
              </details>
              <details>
                <summary>What if I need to move or cancel my call?</summary>
                <p>{site.consult.policy} After that there&apos;s no refund, but contact me and I&apos;ll try to help if something urgent came up.</p>
              </details>
              <details>
                <summary>What happens after I book a call?</summary>
                <p>
                  You get a confirmation email, a short questionnaire and the Google Meet link. After the call I send you the recording and
                  your summary pack.
                </p>
              </details>
              <details>
                <summary>What&apos;s in the summary pack?</summary>
                <p>
                  Everything we covered on the call, written up in one place: what we looked at, what I&apos;d change and why, and an
                  action plan with your next steps in order. It&apos;s yours to keep and work through.
                </p>
              </details>
              <details>
                <summary>Do I need experience to take the courses?</summary>
                <p>No. Each course starts from the basics and builds up to the workflows I use on client work.</p>
              </details>
              <details>
                <summary>How long do I have access?</summary>
                <p>For life, including future updates to the course you bought.</p>
              </details>
              <details>
                <summary>How do I get my course after paying?</summary>
                <p>Straight after checkout you get an email with your access link. Keep it: it&apos;s yours for life.</p>
              </details>
            </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="gut">
        <div className="wrap">
          <a className="wordmark foot-mark" href="#top">
            <b>18k</b>intelligence
          </a>
          <div className="foot-top">
            <div style={{ display: "grid", gap: "14px" }}>
              <span className="hallmark" aria-label="Hallmark: 750, 18 karat">
                <span>750</span>
                <span>18K</span>
              </span>
              <p style={{ color: "var(--mute)", maxWidth: "40ch" }}>One email a week on building, filming and marketing.</p>
            </div>
            <CaptureForm id="ft-email" source="kit" label="Get the free Starter Kit and one email a week" button="Send me the kit" />
          </div>
          <div className="foot-bot">
            <div className="socials">
              {site.socials.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer">
                  {s.label}
                </a>
              ))}
              {site.email && <a href={`mailto:${site.email}`}>{site.email}</a>}
            </div>
            <span>
              © {new Date().getFullYear()} 18K Intelligence · <a href="/privacy">Privacy</a>
              <CookieSettingsButton before=" · ">Cookie settings</CookieSettingsButton>
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
