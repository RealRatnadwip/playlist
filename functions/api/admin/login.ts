import { Env } from '../_db';
import { verifyPassword, generateRandomToken, hashToken } from '../_crypto';
import { createSessionCookie } from '../_auth';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { username, password } = await context.request.json<any>();

    if (!username || !password) {
      return new Response(JSON.stringify({ error: 'Username and password are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const user = await context.env.DB
      .prepare('SELECT id, username, password_hash, salt FROM admin_users WHERE username = ?')
      .bind(username.trim().toLowerCase())
      .first<any>();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const isValid = await verifyPassword(password, user.password_hash, user.salt);
    if (!isValid) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Generate secure session
    const sessionToken = generateRandomToken(32);
    const sessionTokenHash = await hashToken(sessionToken);
    const sessionId = 'sess-' + generateRandomToken(16);
    const expiresAt = Date.now() + 14 * 24 * 60 * 60 * 1000; // 14 days

    await context.env.DB
      .prepare('INSERT INTO admin_sessions (id, user_id, session_token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)')
      .bind(sessionId, user.id, sessionTokenHash, expiresAt, Date.now())
      .run();

    const cookieHeader = createSessionCookie(sessionToken);

    return new Response(
      JSON.stringify({
        success: true,
        user: { id: user.id, username: user.username },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': cookieHeader,
        },
      }
    );
  } catch (error: any) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ error: 'Authentication failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

