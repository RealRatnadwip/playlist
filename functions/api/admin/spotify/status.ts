import { Env } from '../../_db';
import { authenticateAdmin, unauthorizedResponse } from '../../_auth';
import { getValidSpotifyAccessToken } from '../../_spotify';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const admin = await authenticateAdmin(context.request, context.env.DB);
  if (!admin) return unauthorizedResponse();

  try {
    const clientIdConfigured = Boolean(
      context.env.SPOTIFY_CLIENT_ID &&
      context.env.SPOTIFY_CLIENT_ID !== 'replace-with-spotify-client-id'
    );
    const clientSecretConfigured = Boolean(
      context.env.SPOTIFY_CLIENT_SECRET &&
      context.env.SPOTIFY_CLIENT_SECRET !== 'replace-with-spotify-client-secret'
    );

    const tokenRecord = await context.env.DB
      .prepare('SELECT expires_at, updated_at FROM spotify_tokens WHERE id = ?')
      .bind('primary')
      .first<any>();

    let isConnected = false;
    let tokenValid = false;

    if (tokenRecord) {
      isConnected = true;
      try {
        const token = await getValidSpotifyAccessToken(context.env, context.env.DB);
        tokenValid = Boolean(token);
      } catch {
        tokenValid = false;
      }
    }

    const redirectUri = context.env.SPOTIFY_REDIRECT_URI || `${new URL(context.request.url).origin}/api/admin/spotify/callback`;

    return new Response(
      JSON.stringify({
        isConnected,
        tokenValid,
        clientIdConfigured,
        clientSecretConfigured,
        redirectUri,
        lastUpdated: tokenRecord?.updated_at || null,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: 'Failed to inspect Spotify status' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

