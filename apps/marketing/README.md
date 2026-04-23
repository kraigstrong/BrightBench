# Marketing

Next.js App Router marketing site for the BrightBench app suite.

## SEO / indexing checklist

After deploy:

1. Set **`NEXT_PUBLIC_SITE_ORIGIN`** on Vercel to the canonical marketing URL (no trailing slash). This drives `metadataBase`, `sitemap.xml`, and `robots.txt` sitemap hints.
2. Open **`/robots.txt`** and **`/sitemap.xml`** on the live domain and confirm URLs are absolute and correct.
3. In Google Search Console: add the property, submit the sitemap URL (`https://<your-domain>/sitemap.xml`), and use URL Inspection on `/products/time-tutor` and `/learn/time-telling-games`.
4. Optional: validate a few pages with [Rich Results Test](https://search.google.com/test/rich-results) (FAQ + product JSON-LD where present).

Local quick check:

```bash
npm run dev -w marketing
# Visit http://localhost:3000/robots.txt and http://localhost:3000/sitemap.xml
```

## Time Tutor links

- **App Store:** `NEXT_PUBLIC_TIME_TUTOR_APP_STORE_URL` (falls back to the default listing in `src/lib/site.ts`).
