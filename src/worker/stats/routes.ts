import type { Route } from '../router'
import githubRoutes from './github/routes'

// ponytail: add a new network's stats by dropping a `<network>/routes.ts` (same shape) and spreading it here
const statRoutes: Route[] = [
  ...githubRoutes,
]

export default statRoutes
