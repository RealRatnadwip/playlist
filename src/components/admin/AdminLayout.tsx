import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Disc3, LogOut, ExternalLink, LayoutDashboard, ListMusic, Settings, Radio } from 'lucide-react';

interface AdminLayoutProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onTabChange,
  children,
}) => {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'playlists', label: 'Playlists', icon: ListMusic },
    { id: 'spotify', label: 'Spotify', icon: Radio },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background text-primary flex flex-col font-sans">
      {/* Admin Top Navigation */}
      <header className="border-b border-white/10 bg-surface/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent">
                <Disc3 className="w-4 h-4" />
              </div>
              <span className="font-display text-xl font-bold tracking-tight text-primary">
                ratnadwip.
              </span>
            </a>
            <span className="text-secondary/40 font-mono text-sm">/</span>
            <span className="text-xs font-mono tracking-wider uppercase text-accent font-semibold px-2 py-0.5 rounded bg-accent/10 border border-accent/20">
              Admin CMS
            </span>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-accent text-background font-semibold shadow-sm'
                      : 'text-secondary hover:text-primary hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User & Actions */}
          <div className="flex items-center gap-4">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-secondary hover:text-accent flex items-center gap-1.5 transition-colors"
            >
              <span>View Live Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <div className="h-4 w-px bg-white/10 hidden sm:block" />

            <div className="flex items-center gap-2 text-xs font-mono text-secondary">
              <span className="hidden sm:inline">@{user?.username}</span>
              <button
                onClick={logout}
                className="p-1.5 rounded-lg hover:bg-white/10 text-secondary hover:text-red-400 transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around border-t border-white/5 px-2 py-1 bg-surface-elevated">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex flex-col items-center py-1.5 px-3 text-xs font-mono ${
                  isActive ? 'text-accent font-semibold' : 'text-secondary'
                }`}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Admin Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

