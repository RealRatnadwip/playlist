import { Env } from '../../_db';
import { authenticateAdmin, unauthorizedResponse } from '../../_auth';
import { generateRandomToken } from '../../_crypto';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const admin = await authenticateAdmin(context.request, context.env.DB);
  if (!admin) return unauthorizedResponse();

  const clientId = context.env.SPOTIFY_CLIENT_ID;
  const redirectUri = context.env.SPOTIFY_REDIRECT_URI || `${new URL(context.request.url).origin}/api/admin/spotify/callback`;

  if (!clientId || clientId === 'replace-with-spotify-client-id') {
    return new Response(
      JSON.stringify({
        error: 'Spotify Client ID is not configured. Please set SPOTIFY_CLIENT_ID in your Cloudflare dashboard or wrangler.toml.',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const scopes = [
    'user-read-currently-playing',
    'user-read-recently-played',
    'user-read-playback-state',
  ].join(' ');

  const state = generateRandomToken(16);

  const authUrl = new URL('https://accounts.spotify.com/authorize');
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('scope', scopes);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('state', state);

  return new Response(
    JSON.stringify({
      authUrl: authUrl.toString(),
      redirectUri,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};

