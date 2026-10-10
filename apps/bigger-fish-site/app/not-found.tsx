import type { Metadata } from 'next';
import Link from 'next/link';

import { ProsePage } from '@/components/prose-page';

export const metadata: Metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <ProsePage
      eyebrow="404"
      intro={
        <>
          <p>Whatever was here got eaten by something bigger.</p>
          <Link href="/">Back to the reef</Link>
        </>
      }
      title="This page got away"
    >
      {null}
    </ProsePage>
  );
}
