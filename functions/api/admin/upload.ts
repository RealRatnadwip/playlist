import { Env } from '../_db';
import { authenticateAdmin, unauthorizedResponse } from '../_auth';
import { generateRandomToken } from '../_crypto';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const admin = await authenticateAdmin(context.request, context.env.DB);
  if (!admin) return unauthorizedResponse();

  try {
    const contentType = context.request.headers.get('content-type') || '';

    // Check if Cloudflare R2 is bound
    if (context.env.MEDIA_BUCKET) {
      if (!contentType.includes('multipart/form-data')) {
        return new Response(JSON.stringify({ error: 'Expected multipart/form-data' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const formData = await context.request.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return new Response(JSON.stringify({ error: 'No file uploaded' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const extension = file.name.split('.').pop() || 'jpg';
      const key = `covers/${Date.now()}-${generateRandomToken(6)}.${extension}`;
      const buffer = await file.arrayBuffer();

      await context.env.MEDIA_BUCKET.put(key, buffer, {
        httpMetadata: { contentType: file.type || 'image/jpeg' },
      });

      const publicUrl = `/cdn/${key}`;
      return new Response(JSON.stringify({ success: true, url: publicUrl }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fallback if R2 is not yet configured: Support direct external URLs or base64 preview
    return new Response(
      JSON.stringify({
        warning: 'Cloudflare R2 (MEDIA_BUCKET) is not currently configured. Please paste an image URL directly or bind MEDIA_BUCKET in wrangler.toml.',
        r2Configured: false,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Upload error:', error);
    return new Response(JSON.stringify({ error: 'Upload failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

