import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, X } from 'lucide-react';

const STORAGE_KEY = 'alu_cookie_consent_v1';

/**
 * GDPR-lite cookie consent banner.
 * - Appears once (bottom of screen) until user accepts or rejects.
 * - "Accept" enables PostHog analytics (default init state).
 * - "Reject" calls posthog.opt_out_capturing() to disable analytics.
 * - Essential cookies (auth session, dark mode, streaks) always allowed — required for the app to work.
 */
export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Delay 900ms so it doesn't fight with the page's own entrance animation
    const t = setTimeout(() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
          setVisible(true);
        } else if (stored === 'rejected') {
          if (window.posthog?.opt_out_capturing) window.posthog.opt_out_capturing();
        } else if (stored === 'accepted') {
          if (window.posthog?.opt_in_capturing) window.posthog.opt_in_capturing();
        }
      } catch { /* ignore */ }
    }, 900);
    return () => clearTimeout(t);
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'accepted');
      if (window.posthog?.opt_in_capturing) window.posthog.opt_in_capturing();
    } catch { /* ignore */ }
    setVisible(false);
  };

  const reject = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'rejected');
      if (window.posthog?.opt_out_capturing) window.posthog.opt_out_capturing();
    } catch { /* ignore */ }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-md z-[60] animate-in slide-in-from-bottom-4"
      data-testid="cookie-consent-banner"
      role="dialog"
      aria-label="Cookie preferences"
    >
      <div className="bg-card border border-border rounded-2xl shadow-2xl p-5 relative">
        <button
          onClick={reject}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground p-1"
          aria-label="Close and reject non-essential cookies"
          data-testid="cookie-consent-close"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Cookie className="w-4 h-4 text-primary" strokeWidth={1.5} />
          </div>
          <div className="flex-1 pr-6">
            <p className="font-heading text-sm font-semibold mb-1">We use cookies</p>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              Essential cookies keep you signed in and remember your preferences. We&apos;d also like
              to use anonymous analytics (PostHog) to improve the app. Read our{' '}
              <Link to="/privacy" className="text-primary underline">Privacy Policy</Link>.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={accept}
                className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
                data-testid="cookie-consent-accept"
              >
                Accept all
              </button>
              <button
                onClick={reject}
                className="px-4 py-1.5 rounded-full border border-border bg-background text-foreground text-xs font-semibold hover:bg-muted transition-colors"
                data-testid="cookie-consent-reject"
              >
                Essential only
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
