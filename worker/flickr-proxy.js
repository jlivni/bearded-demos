// Cloudflare Worker: proxies flickr.photos.search so the Flickr key stays server-side.
// Secret: FLICKR_KEY (wrangler secret put FLICKR_KEY)
const ALLOWED_ORIGINS = ['https://jlivni.github.io', 'http://jlivni.github.io:8123', 'http://localhost:8123'];
const ALLOWED_PARAMS = ['bbox', 'has_geo', 'sort', 'per_page', 'extras'];

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    if (!ALLOWED_ORIGINS.includes(origin)) {
      return new Response('forbidden', { status: 403 });
    }
    const cors = { 'Access-Control-Allow-Origin': origin, 'Vary': 'Origin' };
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: { ...cors, 'Access-Control-Allow-Methods': 'GET' } });
    }

    const incoming = new URL(request.url).searchParams;
    const params = new URLSearchParams({
      method: 'flickr.photos.search',
      api_key: env.FLICKR_KEY,
      format: 'json',
      nojsoncallback: '1'
    });
    for (const k of ALLOWED_PARAMS) {
      if (incoming.has(k)) params.set(k, incoming.get(k));
    }
    if (Number(params.get('per_page')) > 50) params.set('per_page', '50');

    const upstream = await fetch('https://www.flickr.com/services/rest/?' + params, {
      cf: { cacheTtl: 3600, cacheEverything: true }
    });
    return new Response(upstream.body, {
      status: upstream.status,
      headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' }
    });
  }
};
