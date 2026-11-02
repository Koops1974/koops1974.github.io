// Cloudflare Pages Function: /api/github
//
// A thin proxy in front of the GitHub Contents API so the admin page never
// holds a token. The token lives in the Pages project as an encrypted
// environment variable (GITHUB_TOKEN).
//
//   GET  /api/github?path=playlist.json&ref=main
//   GET  /api/github?path=                  (list the repo root)
//   PUT  /api/github   { path, content, message, sha?, branch? }
//
// Responses are passed straight through from GitHub, so the admin page sees
// normal 404 / 409 / 422 codes.

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  });
}

function config(env) {
  return {
    owner: env.GITHUB_OWNER || '',
    repo: env.GITHUB_REPO || '',
    branch: env.GITHUB_BRANCH || 'main',
    token: env.GITHUB_TOKEN || ''
  };
}

function missingConfig(cfg) {
  return !cfg.owner || !cfg.repo || !cfg.token;
}

function contentsUrl(cfg, filePath, ref) {
  var p = String(filePath || '')
    .split('/')
    .filter(function (s) { return s && s !== '.' && s !== '..'; })
    .map(encodeURIComponent)
    .join('/');

  var url = 'https://api.github.com/repos/' +
    encodeURIComponent(cfg.owner) + '/' +
    encodeURIComponent(cfg.repo) + '/contents/' + p;

  if (ref) url += '?ref=' + encodeURIComponent(ref);
  return url;
}

function ghHeaders(cfg, extra) {
  var h = {
    'Authorization': 'Bearer ' + cfg.token,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'signage-admin'
  };
  if (extra) {
    for (var k in extra) h[k] = extra[k];
  }
  return h;
}

function passThrough(res) {
  return res.text().then(function (text) {
    return new Response(text, {
      status: res.status,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
    });
  });
}

export async function onRequestGet({ request, env }) {
  var cfg = config(env);
  if (missingConfig(cfg)) return json({ message: 'Server missing GITHUB_OWNER / GITHUB_REPO / GITHUB_TOKEN' }, 500);

  var url = new URL(request.url);
  var ref = url.searchParams.get('ref') || cfg.branch;
  var filePath = url.searchParams.get('path') || '';

  var res = await fetch(contentsUrl(cfg, filePath, ref), { headers: ghHeaders(cfg) });
  return passThrough(res);
}

export async function onRequestPut({ request, env }) {
  var cfg = config(env);
  if (missingConfig(cfg)) return json({ message: 'Server missing GITHUB_OWNER / GITHUB_REPO / GITHUB_TOKEN' }, 500);

  var self = new URL(request.url).origin;
  var origin = request.headers.get('Origin');
  if (origin && origin !== self) return json({ message: 'Cross-origin writes are not allowed' }, 403);

  var body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ message: 'Invalid JSON body' }, 400);
  }

  if (!body || typeof body.path !== 'string' || !body.path) return json({ message: 'Missing path' }, 400);
  if (typeof body.content !== 'string') return json({ message: 'Missing content' }, 400);

  var payload = {
    message: body.message || 'Update signage',
    content: body.content,
    branch: body.branch || cfg.branch
  };
  if (body.sha) payload.sha = body.sha;

  var res = await fetch(contentsUrl(cfg, body.path, ''), {
    method: 'PUT',
    headers: ghHeaders(cfg, { 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload)
  });
  return passThrough(res);
}

export async function onRequest({ request }) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204 });
  return json({ message: 'Method not allowed' }, 405);
}
