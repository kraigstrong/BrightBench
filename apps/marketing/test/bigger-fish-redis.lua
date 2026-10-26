-- Run by test/redis-lua.test.ts (npm test), which passes the production script as arg[1].
-- Executes the production Lua script against a deterministic in-memory Redis command shim.
local increment = assert(loadfile(arg[1]))
local db, expires, calls = {}, {}, 0
redis = {call = function(command, key, ...)
  local args = {...}
  local a, b = args[1], args[2]
  calls = calls + 1
  if command == 'GET' then return db[key] or false end
  if command == 'SCARD' or command == 'HLEN' then local n=0; for _ in pairs(db[key] or {}) do n=n+1 end; return n end
  if command == 'SISMEMBER' or command == 'HEXISTS' then return (db[key] or {})[a] and 1 or 0 end
  if command == 'SMISMEMBER' then local out={}; for i,m in ipairs(args) do out[i]=(db[key] or {})[m] and 1 or 0 end; return out end
  if command == 'SADD' then db[key]=db[key] or {}; local n=0; for _,m in ipairs(args) do if not db[key][m] then n=n+1 end; db[key][m]=true end; return n end
  if command == 'INCRBY' then db[key]=(db[key] or 0)+tonumber(a); return db[key] end
  if command == 'HINCRBY' then db[key]=db[key] or {}; db[key][a]=(db[key][a] or 0)+tonumber(b); return db[key][a] end
  if command == 'EXPIRE' then expires[key]=a; return 1 end
  error('Unsupported Redis command: '..command)
end}
local function write(build, contexts, updates)
  KEYS={'builds','pairs','counts:'..build,'fields'}
  ARGV={build,'7776000',tostring(#contexts)}
  for _,c in ipairs(contexts) do ARGV[#ARGV+1]=c end
  for _,u in ipairs(updates) do ARGV[#ARGV+1]=u[1]; ARGV[#ARGV+1]=tostring(u[2]) end
  return increment()
end
local function reset() db={}; expires={}; calls=0 end
local contexts={}; for i=1,500 do contexts[i]='context'..i end
assert(write('build1',contexts,{{'counter',1}})==1)
assert(redis.call('SCARD','pairs')==500)
-- Reusing known contexts across builds must consume pairs and reject before any write.
assert(write('build2',contexts,{{'counter',1}})==0)
assert(db['counts:build2']==nil and redis.call('SCARD','builds')==1)
assert(write('build1',{'context1'},{{'counter',1}})==1)
assert(db['counts:build1'].counter==2 and db.fields==1)
for _,key in ipairs({'builds','pairs','counts:build1','fields'}) do assert(expires[key]==7776000) end
reset()
-- Duplicate arguments cannot inflate cardinality, even at the exact limit.
assert(write('build1',{'same','same'},{{'same',1},{'same',1}})==1)
assert(redis.call('SCARD','pairs')==1 and db.fields==1 and db['counts:build1'].same==2)
reset()
db.fields=19999
assert(write('build1',{'c'},{{'a',1},{'b',1}})==0)
assert(db.builds==nil and db.pairs==nil and db['counts:build1']==nil and db.fields==19999)
assert(next(expires)==nil)
assert(write('build1',{'c'},{{'a',1}})==1 and db.fields==20000)
assert(write('build1',{'c'},{{'a',1}})==1 and db.fields==20000)
-- Existing context/new build and new histogram bucket both consume the global field budget.
assert(write('build2',{'c'},{{'a',1}})==0)
assert(write('build1',{'c'},{{'new-bucket',1}})==0)
assert(db['counts:build2']==nil and db['counts:build1']['new-bucket']==nil)
reset()
for i=1,20 do assert(write('build'..i,{'c'},{{'a',1}})==1) end
assert(write('build21',{'c'},{{'a',1}})==0)
-- A build already counted today still writes once the day has 20.
assert(write('build20',{'c2'},{{'a',1}})==1 and db['counts:build20'].a==2 and db['counts:build21']==nil)
reset()
-- Pairs filled to exactly 500 across writes are accepted; one more new pair is not, and a known one still is.
local most={}; for i=1,499 do most[i]='context'..i end
assert(write('build1',most,{{'counter',1}})==1)
assert(write('build2',{'context1'},{{'counter',1}})==1 and redis.call('SCARD','pairs')==500)
assert(write('build2',{'context2'},{{'counter',1}})==0)
assert(redis.call('SCARD','pairs')==500 and db['counts:build2'].counter==1)
assert(write('build2',{'context1'},{{'counter',1}})==1 and db['counts:build2'].counter==2)
reset()
-- Cost (Upstash bills each redis.call): a day's first write sets things up, then a write to known builds and contexts
-- costs SISMEMBER, SMISMEMBER, GET and HLEN plus one HINCRBY per counter, and HLEN and INCRBY again if a counter is new.
assert(write('build1',{'c1','c2'},{{'a',1},{'b',2}})==1)
calls=0
assert(write('build1',{'c1','c2'},{{'a',1},{'b',1}})==1)
assert(calls==4+2, 'steady-state write used '..calls..' commands')
calls=0
assert(write('build1',{'c1','c2'},{{'a',1},{'c',5},{'d',1}})==1)
assert(calls==4+3+2, 'write with new counters used '..calls..' commands')
assert(db.fields==4 and db['counts:build1'].a==3 and db['counts:build1'].c==5)
-- A counter left at 0 by writes from before zero increments were dropped isn't counted as new when it grows.
reset()
db['counts:build1']={zero=0}; db.builds={build1=true}; db.pairs={['build1|c']=true}; db.fields=1
assert(write('build1',{'c'},{{'zero',3},{'fresh',1}})==1)
assert(db.fields==2 and db['counts:build1'].zero==3)
-- Expiry is set once, on the day's first write to each key, not again.
expires={}
assert(write('build1',{'c1'},{{'a',1}})==1 and next(expires)==nil)
-- A write with no counters writes nothing.
reset()
assert(write('build1',{'c'},{})==1 and db.builds==nil and db.pairs==nil and calls==0)
print('Redis Lua regressions passed: cross-product cap, field cap, atomic rejection, deduplication, TTL, build cap and cost')
