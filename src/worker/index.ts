import type { Env } from './env'
import type { HttpResponse } from '../interfaces/http-response'
import statRoutes from './stats'

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    const statRoute = statRoutes[url.pathname]
    if (statRoute) {
      try {
        const data = await statRoute(env)
        return Response.json({ status: 200, data } satisfies HttpResponse<unknown>)
      } catch {
        return Response.json({ status: 500, error: 'Failed to fetch stat' } satisfies HttpResponse<never>, { status: 500 })
      }
    }

    if (url.pathname.startsWith('/api/')) {
      return Response.json({ status: 404, error: 'Not found' }, {
        status: 404,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      })
    }

    // Not an API route: fall back to the static site (SPA routing/real 404s)
    return env.ASSETS.fetch(request)
  },
} satisfies ExportedHandler<Env>
