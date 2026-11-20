import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminSetup } from '../../services/api';
import { Disc3, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSetupMode, setIsSetupMode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      if (isSetupMode) {
        const res = await adminSetup(username, password);
        if (res.success) {
          window.location.reload();
        } else {
          setErrorMsg(res.error || 'Failed to initialize administrator');
        }
      } else {
        const res = await login(username, password);
        if (!res.success) {
          setErrorMsg(res.error || 'Invalid username or password');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 sm:px-6 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute w-96 h-96 bg-accent/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 group mb-3">
            <div className="w-9 h-9 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent group-hover:scale-105 transition-transform">
              <Disc3 className="w-5 h-5 animate-spin-slow" />
            </div>
            <span className="font-display text-3xl font-bold tracking-tight text-primary">
              ratnadwip.
            </span>
          </a>
          <p className="text-xs font-mono uppercase tracking-widest text-secondary">
            {isSetupMode ? 'Administrator Initial Setup' : 'Private Archive CMS'}
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl glass-panel-elevated p-8 border border-white/10 shadow-glass-lg backdrop-blur-2xl">
          {errorMsg && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-secondary mb-1.5 uppercase tracking-wider">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full bg-surface-elevated border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-primary placeholder-secondary/30 focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-secondary mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-surface-elevated border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-sm text-primary placeholder-secondary/30 focus:outline-none focus:border-accent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-accent text-background font-semibold text-xs font-mono uppercase tracking-wider hover:bg-accent-muted transition-colors shadow-sm disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Authenticating...' : isSetupMode ? 'Create Admin Account' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Toggle setup mode */}
          <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between text-xs font-mono text-secondary">
            <button
              type="button"
              onClick={() => {
                setIsSetupMode(!isSetupMode);
                setErrorMsg(null);
              }}
              className="hover:text-accent transition-colors underline"
            >
              {isSetupMode ? 'Back to standard login' : 'First time setup?'}
            </button>

            <a href="/" className="hover:text-primary transition-colors">
              ← Public Site
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

