-- Run from apps/marketing: node test/run-bigger-fish-redis.mjs
-- Executes the production Lua script against a deterministic in-memory Redis command shim.
local increment = assert(loadfile(arg[1]))
local db, expires = {}, {}
redis = {call = function(command, key, a, b)
  if command == 'GET' then return db[key] or false end
  if command == 'SCARD' then local n=0; for _ in pairs(db[key] or {}) do n=n+1 end; return n end
  if command == 'SISMEMBER' or command == 'HEXISTS' then return (db[key] or {})[a] and 1 or 0 end
  if command == 'SADD' then db[key]=db[key] or {}; db[key][a]=true; return 1 end
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
local function reset() db={}; expires={} end
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
print('Redis Lua regressions passed: cross-product cap, field cap, atomic rejection, deduplication, TTL and build cap')
