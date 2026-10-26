import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {arcadeIncrementScript} from '../src/lib/bigger-fish-redis.ts';
import {doublePuttIncrementScript} from '../src/lib/double-putt-redis.ts';
// The storage limiter regressions run each production ingest script against the in-memory Redis command shim in
// test/<game>-redis.lua, under the Fengari Lua interpreter: the caps, atomic rejection, TTL and the per-write command
// cost Upstash bills. Nothing connects to Redis; live Upstash behavior stays a release check.
const fengari = createRequire(import.meta.url).resolve('fengari-node-cli/src/lua-cli.js');
function runLua(regressions: string, script: string) {
  const dir = mkdtempSync(join(tmpdir(), 'redis-lua-'));
  try {
    const path = join(dir, 'increment.lua');
    writeFileSync(path, script);
    const result = spawnSync(process.execPath, [fengari, fileURLToPath(new URL(regressions, import.meta.url)), path], {encoding:'utf8'});
    // Fengari may report a Lua assertion error with exit 0, so require the final success marker too.
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Redis Lua regressions passed:/, result.stderr || result.stdout);
  } finally {
    rmSync(dir, {recursive:true, force:true});
  }
}

test('Bigger Fish ingest script keeps its caps and per-write command cost',()=>{
  runLua('./bigger-fish-redis.lua', arcadeIncrementScript);
});

test('Double Putt ingest script keeps its caps and per-write command cost',()=>{
  runLua('./double-putt-redis.lua', doublePuttIncrementScript);
});
