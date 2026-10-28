import { ImageResponse } from 'next/og';

import { getLearnPageBySlug } from '@/lib/site';

export const alt = 'BrightBench learn';
export const contentType = 'image/png';
export const size = { height: 630, width: 1200 };

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getLearnPageBySlug(slug);
  const headline = page?.h1 ?? 'BrightBench';
  const kicker =
    slug === 'time-telling-games'
      ? 'Time telling games for kids'
      : 'Learn · Time Tutor';

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: 'flex-start',
          background:
            'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0c4a6e 100%)',
          color: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          height: '100%',
          justifyContent: 'center',
          padding: 56,
          width: '100%',
        }}>
        <div style={{ color: '#93c5fd', fontSize: 26, fontWeight: 600 }}>
          {kicker}
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 50,
            fontWeight: 750,
            letterSpacing: -0.02,
            lineHeight: 1.08,
            marginTop: 18,
            maxWidth: 980,
          }}>
          {headline}
        </div>
        <div style={{ color: '#cbd5e1', fontSize: 26, marginTop: 28 }}>
          BrightBench · Time Tutor
        </div>
      </div>
    ),
    { ...size },
  );
}
