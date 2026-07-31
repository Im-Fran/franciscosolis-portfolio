import assert from 'node:assert/strict'
import { matchRoute, type Route } from './router.ts'

const noop = async () => new Response('ok')

const routes: Route[] = [
  { method: 'GET', pattern: '/api/stats/github/profile', handler: noop },
  { method: 'GET', pattern: '/api/admin/projects/:id', handler: noop },
  { method: 'DELETE', pattern: '/api/admin/projects/:id', handler: noop },
]

// static route matches
{
  const result = matchRoute(routes, 'GET', '/api/stats/github/profile')
  assert.ok(result, 'expected static route to match')
  assert.deepEqual(result.params, {})
}

// param route matches and captures the param
{
  const result = matchRoute(routes, 'GET', '/api/admin/projects/abc-123')
  assert.ok(result, 'expected param route to match')
  assert.deepEqual(result.params, { id: 'abc-123' })
}

// method must match too, not just the path
{
  const result = matchRoute(routes, 'POST', '/api/admin/projects/abc-123')
  assert.equal(result, null, 'expected no match for wrong method')
}

// unknown path returns null
{
  const result = matchRoute(routes, 'GET', '/api/does-not-exist')
  assert.equal(result, null, 'expected no match for unknown path')
}

// same path, different method, both registered — each resolves to its own route
{
  const getResult = matchRoute(routes, 'GET', '/api/admin/projects/abc-123')
  const deleteResult = matchRoute(routes, 'DELETE', '/api/admin/projects/abc-123')
  assert.ok(getResult && deleteResult)
  assert.notEqual(getResult.route, deleteResult.route)
}

console.log('router.selfcheck: all assertions passed')
