import { useEffect } from 'react';

/**
 * Privacy-first page views via Cloudflare Web Analytics (free JS beacon).
 * Token comes from VITE_CF_ANALYTICS_TOKEN at build time. Local `npm run dev`
 * does not load the beacon so localhost does not mix into production stats.
 */
export function CloudflareAnalytics() {
  useEffect(() => {
    const token = import.meta.env.VITE_CF_ANALYTICS_TOKEN;
    if (!import.meta.env.PROD || !token) return;

    const script = document.createElement('script');
    script.defer = true;
    script.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    script.setAttribute('data-cf-beacon', JSON.stringify({ token, spa: true }));
    document.body.appendChild(script);
    return () => {
      script.remove();
    };
  }, []);

  return null;
}
