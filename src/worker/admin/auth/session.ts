import type { Env } from '../../env'

const COOKIE_NAME = 'fs_admin_session'
const SESSION_DURATION_SECONDS = 7 * 24 * 60 * 60 // 7 días

export const generateSessionToken = (): string => {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export const hashToken = async (token: string): Promise<string> => {
  const data = new TextEncoder().encode(token)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

export const createSession = async (env: Env, adminUserId: number): Promise<{ token: string; expiresAt: Date }> => {
  const token = generateSessionToken()
  const tokenHash = await hashToken(token)
  const expiresAt = new Date(Date.now() + SESSION_DURATION_SECONDS * 1000)

  await env.DB.prepare(
    'INSERT INTO admin_sessions (id, admin_user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)',
  ).bind(crypto.randomUUID(), adminUserId, tokenHash, expiresAt.toISOString()).run()

  return { token, expiresAt }
}

const readCookieToken = (request: Request): string | null => {
  const cookieHeader = request.headers.get('Cookie')
  if (!cookieHeader) return null

  for (const part of cookieHeader.split(';')) {
    const [name, ...rest] = part.trim().split('=')
    if (name === COOKIE_NAME) return rest.join('=')
  }
  return null
}

export const getSessionUser = async (request: Request, env: Env): Promise<{ id: number; username: string } | null> => {
  const token = readCookieToken(request)
  if (!token) return null

  const tokenHash = await hashToken(token)
  const row = await env.DB.prepare(
    `SELECT admin_users.id as id, admin_users.username as username
     FROM admin_sessions
     JOIN admin_users ON admin_users.id = admin_sessions.admin_user_id
     WHERE admin_sessions.token_hash = ? AND admin_sessions.expires_at > ?`,
  ).bind(tokenHash, new Date().toISOString()).first<{ id: number; username: string }>()

  return row ?? null
}

export const deleteSession = async (request: Request, env: Env): Promise<void> => {
  const token = readCookieToken(request)
  if (!token) return

  const tokenHash = await hashToken(token)
  await env.DB.prepare('DELETE FROM admin_sessions WHERE token_hash = ?').bind(tokenHash).run()
}

export const buildSessionCookie = (token: string): string =>
  `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${SESSION_DURATION_SECONDS}`

export const buildExpiredCookie = (): string =>
  `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`
