import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Target, Focus, BookOpen, Users, MessageCircle, Moon, Sun, Menu, X, Sparkles, Wand2, Gamepad2, Zap, HelpCircle, CreditCard, ShieldCheck, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { toast } from 'sonner';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { darkMode, setDarkMode } = useApp();
  const { user, isAdmin, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navItems = React.useMemo(() => {
    const homeHref = user ? '/dashboard' : '/';
    const items = [
      { path: homeHref, icon: LayoutDashboard, label: 'Home' },
      { path: '/habits', icon: Target, label: 'Habits', requiresAuth: true },
      { path: '/focus', icon: Focus, label: 'Focus', requiresAuth: true },
      { path: '/concentration-games', icon: Gamepad2, label: 'Games' },
      { path: '/glow-up', icon: Zap, label: 'Glow Up' },
      { path: '/feed', icon: Sparkles, label: 'Feed' },
      { path: '/conspiracy', icon: Wand2, label: 'Conspiracy' },
      { path: '/education', icon: BookOpen, label: 'Learn' },
      { path: '/community', icon: Users, label: 'Community' },
      { path: '/coach', icon: MessageCircle, label: 'AI Coach', requiresAuth: true },
      { path: '/pricing', icon: CreditCard, label: 'Pricing' },
      { path: '/how-to-use', icon: HelpCircle, label: 'Guide' },
    ];
    // Hide auth-only items for logged-out visitors to reduce dead clicks
    const filtered = user ? items : items.filter(i => !i.requiresAuth);
    return isAdmin ? [...filtered, { path: '/admin', icon: ShieldCheck, label: 'Admin' }] : filtered;
  }, [user, isAdmin]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out');
      navigate('/auth');
    } catch {
      toast.error('Sign out failed');
    }
  };

  const userInitial = (user?.displayName || user?.email || '?').charAt(0).toUpperCase();

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

            {/* Right side: Dark mode + User menu */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDarkMode(!darkMode)}
                data-testid="dark-mode-toggle"
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                className="rounded-xl"
              >
                {darkMode ? (
                  <Sun className="w-4 h-4" strokeWidth={1.5} />
                ) : (
                  <Moon className="w-4 h-4" strokeWidth={1.5} />
                )}
              </Button>
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(o => !o)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-muted transition-colors"
                    data-testid="user-menu-btn"
                  >
                    <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                      {userInitial}
                    </div>
                  </button>
                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-lg z-40 py-2" data-testid="user-menu-dropdown">
                        <div className="px-3 py-2 border-b border-border/50">
                          <p className="text-xs font-semibold truncate">{user.displayName || 'User'}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          {isAdmin && <span className="inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">ADMIN</span>}
                        </div>
                        <button
                          onClick={() => { setUserMenuOpen(false); handleSignOut(); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-left"
                          data-testid="signout-btn"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link to="/auth" data-testid="nav-signin-btn" className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity">
                  Sign in
                </Link>
              )}
            </div>
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
            {user ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="rounded-xl"
                data-testid="mobile-signout-btn"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            ) : (
              <Link to="/auth" data-testid="mobile-signin-btn" className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                Sign in
              </Link>
            )}
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
          {(() => {
            // Pick 5 stable bottom-nav slots regardless of nav visibility state
            const wantedPaths = user
              ? ['/dashboard', '/habits', '/concentration-games', '/glow-up', '/coach']
              : ['/', '/concentration-games', '/glow-up', '/feed', '/pricing'];
            const bottom = wantedPaths
              .map(p => navItems.find(n => n.path === p))
              .filter(Boolean);
            return bottom.map(({ path, icon: Icon, label }) => (
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
            ));
          })()}
        </div>
      </nav>

      {/* Spacer for mobile header */}
      <div className="md:hidden h-14" />
    </>
  );
};

export default Navigation;

