export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);
    const path = new URL(request.url).pathname;

    // Versioned/static game data can be cached at Cloudflare's edge; HTML remains fresh after a deploy.
    if (path.startsWith('/assets/') || path.startsWith('/js/') || path.endsWith('.css')) {
      headers.set('Cache-Control', 'public, max-age=86400, s-maxage=604800');
    } else {
      headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
    }
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  }
};
