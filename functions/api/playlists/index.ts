import { getPublishedPlaylists, Env } from '../_db';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const tag = url.searchParams.get('tag');
    const sort = url.searchParams.get('sort') || 'order';

    const playlists = await getPublishedPlaylists(context.env.DB, tag, sort);

    return new Response(JSON.stringify({ playlists }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=120',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    console.error('Error in /api/playlists:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch playlists' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

