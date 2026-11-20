import { getPublicSettings, Env } from '../_db';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const settings = await getPublicSettings(context.env.DB);

    return new Response(JSON.stringify({ settings }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    console.error('Error in /api/settings/public:', error);
    return new Response(JSON.stringify({ error: 'Failed to load settings' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

