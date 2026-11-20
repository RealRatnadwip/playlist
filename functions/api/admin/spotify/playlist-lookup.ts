import { Env } from '../../_db';
import { authenticateAdmin, unauthorizedResponse } from '../../_auth';
import { getValidSpotifyAccessToken } from '../../_spotify';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const admin = await authenticateAdmin(context.request, context.env.DB);
  if (!admin) return unauthorizedResponse();

  const url = new URL(context.request.url);
  const query = url.searchParams.get('q') || url.searchParams.get('url') || url.searchParams.get('id');

  if (!query) {
    return new Response(JSON.stringify({ error: 'Playlist URL or ID parameter "q" is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Extract playlist ID
  let playlistId = query.trim();
  const match = query.match(/playlist\/([a-zA-Z0-9]{22})/);
  if (match) playlistId = match[1];
  const uriMatch = query.match(/spotify:playlist:([a-zA-Z0-9]{22})/);
  if (uriMatch) playlistId = uriMatch[1];

  try {
    const accessToken = await getValidSpotifyAccessToken(context.env, context.env.DB);

    if (!accessToken) {
      return new Response(
        JSON.stringify({
          error: 'Spotify is not connected. Please connect your Spotify account in Admin > Spotify settings.',
        }),
        { status: 412, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: `Spotify playlist fetch failed with status ${res.status}` }),
        { status: res.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data: any = await res.json();
    const tracks = (data.items || [])
      .filter((item: any) => item && item.track && item.track.id)
      .map((item: any) => {
        const t = item.track;
        return {
          spotifyTrackId: t.id,
          title: t.name,
          artist: (t.artists || []).map((a: any) => a.name).join(', '),
          album: t.album?.name || '',
          artworkUrl: t.album?.images?.[0]?.url || t.album?.images?.[1]?.url || '',
          durationMs: t.duration_ms || 0,
          spotifyUrl: t.external_urls?.spotify || `https://open.spotify.com/track/${t.id}`,
        };
      });

    return new Response(JSON.stringify({ playlistId, count: tracks.length, tracks }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Playlist lookup error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to fetch playlist tracks' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
