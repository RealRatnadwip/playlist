import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description = 'A personal music archive, listening journal and playlist collection belonging to Ratnadwip Sarkar.',
  image = 'https://playlist.ratnadwip.com/og-cover.png',
  url = window.location.href,
}) => {
  useEffect(() => {
    const fullTitle = title
      ? `${title} · ratnadwip.`
      : 'ratnadwip. / personal music archive & playlist journal';

    document.title = fullTitle;

    const setMeta = (name: string, content: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let element = document.querySelector(selector) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        if (isProperty) {
          element.setAttribute('property', name);
        } else {
          element.setAttribute('name', name);
        }
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    setMeta('description', description);
    setMeta('og:title', fullTitle, true);
    setMeta('og:description', description, true);
    setMeta('og:image', image, true);
    setMeta('og:url', url, true);
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', description);
    setMeta('twitter:image', image);
  }, [title, description, image, url]);

  return null;
};

