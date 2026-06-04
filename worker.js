// Cloudflare Worker - overhead-proxy
// Handles OpenSky OAuth2 token exchange and proxies API requests.
// Credentials are stored as Cloudflare environment variable secrets,
// never in the app source code.

const TOKEN_URL = 'https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token';
const API_BASE  = 'https://opensky-network.org/api/states/all';

// Simple in-memory token cache (lives for the duration of the Worker instance)
let cachedToken = null;
let tokenExpiry  = 0;

async function getToken(env) {
  const now = Date.now();
  if (cachedToken && now < tokenExpiry - 30000) {
    return cachedToken;
  }

  const body = new URLSearchParams({
    grant_type:    'client_credentials',
    client_id:     env.OPENSKY_CLIENT_ID,
    client_secret: env.OPENSKY_CLIENT_SECRET,
  });

  const resp = await fetch(TOKEN_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    body.toString(),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Token fetch failed: ${resp.status} - ${text}`);
  }

  const data = await resp.json();
  cachedToken = data.access_token;
  tokenExpiry  = now + (data.expires_in * 1000);
  return cachedToken;
}

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': '*',
};

export default {
  async fetch(request, env) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    const url    = new URL(request.url);
    const lamin  = url.searchParams.get('lamin');
    const lomin  = url.searchParams.get('lomin');
    const lamax  = url.searchParams.get('lamax');
    const lomax  = url.searchParams.get('lomax');

    if (!lamin || !lomin || !lamax || !lomax) {
      return new Response(JSON.stringify({ error: 'Missing bounding box params' }), {
        status: 400, headers: { ...CORS, 'Content-Type': 'application/json' }
      });
    }

    let token;
    try {
      token = await getToken(env);
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Token error', detail: e.message }), {
        status: 502, headers: { ...CORS, 'Content-Type': 'application/json' }
      });
    }

    const apiUrl  = `${API_BASE}?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`;
    const apiResp = await fetch(apiUrl, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const text = await apiResp.text();
    return new Response(text, {
      status: apiResp.status,
      headers: { ...CORS, 'Content-Type': 'application/json' }
    });
  }
};
