import { Env } from '../_db';
import { authenticateAdmin, unauthorizedResponse } from '../_auth';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const admin = await authenticateAdmin(context.request, context.env.DB);
  if (!admin) return unauthorizedResponse();

  try {
    const { results } = await context.env.DB.prepare('SELECT key, value FROM site_settings').all();
    const settings: Record<string, string> = {};
    for (const row of results || []) {
      settings[(row as any).key] = (row as any).value;
    }
    return new Response(JSON.stringify({ settings }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: 'Failed to retrieve settings' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const admin = await authenticateAdmin(context.request, context.env.DB);
  if (!admin) return unauthorizedResponse();

  try {
    const { settings } = await context.request.json<any>();
    if (!settings || typeof settings !== 'object') {
      return new Response(JSON.stringify({ error: 'Invalid settings object' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const now = Date.now();
    for (const [key, value] of Object.entries(settings)) {
      if (typeof value !== 'string') continue;
      await context.env.DB
        .prepare('INSERT OR REPLACE INTO site_settings (key, value, updated_at) VALUES (?, ?, ?)')
        .bind(key, value, now)
        .run();
    }

    return new Response(JSON.stringify({ success: true, message: 'Settings saved' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: 'Failed to save settings' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

