/**
 * Cloudflare Edge Caching Helper
 * Protects Spotify API and D1 Database against high-concurrency traffic.
 * Even if 1,000+ visitors browse concurrently, requests are served from Cloudflare's
 * global Edge Cache in < 15ms without touching origin APIs or D1.
 */

export async function withEdgeCache(
  request: Request,
  contextWaitUntil: (promise: Promise<any>) => void,
  ttlSeconds: number,
  swrSeconds: number,
  fetchFn: () => Promise<Response>
): Promise<Response> {
  const url = new URL(request.url);
  // Strip cache-busting params from cache key so all concurrent visitors share the edge cache
  const cleanParams = new URLSearchParams(url.searchParams);
  cleanParams.delete('_t');
  cleanParams.delete('t');
  cleanParams.delete('_');
  const sortedParams = new URLSearchParams(Array.from(cleanParams.entries()).sort());
  const cacheKeyStr = `${url.origin}${url.pathname}${sortedParams.toString() ? '?' + sortedParams.toString() : ''}`;
  const cacheKey = new Request(cacheKeyStr, { method: 'GET' });

  // Access Cloudflare Edge Cache
  // @ts-ignore
  const cache = typeof caches !== 'undefined' ? caches.default : null;

  if (cache) {
    try {
      const match = await cache.match(cacheKey);
      if (match) {
        // Return cached edge response with HIT header
        const res = new Response(match.body, match);
        res.headers.set('X-Edge-Cache', 'HIT');
        // Crucial: instruct client browser NEVER to cache locally, so polling always checks the edge
        res.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        return res;
      }
    } catch {
      // Continue to origin on cache match error
    }
  }

  // Fetch from origin
  const originResponse = await fetchFn();

  if (originResponse.status === 200 && cache) {
    // Edge cache gets TTL
    const edgeHeaders = new Headers(originResponse.headers);
    edgeHeaders.set('Cache-Control', `public, max-age=${ttlSeconds}, stale-while-revalidate=${swrSeconds}`);
    edgeHeaders.set('X-Edge-Cache', 'MISS');

    const cachedRes = new Response(originResponse.clone().body, {
      status: originResponse.status,
      statusText: originResponse.statusText,
      headers: edgeHeaders,
    });

    try {
      contextWaitUntil(cache.put(cacheKey, cachedRes));
    } catch {
      // Ignore background cache put errors
    }

    // Client browser receives no-store so browser never caches locally
    const clientHeaders = new Headers(originResponse.headers);
    clientHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    clientHeaders.set('X-Edge-Cache', 'MISS');

    return new Response(originResponse.body, {
      status: originResponse.status,
      statusText: originResponse.statusText,
      headers: clientHeaders,
    });
  }

  return originResponse;
}
