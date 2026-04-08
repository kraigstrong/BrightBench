import Link from 'next/link';
import { palette, radii, spacing } from '@education/design';

import { productCards, siteMeta } from '@/lib/site';

export default function HomePage() {
  return (
    <main
      style={{
        display: 'grid',
        gap: spacing.xxl,
      }}>
      <section
        style={{
          display: 'grid',
          gap: spacing.lg,
          paddingTop: spacing.md,
        }}>
        <nav
          style={{
            alignItems: 'center',
            display: 'flex',
            justifyContent: 'space-between',
          }}>
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: 0.2,
            }}>
            {siteMeta.title}
          </div>
          <div
            style={{
              display: 'flex',
              gap: spacing.md,
            }}>
            <Link href="/support">Support</Link>
            <Link href="/privacy">Privacy</Link>
          </div>
        </nav>

        <div
          style={{
            background: 'rgba(255, 249, 242, 0.88)',
            border: `1px solid ${palette.ring}`,
            borderRadius: radii.xl,
            boxShadow: '0 18px 40px rgba(18, 53, 91, 0.08)',
            display: 'grid',
            gap: spacing.lg,
            padding: spacing.xxl,
          }}>
          <div
            style={{
              color: palette.coral,
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: 1.2,
              textTransform: 'uppercase',
            }}>
            Calm learning tools
          </div>
          <h1
            style={{
              fontSize: 'clamp(42px, 7vw, 76px)',
              lineHeight: 0.94,
              margin: 0,
            }}>
            BrightBench apps
            <br />
            that teach by feel.
          </h1>
          <p
            style={{
              color: palette.inkMuted,
              fontSize: 20,
              lineHeight: 1.5,
              margin: 0,
              maxWidth: 760,
            }}>
            BrightBench is a suite of focused learning tools for kids that feel
            warm, polished, and easy to understand without turning into noisy
            curriculum dashboards.
          </p>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: spacing.md,
            }}>
            <Link
              href="#products"
              style={{
                background: palette.coral,
                borderRadius: radii.pill,
                color: palette.white,
                fontWeight: 700,
                padding: '14px 22px',
              }}>
              See the apps
            </Link>
            <Link
              href="/support"
              style={{
                background: palette.surfaceMuted,
                borderRadius: radii.pill,
                color: palette.ink,
                fontWeight: 700,
                padding: '14px 22px',
              }}>
              Contact support
            </Link>
          </div>
        </div>
      </section>

      <section
        id="products"
        style={{
          display: 'grid',
          gap: spacing.lg,
        }}>
        <div
          style={{
            display: 'grid',
            gap: spacing.sm,
          }}>
          <div
            style={{
              color: palette.inkMuted,
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: 1.1,
              textTransform: 'uppercase',
            }}>
            Product suite
          </div>
          <h2
            style={{
              fontSize: 40,
              margin: 0,
            }}>
            Focused apps for specific skills
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gap: spacing.md,
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          }}>
          {productCards.map((product, index) => {
            const accent = [
              '#D95D67',
              '#E49A33',
              '#2D8F87',
              '#556CD6',
              '#8A5BD1',
            ][index % 5];

            return (
              <Link
                href={product.href}
                key={product.href}
                style={{
                  background: palette.surface,
                  border: `2px solid ${accent}`,
                  borderRadius: radii.xl,
                  boxShadow: '0 18px 40px rgba(18, 53, 91, 0.08)',
                  color: palette.ink,
                  display: 'grid',
                  gap: spacing.sm,
                  padding: spacing.lg,
                }}>
                <div
                  style={{
                    background: accent,
                    borderRadius: radii.pill,
                    height: 12,
                    width: 64,
                  }}
                />
                <div style={{ fontSize: 28, fontWeight: 700 }}>{product.name}</div>
                <div
                  style={{
                    color: palette.inkMuted,
                    lineHeight: 1.5,
                  }}>
                  {product.blurb}
                </div>
                <div
                  style={{
                    color: accent,
                    fontSize: 14,
                    fontWeight: 700,
                    letterSpacing: 0.4,
                    marginTop: spacing.xs,
                  }}>
                  {product.status}
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
