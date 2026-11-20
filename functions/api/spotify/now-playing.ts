import { getCurrentlyPlaying } from '../_spotify';
import { Env } from '../_db';
import { withEdgeCache } from '../_cache';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  return withEdgeCache(
    context.request,
    context.waitUntil.bind(context),
    8, // 8 seconds TTL (max 7-8 Spotify API calls per minute worldwide regardless of traffic)
    15, // 15 seconds stale-while-revalidate
    async () => {
      try {
        const data = await getCurrentlyPlaying(context.env, context.env.DB);
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      } catch (error: any) {
        console.error('Error in /api/spotify/now-playing:', error);
        return new Response(
          JSON.stringify({
            isPlaying: false,
            title: null,
            artist: null,
            album: null,
            albumArtwork: null,
            spotifyUrl: null,
            trackId: null,
            progressMs: 0,
            durationMs: 0,
            fetchedAt: Date.now(),
            message: 'Currently away from the speakers.',
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }
    }
  );
};
