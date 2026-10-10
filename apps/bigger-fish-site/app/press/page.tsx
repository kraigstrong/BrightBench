import { statSync } from 'node:fs';
import { join } from 'node:path';

import type { Metadata } from 'next';
import Image from 'next/image';

import { SiteFooter, SiteHeader } from '@/components/site-chrome';
import { TrailerPlayer } from '@/components/trailer-player';
import { descriptions, facts, features, game } from '@/lib/game';
import { type PressAsset, brand, loops, pressKitZip, screenshots, trailer } from '@/lib/press-assets';
import { contactEmail, productionOrigin } from '@/lib/site';

import styles from './press.module.css';

export const metadata: Metadata = {
  alternates: { canonical: '/press' },
  description: `Press kit for ${game.name}: fact sheet, descriptions, trailer, screenshots, logos, and key art.`,
  title: 'Press kit',
};

/** A file's size, read when the page is built, so the labels never go stale. */
function size(file: string): string {
  try {
    const bytes = statSync(join(process.cwd(), 'public', file)).size;
    return bytes >= 1e6 ? `${(bytes / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1e3))} KB`;
  } catch {
    return '';
  }
}

function Download({ asset }: { asset: PressAsset }) {
  const fileSize = size(asset.file);
  return (
    <a className={styles.download} download href={`/${asset.file}`}>
      Download
      {fileSize ? <span>{fileSize}</span> : null}
    </a>
  );
}

function AssetCaption({ asset }: { asset: PressAsset }) {
  return (
    <figcaption className={styles.caption}>
      <div>
        <strong>{asset.title}</strong>
        <span>{asset.detail}</span>
      </div>
      <Download asset={asset} />
    </figcaption>
  );
}

export default function PressPage() {
  const email = contactEmail();
  const zipSize = size(pressKitZip);

  return (
    <>
      <SiteHeader />
      <main className={styles.page}>
        <header className={styles.intro}>
          <p className={styles.eyebrow}>Press kit</p>
          <h1 className={styles.title}>{game.name}</h1>
          <p className={styles.lede}>{game.oneLiner}</p>
          <div className={styles.actions}>
            <a className={styles.primary} download href={`/${pressKitZip}`}>
              Download everything
              {zipSize ? <span>.zip, {zipSize}</span> : null}
            </a>
            <a className={styles.secondary} href={`mailto:${email}?subject=${encodeURIComponent(`${game.name} press`)}`}>
              Email for review access
            </a>
          </div>
        </header>

        <div className={styles.layout}>
          <aside aria-labelledby="fact-sheet" className={styles.facts}>
            <h2 className={styles.factsTitle} id="fact-sheet">
              Fact sheet
            </h2>
            <dl>
              {facts.map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
              <div>
                <dt>Website</dt>
                <dd>
                  <a href={productionOrigin}>{productionOrigin.replace('https://', '')}</a>
                </dd>
              </div>
              <div>
                <dt>Press contact</dt>
                <dd>
                  <a href={`mailto:${email}`}>{email}</a>
                </dd>
              </div>
            </dl>
          </aside>

          <div className={styles.content}>
            <section aria-labelledby="description" className={styles.block}>
              <h2 id="description">Description</h2>
              <h3>One line</h3>
              <p>{game.oneLiner}</p>
              <h3>Short</h3>
              <p>{descriptions.short}</p>
              <h3>Long</h3>
              {descriptions.long.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>

            <section aria-labelledby="features" className={styles.block}>
              <h2 id="features">Features</h2>
              <ul className={styles.features}>
                {features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="videos" className={styles.block}>
              <h2 id="videos">Trailer and gameplay</h2>
              <figure className={styles.figure}>
                <TrailerPlayer poster={trailer.poster ?? ''} src={`/${trailer.file}`} title={`${game.name} trailer`} />
                <AssetCaption asset={trailer} />
              </figure>
              <p className={styles.note}>
                Clean gameplay loops from each world, with no interface or text, for your own edits:
              </p>
              <div className={styles.grid}>
                {loops.map((asset) => (
                  <figure className={styles.figure} key={asset.file}>
                    <div className={styles.thumb}>
                      <Image alt={`${asset.title} gameplay`} fill sizes="(max-width: 700px) 92vw, 380px" src={asset.poster ?? ''} />
                    </div>
                    <AssetCaption asset={asset} />
                  </figure>
                ))}
              </div>
            </section>

            <section aria-labelledby="screenshots" className={styles.block}>
              <h2 id="screenshots">Screenshots</h2>
              <div className={styles.grid}>
                {screenshots.map((asset) => (
                  <figure className={styles.figure} key={asset.file}>
                    <div className={styles.thumb}>
                      <Image
                        alt={`${game.name}: ${asset.title}`}
                        fill
                        sizes="(max-width: 700px) 92vw, 380px"
                        src={`/${asset.file}`}
                      />
                    </div>
                    <AssetCaption asset={asset} />
                  </figure>
                ))}
              </div>
            </section>

            <section aria-labelledby="logos" className={styles.block}>
              <h2 id="logos">Logo, icon, and key art</h2>
              <div className={styles.grid}>
                {brand.map((asset) => (
                  <figure className={styles.figure} key={asset.file}>
                    <div className={`${styles.thumb} ${styles.brandThumb} ${asset.light ? styles.lightThumb : ''}`}>
                      <Image
                        alt={`${game.name} ${asset.title.toLowerCase()}`}
                        className={styles.contain}
                        fill
                        sizes="(max-width: 700px) 92vw, 380px"
                        src={`/${asset.file}`}
                      />
                    </div>
                    <AssetCaption asset={asset} />
                  </figure>
                ))}
              </div>
            </section>

            <section aria-labelledby="about" className={styles.block}>
              <h2 id="about">About the developer</h2>
              <p>
                {game.name} is designed, built, and playtested by {game.developer}, an independent developer. Every level
                is played and tuned by hand before it ships.
              </p>
            </section>

            <section aria-labelledby="credits" className={styles.block}>
              <h2 id="credits">Credits</h2>
              <dl className={styles.credits}>
                <div>
                  <dt>Design and development</dt>
                  <dd>{game.developer}</dd>
                </div>
                <div>
                  <dt>Sound effects</dt>
                  <dd>Mixkit</dd>
                </div>
                <div>
                  <dt>Music</dt>
                  <dd>“Aquarium Fish” by Magiksolo and “Tidal Groove” by tideblue, via Pixabay</dd>
                </div>
              </dl>
            </section>

            <section aria-labelledby="contact" className={styles.block}>
              <h2 id="contact">Contact</h2>
              <p>
                For review access, interviews, or anything else, email <a href={`mailto:${email}`}>{email}</a>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
