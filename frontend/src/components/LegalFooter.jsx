import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Slim legal footer shown on every page for Lemon Squeezy compliance.
 * Renders Privacy, Terms, Contact, and Merchant-of-Record disclosure.
 */
export default function LegalFooter() {
  return (
    <footer
      className="border-t border-border/50 bg-background/60 backdrop-blur-sm mt-8"
      data-testid="legal-footer"
    >
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} Building My Awesome Life Daily. Payments processed by{' '}
          <span className="font-medium text-foreground">Lemon Squeezy</span> (Merchant of Record).
        </p>
        <nav className="flex items-center gap-4" aria-label="Legal">
          <Link to="/privacy" data-testid="footer-privacy-link" className="hover:text-foreground transition-colors">
            Privacy
          </Link>
          <Link to="/terms" data-testid="footer-terms-link" className="hover:text-foreground transition-colors">
            Terms
          </Link>
          <a
            href="mailto:sparksofmotivation1001@gmail.com"
            data-testid="footer-contact-link"
            className="hover:text-foreground transition-colors"
          >
            Contact
          </a>
        </nav>
      </div>
    </footer>
  );
}
