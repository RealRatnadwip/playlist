import { Env } from '../_db';
import { authenticateAdmin, unauthorizedResponse } from '../_auth';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const admin = await authenticateAdmin(context.request, context.env.DB);
    if (!admin) {
      return unauthorizedResponse();
    }

    return new Response(
      JSON.stringify({
        authenticated: true,
        user: {
          id: admin.id,
          username: admin.username,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    return unauthorizedResponse();
  }
};

