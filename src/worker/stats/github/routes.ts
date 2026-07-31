import type { Route } from '../../router'
import type { HttpResponse } from '../../../interfaces/http-response'
import { getStars, getPRs, getCommits, getGitHubProfile } from '.'

const jsonRoute = (pattern: string, fetcher: (env: import('../../env').Env) => Promise<unknown>): Route => ({
  method: 'GET',
  pattern,
  handler: async ({ env }) => {
    try {
      const data = await fetcher(env)
      return Response.json({ status: 200, data } satisfies HttpResponse<unknown>)
    } catch {
      return Response.json({ status: 500, error: 'Failed to fetch stat' } satisfies HttpResponse<never>, { status: 500 })
    }
  },
})

const githubRoutes: Route[] = [
  jsonRoute('/api/stats/github/profile', async (env) => {
    const profile = await getGitHubProfile({ GH_TOKEN: env.GH_TOKEN })
    return { repositories: profile.repos.total, followers: profile.followers }
  }),
  jsonRoute('/api/stats/github/stars', (env) => getStars({ GH_TOKEN: env.GH_TOKEN })),
  jsonRoute('/api/stats/github/pull-requests', (env) => getPRs({ GH_TOKEN: env.GH_TOKEN })),
  jsonRoute('/api/stats/github/total-commits', (env) => getCommits({ GH_TOKEN: env.GH_TOKEN })),
]

export default githubRoutes
