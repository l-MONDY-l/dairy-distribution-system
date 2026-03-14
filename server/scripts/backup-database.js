/**
 * Backup database to SQL file using pg_dump.
 * Reads DATABASE_URL from server/.env (run from server dir: node scripts/backup-database.js)
 * Output: ../database-backups/dairy_distribution_db_YYYY-MM-DD_HH-mm.sql
 */
const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Load .env manually (server may not have dotenv)
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const idx = line.indexOf('=');
    if (idx <= 0 || line.trimStart().startsWith('#')) return;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
      val = val.slice(1, -1);
    process.env[key] = val;
  });
}

const url = process.env.DATABASE_URL;
if (!url || !url.startsWith('postgres')) {
  console.error('DATABASE_URL not set or not PostgreSQL. Set it in server/.env');
  process.exit(1);
}

let parsed;
try {
  parsed = new URL(url);
} catch (e) {
  console.error('Invalid DATABASE_URL:', e.message);
  process.exit(1);
}

const db = (parsed.pathname || '').replace(/^\//, '').split('?')[0] || 'dairy_distribution_db';
const user = decodeURIComponent(parsed.username || 'postgres');
const host = parsed.hostname || 'localhost';
const port = parsed.port || '5432';
const password = parsed.password ? decodeURIComponent(parsed.password) : '';

const outDir = path.join(__dirname, '..', '..', 'database-backups');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const date = new Date().toISOString().slice(0, 16).replace('T', '_').replace(/:/g, '-');
const outFile = path.join(outDir, `dairy_distribution_db_${date}.sql`);

const pgDumpPaths = [
  path.join(process.env['ProgramFiles'] || 'C:\\Program Files', 'PostgreSQL', '16', 'bin', 'pg_dump.exe'),
  path.join(process.env['ProgramFiles'] || 'C:\\Program Files', 'PostgreSQL', '15', 'bin', 'pg_dump.exe'),
  'pg_dump'
];

let pgDump = pgDumpPaths.find(p => {
  if (p === 'pg_dump') return true;
  try { return fs.existsSync(p); } catch { return false; }
});
if (pgDump !== 'pg_dump' && !fs.existsSync(pgDump)) pgDump = 'pg_dump';

const args = [
  '-h', host,
  '-p', port,
  '-U', user,
  '-d', db,
  '--no-owner', '--no-acl',
  '-f', outFile
];

const env = { ...process.env };
if (password) env.PGPASSWORD = password;

try {
  execFileSync(pgDump, args, { env, stdio: 'inherit' });
  console.log('Backup written to:', outFile);
} catch (err) {
  console.error('Backup failed:', err.message);
  process.exit(1);
}
