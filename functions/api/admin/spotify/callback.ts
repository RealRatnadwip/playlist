import { Env } from '../../_db';
import { encryptData } from '../../_crypto';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  const redirectTarget = new URL('/admin', url.origin);

  if (error || !code) {
    redirectTarget.searchParams.set('spotify_error', error || 'missing_code');
    return Response.redirect(redirectTarget.toString(), 302);
  }

  const clientId = context.env.SPOTIFY_CLIENT_ID;
  const clientSecret = context.env.SPOTIFY_CLIENT_SECRET;
  const redirectUri = context.env.SPOTIFY_REDIRECT_URI || `${url.origin}/api/admin/spotify/callback`;
  const encryptionKey = context.env.SPOTIFY_TOKEN_ENCRYPTION_KEY || 'default-secret-key-32-chars-long-rnd';

  if (!clientId || !clientSecret) {
    redirectTarget.searchParams.set('spotify_error', 'credentials_not_configured');
    return Response.redirect(redirectTarget.toString(), 302);
  }

  try {
    const basicAuth = btoa(`${clientId}:${clientSecret}`);

    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }).toString(),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error('Spotify token exchange failed:', tokenRes.status, errText);
      redirectTarget.searchParams.set('spotify_error', 'token_exchange_failed');
      return Response.redirect(redirectTarget.toString(), 302);
    }

    const tokenData = await tokenRes.json<any>();
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    const expiresIn = tokenData.expires_in || 3600;
    const now = Date.now();
    const expiresAt = now + expiresIn * 1000;

    if (!refreshToken) {
      redirectTarget.searchParams.set('spotify_error', 'missing_refresh_token');
      return Response.redirect(redirectTarget.toString(), 302);
    }

    const encryptedRefresh = await encryptData(refreshToken, encryptionKey);

    await context.env.DB
      .prepare(`
        INSERT INTO spotify_tokens (id, encrypted_refresh_token, access_token_cache, expires_at, updated_at)
        VALUES ('primary', ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          encrypted_refresh_token = excluded.encrypted_refresh_token,
          access_token_cache = excluded.access_token_cache,
          expires_at = excluded.expires_at,
          updated_at = excluded.updated_at
      `)
      .bind(encryptedRefresh, accessToken, expiresAt, now)
      .run();

    redirectTarget.searchParams.set('spotify', 'connected');
    return Response.redirect(redirectTarget.toString(), 302);
  } catch (err: any) {
    console.error('Spotify callback exception:', err);
    redirectTarget.searchParams.set('spotify_error', 'internal_error');
    return Response.redirect(redirectTarget.toString(), 302);
  }
};

