import type { Env } from './env'

export type RouteHandler = (ctx: { env: Env; params: Record<string, string>; request: Request }) => Promise<Response>

export type Route = { method: string; pattern: string; handler: RouteHandler }

export const matchRoute = (
  routes: Route[],
  method: string,
  pathname: string,
): { route: Route; params: Record<string, string> } | null => {
  const pathSegments = pathname.split('/').filter(Boolean)

  for (const route of routes) {
    if (route.method !== method) continue

    const patternSegments = route.pattern.split('/').filter(Boolean)
    if (patternSegments.length !== pathSegments.length) continue

    const params: Record<string, string> = {}
    let matched = true

    for (let i = 0; i < patternSegments.length; i++) {
      const patternSegment = patternSegments[i]
      const pathSegment = pathSegments[i]

      if (patternSegment.startsWith(':')) {
        params[patternSegment.slice(1)] = pathSegment
      } else if (patternSegment !== pathSegment) {
        matched = false
        break
      }
    }

    if (matched) return { route, params }
  }

  return null
}

export const handleRequest = async (request: Request, env: Env, routes: Route[]): Promise<Response> => {
  const url = new URL(request.url)
  const match = matchRoute(routes, request.method, url.pathname)

  if (!match) {
    return Response.json({ status: 404, error: 'Not found' }, {
      status: 404,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    })
  }

  return match.route.handler({ env, params: match.params, request })
}
