import { recordAnalyticsEvent, Env } from '../_db';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    let playlistId: string | undefined;
    try {
      const body = await context.request.json<any>();
      playlistId = body?.playlistId;
    } catch {
      // empty body is fine
    }

    await recordAnalyticsEvent(context.env.DB, 'site_visit', playlistId);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

