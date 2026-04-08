import Link from 'next/link';
import { notFound } from 'next/navigation';
import { palette, radii, spacing } from '@education/design';

import { getProductBySlug, productCards, slugify } from '@/lib/site';

export function generateStaticParams() {
  return productCards.map((product) => ({
    slug: slugify(product.name),
  }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <main
      style={{
        display: 'grid',
        gap: spacing.lg,
        margin: '0 auto',
        maxWidth: 760,
        paddingTop: spacing.xl,
      }}>
      <Link href="/" style={{ color: palette.inkMuted, fontWeight: 700 }}>
        Back to home
      </Link>

      <section
        style={{
          background: palette.surface,
          border: `1px solid ${palette.ring}`,
          borderRadius: radii.xl,
          display: 'grid',
          gap: spacing.md,
          padding: spacing.xxl,
        }}>
        <div
          style={{
            color: palette.inkMuted,
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: 1.1,
            textTransform: 'uppercase',
          }}>
          Product
        </div>
        <h1 style={{ fontSize: 44, margin: 0 }}>{product.name}</h1>
        <p
          style={{
            color: palette.inkMuted,
            fontSize: 18,
            lineHeight: 1.6,
            margin: 0,
          }}>
          {product.blurb}
        </p>
        <div
          style={{
            color: palette.coral,
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: 0.4,
          }}>
          {product.status}
        </div>
      </section>
    </main>
  );
}
