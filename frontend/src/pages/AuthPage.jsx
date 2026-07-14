import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';
import { Target, Mail, Lock, User as UserIcon, LogIn, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function AuthPage() {
  useSEO({
    title: 'Sign in / Create account',
    description: 'Sign in or create your Awesome Life Habits account. 7-day free trial, cancel anytime.',
    path: '/auth',
    noindex: true,
  });
  const [mode, setMode] = useState('signin'); // signin | signup | forgot
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const { signInEmail, signUpEmail, signInGoogle, resetPassword } = useAuth();

  const friendlyError = (code) => {
    const map = {
      'auth/invalid-credential': 'Invalid email or password.',
      'auth/wrong-password': 'Invalid email or password.',
      'auth/user-not-found': 'No account with this email.',
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/weak-password': 'Password must be at least 6 characters.',
      'auth/invalid-email': 'Please enter a valid email.',
      'auth/popup-closed-by-user': 'Google sign-in cancelled.',
      'auth/unauthorized-domain': 'This domain isn\'t authorized in Firebase Console. Add it under Auth → Settings → Authorized domains.',
      'auth/network-request-failed': 'Network error. Please try again.',
    };
    return map[code] || 'Something went wrong. Try again.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      if (mode === 'signup') {
        if (password.length < 6) throw { code: 'auth/weak-password' };
        await signUpEmail(email, password, name);
        toast.success('Account created! Check your inbox for verification.');
        navigate(from, { replace: true });
      } else if (mode === 'signin') {
        await signInEmail(email, password);
        toast.success('Welcome back!');
        navigate(from, { replace: true });
      } else if (mode === 'forgot') {
        await resetPassword(email);
        toast.success('Password reset email sent. Check your inbox.');
        setMode('signin');
      }
    } catch (err) {
      toast.error(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await signInGoogle();
      toast.success('Welcome!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-background via-background to-primary/5" data-testid="auth-page">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
            <Target className="w-7 h-7 text-primary-foreground" strokeWidth={1.5} />
          </div>
          <h1 className="font-heading text-3xl font-bold">Awesome Life</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === 'signup' ? 'Create your account' : mode === 'forgot' ? 'Reset your password' : 'Welcome back'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border/50 rounded-2xl p-6 md:p-8 shadow-soft">
          {/* Google sign-in */}
          {mode !== 'forgot' && (
            <>
              <button
                type="button"
                onClick={handleGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-border bg-background hover:bg-muted transition-colors disabled:opacity-50 font-medium text-sm"
                data-testid="google-signin-btn"
              >
                <GoogleIcon />
                Continue with Google
              </button>
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">or {mode === 'signup' ? 'sign up' : 'sign in'} with email</span>
                <div className="flex-1 h-px bg-border" />
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {mode === 'signup' && (
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Name</span>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-background border border-border focus:border-primary outline-none text-sm"
                    data-testid="auth-name-input"
                  />
                </div>
              </label>
            )}
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email</span>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-background border border-border focus:border-primary outline-none text-sm"
                  data-testid="auth-email-input"
                />
              </div>
            </label>
            {mode !== 'forgot' && (
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Password</span>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-background border border-border focus:border-primary outline-none text-sm"
                    data-testid="auth-password-input"
                  />
                </div>
              </label>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
              data-testid="auth-submit-btn"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              {mode === 'signup' ? 'Create account' : mode === 'forgot' ? 'Send reset link' : 'Sign in'}
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-5 text-center space-y-2">
            {mode === 'signin' && (
              <>
                <button type="button" onClick={() => setMode('forgot')} className="text-xs text-muted-foreground hover:text-foreground" data-testid="forgot-password-link">
                  Forgot your password?
                </button>
                <p className="text-xs text-muted-foreground">
                  New here?{' '}
                  <button type="button" onClick={() => setMode('signup')} className="text-primary font-medium" data-testid="switch-to-signup">Create an account</button>
                </p>
              </>
            )}
            {mode === 'signup' && (
              <p className="text-xs text-muted-foreground">
                Already have an account?{' '}
                <button type="button" onClick={() => setMode('signin')} className="text-primary font-medium" data-testid="switch-to-signin">Sign in</button>
              </p>
            )}
            {mode === 'forgot' && (
              <button type="button" onClick={() => setMode('signin')} className="text-xs text-primary font-medium" data-testid="back-to-signin">← Back to sign in</button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          By continuing you agree to our{' '}
          <Link to="/terms" data-testid="auth-terms-link" className="text-primary underline">Terms</Link>
          {' '}&amp;{' '}
          <Link to="/privacy" data-testid="auth-privacy-link" className="text-primary underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
