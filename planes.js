// Vercel serverless function - api/planes.js
// Handles OpenSky OAuth2 token exchange and proxies state requests.
// OPENSKY_CLIENT_ID and OPENSKY_CLIENT_SECRET are set as Vercel env vars.

const TOKEN_URL = 'https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token';
const API_BASE  = 'https://opensky-network.org/api/states/all';

// Module-level token cache (persists across warm invocations)
let cachedToken  = null;
let tokenExpiry  = 0;

async function getToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiry - 30000) {
    return cachedToken;
  }

  const body = new URLSearchParams({
    grant_type:    'client_credentials',
    client_id:     process.env.OPENSKY_CLIENT_ID,
    client_secret: process.env.OPENSKY_CLIENT_SECRET,
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

  const data   = await resp.json();
  cachedToken  = data.access_token;
  tokenExpiry  = now + (data.expires_in * 1000);
  return cachedToken;
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const { lamin, lomin, lamax, lomax } = req.query;

  if (!lamin || !lomin || !lamax || !lomax) {
    return res.status(400).json({ error: 'Missing bounding box params' });
  }

  let token;
  try {
    token = await getToken();
  } catch (e) {
    return res.status(502).json({ error: 'Token error', detail: e.message });
  }

  try {
    const apiUrl  = `${API_BASE}?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`;
    const apiResp = await fetch(apiUrl, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const text = await apiResp.text();
    return res.status(apiResp.status)
              .setHeader('Content-Type', 'application/json')
              .send(text);
  } catch (e) {
    return res.status(502).json({ error: 'API fetch failed', detail: e.message });
  }
}
