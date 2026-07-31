import bcrypt from 'bcryptjs'
import { execFileSync } from 'node:child_process'

const [, , username, password, ...flags] = process.argv
const isLocal = flags.includes('--local')

if (!username || !password) {
  console.error('Usage: node scripts/create-admin-user.ts <username> <password> [--local]')
  process.exit(1)
}

const passwordHash = bcrypt.hashSync(password, 12)
const sql = `INSERT INTO admin_users (username, password_hash) VALUES ('${username.replace(/'/g, "''")}', '${passwordHash.replace(/'/g, "''")}')`

const args = ['exec', 'wrangler', 'd1', 'execute', 'franciscosolis', ...(isLocal ? ['--local'] : []), '--command', sql]

console.log(`Creating admin user "${username}" (${isLocal ? 'local' : 'remote'} D1)...`)
execFileSync('pnpm', args, { stdio: 'inherit' })
console.log('Done.')
