import type { Viewport } from 'next';

import { StudioFooter, StudioHeader } from '@/components/studio-chrome';

import styles from './studio.module.css';

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0b1d33',
};

// The studio's dark pages: the home page and Play, in the spirit of the game sites. `data-studio` tells globals.css
// to paint the page's surroundings dark as well. The learning side keeps its warm paper look, in app/(paper).
export default function StudioLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={styles.shell} data-studio="">
      <StudioHeader />
      <main>{children}</main>
      <StudioFooter />
    </div>
  );
}
