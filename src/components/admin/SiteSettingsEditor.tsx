import React, { useState } from 'react';
import { SiteSettings } from '../../types';
import { updateAdminSettings } from '../../services/api';
import { Save, Check, Settings2, Sparkles } from 'lucide-react';

interface SiteSettingsEditorProps {
  settings: SiteSettings;
  onSaved: () => void;
}

export const SiteSettingsEditor: React.FC<SiteSettingsEditorProps> = ({ settings, onSaved }) => {
  const [formData, setFormData] = useState<SiteSettings>({
    about_heading: settings.about_heading || "A little about what's playing in my head.",
    about_body:
      settings.about_body ||
      `I've always believed that you can know someone better through what they listen to at 1 AM than through a resume. This archive is my personal catalog of sounds, memories, and the quiet records that anchor different seasons of my life.

Every playlist here has a reason to exist. Some were made for specific people, some during quiet train journeys, and some simply because a song refused to leave my chest.

No algorithms. No shuffle recommendations. Just the songs I return to when the world gets too loud.`,
    hero_intro: settings.hero_intro || 'A personal music archive, listening journal and playlist collection.',
    footer_signature: settings.footer_signature || 'Made with music and a little too much attachment to playlists.',
    owner_name: settings.owner_name || 'Ratnadwip Sarkar',
    portfolio_url: settings.portfolio_url || 'https://ratnadwip.com',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg(null);

    try {
      const ok = await updateAdminSettings(formData);
      if (ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
        onSaved();
      } else {
        setErrorMsg('Failed to update settings');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex items-center justify-between pb-6 border-b border-white/10">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-primary">
            Site Copy & Editorial Settings
          </h1>
          <p className="text-secondary text-sm font-light mt-1">
            Customize the personal texts, about notes, and signatures across the website without touching code.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent text-background font-semibold text-xs font-mono uppercase tracking-wider hover:bg-accent-muted transition-colors shadow-sm disabled:opacity-50"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
            </>
          )}
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-mono">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* About Section Settings */}
        <div className="rounded-2xl glass-panel p-6 border border-white/10 space-y-4 shadow-glass">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-accent font-semibold pb-3 border-b border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>About Section Copy</span>
          </div>

          <div>
            <label className="block text-xs font-mono text-secondary mb-1">
              About Heading
            </label>
            <input
              type="text"
              value={formData.about_heading || ''}
              onChange={(e) => setFormData({ ...formData, about_heading: e.target.value })}
              className="w-full bg-surface-elevated border border-white/10 rounded-xl px-4 py-2.5 text-base font-medium text-primary focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-secondary mb-1">
              About Body Text (Paragraphs separated by blank lines)
            </label>
            <textarea
              rows={8}
              value={formData.about_body || ''}
              onChange={(e) => setFormData({ ...formData, about_body: e.target.value })}
              className="w-full bg-surface-elevated border border-white/10 rounded-xl p-4 text-sm font-light text-primary placeholder-secondary/30 focus:outline-none focus:border-accent leading-relaxed font-sans"
            />
          </div>
        </div>

        {/* Brand & Signature Details */}
        <div className="rounded-2xl glass-panel p-6 border border-white/10 space-y-4 shadow-glass">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-secondary font-semibold pb-3 border-b border-white/10">
            <Settings2 className="w-3.5 h-3.5" />
            <span>Identity & Footer</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-secondary mb-1">Owner Name</label>
              <input
                type="text"
                value={formData.owner_name || ''}
                onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                className="w-full bg-surface-elevated border border-white/10 rounded-xl px-3 py-2 text-sm text-primary focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-secondary mb-1">
                Portfolio Website URL
              </label>
              <input
                type="url"
                value={formData.portfolio_url || ''}
                onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                className="w-full bg-surface-elevated border border-white/10 rounded-xl px-3 py-2 text-sm text-primary focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-secondary mb-1">
              Footer Personal Signature
            </label>
            <input
              type="text"
              value={formData.footer_signature || ''}
              onChange={(e) => setFormData({ ...formData, footer_signature: e.target.value })}
              className="w-full bg-surface-elevated border border-white/10 rounded-xl px-3 py-2 text-sm text-primary focus:outline-none focus:border-accent"
            />
          </div>
        </div>
      </form>
    </div>
  );
};

