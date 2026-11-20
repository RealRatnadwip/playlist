/**
 * Admin authentication middleware and session manager
 */
import { hashToken } from './_crypto';

const SESSION_COOKIE_NAME = 'ratnadwip_admin_session';
const SESSION_DURATION_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

export interface AuthenticatedUser {
  id: string;
  username: string;
}

// Parse cookie header
export function getCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map((c) => c.trim());
  for (const cookie of cookies) {
    const [key, value] = cookie.split('=');
    if (key === name) {
      return decodeURIComponent(value);
    }
  }
  return null;
}

// Create session cookie header string
export function createSessionCookie(token: string, maxAgeMs = SESSION_DURATION_MS): string {
  const expires = new Date(Date.now() + maxAgeMs).toUTCString();
  return `${SESSION_COOKIE_NAME}=${encodeURIComponent(
    token
  )}; Path=/; Expires=${expires}; HttpOnly; SameSite=Lax; Secure`;
}

// Clear session cookie
export function clearSessionCookie(): string {
  return `${SESSION_COOKIE_NAME}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax; Secure`;
}

// Validate session from request
export async function authenticateAdmin(
  request: Request,
  db: D1Database
): Promise<AuthenticatedUser | null> {
  const sessionToken = getCookie(request, SESSION_COOKIE_NAME);
  if (!sessionToken) return null;

  const tokenHash = await hashToken(sessionToken);
  const now = Date.now();

  const session = await db
    .prepare(`
      SELECT s.id as session_id, s.expires_at, u.id as user_id, u.username
      FROM admin_sessions s
      JOIN admin_users u ON s.user_id = u.id
      WHERE s.session_token_hash = ?
      LIMIT 1
    `)
    .bind(tokenHash)
    .first<any>();

  if (!session) return null;

  // Check expiration
  if (session.expires_at < now) {
    // Session expired; delete it
    await db.prepare('DELETE FROM admin_sessions WHERE id = ?').bind(session.session_id).run();
    return null;
  }

  return {
    id: session.user_id,
    username: session.username,
  };
}

// Helper to return standardized unauthorized JSON response
export function unauthorizedResponse(message = 'Unauthorized'): Response {
  return new Response(JSON.stringify({ error: message }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}

