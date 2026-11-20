import { Env } from '../../_db';
import { authenticateAdmin, unauthorizedResponse } from '../../_auth';
import { extractTrackId, getValidSpotifyAccessToken, getTrackMetadata } from '../../_spotify';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const admin = await authenticateAdmin(context.request, context.env.DB);
  if (!admin) return unauthorizedResponse();

  const url = new URL(context.request.url);
  const query = url.searchParams.get('q') || url.searchParams.get('url') || url.searchParams.get('id');

  if (!query) {
    return new Response(JSON.stringify({ error: 'Track URL or ID query parameter "q" is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const trackId = extractTrackId(query);
  if (!trackId) {
    return new Response(JSON.stringify({ error: 'Invalid Spotify track URL or ID format.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const accessToken = await getValidSpotifyAccessToken(context.env, context.env.DB);

    if (!accessToken) {
      return new Response(
        JSON.stringify({
          error: 'Spotify is not connected. Please connect your Spotify account in Admin > Spotify settings, or enter track details manually.',
          fallbackTrackId: trackId,
        }),
        { status: 412, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const metadata = await getTrackMetadata(accessToken, trackId);

    return new Response(JSON.stringify({ track: metadata }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Track lookup failed:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to fetch Spotify track metadata',
        fallbackTrackId: trackId,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

