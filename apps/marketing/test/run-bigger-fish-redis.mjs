import {readFileSync, mkdtempSync, writeFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
const source = readFileSync(new URL('../src/lib/bigger-fish-redis.ts', import.meta.url), 'utf8');
const script = source.match(/export const arcadeIncrementScript = `([\s\S]*?)`;/)?.[1];
if (!script) throw new Error('Storage script missing');
const dir = mkdtempSync(join(tmpdir(), 'bigger-fish-redis-'));
try {
  const path = join(dir, 'increment.lua');
  writeFileSync(path, script);
  const result = spawnSync('npm', ['exec', '--yes', '--package=fengari-node-cli@0.1.0', '--', 'fengari', 'test/bigger-fish-redis.lua', path], {encoding:'utf8'});
  process.stdout.write(result.stdout ?? '');
  process.stderr.write(result.stderr ?? '');
  // Fengari may report a Lua assertion error with exit 0, so require the final success marker too.
  if (result.status !== 0 || !result.stdout?.includes('Redis Lua regressions passed:')) process.exitCode = 1;
} finally {
  rmSync(dir, {recursive:true, force:true});
}
