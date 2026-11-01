import type { CSSProperties } from "react";
import { BookCall } from "@/components/book-call";
import { BuyButton } from "@/components/buy-button";
import { CaptureForm } from "@/components/capture-form";
import { formatPrice, site } from "@/content";

const Arrow = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M3 8h10M9 4l4 4-4 4"></path>
  </svg>
);

export default function Home() {
  const calUrl = process.env.CAL_CONSULT_URL ?? "";

  return (
    <>
      <header className="nav gut">
        <div className="wrap nav-in">
          <a className="wordmark" href="#top">
            <b>18k</b>intelligence
          </a>
          <nav className="nav-links" aria-label="Main">
            <a href="#start">Start here</a>
            <a href="#products">Products</a>
            <a href="#consult">1:1 calls</a>
            <a href="#community">Community</a>
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
              <span className="hallmark" aria-label="Hallmark: 750, 18 karat">
                <span>750</span>
                <span>18K</span>
                <span>CREATIVE · TECH · FILM</span>
              </span>
              <h1>
                I build businesses, apps and films. <span className="dim">Then I show you how.</span>
              </h1>
              <p className="lede">
                I&apos;m a creative tech entrepreneur and filmmaker. Every week I share how I build websites and apps,
                market brands and make films, so you can do the same for your own business.
              </p>
              <CaptureForm
                formId="join"
                id="hero-email"
                source="kit"
                label="Free · The Creator-Builder Starter Kit"
                button="Send me the kit"
                note={
                  <>
                    Plus one email a week on building, filming and marketing. Unsubscribe anytime. <a href="/privacy">Privacy</a>
                  </>
                }
              />
            </div>

            <div className="kit" aria-label="Preview of the free Creator-Builder Starter Kit">
              <div className="sheet s3" aria-hidden="true"></div>
              <div className="sheet s2" aria-hidden="true"></div>
              <div className="sheet s1">
                <div className="kit-top">
                  <span className="hallmark">
                    <span>750</span>
                    <span>FREE KIT</span>
                  </span>
                  <span className="label">18kintelligence</span>
                </div>
                <div className="kit-title">
                  Creator-Builder
                  <br />
                  <span className="gold">Starter Kit</span>
                </div>
                <ul className="kit-list">
                  {site.kit.map((k) => (
                    <li key={k.item}>
                      <span>{k.item}</span>
                      <span>{k.format}</span>
                    </li>
                  ))}
                </ul>
                <div className="kit-foot">
                  <span className="label">Instant access</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {site.stats.length > 0 && (
          <div className="proof gut">
            <div className="wrap proof-in" style={{ "--cols": site.stats.length + 1 } as CSSProperties}>
              <div>
                <b>@18kintelligence</b>
                <span>on Instagram</span>
              </div>
              {site.stats.map((s) => (
                <div key={s.label}>
                  <b>{s.value}</b>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <section id="start" className="gut" aria-labelledby="start-h">
          <div className="wrap">
            <div className="sec-head">
              <span className="label g">Start here</span>
              <h2 id="start-h">Three ways to work with me.</h2>
              <p className="lede">Start free, go deeper with a course, or get my eyes on your business directly.</p>
            </div>
            <div className="doors">
              <a className="door" href="#join">
                <span className="door-n">01 · FREE</span>
                <h3>Learn free</h3>
                <p>Get the Starter Kit and my weekly email. The tools, workflows and lessons from what I&apos;m building right now.</p>
                <span className="go">
                  Get the free kit <Arrow />
                </span>
              </a>
              <a className="door" href="#products">
                <span className="door-n">02 · COURSES</span>
                <h3>Go deeper</h3>
                <p>Self-paced courses and templates built from real projects: filming, building with AI and running your content.</p>
                <span className="go">
                  See the products <Arrow />
                </span>
              </a>
              <a className="door" href="#consult">
                <span className="door-n">03 · 1:1</span>
                <h3>Work with me</h3>
                <p>A focused 60-minute call on your brand, content, website or next shoot. You leave with a plan.</p>
                <span className="go">
                  Book a call <Arrow />
                </span>
              </a>
            </div>
          </div>
        </section>

        {site.videos.length > 0 && (
          <section className="gut" aria-labelledby="ch-h" style={{ paddingTop: 0 }}>
            <div className="wrap">
              <div className="sec-head">
                <span className="label g">Latest from the channel</span>
                <h2 id="ch-h">What I&apos;m sharing this week.</h2>
              </div>
              <div className="reels">
                {site.videos.slice(0, 4).map((v) => (
                  <a className="reel" key={v.href} href={v.href} target="_blank" rel="noopener noreferrer">
                    <div className="reel-meta">
                      <span>REEL</span>
                    </div>
                    <span className="play" aria-hidden="true">
                      <svg viewBox="0 0 10 12">
                        <path d="M0 0l10 6-10 6z"></path>
                      </svg>
                    </span>
                    <h3>{v.title}</h3>
                  </a>
                ))}
              </div>
              <div className="reels-foot">
                <span>New videos every week.</span>
                <a className="btn" href={site.instagram} target="_blank" rel="noopener noreferrer">
                  Follow @18kintelligence
                </a>
              </div>
            </div>
          </section>
        )}

        <section id="products" className="gut" aria-labelledby="prod-h" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="sec-head">
              <span className="label g">Digital products</span>
              <h2 id="prod-h">Learn the systems I use every day.</h2>
              <p className="lede">Self-paced and practical. Buy once and keep lifetime access, including future updates.</p>
            </div>
            <div className="products">
              {site.products.map((p) => (
                <article className={`product${p.flagship ? " feat" : ""}`} key={p.slug}>
                  <div className="cover">
                    <div className="cover-top">
                      {p.flagship ? (
                        <span className="hallmark">
                          <span>750</span>
                          <span>FLAGSHIP</span>
                        </span>
                      ) : (
                        <span className="label">{p.kind}</span>
                      )}
                    </div>
                    <b>
                      {p.cover[0]}
                      <br />
                      <em>{p.cover[1]}</em>
                    </b>
                  </div>
                  <div className="product-body">
                    <div className="meta">
                      {p.meta.map((m) => (
                        <span key={m}>{m.toUpperCase()}</span>
                      ))}
                    </div>
                    <p>{p.summary}</p>
                    <ul className="ticks">
                      {p.points.map((pt) => (
                        <li key={pt}>{pt}</li>
                      ))}
                    </ul>
                    <div className="price-row">
                      {p.live ? (
                        <>
                          <span className="price">{formatPrice(p.price)}</span>
                          <BuyButton slug={p.slug} />
                        </>
                      ) : (
                        <>
                          <span className="price">
                            Coming soon<small>JOIN THE LIST TO HEAR FIRST</small>
                          </span>
                          <a className="btn" href="#join">
                            Notify me
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="consult" className="gut" aria-labelledby="con-h" style={{ paddingTop: 0 }}>
          <div className="wrap consult">
            <div style={{ display: "grid", gap: "18px" }}>
              <span className="label g">1:1 consultation</span>
              <h2 id="con-h">Get my eyes on your business.</h2>
              <p className="lede">One focused call. You leave with a clear plan and a recording to come back to.</p>
              <div className="topics">
                <div className="topic">
                  <span>A</span>
                  <p>
                    <b>Brand &amp; content strategy</b>What to post, where, and how to turn views into customers.
                  </p>
                </div>
                <div className="topic">
                  <span>B</span>
                  <p>
                    <b>Website or app review</b>A live teardown of your site or product idea, with fixes ranked by impact.
                  </p>
                </div>
                <div className="topic">
                  <span>C</span>
                  <p>
                    <b>Film &amp; production</b>Gear, workflow and storytelling for your next shoot or campaign.
                  </p>
                </div>
              </div>
            </div>
            <div className="consult-card">
              <h3>Strategy call</h3>
              <div className="consult-meta" style={site.consult.priceLabel ? undefined : { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
                <div>
                  <span className="label">Length</span>
                  <b>{site.consult.length}</b>
                </div>
                <div>
                  <span className="label">Format</span>
                  <b>{site.consult.format}</b>
                </div>
                {site.consult.priceLabel && (
                  <div>
                    <span className="label">Price</span>
                    <b>{site.consult.priceLabel}</b>
                  </div>
                )}
              </div>
              <BookCall calUrl={calUrl} focuses={site.consult.focuses} />
            </div>
          </div>
        </section>

        {site.testimonials.length > 0 && (
          <section className="gut" aria-labelledby="q-h" style={{ paddingTop: 0 }}>
            <div className="wrap">
              <div className="sec-head">
                <span className="label g">Students &amp; clients</span>
                <h2 id="q-h">What people say.</h2>
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

        <section id="community" className="gut" aria-labelledby="com-h" style={{ paddingTop: 0 }}>
          <div className="wrap community">
            <div style={{ display: "grid", gap: "18px" }}>
              <span className="label g">Community</span>
              <h2 id="com-h">
                The <span className="gold">18K</span> Club.
              </h2>
              <p className="lede">
                A private space for creators and founders who build. Doors open soon. Join the waitlist for founding-member
                pricing.
              </p>
              <ul className="perks">
                <li>Monthly live build sessions and Q&amp;As</li>
                <li>Feedback on your content, sites and apps</li>
                <li>Early access to every new course</li>
                <li>A network of people shipping real work</li>
              </ul>
            </div>
            <CaptureForm id="wl-email" source="waitlist" label="Join the waitlist" button="Join" note="Founding members keep their price for life." />
          </div>
        </section>

        <section id="about" className="gut" aria-labelledby="ab-h" style={{ paddingTop: 0 }}>
          <div className="wrap about">
            <div className="about-photo">
              {/* Swap for <img src="/portrait.jpg" alt="Kwame, 18K Intelligence" /> once the photo is in /public. */}
              <span className="monogram" aria-hidden="true">
                18k
              </span>
            </div>
            <div style={{ display: "grid", gap: "20px" }}>
              <span className="label g">About</span>
              <h2 id="ab-h">Hey, I&apos;m Kwame.</h2>
              <div className="about-copy">
                <p>
                  I&apos;m a <strong>creative tech entrepreneur</strong>. I build businesses, websites and apps, and I&apos;m a{" "}
                  <strong>filmmaker</strong> who makes marketing for brands.
                </p>
                <p>
                  I founded <strong>4angles</strong>, a marketing and AI studio, and I share what I learn along the way with my
                  audience.
                </p>
              </div>
              <div className="skills">
                <div>
                  <b>Build</b>
                  <span>Businesses, websites and apps</span>
                </div>
                <div>
                  <b>Film</b>
                  <span>Brand films and short-form content</span>
                </div>
                <div>
                  <b>Teach</b>
                  <span>Courses, community and 1:1 calls</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="gut" aria-labelledby="faq-h" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="sec-head">
              <span className="label g">FAQ</span>
              <h2 id="faq-h">Good to know.</h2>
            </div>
            <div className="faq">
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
              <details>
                <summary>What happens after I book a call?</summary>
                <p>You get a confirmation email, a short questionnaire and the video link. The recording is sent after the call.</p>
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
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
