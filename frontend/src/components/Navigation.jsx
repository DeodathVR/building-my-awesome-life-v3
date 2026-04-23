import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Target, Focus, BookOpen, Users, MessageCircle, Moon, Sun, Menu, X, Sparkles, Wand2, Gamepad2, Zap, HelpCircle, CreditCard, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from './ui/button';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Home' },
  { path: '/habits', icon: Target, label: 'Habits' },
  { path: '/focus', icon: Focus, label: 'Focus' },
  { path: '/concentration-games', icon: Gamepad2, label: 'Games' },
  { path: '/glow-up', icon: Zap, label: 'Glow Up' },
  { path: '/feed', icon: Sparkles, label: 'Feed' },
  { path: '/conspiracy', icon: Wand2, label: 'Conspiracy' },
  { path: '/education', icon: BookOpen, label: 'Learn' },
  { path: '/community', icon: Users, label: 'Community' },
  { path: '/coach', icon: MessageCircle, label: 'AI Coach' },
  { path: '/pricing', icon: CreditCard, label: 'Pricing' },
  { path: '/how-to-use', icon: HelpCircle, label: 'Guide' },
  { path: '/admin', icon: ShieldCheck, label: 'Admin' },
];

const Navigation = () => {
  const location = useLocation();
  const { darkMode, setDarkMode } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Navigation */}
      <nav 
        className="hidden md:flex sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50"
        data-testid="desktop-navigation"
      >
        <div className="max-w-7xl mx-auto w-full px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group flex-shrink-0" data-testid="logo-link">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center transition-transform group-hover:scale-105">
                <Target className="w-4 h-4 text-primary-foreground" strokeWidth={1.5} />
              </div>
              <span className="font-heading text-sm font-semibold text-foreground whitespace-nowrap">
                Awesome Life
              </span>
            </Link>

            {/* Nav Links */}
            <div className="flex items-center gap-0.5 flex-wrap justify-center">
              {navItems.map(({ path, icon: Icon, label }) => (
                <Link
                  key={path}
                  to={path}
                  data-testid={`nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all duration-200 ${
                    location.pathname === path
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span className="text-xs">{label}</span>
                </Link>
              ))}
            </div>

            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDarkMode(!darkMode)}
              data-testid="dark-mode-toggle"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              className="rounded-xl flex-shrink-0"
            >
              {darkMode ? (
                <Sun className="w-4 h-4" strokeWidth={1.5} />
              ) : (
                <Moon className="w-4 h-4" strokeWidth={1.5} />
              )}
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" data-testid="mobile-logo-link">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <Target className="w-4 h-4 text-primary-foreground" strokeWidth={1.5} />
            </div>
            <span className="font-heading text-lg font-semibold">ALH</span>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDarkMode(!darkMode)}
              className="rounded-xl"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-xl"
              data-testid="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed top-14 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b border-border shadow-lg max-h-[80vh] overflow-y-auto"
          data-testid="mobile-menu"
        >
          <div className="px-4 py-4 grid grid-cols-2 gap-2">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileMenuOpen(false)}
                data-testid={`mobile-nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  location.pathname === path
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <Icon className="w-4 h-4" strokeWidth={1.5} />
                <span className="text-sm">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav 
        className="md:hidden fixed bottom-6 left-4 right-4 bg-card/90 backdrop-blur-xl border border-border/50 shadow-float rounded-full p-2 z-50 mobile-nav"
        data-testid="mobile-bottom-navigation"
      >
        <div className="flex justify-around items-center">
          {[navItems[0], navItems[1], navItems[3], navItems[4], navItems[9]].map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              data-testid={`bottom-nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
              className={`flex flex-col items-center p-2 rounded-full transition-all ${
                location.pathname === path
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground'
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={1.5} />
            </Link>
          ))}
        </div>
      </nav>

      {/* Spacer for mobile header */}
      <div className="md:hidden h-14" />
    </>
  );
};

export default Navigation;

