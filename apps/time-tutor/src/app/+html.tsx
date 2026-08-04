import { ScrollViewStyleReset } from 'expo-router/html';
import React, { type PropsWithChildren } from 'react';

// This file is web-only and used to configure the root HTML for every
// web page during static rendering. It only runs in Node.js and has no
// access to the DOM or browser APIs.
//
// Title/description/Open Graph tags are NOT set here: expo-router renders an
// empty react-helmet-managed <title> into <head> ahead of anything static,
// and per the HTML spec the browser uses the *first* <title> in the
// document — so a static one here would be silently shadowed. Those tags
// are set per-route via `expo-router/head` instead (see src/app/_layout.tsx).
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />

        <link rel="icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />

        {/* Disable body scrolling on web so ScrollView fills the viewport with native-like overflow scrolling. */}
        <ScrollViewStyleReset />

        {/* Raw CSS as an escape hatch so the background color never flickers in dark mode. */}
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const responsiveBackground = `
body {
  background-color: #fff;
}
@media (prefers-color-scheme: dark) {
  body {
    background-color: #000;
  }
}`;
