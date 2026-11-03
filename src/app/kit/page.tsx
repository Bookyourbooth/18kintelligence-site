import type { Metadata } from "next";
import { kitItems, site } from "@/content";

export const metadata: Metadata = { title: "Creator-Builder Starter Kit", robots: { index: false, follow: false } };

/**
 * The free Starter Kit. The welcome email links here through KIT_URL; it's
 * unlisted rather than secret. Each part renders only once it has content.
 */
export default function Kit() {
  const k = site.kitParts;
  const ready = new Set(kitItems().map((i) => i.id));

  return (
    <main className="gut">
      <div className="wrap page kit-page">
        <a className="label g" href="/" style={{ textDecoration: "none" }}>
          ← 18K Intelligence
        </a>
        <span className="hallmark" aria-label="Hallmark: 750, free kit">
          <span>750</span>
          <span>FREE KIT</span>
        </span>
        <h1>Creator-Builder Starter Kit</h1>
        <p className="lede">The tools and checklists I use to build sites and make content. Bookmark this page: I add to it as I go.</p>
        <nav className="kit-toc" aria-label="In this kit">
          {kitItems().map((i) => (
            <a key={i.id} href={`#${i.id}`}>
              {i.item}
            </a>
          ))}
        </nav>

        {ready.has("gear") && (
          <section id="gear" aria-labelledby="gear-h">
            <h2 id="gear-h">My filmmaking gear list</h2>
            <dl className="kit-defs">
              {k.gear.map((g) => (
                <div key={g.name}>
                  <dt>{g.name}</dt>
                  <dd>{g.use}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {ready.has("presets") && (
          <section id="presets" aria-labelledby="presets-h">
            <h2 id="presets-h">Editing presets &amp; LUTs</h2>
            <p>
              <a className="btn au" href={k.presetsFile} download>
                Download the presets
              </a>
            </p>
          </section>
        )}

        {ready.has("ai-tools") && (
          <section id="ai-tools" aria-labelledby="ai-h">
            <h2 id="ai-h">The AI tools I build with</h2>
            <dl className="kit-defs">
              {k.aiTools.map((t) => (
                <div key={t.name}>
                  <dt>{t.name}</dt>
                  <dd>{t.use}</dd>
                </div>
              ))}
            </dl>
            <h3>What this site runs on</h3>
            <dl className="kit-defs">
              {k.stack.map((t) => (
                <div key={t.name}>
                  <dt>{t.name}</dt>
                  <dd>{t.use}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {ready.has("checklist") && (
          <section id="checklist" aria-labelledby="check-h">
            <h2 id="check-h">First-website checklist</h2>
            {k.checklist.map((group) => (
              <fieldset className="checks" key={group.stage}>
                <legend>{group.stage}</legend>
                {group.items.map((item, i) => (
                  <label key={item}>
                    <input type="checkbox" name={`${group.stage}-${i}`} />
                    <span>{item}</span>
                  </label>
                ))}
              </fieldset>
            ))}
          </section>
        )}

        <section aria-labelledby="next-h" className="kit-next">
          <h2 id="next-h">Want help with your own project?</h2>
          <p>Book a 1:1 call and we&apos;ll work through your site, content or next shoot together.</p>
          <p>
            <a className="btn au" href="/#consult">
              See the 1:1 call{site.consult.priceLabel && `, ${site.consult.priceLabel}`}
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
