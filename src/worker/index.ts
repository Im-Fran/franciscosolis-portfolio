import type { Env } from './env'
import type { GitHubStats, HttpResponse } from '../interfaces'

const MOCK_GITHUB_STATS: HttpResponse<GitHubStats> = { 
  status: 200,
  data: {
    repositories: 10,
    stars: 100,
    followers: 3200,
    total_commits: 500,
    pull_requests: 50
  }
}

function getGitHubStats(): Response {
  return Response.json(MOCK_GITHUB_STATS, {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (url.pathname === '/api/stats/github') {
      return getGitHubStats()
    }

    // Not found
    return Response.json({ status: 404, error: 'Not found' }, {
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    })
  },
} satisfies ExportedHandler<Env>
