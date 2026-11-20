import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { NowPlayingProvider } from './context/NowPlayingContext';
import { HomePage } from './pages/HomePage';
import { PlaylistDetailPage } from './pages/PlaylistDetailPage';
import { AdminPage } from './pages/AdminPage';

export const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    // Handle browser back/forward buttons
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);

    // Global click interceptor for internal links to preserve SPA routing
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (
        target &&
        target.href &&
        target.origin === window.location.origin &&
        !target.getAttribute('download') &&
        target.target !== '_blank' &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey
      ) {
        const url = new URL(target.href);
        // If it's just an in-page anchor like #playlists on current page
        if (url.pathname === window.location.pathname && url.hash) {
          return; // let default scroll anchor work
        }

        e.preventDefault();
        window.history.pushState({}, '', target.href);
        setCurrentPath(url.pathname);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    document.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('click', handleClick);
    };
  }, []);

  // Simple, robust client-side route matcher
  let pageContent: React.ReactNode;

  if (currentPath === '/admin' || currentPath.startsWith('/admin/')) {
    pageContent = <AdminPage />;
  } else if (currentPath.startsWith('/playlist/')) {
    const slug = currentPath.replace(/^\/playlist\//, '').split('/')[0];
    pageContent = <PlaylistDetailPage slug={slug} />;
  } else {
    pageContent = <HomePage />;
  }

  return (
    <AuthProvider>
      <NowPlayingProvider>
        <div className="relative min-h-screen bg-background text-primary overflow-x-hidden">
          {/* Subtle analog grain overlay */}
          <div className="fixed inset-0 bg-noise pointer-events-none z-50 opacity-40" />
          {pageContent}
        </div>
      </NowPlayingProvider>
    </AuthProvider>
  );
};

export default App;

