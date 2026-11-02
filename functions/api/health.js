// Cloudflare Pages Function: GET /api/health
// Tells the admin page whether it is running on the server-backed host, so it
// can skip the GitHub token screen entirely.

export async function onRequestGet({ env }) {
  const configured = !!(env.GITHUB_TOKEN && env.GITHUB_OWNER && env.GITHUB_REPO);

  return new Response(JSON.stringify({
    ok: true,
    configured: configured,
    owner: env.GITHUB_OWNER || '',
    repo: env.GITHUB_REPO || '',
    branch: env.GITHUB_BRANCH || 'main',
    player: env.PLAYER_URL || ''
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    }
  });
}
