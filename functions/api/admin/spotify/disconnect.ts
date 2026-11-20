import { Env } from '../../_db';
import { authenticateAdmin, unauthorizedResponse } from '../../_auth';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const admin = await authenticateAdmin(context.request, context.env.DB);
  if (!admin) return unauthorizedResponse();

  try {
    await context.env.DB.prepare('DELETE FROM spotify_tokens WHERE id = ?').bind('primary').run();

    return new Response(JSON.stringify({ success: true, message: 'Spotify disconnected' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: 'Failed to disconnect Spotify' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

