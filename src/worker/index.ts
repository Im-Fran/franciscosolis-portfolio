import type { Env } from './env'
import { handleRequest } from './router'
import statRoutes from './stats/routes'
import adminAuthRoutes from './admin/auth/routes'

const allRoutes = [...statRoutes, ...adminAuthRoutes]

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (url.pathname.startsWith('/api/')) {
      return handleRequest(request, env, allRoutes)
    }

    // Not an API route: fall back to the static site (SPA routing/real 404s)
    return env.ASSETS.fetch(request)
  },
} satisfies ExportedHandler<Env>
