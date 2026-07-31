import bcrypt from 'bcryptjs'
import type { Route } from '../../router'
import type { HttpResponse } from '../../../interfaces/http-response'
import { createSession, getSessionUser, deleteSession, buildSessionCookie, buildExpiredCookie } from './session'

const LOCKOUT_THRESHOLD = 5
const LOCKOUT_MINUTES = 15

type AdminUserRow = {
  id: number
  username: string
  password_hash: string
  failed_attempts: number
  locked_until: string | null
}

const jsonError = (status: number, error: string) =>
  Response.json({ status, error } satisfies HttpResponse<never>, { status })

const loginRoute: Route = {
  method: 'POST',
  pattern: '/api/admin/auth/login',
  handler: async ({ request, env }) => {
    const body = await request.json() as { username?: string; password?: string }
    if (!body.username || !body.password) return jsonError(400, 'Missing username or password')

    const user = await env.DB.prepare(
      'SELECT id, username, password_hash, failed_attempts, locked_until FROM admin_users WHERE username = ?',
    ).bind(body.username).first<AdminUserRow>()

    if (!user) return jsonError(401, 'Invalid credentials')

    if (user.locked_until && new Date(user.locked_until).getTime() > Date.now()) {
      return jsonError(429, 'Too many attempts')
    }

    const valid = await bcrypt.compare(body.password, user.password_hash)

    if (!valid) {
      const nextAttempts = user.failed_attempts + 1
      if (nextAttempts >= LOCKOUT_THRESHOLD) {
        const lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000).toISOString()
        await env.DB.prepare('UPDATE admin_users SET failed_attempts = 0, locked_until = ? WHERE id = ?')
          .bind(lockedUntil, user.id).run()
      } else {
        await env.DB.prepare('UPDATE admin_users SET failed_attempts = ? WHERE id = ?')
          .bind(nextAttempts, user.id).run()
      }
      return jsonError(401, 'Invalid credentials')
    }

    await env.DB.prepare('UPDATE admin_users SET failed_attempts = 0, locked_until = NULL WHERE id = ?')
      .bind(user.id).run()

    const { token } = await createSession(env, user.id)

    const response = Response.json({
      status: 200,
      data: { id: user.id, username: user.username },
    } satisfies HttpResponse<{ id: number; username: string }>)
    response.headers.append('Set-Cookie', buildSessionCookie(token))
    return response
  },
}

const logoutRoute: Route = {
  method: 'POST',
  pattern: '/api/admin/auth/logout',
  handler: async ({ request, env }) => {
    await deleteSession(request, env)
    const response = Response.json({ status: 200, data: {} } satisfies HttpResponse<Record<string, never>>)
    response.headers.append('Set-Cookie', buildExpiredCookie())
    return response
  },
}

const meRoute: Route = {
  method: 'GET',
  pattern: '/api/admin/auth/me',
  handler: async ({ request, env }) => {
    const user = await getSessionUser(request, env)
    if (!user) return jsonError(401, 'Not authenticated')
    return Response.json({ status: 200, data: user } satisfies HttpResponse<{ id: number; username: string }>)
  },
}

const adminAuthRoutes: Route[] = [loginRoute, logoutRoute, meRoute]

export default adminAuthRoutes
