import React, { useState } from 'react';
import { SpotifyConnectionStatus } from '../../types';
import { connectSpotify, disconnectSpotify, fetchNowPlaying } from '../../services/api';
import { Radio, ExternalLink, RefreshCw, Key } from 'lucide-react';

interface SpotifySettingsProps {
  status: SpotifyConnectionStatus | null;
  onRefresh: () => void;
}

export const SpotifySettings: React.FC<SpotifySettingsProps> = ({ status, onRefresh }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [copied, setCopied] = useState(false);

  const redirectUri =
    status?.redirectUri || `${window.location.origin}/api/admin/spotify/callback`;

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const res = await connectSpotify();
      if (res.authUrl) {
        window.location.href = res.authUrl;
      } else {
        alert(res.error || 'Failed to start Spotify authorization flow');
      }
    } catch (err: any) {
      alert(err.message || 'Connection error');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect Spotify?')) return;
    const ok = await disconnectSpotify();
    if (ok) {
      onRefresh();
      setTestResult(null);
    }
  };

  const handleTestPlayback = async () => {
    setIsTesting(true);
    try {
      const data = await fetchNowPlaying();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({ error: err.message });
    } finally {
      setIsTesting(false);
    }
  };

  const handleCopyRedirect = () => {
    navigator.clipboard.writeText(redirectUri);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-primary">
          Spotify Integration
        </h1>
        <p className="text-secondary text-sm font-light mt-1">
          Connect your personal Spotify Premium account to display live currently playing playback.
        </p>
      </div>

      {/* Connection Status Card */}
      <div className="rounded-2xl glass-panel p-6 border border-white/10 shadow-glass">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${status?.isConnected
                ? 'bg-accent/20 text-accent border border-accent/40'
                : 'bg-white/5 text-secondary border border-white/10'
                }`}
            >
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-primary">Account Connection</h3>
                {status?.isConnected ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-accent/20 text-accent border border-accent/30">
                    Live
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-white/5 text-secondary border border-white/10">
                    Disconnected
                  </span>
                )}
              </div>
              <p className="text-xs text-secondary mt-0.5 font-mono">
                {status?.isConnected
                  ? 'Authorized for user-read-currently-playing and user-read-recently-played'
                  : 'Not linked to any Spotify user'}
              </p>
            </div>
          </div>

          <div>
            {status?.isConnected ? (
              <button
                onClick={handleDisconnect}
                className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-mono font-medium transition-colors"
              >
                Disconnect Spotify
              </button>
            ) : (
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent text-background font-semibold text-xs font-mono uppercase tracking-wider hover:bg-accent-muted transition-colors shadow-sm disabled:opacity-50"
              >
                <Radio className="w-4 h-4" />
                <span>{isConnecting ? 'Redirecting...' : 'Connect Spotify Account'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Test Playback */}
        <div className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono uppercase tracking-wider text-secondary font-semibold">
              Live Playback Diagnostic
            </span>
            <button
              onClick={handleTestPlayback}
              disabled={isTesting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-primary hover:bg-white/10"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>Test Now-Playing Endpoint</span>
            </button>
          </div>

          {testResult && (
            <div className="p-4 rounded-xl bg-surface-elevated border border-white/10 text-xs font-mono text-secondary overflow-x-auto">
              <pre>{JSON.stringify(testResult, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>

      {/* Developer Setup Instructions */}
      <div className="rounded-2xl glass-panel p-6 border border-white/10 space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-accent font-semibold">
          <Key className="w-3.5 h-3.5" />
          <span>Spotify Developer Configuration</span>
        </div>

        <p className="text-secondary text-sm font-light leading-relaxed">
          To enable live playback on your website, create an app in the{' '}
          <a
            href="https://developer.spotify.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline inline-flex items-center gap-1 font-medium"
          >
            Spotify Developer Dashboard <ExternalLink className="w-3 h-3 inline" />
          </a>{' '}
          and add this exact Redirect URI to your Spotify app settings:
        </p>

        <div className="flex items-center gap-2 bg-surface-elevated p-3 rounded-xl border border-white/10">
          <code className="text-xs font-mono text-primary flex-1 break-all">{redirectUri}</code>
          <button
            onClick={handleCopyRedirect}
            className="px-3 py-1 rounded bg-white/10 hover:bg-white/15 text-xs font-mono text-primary"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <div className="pt-2 text-xs text-secondary/80 space-y-1 font-light">
          <p>
            Then set your secrets using Cloudflare Wrangler CLI:
          </p>
          <div className="bg-black/40 p-3 rounded-lg font-mono text-xs text-primary/80 overflow-x-auto space-y-1">
            <div>wrangler secret put SPOTIFY_CLIENT_ID</div>
            <div>wrangler secret put SPOTIFY_CLIENT_SECRET</div>
            <div>wrangler secret put SPOTIFY_TOKEN_ENCRYPTION_KEY</div>
          </div>
        </div>
      </div>
    </div>
  );
};

