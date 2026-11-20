import { Env } from '../../../_db';
import { authenticateAdmin, unauthorizedResponse } from '../../../_auth';

export const onRequestPost: PagesFunction<Env, 'id'> = async (context) => {
  const admin = await authenticateAdmin(context.request, context.env.DB);
  if (!admin) return unauthorizedResponse();

  const playlistId = context.params.id as string;

  try {
    const { status } = await context.request.json<any>();

    if (!['published', 'draft', 'archived'].includes(status)) {
      return new Response(JSON.stringify({ error: 'Invalid status. Must be draft, published, or archived.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const now = Date.now();
    const publishedAt = status === 'published' ? now : null;

    await context.env.DB
      .prepare(`
        UPDATE playlists 
        SET status = ?, 
            updated_at = ?, 
            published_at = CASE WHEN ? = 'published' AND published_at IS NULL THEN ? ELSE published_at END
        WHERE id = ?
      `)
      .bind(status, now, status, now, playlistId)
      .run();

    return new Response(JSON.stringify({ success: true, status }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: 'Failed to change playlist status' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

