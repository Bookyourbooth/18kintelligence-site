import type { CSSProperties } from "react";
import { BookCall } from "@/components/book-call";
import { BuyButton } from "@/components/buy-button";
import { CaptureForm } from "@/components/capture-form";
import { CookieSettingsButton } from "@/components/cookie-consent";
import { Reels } from "@/components/reels";
import { formatPrice, kitItems, site } from "@/content";

export default function Home() {
  const calUrl = process.env.CAL_CONSULT_URL ?? "";
  const kitReady = Boolean(process.env.KIT_URL);
  const live = site.products.filter((p) => p.live);
  const coming = site.products.filter((p) => !p.live);

  return (
    <>
      <header className="nav gut">
        <div className="wrap nav-in">
          <a className="wordmark" href="#top">
            <b>18k</b>intelligence
          </a>
          <nav className="nav-links" aria-label="Main">
            {site.videos.length > 0 && <a href="#work">Work</a>}
            <a href="#consult">1:1 calls</a>
            <a href={live.length > 0 ? "#products" : "#next"}>Courses</a>
            <a href="#about">About</a>
            <a className="btn au" href="#join">
              Get the free kit
            </a>
          </nav>
        </div>
      </header>

      <main id="top">
        <div className="gut">
          <div className="wrap hero">
            <div className="hero-copy">
              <h1>Build it and film it yourself</h1>
              <p className="lede">
                I&apos;m Kwame, a filmmaker and the founder of 4angles. Each week I show you how I build websites and apps,
                make films and market brands.
              </p>
              <CaptureForm
                formId="join"
                id="hero-email"
                source="kit"
                label="Start with the free Creator-Builder Starter Kit"
                button="Send me the kit"
                note={
                  <>
                    Plus one email a week on building, filming and marketing. Unsubscribe anytime. <a href="/privacy">Privacy</a>
                  </>
                }
              />
              <a className="text-link" href="#consult">
                Want help on your own project? Book a 1:1 call{site.consult.priceLabel && `, ${site.consult.priceLabel}`}
              </a>
            </div>

            <div className="kit" aria-label="Preview of the free Creator-Builder Starter Kit">
              <div className="sheet s3" aria-hidden="true"></div>
              <div className="sheet s2" aria-hidden="true"></div>
              <div className="sheet s1">
                <div className="kit-top">
                  <span className="hallmark">
                    <span>FREE</span>
                  </span>
                  <span className="label">18kintelligence</span>
                </div>
                <div className="kit-title">
                  Creator-Builder
                  <br />
                  <span className="gold">Starter Kit</span>
                </div>
                <div>
                  <p className="kit-in">Inside</p>
                  <ul className="kit-list">
                    {kitItems().map((k) => (
                      <li key={k.item}>
                        <span>{k.item}</span>
                        <span>{k.format}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="kit-foot">
                  <span className="label">{kitReady ? "Instant access" : "Sent by email"}</span>
                </div>
              </div>
            </div>
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

        <section id="consult" className="gut" aria-labelledby="con-h" style={site.videos.length > 0 ? { paddingTop: 0 } : undefined}>
          <div className="wrap consult">
            <div className="consult-copy">
              <h2 id="con-h">Get my eyes on your business</h2>
              <p className="lede">
                One focused hour on the thing you&apos;re stuck on. You leave with a clear plan and a recording to come back to.
              </p>
              <p className="lede">Pay when you book. A short questionnaire beforehand means we get straight to your plan.</p>
            </div>
            <div className="consult-card">
              <h3>1:1 strategy call</h3>
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
                  <article className="product" key={p.slug}>
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
                      <BuyButton slug={p.slug} />
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
                <li key={p.slug}>
                  <div>
                    <b>
                      {p.name}
                      {p.flagship && <span className="flag">Flagship</span>}
                    </b>
                    <span className="kind">{[p.kind, ...p.meta].join(", ")}</span>
                  </div>
                  <p>{p.summary}</p>
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

        <section id="about" className="gut" aria-labelledby="ab-h" style={{ paddingTop: 0 }}>
          <div className={`wrap about${site.portrait ? " has-photo" : ""}`}>
            {site.portrait && (
              <div className="about-photo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={site.portrait} alt="Kwame, 18K Intelligence" />
              </div>
            )}
            <div className="about-copy">
              <h2 id="ab-h">Hey, I&apos;m Kwame</h2>
              <p>
                I&apos;m a <strong>creative tech entrepreneur</strong>. I build businesses, websites and apps, and I&apos;m a{" "}
                <strong>filmmaker</strong> who makes marketing for brands.
              </p>
              <p>
                I founded{" "}
                <a href="https://4anglesagency.com" target="_blank" rel="noopener noreferrer">
                  4angles
                </a>
                , a marketing and AI studio, and I share what I learn along the way with you.
              </p>
              <a className="text-link" href={site.instagram} target="_blank" rel="noopener noreferrer">
                Follow @18kintelligence
              </a>
            </div>
          </div>
        </section>

        <section className="gut" aria-labelledby="faq-h" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="sec-head">
              <h2 id="faq-h">Good to know</h2>
            </div>
            <div className="faq">
              <details>
                <summary>What if I need to move or cancel my call?</summary>
                <p>{site.consult.policy} After that there&apos;s no refund, but contact me and I&apos;ll try to help if something urgent came up.</p>
              </details>
              <details>
                <summary>What happens after I book a call?</summary>
                <p>You get a confirmation email, a short questionnaire and the Google Meet link. The recording is sent after the call.</p>
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
        </section>
      </main>

      <footer className="gut">
        <div className="wrap">
          <div className="foot-top">
            <div style={{ display: "grid", gap: "14px" }}>
              <a className="wordmark" href="#top" style={{ fontSize: "clamp(2.6rem,7vw,4rem)" }}>
                <b>18k</b>intelligence
              </a>
              <span className="hallmark" aria-label="Hallmark: 750, 18 karat">
                <span>750</span>
                <span>18K</span>
              </span>
              <p style={{ color: "var(--mute)", maxWidth: "40ch" }}>One email a week on building, filming and marketing.</p>
            </div>
            <CaptureForm id="ft-email" source="newsletter" label="Get the weekly email" button="Subscribe" />
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
