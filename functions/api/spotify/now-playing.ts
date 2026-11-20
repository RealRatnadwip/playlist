import { getCurrentlyPlaying } from '../_spotify';
import { Env } from '../_db';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const data = await getCurrentlyPlaying(context.env, context.env.DB);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=15, stale-while-revalidate=30',
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
        },
      }
    );
  }
};

