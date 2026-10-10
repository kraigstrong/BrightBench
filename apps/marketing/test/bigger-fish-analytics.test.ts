import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {validateBatch,counterUpdates,handleEvents,handleStats,report,type Batch,type ArcadeStore} from '../src/lib/bigger-fish-analytics.ts';
const sample = (): Batch => ({schema:1,appVersion:'0.1',build:'2',channel:'testflight',events:[{kind:'run',context:{world:'future-world',level:1000,setup:1000,mode:'campaign',seed:'20261477',revision:'future.1'},outcome:'death',cause:'predator',replay:false,attempt:2,summary:{seconds:12,circuits:.5,playerMeals:3,aiMeals:2,closeMeals:2,nearEqualMeals:1,bounces:0,cleanupSeconds:0,longestMealGap:4,noPathSeconds:0,pathRecovered:false,snapshot:{path:'available',playerRadius:25,remaining:3,edible:1,largestRatio:1.5},fatalRatio:1.2}}]});
const store = (): ArcadeStore => ({write:async()=>true,read:async()=>[]});
test('strict anonymous schema supports future worlds, large campaigns and endless mode',()=>{
  const b=sample();assert.equal(validateBatch(b),true);
  b.events[0]!.context!.mode='endless';assert.equal(validateBatch(b),true);
  for(const key of ['playerID','installID','sessionID','timestamp','device','trajectory']){
    assert.equal(validateBatch({...b,[key]:'private'}),false);
    assert.equal(validateBatch({...b,events:[{...b.events[0],[key]:'private'}]}),false);
  }
});
test('reject inconsistent counts, fatal metadata and nonfinite/out-of-range metrics',()=>{
  for(const change of [{seconds:-1},{nearEqualMeals:4},{cleanupSeconds:13},{fatalRatio:Infinity},{firstNoPathSeconds:5}]){
    const b=sample();if(b.events[0]!.kind==='run')Object.assign(b.events[0]!.summary,change);
    assert.equal(validateBatch(b),false);
  }
});
test('store receives only counters, not individual run bodies; success rates state denominators',()=>{
  const b=sample();const updates=counterUpdates(b);assert.equal(updates.some(u=>u.field.includes('deathPath.available')),true);
  const counts=Object.fromEntries(updates.map(u=>[u.field,u.by]));
  const prefix=updates[0]!.field.split('|')[0]!;
  counts[`${prefix}|outcome.win`]=1;counts[`${prefix}|outcome.quit`]=2;
  const rows=report([{day:'2026-10-04',build:'testflight:0.1:2',counts}]);
  assert.equal(rows[0]!.successRate,.5);assert.equal(rows[0]!.allEndedSuccessRate,.25);assert.equal(rows[0]!.deathsWithGrowthPathRate,1);
  assert.equal(rows[0]!.attempts,4);
});
test('report rows sort by world in campaign order, then level, then newest build',()=>{
  const row=(world:string,level:number,build:string)=>({day:'2026-10-04',build,counts:{[`${Buffer.from(JSON.stringify([world,'campaign',level,level,'1','r1'])).toString('base64url')}|outcome.win`]:1}});
  const rows=report([row('kelp-forest',1,'testflight:0.2:3'),row('future-world',1,'testflight:0.2:3'),row('shallow-reef',10,'testflight:0.2:3'),
    row('shallow-reef',2,'testflight:0.1:2'),row('midnight-zone',1,'testflight:0.2:3'),row('jelly-bloom',1,'testflight:0.2:3'),row('shallow-reef',2,'testflight:0.2:10'),row('shallow-reef',2,'testflight:0.2:3'),
    row('shallow-reef',3,'testflight:1.2:10'),row('shallow-reef',3,'testflight:1.2.1:1')]);
  assert.deepEqual(rows.map(r=>{const c=r.context as {world:string;level:number};return `${c.world} ${c.level} ${r.build}`;}),[
    'shallow-reef 2 testflight:0.2:10','shallow-reef 2 testflight:0.2:3','shallow-reef 2 testflight:0.1:2',
    'shallow-reef 3 testflight:1.2.1:1','shallow-reef 3 testflight:1.2:10','shallow-reef 10 testflight:0.2:3',
    'jelly-bloom 1 testflight:0.2:3','kelp-forest 1 testflight:0.2:3','midnight-zone 1 testflight:0.2:3','future-world 1 testflight:0.2:3']);
});
test('ingestion fails closed without keys and rejects oversized/unvalidated payloads',async()=>{
  const req=(body:unknown,key='key')=>new Request('https://example.test/events',{method:'POST',headers:{'X-App-Key':key},body:JSON.stringify(body)});
  assert.equal((await handleEvents(req(sample()),{store:store(),appKey:''})).status,401);
  assert.equal((await handleEvents(req(sample()),{store:store(),appKey:'key'})).status,204);
  assert.equal((await handleEvents(req({...sample(),sessionID:'bad'}),{store:store(),appKey:'key'})).status,400);
  assert.equal((await handleEvents(req('x'.repeat(70000)),{store:store(),appKey:'key'})).status,413);
});
test('stats authentication, invalid dates and default beta-only filtering',async()=>{
  const req=(params:string,auth='Bearer secret')=>new Request('https://example.test/stats'+params,{headers:{Authorization:auth}});
  assert.equal((await handleStats(req(''),{store:store(),secret:''})).status,401);
  for(const params of ['?to=bad','?to=2026-02-30','?from=2026-10-05&to=2026-10-04','?from=2026-07-06&to=2026-10-04'])assert.equal((await handleStats(req(params),{store:store(),secret:'secret'})).status,400);
  // The page's longest range, 90 days counting both ends, is the whole retention window.
  let read:string[]=[];const all=store();all.read=async days=>{read=days;return [];};
  assert.equal((await handleStats(req('?from=2026-07-07&to=2026-10-04'),{store:all,secret:'secret'})).status,200);assert.equal(read.length,90);
  const updates=counterUpdates(sample());const counts=Object.fromEntries(updates.map(u=>[u.field,u.by]));
  const s=store();s.read=async()=>[{day:'2026-10-04',build:'debug:0.1:2',counts},{day:'2026-10-04',build:'testflight:0.1:2',counts}];
  const response=await handleStats(req('?to=2026-10-04'),{store:s,secret:'secret'});
  const body=await response.json();assert.equal(body.rows.length,1);assert.equal(body.rows[0].build,'testflight:0.1:2');
});

test('accept the real Swift-encoded client contract fixture',()=>{
  const payload=JSON.parse(readFileSync(new URL('./fixtures/bigger-fish-swift.json',import.meta.url),'utf8'));
  assert.equal(validateBatch(payload),true);
  assert.equal(payload.events.find((e:{kind:string})=>e.kind==='run').context.seed,'20261477');
});
