import { useEffect } from 'react';

/**
 * Lightweight SEO hook — updates document.title, meta description,
 * canonical URL, and OpenGraph / Twitter tags on route change.
 *
 * Note on social share previews:
 * Twitter/FB/WhatsApp scrapers do NOT execute JS, so they only see the
 * base OG tags in /public/index.html (which cover the landing page).
 * For per-page share previews across all routes, we'd need Vercel
 * prerendering (paid) or a small Vercel edge function. That's a
 * future upgrade — this hook still improves Google indexing and
 * browser-tab UX today.
 */

const SITE_NAME = 'Building My Awesome Life Daily';
const SITE_URL = 'https://buildingmyawesomelifedaily.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-cover.png`;

function upsertMeta(attr, key, value) {
  if (!value) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

function upsertLink(rel, href) {
  if (!href) return;
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export function useSEO({
  title,
  description,
  path = '/',
  ogImage,
  ogType = 'website',
  noindex = false,
} = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} · ${SITE_NAME}` : SITE_NAME;
    const url = `${SITE_URL}${path}`;
    const image = ogImage || DEFAULT_OG_IMAGE;

    document.title = fullTitle;
    upsertMeta('name', 'description', description);
    upsertMeta('name', 'robots', noindex ? 'noindex,nofollow' : 'index,follow');
    upsertLink('canonical', url);

    // OpenGraph
    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('property', 'og:type', ogType);
    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:image', image);
    upsertMeta('property', 'og:image:width', '1200');
    upsertMeta('property', 'og:image:height', '630');

    // Twitter
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', image);
  }, [title, description, path, ogImage, ogType, noindex]);
}
