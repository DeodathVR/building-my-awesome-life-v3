/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';

const SITE_NAME = 'Building My Awesome Life Daily';
const CONTACT_EMAIL = 'sparksofmotivation1001@gmail.com';
const EFFECTIVE_DATE = 'February 10, 2026';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background text-foreground" data-testid="terms-page">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary" strokeWidth={1.5} />
          </div>
          <p className="text-xs font-bold tracking-widest uppercase text-primary">Legal</p>
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-10">Effective date: {EFFECTIVE_DATE}</p>

        <div className="prose-legal space-y-8 text-sm leading-relaxed">
          <section>
            <p>
              Welcome to {SITE_NAME} (the "Service"). By creating an account or using the Service, you
              agree to these Terms of Service ("Terms"). If you do not agree, please do not use the
              Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">1. The Service</h2>
            <p>
              {SITE_NAME} is a subscription web application that provides habit tracking, focus
              mini-games, guided mindfulness exercises, AI-powered coaching, motivational content,
              and photo-visualisation tools. The Service is provided on a "software as a service"
              basis and is delivered entirely online. No physical products are shipped.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">2. Eligibility &amp; account</h2>
            <p>
              You must be at least 18 years old to use the Service. You are responsible for keeping
              your login credentials confidential and for all activity under your account. Notify us
              immediately at{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline">{CONTACT_EMAIL}</a>{' '}
              if you suspect unauthorised access.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">3. Subscriptions, billing &amp; free trial</h2>
            <ul className="list-disc pl-6 space-y-1.5">
              <li><strong>Free tier</strong> — includes core habit tracking and a limited set of focus games at no cost.</li>
              <li><strong>Pro plan — US$9.99/month</strong> — unlocks all 15 concentration games, AI Coach, Glow Up image generation, Success Conspiracy tools, and full Awesome Feed.</li>
              <li><strong>Family plan — US$19.99/month</strong> — Pro features for up to five accounts.</li>
              <li><strong>7-day free trial</strong> — new paid subscribers receive a 7-day free trial. You may cancel any time during the trial and will not be charged.</li>
              <li><strong>Recurring billing</strong> — after the trial, the subscription auto-renews monthly until you cancel.</li>
              <li><strong>Merchant of Record</strong> — billing is handled by Lemon Squeezy, which collects payment, remits taxes, and issues receipts. All charges appear on your statement as "Lemon Squeezy" or similar.</li>
              <li><strong>Cancellation</strong> — cancel any time from your account settings or by emailing us. Access to paid features continues until the end of the current billing period.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">4. Refund policy</h2>
            <p>
              We want you to be happy. If you are not satisfied within <strong>14 days of your first
              paid billing cycle</strong>, email us at{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline">{CONTACT_EMAIL}</a>{' '}
              and we will issue a full refund. After the 14-day window, subscriptions are
              non-refundable, but you can cancel at any time to stop future charges. Refunds are
              processed by Lemon Squeezy and typically appear on your card within 5-10 business days.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">5. Acceptable use</h2>
            <p className="mb-2">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Reverse-engineer, resell, or sublicence the Service.</li>
              <li>Use the AI features to generate unlawful, hateful, defamatory, sexually explicit, or otherwise harmful content.</li>
              <li>Upload photos of anyone without their consent, or photos containing minors, to Glow Up.</li>
              <li>Attempt to bypass rate limits, security controls, or subscription paywalls.</li>
              <li>Use the Service to spam, phish, or harass other users or third parties.</li>
              <li>Use automated tools to scrape or crawl the Service.</li>
            </ul>
            <p className="mt-3">We reserve the right to suspend or terminate accounts that violate these rules.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">6. Your content</h2>
            <p>
              You retain ownership of the habits, journal entries, photos, and other content you
              submit to the Service ("Your Content"). You grant us a limited licence to store, process,
              and display Your Content solely to operate the Service on your behalf. You are
              responsible for having the necessary rights to any content you upload.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">7. AI-generated content disclaimer</h2>
            <p>
              The Service uses artificial-intelligence models (OpenAI, Anthropic, Google Gemini) via
              the Emergent LLM proxy to generate coaching, reframes, and images. AI output may be
              inaccurate, incomplete, or inappropriate. It is <strong>not</strong> professional
              medical, mental-health, legal, or financial advice. Do not rely on it as a substitute
              for advice from a licensed professional. If you are in crisis, contact a local
              helpline immediately.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">8. Intellectual property</h2>
            <p>
              All trademarks, logos, source code, designs, and materials of the Service are owned by
              {' '}{SITE_NAME} or its licensors and are protected by copyright and trademark laws. You
              may not copy, modify, or distribute them without our written permission.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">9. Service availability</h2>
            <p>
              We do our best to keep the Service running, but we do not guarantee uninterrupted
              availability. Scheduled maintenance, third-party outages (Firebase, Lemon Squeezy,
              Render, Vercel), or force majeure events may cause temporary downtime. Extended
              disruptions may be credited back on request.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">10. Disclaimers &amp; limitation of liability</h2>
            <p>
              The Service is provided "as is" and "as available" without warranties of any kind,
              express or implied, including merchantability, fitness for a particular purpose, and
              non-infringement. To the maximum extent permitted by law, {SITE_NAME}'s total liability
              to you shall not exceed the amount you paid to us in the twelve (12) months preceding
              the claim. We are not liable for indirect, incidental, special, consequential, or
              punitive damages.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">11. Termination</h2>
            <p>
              You may delete your account at any time. We may suspend or terminate your account for
              breach of these Terms, non-payment, or as required by law. On termination, your data
              is deleted within 30 days (see Privacy Policy).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">12. Governing law</h2>
            <p>
              These Terms are governed by the laws of the Republic of Trinidad and Tobago, without
              regard to its conflict-of-law rules. Any dispute shall be brought exclusively in the
              courts of Trinidad and Tobago, except where applicable consumer-protection law grants
              you a different forum.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">13. Changes to these Terms</h2>
            <p>
              We may update these Terms occasionally. Material changes will be announced in-app or
              by email at least 14 days before taking effect. Continued use of the Service after
              changes take effect means you accept the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">14. Contact</h2>
            <p>
              For questions about these Terms, email{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline">{CONTACT_EMAIL}</a>.
            </p>
          </section>

          <div className="pt-8 border-t border-border">
            <p className="text-xs text-muted-foreground">
              See also: <Link to="/privacy" className="text-primary underline">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
