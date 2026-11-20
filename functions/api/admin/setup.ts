import { Env } from '../_db';
import { hashPassword, generateRandomToken, hashToken } from '../_crypto';
import { createSessionCookie } from '../_auth';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    // Only allow setup if NO admin user currently exists in database
    const existing = await context.env.DB
      .prepare('SELECT COUNT(*) as count FROM admin_users')
      .first<any>();

    if (existing && existing.count > 0) {
      return new Response(
        JSON.stringify({ error: 'Setup is closed. An administrator account already exists.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { username, password } = await context.request.json<any>();

    if (!username || !password || password.length < 8) {
      return new Response(
        JSON.stringify({ error: 'Username is required and password must be at least 8 characters long.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const userId = 'usr-' + generateRandomToken(12);
    const { hash, salt } = await hashPassword(password);
    const now = Date.now();

    await context.env.DB
      .prepare('INSERT INTO admin_users (id, username, password_hash, salt, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(userId, username.trim().toLowerCase(), hash, salt, now, now)
      .run();

    // Auto-login newly created admin
    const sessionToken = generateRandomToken(32);
    const sessionTokenHash = await hashToken(sessionToken);
    const sessionId = 'sess-' + generateRandomToken(16);
    const expiresAt = now + 14 * 24 * 60 * 60 * 1000;

    await context.env.DB
      .prepare('INSERT INTO admin_sessions (id, user_id, session_token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)')
      .bind(sessionId, userId, sessionTokenHash, expiresAt, now)
      .run();

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Admin account initialized successfully.',
        user: { id: userId, username: username.trim().toLowerCase() },
      }),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': createSessionCookie(sessionToken),
        },
      }
    );
  } catch (error: any) {
    console.error('Setup error:', error);
    return new Response(JSON.stringify({ error: 'Failed to initialize admin' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

