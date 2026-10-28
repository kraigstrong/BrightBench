import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {validateBatch,counterUpdates,report,type Batch} from '../src/lib/bigger-fish-analytics.ts';
import {openWaterLeg,openWaterReport,shopReport,openWaterLevelCap} from '../src/lib/bigger-fish-open-water.ts';
// The Open Water (Bigger Fish's endless run) and the pearl shop: sent only once the app's sendsOpenWaterEvents is on.
const context = {world:'open-water',level:1,setup:1,seed:'0',mode:'endless' as const,revision:'2026-10-25.1'};
const openWater = {levels:6,fish:31,pearls:9,seconds:412.5,best:true,waits:1,waitSeconds:1.25,slowestPlan:2.4,dressed:true};
const batch = (): Batch => ({schema:1,appVersion:'1.1',build:'3',channel:'debug',events:[
  {kind:'endless',context,outcome:'death',cause:'tentacles',openWater:{...openWater},unlocked:true},
  {kind:'endless',context,outcome:'quit',cause:'none',openWater:{...openWater,levels:0,fish:2,pearls:0,seconds:20,best:false,waits:0,waitSeconds:0,dressed:false}},
  {kind:'decision',name:'retry',context,outcome:'death'},
  {kind:'milestone',name:'open_water_started',context},{kind:'milestone',name:'open_water_round',context},
  {kind:'shop',source:'run_card',wallet:140,bought:['hat.cone','trail.hearts'],firstPurchaseRuns:4},
  {kind:'shop',source:'map',wallet:12,bought:[]},
  {kind:'earned',id:'hat.starfish'},
  {kind:'outfit',pieces:['color.mint','hat.cone','trail.hearts']},
]});
type Run = Extract<Batch['events'][number],{kind:'run'}>;
// The report's rows, as the stats page receives them (their context typed).
const rowsOf = (rows: ReturnType<typeof report>) => rows as unknown as Parameters<typeof openWaterReport>[0];
const run = (): Run => ({kind:'run',context:{world:'kelp-forest',level:3,setup:3,mode:'campaign',seed:'7',revision:'r1'},outcome:'win',cause:'none',replay:false,attempt:1,
  summary:{seconds:12,circuits:.5,playerMeals:3,aiMeals:2,closeMeals:2,nearEqualMeals:1,bounces:0,cleanupSeconds:0,longestMealGap:4,noPathSeconds:0,pathRecovered:false,snapshot:{path:'available',playerRadius:25,remaining:0,edible:0,largestRatio:0}}});

test('Open Water runs, the shop, earned looks and outfits are accepted',()=>{
  assert.equal(validateBatch(batch()),true);
  assert.equal(validateBatch({...batch(),events:[{...run(),dressed:true}]}),true);
});

test('they stay strict: one unknown field or value rejects the whole batch',()=>{
  const e = batch().events;
  const endless = e[0]!, shop = e[5]!;
  for(const event of [
    {...endless,context:{...context,mode:'campaign'}},{...endless,outcome:'win'},{...endless,cause:'none'},{...endless,outcome:'quit'},
    {...endless,seed:'123'},{...endless,runID:'x'},{...endless,unlocked:'yes'},{...endless,summary:{}},
    {...endless,openWater:{...openWater,fish:-1}},{...endless,openWater:{...openWater,fish:1.5}},{...endless,openWater:{...openWater,seconds:3601}},
    {...endless,openWater:{...openWater,waits:8}},{...endless,openWater:{...openWater,waitSeconds:500}},{...endless,openWater:{...openWater,slowestPlan:601}},
    {...endless,openWater:{...openWater,best:1}},{...endless,openWater:{...openWater,device:'iPhone'}},
    {kind:'milestone',name:'open_water_started'},{kind:'milestone',name:'open_water_started',context:{...context,mode:'campaign'}},
    {...shop,source:'settings'},{...shop,wallet:-1},{...shop,wallet:100001},{...shop,bought:['Hat Cone']},{...shop,bought:['hat.cone','hat.cone']},
    {...shop,bought:'hat.cone'},{...shop,bought:[],firstPurchaseRuns:3},{...shop,context},{...shop,tried:['hat.cone']},
    {kind:'earned',id:'../x'},{kind:'earned',id:'hat.cone',context},
    {kind:'outfit',pieces:[]},{kind:'outfit',pieces:['hat.cone','hat.crown']},{kind:'outfit',pieces:['hat.cone'],context},
    {...run(),dressed:'yes'},
  ]){
    assert.equal(validateBatch({...batch(),events:[event]}),false,JSON.stringify(event));
    assert.equal(validateBatch({...batch(),events:[...batch().events,event]}),false,JSON.stringify(event));
  }
});

test('a look whose name has dots of its own (the crowns) is accepted and counted under its whole ID',()=>{
  const crowns:Batch={...batch(),events:[{kind:'earned',id:'hat.crown.silver'},{kind:'outfit',pieces:['color.rainbow','hat.crown.diamond']},
    {kind:'shop',source:'map',wallet:300,bought:['color.cotton-candy']}]};
  assert.equal(validateBatch(crowns),true);
  const counts=Object.fromEntries(counterUpdates(crowns).map(u=>[u.field,u.by]));
  assert.equal(counts['install|look.earned.hat.crown.silver'],1);assert.equal(counts['install|look.worn.hat.crown.diamond'],1);
  const s=shopReport(rowsOf(report([{day:'2026-10-25',build:'debug:1.1:3',counts}])));
  assert.deepEqual(s.looks.find(l=>l.id==='hat.crown.diamond'),{id:'hat.crown.diamond',bought:0,earned:0,worn:1});
  assert.equal(s.looks.find(l=>l.id==='color.cotton-candy')!.bought,1);
  assert.equal(s.looks.find(l=>l.id==='hat.crown.silver')!.earned,1);
  // Still one look a kind in an outfit, and still no stray dots or names past 40 characters.
  for(const event of [{kind:'outfit',pieces:['hat.crown.silver','hat.cone']},{kind:'earned',id:'hat.crown..silver'},
    {kind:'earned',id:'hat.crown.'},{kind:'earned',id:'hat..crown'},{kind:'earned',id:'.hat.crown'},{kind:'earned',id:`hat.${'a.'.repeat(20)}b`}]){
    assert.equal(validateBatch({...batch(),events:[event]}),false,JSON.stringify(event));
  }
  assert.equal(validateBatch({...batch(),events:[{kind:'earned',id:`hat.${'a'.repeat(40)}`}]}),true);
});

test('a run is counted where it ended, with a few counters; the shop and looks per install',()=>{
  const counts=Object.fromEntries(counterUpdates(batch()).map(u=>[u.field,u.by]));
  const token=Object.keys(counts).find(k=>k.endsWith('|outcome.death'))!.split('|')[0]!;
  const at=(metric:string)=>counts[`${token}|${metric}`];
  assert.equal(at('ended.7.tentacles'),1);assert.equal(at('ended.1.quit'),1);
  assert.equal(at('death.tentacles'),1);assert.equal(at('hist.death.fish.40'),1);assert.equal(at('sum.death.seconds'),412500);
  assert.equal(at('best'),1);assert.equal(at('planWaits.1'),1);assert.equal(at('planWaits.0'),1);assert.equal(at('slowestPlan.3'),2);
  assert.equal(at('dressed.death'),1);assert.equal(at('plain.quit'),1);assert.equal(at('unlocked.death'),1);
  assert.equal(at('decision.death.retry'),1);assert.equal(at('milestone.open_water_started'),1);
  assert.equal(counts['install|shop.visit.run_card'],1);assert.equal(counts['install|shop.buyingVisit.run_card'],1);
  assert.equal(counts['install|shop.visit.map'],1);assert.equal(counts['install|shop.buyingVisit.map'],undefined);
  assert.equal(counts['install|look.bought.hat.cone'],1);assert.equal(counts['install|shop.firstPurchaseRuns.5'],1);
  assert.equal(counts['install|shop.wallet.150'],1);assert.equal(counts['install|look.earned.hat.starfish'],1);
  assert.equal(counts['install|look.outfits'],1);assert.equal(counts['install|look.worn.color.mint'],1);
  // Every Open Water run shares one content row however many runs there are: the seed is never the run's.
  assert.equal(new Set(Object.keys(counts).map(k=>k.split('|')[0])).size,2);
  // A zero is never written: each counter written is a billed Redis command.
  assert.equal(Object.values(counts).includes(0),false);
  assert.equal(Object.keys(counts).some(k=>k.endsWith('sum.quit.pearls')),false);
  // A run deeper than the cap ends at it, but its levels cleared are summed in full for the mean.
  const deep:Batch={...batch(),events:[{kind:'endless',context,outcome:'death',cause:'tentacles',openWater:{...openWater,levels:200}}]};
  const deepCounts=Object.fromEntries(counterUpdates(deep).map(u=>[u.field.split('|')[1],u.by]));
  assert.equal(deepCounts[`ended.${openWaterLevelCap}.tentacles`],1);assert.equal(deepCounts['sum.death.levels'],200000);
  assert.equal(openWaterReport(rowsOf(report([{day:'2026-10-25',build:'debug:1.1:3',counts:Object.fromEntries(counterUpdates(deep).map(u=>[u.field,u.by]))}]))).mean.levels,200);
});

test('campaign runs report whether the fish was dressed; runs without the field are in neither count',()=>{
  const b:Batch={...batch(),events:[{...run(),dressed:true},{...run(),outcome:'quit',dressed:false}]};
  const updates=counterUpdates(b);
  assert.equal(updates.some(u=>u.field.endsWith('|dressed.win')),true);assert.equal(updates.some(u=>u.field.endsWith('|plain.quit')),true);
  assert.equal(counterUpdates({...batch(),events:[run()]}).some(u=>/\|(dressed|plain)\./.test(u.field)),false);
});

test('the Open Water report adds up the runs reaching each level and labels its world',()=>{
  assert.deepEqual(openWaterLeg(1),{world:'shallow-reef',difficulty:5});
  assert.deepEqual(openWaterLeg(7),{world:'jelly-bloom',difficulty:6});
  const rows=rowsOf(report([{day:'2026-10-25',build:'debug:1.1:3',counts:Object.fromEntries(counterUpdates(batch()).map(u=>[u.field,u.by]))},
    {day:'2026-10-26',build:'debug:1.1:3',counts:{[`${Buffer.from(JSON.stringify(['open-water','endless',1,1,'0','2026-10-25.1'])).toString('base64url')}|ended.3.predator`]:2,
      [`${Buffer.from(JSON.stringify(['open-water','endless',1,1,'0','2026-10-25.1'])).toString('base64url')}|outcome.death`]:2}}]));
  const r=openWaterReport(rows);
  assert.equal(r.runs,4);assert.deepEqual(r.revisions,['2026-10-25.1']);
  assert.deepEqual(r.levels.map(l=>[l.level,l.reached,l.ended]),[[1,4,1],[2,3,0],[3,3,2],[4,1,0],[5,1,0],[6,1,0],[7,1,1]]);
  assert.equal(r.levels[2]!.rate,2/3);assert.deepEqual(r.levels[2]!.endings,{predator:2});assert.equal(r.levels[6]!.world,'jelly-bloom');
  assert.equal(r.after.retry,1);assert.equal(r.installs.started,1);assert.equal(r.best,1);
  assert.equal(r.dressed,1);assert.equal(r.plain,1);
  assert.equal(r.fish.find(h=>h.bound===40)!.runs,1);assert.equal(r.fish.find(h=>h.bound===5)!.runs,1);
  // Only runs with sums are in a mean's numerator; every run is in its denominator.
  assert.equal(r.mean.fish,(31+2)/4);assert.equal(r.mean.levels,6/4);
  // Another revision is kept apart when one is chosen.
  assert.equal(openWaterReport(rows,'2026-01-01.1').runs,0);
});

test('the shop report pools visits, purchases per look, and dressed runs by mode',()=>{
  const counts=Object.fromEntries(counterUpdates({...batch(),events:[...batch().events,{...run(),dressed:true}]}).map(u=>[u.field,u.by]));
  const s=shopReport(rowsOf(report([{day:'2026-10-25',build:'debug:1.1:3',counts}])));
  assert.deepEqual(s.visits,{map:1,run_card:1});assert.deepEqual(s.buyingVisits,{map:0,run_card:1});
  assert.deepEqual(s.looks.slice(0,2).map(l=>l.id),['hat.cone','trail.hearts']);
  assert.deepEqual(s.looks.find(l=>l.id==='hat.cone'),{id:'hat.cone',bought:1,earned:0,worn:1});
  assert.equal(s.looks.find(l=>l.id==='hat.starfish')!.earned,1);
  assert.equal(s.outfits,1);assert.equal(s.firstPurchaseRuns.find(h=>h.bound===5)!.runs,1);
  assert.deepEqual(s.dressed,{campaign:{dressed:1,plain:0},openWater:{dressed:1,plain:1}});
});

test('accept the real Swift-encoded Open Water and shop fixture, which sends every kind and field',()=>{
  // Written by the app's ArcadeOpenWaterMetricsTests to /private/tmp/arcade-open-water-contract.json.
  const payload=JSON.parse(readFileSync(new URL('./fixtures/bigger-fish-swift-open-water.json',import.meta.url),'utf8'));
  assert.equal(validateBatch(payload),true);
  const kinds=new Set((payload.events as {kind:string}[]).map(e=>e.kind));
  for(const kind of ['endless','shop','earned','outfit','run','milestone','decision'])assert.equal(kinds.has(kind),true,kind);
  const endless=(payload.events as {kind:string;context?:{seed:string}}[]).filter(e=>e.kind==='endless');
  assert.equal(endless.every(e=>e.context!.seed==='0'),true);
});
