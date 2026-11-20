import { Env } from '../_db';
import { getCookie, clearSessionCookie } from '../_auth';
import { hashToken } from '../_crypto';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const sessionToken = getCookie(context.request, 'ratnadwip_admin_session');
    if (sessionToken) {
      const tokenHash = await hashToken(sessionToken);
      await context.env.DB.prepare('DELETE FROM admin_sessions WHERE session_token_hash = ?').bind(tokenHash).run();
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': clearSessionCookie(),
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': clearSessionCookie(),
      },
    });
  }
};

