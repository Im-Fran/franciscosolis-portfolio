import bcrypt from 'bcryptjs'
import type { Route } from '../../router'
import type { Env } from '../../env'
import type { HttpResponse } from '../../../interfaces/http-response'
import { createSession, getSessionUser, deleteSession, buildSessionCookie, buildExpiredCookie } from './session'

const jsonError = (status: number, error: string) =>
  Response.json({ status, error } satisfies HttpResponse<never>, { status })

const DUMMY_HASH = bcrypt.hashSync('dummy-password-for-constant-time-compare', 12)

const IP_LOCKOUT_THRESHOLD = 5
const IP_LOCKOUT_MINUTES = 15
// ponytail: accepted tradeoff — anyone who knows the admin username can keep it locked
// indefinitely (20 fails/hour from any IP resets the clock). Fine for a single-admin site
// behind Cloudflare's edge; if it ever bites, unlock with:
// wrangler d1 execute franciscosolis --command "DELETE FROM admin_login_attempts WHERE username = '<user>'"
const ACCOUNT_LOCKOUT_THRESHOLD = 20
const ACCOUNT_LOCKOUT_MINUTES = 60
const GLOBAL_IP_KEY = '*'

const getClientIp = (request: Request): string =>
  request.headers.get('CF-Connecting-IP') ?? 'unknown'

const isLocked = (row: { locked_until: string | null } | null | undefined): boolean =>
  !!row?.locked_until && new Date(row.locked_until).getTime() > Date.now()

const recordFailedAttempt = async (
  env: Env,
  ip: string,
  username: string,
  threshold: number,
  minutes: number,
): Promise<void> => {
  const row = await env.DB.prepare(
    `INSERT INTO admin_login_attempts (ip, username, failed_attempts, locked_until)
     VALUES (?, ?, 1, NULL)
     ON CONFLICT(ip, username) DO UPDATE SET failed_attempts = failed_attempts + 1
     RETURNING failed_attempts`,
  ).bind(ip, username).first<{ failed_attempts: number }>()

  if (row && row.failed_attempts >= threshold) {
    const lockedUntil = new Date(Date.now() + minutes * 60 * 1000).toISOString()
    await env.DB.prepare(
      'UPDATE admin_login_attempts SET failed_attempts = 0, locked_until = ? WHERE ip = ? AND username = ?',
    ).bind(lockedUntil, ip, username).run()
  }
}

const loginRoute: Route = {
  method: 'POST',
  pattern: '/api/admin/auth/login',
  handler: async ({ request, env }) => {
    const body = await request.json() as { username?: string; password?: string }
    if (!body.username || !body.password) return jsonError(400, 'Missing username or password')

    const ip = getClientIp(request)

    const [ipAttempt, accountAttempt] = await Promise.all([
      env.DB.prepare('SELECT locked_until FROM admin_login_attempts WHERE ip = ? AND username = ?')
        .bind(ip, body.username).first<{ locked_until: string | null }>(),
      env.DB.prepare('SELECT locked_until FROM admin_login_attempts WHERE ip = ? AND username = ?')
        .bind(GLOBAL_IP_KEY, body.username).first<{ locked_until: string | null }>(),
    ])

    if (isLocked(ipAttempt) || isLocked(accountAttempt)) {
      return jsonError(429, 'Too many attempts')
    }

    const user = await env.DB.prepare(
      'SELECT id, username, password_hash FROM admin_users WHERE username = ?',
    ).bind(body.username).first<{ id: number; username: string; password_hash: string }>()

    const valid = await bcrypt.compare(body.password, user?.password_hash ?? DUMMY_HASH)

    if (!user) {
      return jsonError(401, 'Invalid credentials')
    }

    if (!valid) {
      await recordFailedAttempt(env, ip, body.username, IP_LOCKOUT_THRESHOLD, IP_LOCKOUT_MINUTES)
      await recordFailedAttempt(env, GLOBAL_IP_KEY, body.username, ACCOUNT_LOCKOUT_THRESHOLD, ACCOUNT_LOCKOUT_MINUTES)
      return jsonError(401, 'Invalid credentials')
    }

    await env.DB.prepare('DELETE FROM admin_login_attempts WHERE username = ? AND (ip = ? OR ip = ?)')
      .bind(body.username, ip, GLOBAL_IP_KEY).run()

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
