/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

const SITE_NAME = 'Building My Awesome Life Daily';
const CONTACT_EMAIL = 'sparksofmotivation1001@gmail.com';
const EFFECTIVE_DATE = 'February 10, 2026';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground" data-testid="privacy-page">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-primary" strokeWidth={1.5} />
          </div>
          <p className="text-xs font-bold tracking-widest uppercase text-primary">Legal</p>
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Effective date: {EFFECTIVE_DATE}</p>

        <div className="prose-legal space-y-8 text-sm leading-relaxed">
          <section>
            <p>
              {SITE_NAME} ("we", "us", "our") respects your privacy. This Privacy Policy explains
              what personal information we collect, how we use it, and the choices you have. By
              using our website and services (the "Service"), you agree to the practices described
              here.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">1. Who we are</h2>
            <p>
              {SITE_NAME} is an online subscription service operated by an independent creator based
              in Trinidad and Tobago. Payments are processed by our merchant of record,
              Lemon Squeezy (Lemon Squeezy, Inc.), which handles subscription billing, tax collection,
              refunds, and payment-card compliance on our behalf.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">2. Information we collect</h2>
            <p className="mb-3">We only collect what is needed to run the Service:</p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li><strong>Account info</strong> — email address and (optional) display name, provided via Firebase Authentication when you sign up with email/password or Google.</li>
              <li><strong>App data you create</strong> — habits, streaks, completion history, focus-game scores, journal entries, community posts, and photos you voluntarily upload to Glow Up. Stored in Google Firestore under your user ID.</li>
              <li><strong>Payment info</strong> — collected and stored by Lemon Squeezy, not by us. We only receive the subscription status and last-4 digits of your card for receipt purposes.</li>
              <li><strong>Usage analytics</strong> — anonymised pageviews, clicks, and session data via PostHog. No card data, no plain-text messages, no photos are captured. You may opt out via the cookie banner.</li>
              <li><strong>AI content</strong> — prompts you send to the AI Coach or the Success Conspiracy tools are transmitted to our backend and to third-party model providers (via the Emergent LLM proxy) to generate responses. We do not train models on your data.</li>
              <li><strong>Cookies / local storage</strong> — small identifiers used to keep you logged in, remember dark-mode preference, and (if you accept) analytics.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">3. How we use your information</h2>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>To provide, personalise, and improve the Service (e.g. show your habits and streaks).</li>
              <li>To generate AI responses in the AI Coach, Cosmic Reframer, Thought Tracker, and Glow Up.</li>
              <li>To send transactional emails (sign-in verification, receipts, password reset) via Firebase and Lemon Squeezy.</li>
              <li>To detect abuse and enforce daily rate limits (20 AI requests per user per day).</li>
              <li>To comply with tax and legal obligations (via Lemon Squeezy as merchant of record).</li>
            </ul>
            <p className="mt-3">We do <strong>not</strong> sell your data. We do not run advertising networks on the Service.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">4. Third-party sub-processors</h2>
            <p className="mb-3">We rely on the following vetted providers:</p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li><strong>Google Firebase</strong> — authentication + Firestore database (data hosted in Google Cloud).</li>
              <li><strong>Lemon Squeezy</strong> — payments, subscription management, tax remittance, and refunds.</li>
              <li><strong>Emergent LLM proxy</strong> — routes AI requests to OpenAI, Anthropic, and Google Gemini providers. Data is transmitted to generate responses; not used for model training.</li>
              <li><strong>PostHog</strong> — product analytics (opt-out available).</li>
              <li><strong>Render</strong> — backend hosting.</li>
              <li><strong>Vercel</strong> — frontend hosting.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">5. Data retention</h2>
            <p>
              We retain your data for as long as your account is active. If you delete your account,
              we remove your personal data within 30 days, except where retention is required for
              legal, tax, or fraud-prevention reasons (Lemon Squeezy retains transaction records for
              up to 7 years as required by tax law).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">6. Your rights</h2>
            <p className="mb-3">You can, at any time:</p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Access, correct, or export the data you have stored in the app.</li>
              <li>Delete your account and all associated data by emailing us at{' '}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline">{CONTACT_EMAIL}</a>.
              </li>
              <li>Withdraw consent for analytics via the cookie banner (or clear localStorage and refresh).</li>
              <li>Lodge a complaint with a data-protection authority if you are in the EU/UK.</li>
            </ul>
            <p className="mt-3">We respond to verified requests within 30 days.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">7. Children</h2>
            <p>
              The Service is intended for adults 18+ and is not directed at children under 13. If you
              believe a child has provided us personal data, please contact us and we will delete it.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">8. Security</h2>
            <p>
              We use HTTPS everywhere, Firebase security rules to isolate each user's data, backend
              rate-limiting, and the OAuth/OpenID protocols provided by Google and Firebase. No system
              is 100% secure — you are responsible for keeping your password confidential.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">9. International transfers</h2>
            <p>
              Data may be processed in the United States and other countries where our sub-processors
              operate. By using the Service you consent to such transfers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">10. Changes</h2>
            <p>
              We may update this Privacy Policy from time to time. Material changes will be announced
              via a banner in the app or by email. The "Effective date" above indicates the current
              version.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">11. Contact</h2>
            <p>
              Questions or requests? Email{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline">{CONTACT_EMAIL}</a>.
            </p>
          </section>

          <div className="pt-8 border-t border-border">
            <p className="text-xs text-muted-foreground">
              See also: <Link to="/terms" className="text-primary underline">Terms of Service</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
