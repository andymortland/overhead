// Vercel serverless function - api/planes.js
// Handles OpenSky OAuth2 token exchange and proxies state requests.

const TOKEN_URL = 'https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token';
const API_BASE  = 'https://opensky-network.org/api/states/all';

let cachedToken = null;
let tokenExpiry = 0;

async function getToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiry - 30000) {
    return { token: cachedToken, source: 'cache' };
  }

  const clientId     = process.env.OPENSKY_CLIENT_ID;
  const clientSecret = process.env.OPENSKY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(`Env vars missing: CLIENT_ID=${!!clientId} CLIENT_SECRET=${!!clientSecret}`);
  }

  const body = new URLSearchParams({
    grant_type:    'client_credentials',
    client_id:     clientId,
    client_secret: clientSecret,
  });

  let resp;
  try {
    resp = await fetch(TOKEN_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    body.toString(),
    });
  } catch (e) {
    throw new Error(`Token fetch network error: ${e.message}`);
  }

  if (!resp.ok) {
    const text = await resp.text().catch(() => '(unreadable)');
    throw new Error(`Token HTTP ${resp.status}: ${text.substring(0, 200)}`);
  }

  const data  = await resp.json();
  cachedToken = data.access_token;
  tokenExpiry = now + (data.expires_in * 1000);
  return { token: cachedToken, source: 'fresh' };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') return res.status(204).end();

  const { lamin, lomin, lamax, lomax } = req.query;
  if (!lamin || !lomin || !lamax || !lomax) {
    return res.status(400).json({ error: 'Missing bounding box params' });
  }

  const diag = {
    ts:        new Date().toISOString(),
    env:       { hasClientId: !!process.env.OPENSKY_CLIENT_ID, hasClientSecret: !!process.env.OPENSKY_CLIENT_SECRET },
    tokenStep: null,
    apiStep:   null,
  };

  let token, tokenSource;
  try {
    const result = await getToken();
    token        = result.token;
    tokenSource  = result.source;
    diag.tokenStep = { ok: true, source: tokenSource, tokenLength: token.length };
  } catch (e) {
    diag.tokenStep = { ok: false, error: e.message };
    return res.status(502).json({ error: 'Token error', detail: e.message, diag });
  }

  try {
    const apiUrl  = `${API_BASE}?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`;
    diag.apiStep  = { url: apiUrl };

    const apiResp = await fetch(apiUrl, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    diag.apiStep.status = apiResp.status;
    const text = await apiResp.text();

    if (!apiResp.ok) {
      diag.apiStep.errorBody = text.substring(0, 200);
      return res.status(apiResp.status).json({ error: 'OpenSky API error', detail: text.substring(0, 200), diag });
    }

    return res.status(200)
      .setHeader('Content-Type', 'application/json')
      .setHeader('X-Diag-Token-Source', tokenSource)
      .send(text);
  } catch (e) {
    diag.apiStep = { ...diag.apiStep, error: e.message };
    return res.status(502).json({ error: 'API fetch failed', detail: e.message, diag });
  }
}
