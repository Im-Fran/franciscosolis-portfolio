import type { Env } from '../env'
import githubRoutes from './github/routes'

// ponytail: add a new network's stats by dropping a `<network>/routes.ts` (same shape) and merging it here
const statRoutes: Record<string, (env: Env) => Promise<unknown>> = {
  ...githubRoutes,
}

export default statRoutes
