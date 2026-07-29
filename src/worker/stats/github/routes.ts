import type { Env } from '../../env'
import { getStars, getPRs, getCommits, getGitHubProfile } from '.'

const githubRoutes: Record<string, (env: Env) => Promise<unknown>> = {
  '/api/stats/github/profile': async (env) => {
    const profile = await getGitHubProfile({ GH_TOKEN: env.GH_TOKEN })
    return { repositories: profile.repos.total, followers: profile.followers }
  },
  '/api/stats/github/stars': (env) => getStars({ GH_TOKEN: env.GH_TOKEN }),
  '/api/stats/github/pull-requests': (env) => getPRs({ GH_TOKEN: env.GH_TOKEN }),
  '/api/stats/github/total-commits': (env) => getCommits({ GH_TOKEN: env.GH_TOKEN }),
}

export default githubRoutes
