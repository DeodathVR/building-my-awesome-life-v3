/**
 * Text sanitisation for user-generated content (community posts, journal entries).
 * React already escapes JSX text so raw XSS is prevented, but this layer:
 *  1. Strips HTML tags entirely
 *  2. Blocks javascript: / data: URL schemes in text
 *  3. Truncates at a hard max to prevent abuse
 *  4. Removes control characters
 */

const MAX_LEN = 2000;
const DANGEROUS_SCHEMES = /(javascript|data|vbscript|file):/gi;
const HTML_TAG = /<\/?[^>]+(>|$)/g;
const SCRIPT_STYLE_BLOCK = /<(script|style)[^>]*>[\s\S]*?<\/\1>/gi;
const CTRL_CHARS = /[\u0000-\u001F\u007F]/g;

export function sanitiseUserText(input, opts = {}) {
  const maxLen = opts.maxLen || MAX_LEN;
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(SCRIPT_STYLE_BLOCK, '')
    .replace(HTML_TAG, '')
    .replace(DANGEROUS_SCHEMES, 'blocked:')
    .replace(CTRL_CHARS, '')
    .trim()
    .slice(0, maxLen);
}

/**
 * Safe rel attributes for any user-supplied external links.
 * Prevents window.opener redirects + refers.
 */
export const SAFE_LINK_REL = 'noopener noreferrer nofollow';

/**
 * Whitelist internal navigation targets — prevents open-redirect bugs where
 * a query param like `?next=https://evil.com` sends users off-site.
 */
export function safeRedirectPath(candidate) {
  if (typeof candidate !== 'string') return '/';
  if (!candidate.startsWith('/')) return '/';
  if (candidate.startsWith('//')) return '/'; // protocol-relative
  return candidate;
}
