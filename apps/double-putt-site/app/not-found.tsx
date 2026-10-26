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
          <p>This page rolled right past the cup.</p>
          <Link href="/">Back to the first tee</Link>
        </>
      }
      title="Lipped out">
      {null}
    </ProsePage>
  );
}
