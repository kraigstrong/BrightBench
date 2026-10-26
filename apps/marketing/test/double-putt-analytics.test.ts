import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {validateBatch,upgrade,counterUpdates,contentToken,handleEvents,handleStats,report,medals,unlockSources,type Batch,type Context,type Event,type DoublePuttStore,type Schema1Batch} from '../src/lib/double-putt-analytics.ts';
type HoleEvent = Extract<Event,{kind:'hole'}>;
const context = () => ({course:'midway',hole:2,slug:'springboard',revision:'2026-10-15.1'});
const attempt = (change: Partial<HoleEvent> = {}): HoleEvent => ({kind:'hole',context:context(),mode:'round',outcome:'finished',replay:false,attempt:1,
  strokes:[2,3],par:5,swings:3,mirrorSwings:1,water:0,aces:0,doubleAce:false,seconds:84,...change});
// Every example in the contract (docs/analytics.md in kraigstrong/double-putt).
const everyKind = (): Event[] => [
  {kind:'milestone',name:'first_launch'},
  {kind:'milestone',name:'course_unlocked',course:'thunderhead',revision:'2026-10-15.1'},
  {kind:'milestone',name:'hole_finished',context:context()},
  {kind:'milestone',name:'trophy_won',context:context()},
  attempt(),
  {kind:'round',action:'started',course:'daybreak',revision:'2026-10-15.1',first:true},
  {kind:'round',action:'left',course:'daybreak',revision:'2026-10-15.1',hole:4},
  {kind:'round',action:'finished',course:'daybreak',revision:'2026-10-15.1',strokes:41,par:40,medal:'none',best:true},
];
// The purchase screen, from each place it opens: every one names its course but Settings.
const everyUnlock = (): Event[] => unlockSources.map((source,i): Event => source==='settings'?{kind:'unlock',source,first:true}
  :{kind:'unlock',source,course:'midway',first:i%2===0});
const sample = (events: unknown[] = everyKind()): Batch => ({schema:2,appVersion:'0.1',build:'1',channel:'testflight',events:events as Event[]});
const store = (): DoublePuttStore => ({write:async()=>true,read:async()=>[]});
const counts = (...batches: Batch[]) => {
  const out: Record<string,number> = {};
  for (const b of batches) for (const {field,by} of counterUpdates(b)) out[field] = (out[field] ?? 0) + by;
  return out;
};

test('accepts every event kind in the contract, alone or together',()=>{
  assert.equal(validateBatch(sample()),true);
  for (const e of everyKind()) assert.equal(validateBatch(sample([e])),true,JSON.stringify(e));
  for (const channel of ['debug','testflight','appstore']) assert.equal(validateBatch({...sample(),channel}),true);
  for (const appVersion of ['0.1','1.2.3','999.999.999']) assert.equal(validateBatch({...sample(),appVersion}),true);
  assert.equal(validateBatch({...sample(),build:'123456789'}),true);
  assert.equal(validateBatch(sample(Array.from({length:25},()=>attempt()))),true);
});
test('accepts the edges of every range, future courses, and each mode, outcome and medal',()=>{
  const future = {course:'z'+'a'.repeat(31),hole:9,slug:'h'+'-'.repeat(47),revision:'A.b-9'.padEnd(48,'0')};
  for (const e of [
    attempt({context:future}),attempt({context:{...context(),hole:1}}),
    attempt({mode:'single'}),attempt({outcome:'quit',strokes:[0,0],swings:0,mirrorSwings:0,seconds:0}),
    attempt({outcome:'abandoned',strokes:[99,99],swings:200,mirrorSwings:200,water:200,seconds:3600}),
    attempt({replay:true,attempt:0}),attempt({attempt:1000}),attempt({par:2}),attempt({par:12}),
    attempt({strokes:[1,1],aces:2,doubleAce:true}),attempt({replay:true,attempt:0,strokes:[1,1],aces:2,doubleAce:true}),
    // A double ace is only reported as one when the hole was finished: [1, 1] on a quit is two swings that missed.
    // Unfinished, a 1 in `strokes` is an ace only if that ball went in: one green made in one, the other still out.
    attempt({outcome:'quit',strokes:[1,1]}),
    attempt({outcome:'quit',strokes:[1,3],aces:1}),attempt({outcome:'abandoned',strokes:[1,0],aces:1}),attempt({strokes:[1,2],aces:1}),
    {kind:'milestone',name:'course_unlocked',course:'fireworks',revision:'1'},
    {kind:'round',action:'started',course:'future-course',revision:'2027-01-01.3',first:false},
    {kind:'round',action:'left',course:'daybreak',revision:'1',hole:1},{kind:'round',action:'left',course:'daybreak',revision:'1',hole:9},
    {kind:'round',action:'finished',course:'daybreak',revision:'1',strokes:9,par:18,medal:'gold',best:false},
    {kind:'round',action:'finished',course:'daybreak',revision:'1',strokes:999,par:108,medal:'silver',best:true},
    ...medals.map(medal=>({kind:'round',action:'finished',course:'nightfall',revision:'1',strokes:40,par:40,medal,best:true})),
  ]) assert.equal(validateBatch(sample([e])),true,JSON.stringify(e));
});
test('rejects identifiers, timestamps and any unknown field, anywhere in the batch',()=>{
  for (const key of ['installID','deviceID','sessionID','userID','timestamp','date','locale','extra']) {
    assert.equal(validateBatch({...sample(),[key]:'private'}),false,key);
    [...everyKind(),...everyUnlock()].forEach((e,i)=>assert.equal(validateBatch(sample([{...e,[key]:'private'}])),false,`${key} on event ${i}`));
    assert.equal(validateBatch(sample([attempt({context:{...context(),[key]:'private'} as HoleEvent['context']})])),false,`${key} in context`);
  }
  // Each kind carries exactly its own fields: none borrowed from another kind or action, none missing.
  const finished = {kind:'round',action:'finished',course:'daybreak',revision:'1',strokes:41,par:40,medal:'none',best:true};
  for (const e of [
    {kind:'milestone',name:'first_launch',context:context()},{kind:'milestone',name:'first_launch',course:'daybreak',revision:'1'},
    {kind:'milestone',name:'course_unlocked',course:'daybreak'},{kind:'milestone',name:'course_unlocked',revision:'1'},
    {kind:'milestone',name:'course_unlocked',course:'daybreak',revision:'1',context:context()},
    {kind:'milestone',name:'hole_finished'},{kind:'milestone',name:'trophy_won',course:'midway',revision:'1'},
    {kind:'milestone',name:'hole_finished',context:context(),course:'midway'},
    {kind:'round',action:'started',course:'daybreak',revision:'1'},{kind:'round',action:'started',course:'daybreak',revision:'1',first:true,hole:1},
    {kind:'round',action:'left',course:'daybreak',revision:'1'},{kind:'round',action:'left',course:'daybreak',revision:'1',hole:1,first:true},
    {kind:'round',action:'started',revision:'1',first:true},{kind:'round',action:'started',course:'daybreak',first:true},
    {kind:'round',course:'daybreak',revision:'1',first:true},
    ...['strokes','par','medal','best'].map(k=>Object.fromEntries(Object.entries(finished).filter(([key])=>key!==k))),
    {...finished,hole:9},{...finished,context:context()},
    ...Object.keys(attempt()).filter(k=>k!=='kind').map(k=>Object.fromEntries(Object.entries(attempt()).filter(([key])=>key!==k))),
    {...attempt(),course:'midway'},
    attempt({context:{course:'midway',hole:2,slug:'springboard'} as HoleEvent['context']}),
  ]) assert.equal(validateBatch(sample([e])),false,JSON.stringify(e));
});
test('rejects every out-of-range, malformed or inconsistent value, and the whole batch with it',()=>{
  const bad: unknown[] = [
    // Batch-level values are checked in the next test; these are events.
    null,'hole',[],42,{},{kind:'run'},{kind:'Milestone',name:'first_launch'},
    {kind:'milestone',name:'level_started'},{kind:'milestone',name:'hole_started',context:context()},{kind:'milestone'},
    // Hole context.
    ...[{hole:0},{hole:10},{hole:1.5},{hole:'2'},{hole:-1},{course:'Daybreak'},{course:'1day'},{course:'day_break'},{course:'a'.repeat(33)},
      {course:''},{course:7},{slug:'Twins'},{slug:'twins_2'},{slug:'-twins'},{slug:'t'.repeat(49)},{slug:''},
      {revision:''},{revision:'a b'},{revision:'2026/10/15'},{revision:'r'.repeat(49)},{revision:1}]
      .map(change=>attempt({context:{...context(),...change} as HoleEvent['context']})),
    attempt({context:null as unknown as HoleEvent['context']}),attempt({context:[] as unknown as HoleEvent['context']}),
    // Hole fields.
    ...([{mode:'practice'},{outcome:'won'},{outcome:'death'},{replay:'no'},{replay:0},
      {attempt:0},{attempt:-1},{attempt:1001},{attempt:1.5},{attempt:'1'},{replay:true,attempt:1},
      {strokes:[2]},{strokes:[2,3,4]},{strokes:[0,3]},{strokes:[2,0]},{strokes:[100,1]},{strokes:[1,-1]},{strokes:[1.5,2]},{strokes:['2','3']},{strokes:{0:2,1:3}},
      {outcome:'quit',strokes:[100,0]},{par:1},{par:13},{par:4.5},{swings:-1},{swings:201},{swings:2.5},
      {swings:2,mirrorSwings:3},{mirrorSwings:-1},{water:-1},{water:201},{aces:-1},{aces:3},{aces:1.5},
      {doubleAce:'yes'},{doubleAce:1},{doubleAce:true},{strokes:[1,2],doubleAce:true},{strokes:[2,1],doubleAce:true},
      {outcome:'quit',strokes:[1,1],doubleAce:true},{outcome:'abandoned',strokes:[1,1],doubleAce:true},
      // Aces must match the strokes: every 1 on a finish, at most the 1s otherwise; a double ace exactly on [1, 1].
      {strokes:[2,3],aces:2},{strokes:[2,3],aces:1},{strokes:[1,1],aces:2,doubleAce:false},{strokes:[1,1],aces:1,doubleAce:true},
      {strokes:[1,2],aces:0},{strokes:[1,2],aces:2},{outcome:'quit',strokes:[1,3],aces:2},{outcome:'abandoned',strokes:[0,0],aces:1},
      {seconds:-1},{seconds:3601},{seconds:1.5},{seconds:Infinity},{seconds:NaN},{seconds:null}] as unknown as Partial<HoleEvent>[]).map(change=>attempt(change)),
    // Rounds and course milestones.
    {kind:'round',action:'paused',course:'daybreak',revision:'1'},{kind:'round',action:'started',course:'Daybreak',revision:'1',first:true},
    {kind:'round',action:'started',course:'daybreak',revision:'',first:true},{kind:'round',action:'started',course:'daybreak',revision:'1',first:'yes'},
    {kind:'round',action:'left',course:'daybreak',revision:'1',hole:0},{kind:'round',action:'left',course:'daybreak',revision:'1',hole:10},
    {kind:'round',action:'left',course:'daybreak',revision:'1',hole:'4'},
    ...[{strokes:8},{strokes:1000},{strokes:40.5},{par:17},{par:109},{medal:'platinum'},{medal:'Gold'},{medal:null},{best:'yes'},{best:1}]
      .map(change=>({kind:'round',action:'finished',course:'daybreak',revision:'1',strokes:41,par:40,medal:'none',best:true,...change})),
    {kind:'milestone',name:'course_unlocked',course:'Thunderhead',revision:'1'},{kind:'milestone',name:'course_unlocked',course:'thunderhead',revision:'a b'},
  ];
  for (const e of bad) {
    assert.equal(validateBatch(sample([e])),false,JSON.stringify(e));
    assert.equal(validateBatch(sample([...everyKind(),e])),false,`with valid events: ${JSON.stringify(e)}`);
  }
});
test('rejects a malformed batch envelope',()=>{
  const {schema:_s,...noSchema} = sample(), {events:_e,...noEvents} = sample();
  for (const b of [null,[],'batch',noSchema,noEvents,{...sample(),schema:3},{...sample(),schema:0},{...sample(),schema:'2'},
    ...['1','1.2.3.4','v1.0','1000.0','1.0.','',' 1.0','1.0\n',1.0].map(appVersion=>({...sample(),appVersion})),
    ...['a','','1234567890','1.0','-1',1].map(build=>({...sample(),build})),
    ...['beta','TestFlight','',null].map(channel=>({...sample(),channel})),
    {...sample(),events:[]},{...sample(),events:Array.from({length:26},()=>attempt())},{...sample(),events:attempt()},{...sample(),events:'[]'},
  ]) assert.equal(validateBatch(b),false,JSON.stringify(b));
});
test('stores only aggregate counters per content: holes, courses and the install',()=>{
  const c = counts(sample());
  const holeToken = contentToken(attempt()), courseToken = contentToken({kind:'round',action:'started',course:'daybreak',revision:'2026-10-15.1',first:true});
  assert.equal(holeToken,contentToken({kind:'milestone',name:'trophy_won',context:{revision:'2026-10-15.1',slug:'springboard',hole:2,course:'midway'}}),'key order does not matter');
  assert.notEqual(holeToken,contentToken(attempt({context:{...context(),revision:'2026-10-15.2'}})),'revisions never mix');
  assert.deepEqual(c,{
    'install|milestone.first_launch':1,
    [`${contentToken({kind:'milestone',name:'course_unlocked',course:'thunderhead',revision:'2026-10-15.1'})}|milestone.course_unlocked`]:1,
    [`${holeToken}|milestone.hole_finished`]:1,[`${holeToken}|milestone.trophy_won`]:1,
    [`${holeToken}|outcome.finished`]:1,[`${holeToken}|sum.swings`]:3,[`${holeToken}|sum.mirrorSwings`]:1,[`${holeToken}|sum.finished.seconds`]:84,
    [`${holeToken}|sum.first.strokesA`]:2,[`${holeToken}|sum.first.strokesB`]:3,[`${holeToken}|sum.first.par`]:5,[`${holeToken}|first.atOrUnderPar`]:1,
    [`${holeToken}|attempt.1`]:1,[`${holeToken}|sum.first.attempt`]:1,
    [`${courseToken}|round.started`]:1,[`${courseToken}|round.started.first`]:1,[`${courseToken}|round.left.4`]:1,
    [`${courseToken}|round.finished`]:1,[`${courseToken}|medal.none`]:1,[`${courseToken}|round.best`]:1,
    [`${courseToken}|sum.round.strokes`]:41,[`${courseToken}|sum.round.par`]:40,
  });
  // Replays, quits and Free Play are split out; tries to a first finish are bucketed.
  const more = counts(sample([attempt({replay:true,attempt:0,strokes:[1,1],aces:2,doubleAce:true}),attempt({outcome:'quit',mode:'single',strokes:[4,0],water:2,seconds:30}),
    attempt({strokes:[12,10],attempt:6}),attempt({strokes:[1,1],par:12,attempt:1000})]));
  const m = (k: string) => more[`${holeToken}|${k}`];
  assert.equal(m('replay.finished'),1);assert.equal(m('replay.doubleAce'),1);assert.equal(m('sum.replay.par'),5);assert.equal(m('sum.aces'),2);
  assert.equal(m('outcome.quit'),1);assert.equal(m('single.quit'),1);assert.equal(m('sum.water'),2);assert.equal(m('sum.quit.seconds'),30);
  assert.equal(m('attempt.7'),1);assert.equal(m('attempt.1000'),1);assert.equal(m('sum.first.strokesA'),13);assert.equal(m('sum.first.par'),17);
  assert.equal(m('sum.first.attempt'),1006);assert.equal(m('outcome.finished'),3);
  // A replay finish counts as a replay only: never as a first finish or a try.
  const replay = Object.keys(counts(sample([attempt({replay:true,attempt:0})]))).map(k=>k.split('|')[1]);
  assert.deepEqual(replay.filter(k=>/^(attempt\.|sum\.first\.|first\.)/.test(k)),[]);
  assert.equal(replay.includes('sum.replay.strokesA'),true);
  assert.equal(Object.values(more).includes(0),false,'zero sums spend no fields');
});
test('report pools builds per hole and revision, and computes what the stats page shows',()=>{
  const r1 = '2026-10-15.1', r2 = '2026-10-15.2';
  const at = (course: string, hole: number, revision: string, change: Partial<HoleEvent> = {}) => attempt({context:{course,hole,slug:`hole-${hole}`,revision},...change});
  const day = '2026-10-15';
  const report1 = report([
    {day,build:'testflight:0.1:1',counts:counts(sample([{kind:'milestone',name:'first_launch'},{kind:'milestone',name:'first_launch'},
      at('midway',2,r1,{outcome:'quit',strokes:[3,0],swings:4,mirrorSwings:0,water:1}),at('midway',2,r1,{attempt:2,strokes:[3,3],swings:5,mirrorSwings:1,water:1}),
      at('daybreak',1,r1,{strokes:[1,1],aces:2,doubleAce:true,swings:2,mirrorSwings:0,par:3})]))},
    {day,build:'testflight:0.2:3',counts:counts(sample([{kind:'milestone',name:'first_launch'},
      at('midway',2,r1,{strokes:[2,2],swings:4,mirrorSwings:3}),at('midway',2,r1,{replay:true,attempt:0,strokes:[2,2],swings:4,mirrorSwings:0}),
      at('midway',2,r2,{outcome:'abandoned',strokes:[1,0],swings:1,mirrorSwings:0}),at('future-course',1,r1),at('midway',1,r1),
      {kind:'milestone',name:'hole_finished',context:{course:'midway',hole:2,slug:'hole-2',revision:r1}},
      {kind:'milestone',name:'course_unlocked',course:'midway',revision:r1},
      {kind:'round',action:'started',course:'midway',revision:r1,first:true},{kind:'round',action:'started',course:'midway',revision:r1,first:false},
      {kind:'round',action:'left',course:'midway',revision:r1,hole:3},
      {kind:'round',action:'finished',course:'midway',revision:r1,strokes:44,par:40,medal:'bronze',best:true},
      {kind:'round',action:'finished',course:'daybreak',revision:r1,strokes:36,par:40,medal:'gold',best:true}]))},
  ]);
  assert.deepEqual(report1.builds.map(b=>[b.build,b.firstLaunches,b.attempts,b.roundsStarted,b.roundsFinished]),
    [['testflight:0.2:3',1,5,2,2],['testflight:0.1:1',2,3,0,0]]);
  assert.equal(report1.firstLaunches,3);
  assert.deepEqual(report1.holes.map(p=>`${p.course} ${p.revision} ${p.hole}`),
    ['daybreak 2026-10-15.1 1','midway 2026-10-15.2 2','midway 2026-10-15.1 1','midway 2026-10-15.1 2','future-course 2026-10-15.1 1']);
  const p = report1.holes.find(p=>p.course==='midway'&&p.hole===2&&p.revision===r1)!;
  assert.deepEqual([p.attempts,p.finished,p.firstFinishes,p.replayFinishes,p.quits,p.abandoned,p.single],[4,3,2,1,1,0,0]);
  // Finishes: [3,3] +1, [2,2] -1, replay [2,2] -1 over a par of 5.
  assert.equal(p.firstOverPar,0);assert.equal(p.allOverPar,-1/3);assert.equal(p.firstAtOrUnderPar,1/2);assert.equal(p.allAtOrUnderPar,2/3);
  assert.equal(p.triesToFirstFinish,1.5);assert.equal(p.medianTries,'1');assert.deepEqual(p.firstGreenStrokes,[2.5,2.5]);
  assert.equal(p.waterPerAttempt,.5);assert.equal(p.mirrorShare,4/17);assert.equal(p.secondsToFinish,84);
  assert.equal(p.installsFinished,1);assert.equal(p.doubleAces,0);
  const ace = report1.holes.find(p=>p.course==='daybreak')!;
  assert.equal(ace.doubleAces,1);assert.equal(ace.firstOverPar,-1);assert.equal(ace.firstAtOrUnderPar,1);
  const abandoned = report1.holes.find(p=>p.revision===r2)!;
  assert.deepEqual([abandoned.attempts,abandoned.abandoned,abandoned.firstOverPar,abandoned.triesToFirstFinish,abandoned.medianTries,abandoned.mirrorShare],[1,1,null,null,null,0]);
  // The median is the bucket holding the middle first finish.
  const tries = report([{day,build:'testflight:0.1:1',counts:counts(sample([1,6,7,6].map(n=>attempt({attempt:n}))))}]).holes[0]!;
  assert.equal(tries.medianTries,'6–7');assert.equal(tries.triesToFirstFinish,5);
  assert.deepEqual(report1.courses.map(c=>c.course),['daybreak','midway']);
  const midway = report1.courses[1]!;
  assert.deepEqual([midway.started,midway.firstStarts,midway.left,midway.finished,midway.best,midway.overPar,midway.unlocks],
    [2,1,[0,0,1,0,0,0,0,0,0],1,1,4,1]);
  assert.deepEqual(midway.medals,{none:0,bronze:1,silver:0,gold:0});
  assert.equal(report1.courses[0]!.medals.gold,1);
  assert.deepEqual(report([]),{builds:[],firstLaunches:0,holes:[],courses:[],
    unlock:{views:0,firstViews:0,sources:unlockSources.map(source=>({source,views:0,first:0})),courses:[]}});
});
test('ingestion fails closed without the key, and rejects oversized or unvalidated payloads',async()=>{
  const req=(body:unknown,key='key')=>new Request('https://example.test/events',{method:'POST',headers:{'X-App-Key':key},body:typeof body==='string'?body:JSON.stringify(body)});
  assert.equal((await handleEvents(req(sample()),{store:store(),appKey:''})).status,401);
  assert.equal((await handleEvents(req(sample(),'wrong'),{store:store(),appKey:'key'})).status,401);
  let written: unknown[] = [];
  const s=store();s.write=async(...args)=>{written=args;return true;};
  const ok=await handleEvents(req(sample([attempt(),attempt(),{kind:'milestone',name:'first_launch'}])),{store:s,appKey:'key',now:()=>new Date('2026-10-15T23:59:00Z')});
  assert.equal(ok.status,204);assert.equal(ok.headers.get('cache-control'),'no-store');
  assert.deepEqual(written.slice(0,3),['2026-10-15','testflight:0.1:1',[contentToken(attempt()),'install']]);
  assert.equal((await handleEvents(req({...sample(),installID:'bad'}),{store:store(),appKey:'key'})).status,400);
  assert.equal((await handleEvents(req('{"schema":2'),{store:store(),appKey:'key'})).status,400);
  assert.equal((await handleEvents(req('x'.repeat(70000)),{store:store(),appKey:'key'})).status,413);
  // Exactly 64 KiB is allowed; one byte more is not.
  const padded=(bytes:number)=>JSON.stringify(sample()).padEnd(bytes,' ');
  assert.equal((await handleEvents(req(padded(65536)),{store:store(),appKey:'key'})).status,204);
  assert.equal((await handleEvents(req(padded(65537)),{store:store(),appKey:'key'})).status,413);
  const declared=new Request('https://example.test/events',{method:'POST',headers:{'X-App-Key':'key','Content-Length':'70000'},body:'{}'});
  assert.equal((await handleEvents(declared,{store:store(),appKey:'key'})).status,413);
  const full=store();full.write=async()=>false;
  assert.equal((await handleEvents(req(sample()),{store:full,appKey:'key'})).status,429);
  const down=store();down.write=async()=>{throw new Error('down');};
  assert.equal((await handleEvents(req(sample()),{store:down,appKey:'key'})).status,503);
});
test('stats authentication, invalid dates and default TestFlight-only filtering',async()=>{
  const req=(params:string,auth='Bearer secret')=>new Request('https://example.test/stats'+params,{headers:{Authorization:auth}});
  assert.equal((await handleStats(req(''),{store:store(),secret:''})).status,401);
  assert.equal((await handleStats(req('','Bearer wrong'),{store:store(),secret:'secret'})).status,401);
  for(const params of ['?to=bad','?to=2026-02-30','?from=2026-10-05&to=2026-10-04','?from=2026-07-06&to=2026-10-04'])assert.equal((await handleStats(req(params),{store:store(),secret:'secret'})).status,400);
  // The page's longest range, 90 days counting both ends, is the whole retention window.
  let read:string[]=[];const all=store();all.read=async days=>{read=days;return [];};
  assert.equal((await handleStats(req('?from=2026-07-07&to=2026-10-04'),{store:all,secret:'secret'})).status,200);assert.equal(read.length,90);
  const c=counts(sample());
  const s=store();s.read=async()=>[{day:'2026-10-04',build:'debug:0.1:1',counts:c},{day:'2026-10-04',build:'testflight:0.1:1',counts:c},{day:'2026-10-04',build:'testflight:0.1:2',counts:c}];
  const body=await (await handleStats(req('?to=2026-10-04'),{store:s,secret:'secret'})).json();
  assert.deepEqual(body.builds.map((b:{build:string})=>b.build),['testflight:0.1:2','testflight:0.1:1']);
  assert.equal(body.holes[0].attempts,2);assert.equal(body.firstLaunches,2);assert.equal(body.from,'2026-09-05');
  const one=await (await handleStats(req('?to=2026-10-04&build=1&channel=testflight'),{store:s,secret:'secret'})).json();
  assert.deepEqual(one.builds.map((b:{build:string})=>b.build),['testflight:0.1:1']);
  const debug=await (await handleStats(req('?to=2026-10-04&channel=debug&appVersion=0.1'),{store:s,secret:'secret'})).json();
  assert.equal(debug.holes[0].attempts,1);
  const down=store();down.read=async()=>{throw new Error('down');};
  assert.equal((await handleStats(req(''),{store:down,secret:'secret'})).status,503);
});

test('accept the real Swift-encoded client contract fixtures, which send every kind, outcome and round action',()=>{
  // Encoded with the app's own AnalyticsEvent and AnalyticsBatch types (kraigstrong/double-putt, MiniGolf/Game/Analytics.swift):
  // schema 1 by TestFlight builds 1–3, schema 2 since a pair of greens became a hole. Both hold the same events.
  const fixture=(schema:number)=>JSON.parse(readFileSync(new URL(`./fixtures/double-putt-swift-schema-${schema}.json`,import.meta.url),'utf8'));
  const [one,two]=[fixture(1),fixture(2)];
  assert.equal(one.schema,1);assert.equal(two.schema,2);
  assert.equal(validateBatch(one),true);assert.equal(validateBatch(two),true);
  type Sent={kind:string;name?:string;outcome?:string;action?:string};
  const values=(payload:{events:Sent[]},key:'kind'|'name'|'outcome'|'action')=>new Set(payload.events.flatMap(e=>e[key]?[e[key]]:[]));
  assert.deepEqual(values(one,'kind'),new Set(['milestone','pair','round']));
  assert.deepEqual(values(one,'name'),new Set(['first_launch','course_unlocked','pair_finished','trophy_won']));
  assert.deepEqual(values(two,'kind'),new Set(['milestone','hole','round']));
  assert.deepEqual(values(two,'name'),new Set(['first_launch','course_unlocked','hole_finished','trophy_won']));
  for (const payload of [one,two]) {
    assert.deepEqual(values(payload,'outcome'),new Set(['finished','quit','abandoned']));
    assert.deepEqual(values(payload,'action'),new Set(['started','left','finished']));
  }
  assert.deepEqual(counts(upgrade(one)),counts(two),'an older build counts the same as a newer one');
});
// Schema 1 (TestFlight builds 1–3) called a hole a pair; this is an event as one of those builds sent it.
function asSchema1(e: Event): unknown {
  const pair=({hole,...rest}:Context)=>({...rest,pair:hole});
  if (e.kind==='hole') return {...e,kind:'pair',context:pair(e.context)};
  if (e.kind==='milestone'&&'context' in e) return {...e,name:e.name==='hole_finished'?'pair_finished':e.name,context:pair(e.context)};
  if (e.kind==='round'&&e.action==='left') { const {hole,...rest}=e; return {...rest,pair:hole}; }
  return e;
}
const schema1 = (events: unknown[] = everyKind().map(asSchema1)) => ({...sample(),schema:1,build:'3',events}) as unknown as Schema1Batch;
test('accepts schema 1 batches from older builds and counts them as schema 2',async()=>{
  assert.equal(validateBatch(schema1()),true);
  for (const e of everyKind().map(asSchema1)) assert.equal(validateBatch(schema1([e])),true,JSON.stringify(e));
  assert.deepEqual(upgrade(schema1()),{...sample(),build:'3'});
  assert.deepEqual(counts(upgrade(schema1())),counts(sample()));
  const two=sample();assert.equal(upgrade(two),two,'a schema 2 batch passes through as it is');
  let written: unknown[] = [];
  const s=store();s.write=async(...args)=>{written=args;return true;};
  const req=new Request('https://example.test/events',{method:'POST',headers:{'X-App-Key':'key'},body:JSON.stringify(schema1())});
  assert.equal((await handleEvents(req,{store:s,appKey:'key',now:()=>new Date('2026-10-24T12:00:00Z')})).status,204);
  assert.deepEqual(written,['2026-10-24','testflight:0.1:3',[...new Set(everyKind().map(contentToken))],counterUpdates({...sample(),build:'3'})]);
});
test('rejects a batch that mixes the two schemas’ names',()=>{
  const pairContext={...context(),pair:2} as Record<string,unknown>; delete pairContext.hole;
  // Schema 2 names in a schema 1 batch.
  for (const e of [attempt(),{kind:'milestone',name:'hole_finished',context:{...pairContext}},{kind:'milestone',name:'trophy_won',context:context()},
    {kind:'round',action:'left',course:'daybreak',revision:'1',hole:4},{...asSchema1(attempt()) as object,context:context()},
    {...asSchema1(attempt()) as object,context:{...pairContext,hole:2}}]) {
    assert.equal(validateBatch(schema1([e])),false,JSON.stringify(e));
    assert.equal(validateBatch(schema1([...everyKind().map(asSchema1),e])),false,`with valid events: ${JSON.stringify(e)}`);
  }
  // Schema 1 names in a schema 2 batch.
  for (const e of everyKind().map(asSchema1).filter(e=>JSON.stringify(e).includes('pair'))) {
    assert.equal(validateBatch(sample([e])),false,JSON.stringify(e));
    assert.equal(validateBatch(sample([...everyKind(),e])),false,`with valid events: ${JSON.stringify(e)}`);
  }
});
test('accepts the purchase screen from every source, with a course for all but Settings, mixed with every other kind',()=>{
  for (const e of everyUnlock()) assert.equal(validateBatch(sample([e])),true,JSON.stringify(e));
  for (const source of unlockSources.filter(s=>s!=='settings')) for (const first of [true,false])
    for (const course of ['daybreak','starbase','z'+'a'.repeat(31),'x','future-course-2'])
      assert.equal(validateBatch(sample([{kind:'unlock',source,course,first}])),true,`${source} ${course} ${first}`);
  assert.equal(validateBatch(sample([{kind:'unlock',source:'settings',first:false}])),true);
  // Older builds' course_unlocked milestones are still accepted beside it.
  assert.equal(validateBatch(sample([...everyKind(),...everyUnlock()])),true);
  assert.equal(validateBatch(sample([...everyUnlock(),...everyKind()].reverse())),true);
  assert.equal(validateBatch(sample(Array.from({length:25},(_,i)=>everyUnlock()[i%7]))),true);
});
test('rejects a purchase screen with a bad source, course or first, a missing or extra field, and the whole batch with it',()=>{
  const free = {kind:'unlock',source:'free_hole',course:'midway',first:false}, settings = {kind:'unlock',source:'settings',first:true};
  const bad: unknown[] = [
    ...['Scorecard','free-hole','freeHole','paywall','shop','unlock','purchase','',null,7,true,['hole']].map(source=>({...free,source})),
    ...['Midway','1day','day_break','-midway','a'.repeat(33),'',' midway','midway\n',7,null,['midway']].map(course=>({...free,course})),
    ...['true',1,0,null,'yes'].map(first=>({...free,first})),{...settings,first:'false'},
    // Every source but Settings names its course; Settings never does.
    ...unlockSources.filter(s=>s!=='settings').map(source=>({kind:'unlock',source,first:true})),
    {...settings,course:'midway'},{...settings,course:null},
    {kind:'unlock',course:'midway',first:true},{kind:'unlock',source:'course',course:'midway'},{kind:'unlock',first:true},{kind:'unlock'},
    {...free,kind:'Unlock'},{...free,kind:'offer'},{...free,kind:'purchase'},
    // No outcome, price, revision, hole or anything else rides along.
    ...['outcome','purchased','price','product','revision','hole','context','slug','installID','deviceID','timestamp','extra']
      .flatMap(key=>[{...free,[key]:'x'},{...settings,[key]:'x'}]),
    {...free,context:context()},{...free,hole:2},{...free,revision:'2026-10-15.1'},
  ];
  for (const e of bad) {
    assert.equal(validateBatch(sample([e])),false,JSON.stringify(e));
    assert.equal(validateBatch(sample([...everyKind(),...everyUnlock(),e])),false,`with valid events: ${JSON.stringify(e)}`);
  }
  // Schema 1 builds never had a purchase screen.
  for (const e of everyUnlock()) {
    assert.equal(validateBatch(schema1([e])),false,JSON.stringify(e));
    assert.equal(validateBatch(schema1([...everyKind().map(asSchema1),e])),false,`with valid events: ${JSON.stringify(e)}`);
  }
});
test('counts the purchase screen per course and source, its first views apart, and adds a batch up into one write',async()=>{
  const midway = contentToken({kind:'unlock',source:'hole',course:'midway',first:false});
  assert.equal(midway,contentToken({kind:'unlock',source:'scorecard',course:'midway',first:true}),'one content per course, whatever the source');
  assert.notEqual(midway,contentToken({kind:'round',action:'started',course:'midway',revision:'2026-10-15.1',first:true}),'apart from its rounds');
  assert.equal(contentToken({kind:'unlock',source:'settings',first:true}),'install','Settings belongs to no course');
  const c = counts(sample([
    {kind:'unlock',source:'free_hole',course:'midway',first:true},{kind:'unlock',source:'free_hole',course:'midway',first:false},
    {kind:'unlock',source:'free_hole',course:'midway',first:false},{kind:'unlock',source:'course',course:'midway',first:false},
    {kind:'unlock',source:'scorecard',course:'daybreak',first:true},{kind:'unlock',source:'settings',first:true},
    {kind:'unlock',source:'settings',first:false},{kind:'milestone',name:'first_launch'},
  ]));
  const daybreak = contentToken({kind:'unlock',source:'scorecard',course:'daybreak',first:true});
  assert.deepEqual(c,{
    [`${midway}|unlock.free_hole`]:3,[`${midway}|unlock.free_hole.first`]:1,[`${midway}|unlock.course`]:1,
    [`${daybreak}|unlock.scorecard`]:1,[`${daybreak}|unlock.scorecard.first`]:1,
    'install|unlock.settings':2,'install|unlock.settings.first':1,'install|milestone.first_launch':1,
  });
  let written: unknown[] = [];
  const s=store();s.write=async(...args)=>{written=args;return true;};
  const events=[...everyKind(),...everyUnlock(),...everyUnlock()];
  const req=new Request('https://example.test/events',{method:'POST',headers:{'X-App-Key':'key'},body:JSON.stringify(sample(events))});
  assert.equal((await handleEvents(req,{store:s,appKey:'key',now:()=>new Date('2026-10-26T12:00:00Z')})).status,204);
  assert.deepEqual(written.slice(0,3),['2026-10-26','testflight:0.1:1',[...new Set(events.map(contentToken))]]);
  const updates=written[3] as {field:string;by:number}[];
  assert.equal(new Set(updates.map(u=>u.field)).size,updates.length,'each counter once per write');
  assert.equal(updates.find(u=>u.field===`${midway}|unlock.trophy`)?.by,2);
  assert.equal(updates.find(u=>u.field==='install|unlock.settings.first')?.by,2);
});
test('report shows purchase screen views by source, by course and first views, pooled across builds',()=>{
  const day='2026-10-26', u=(source: string, course: string|null, first=false) => ({kind:'unlock',source,...course?{course}:{},first});
  const r=report([
    {day,build:'appstore:1.0:6',counts:counts(sample([u('free_hole','midway',true),u('free_hole','midway'),u('course','starbase',true),
      u('settings',null,true),u('settings',null),u('scorecard','daybreak'),{kind:'milestone',name:'first_launch'},attempt()]))},
    {day,build:'appstore:1.0:7',counts:counts(sample([u('free_hole','midway'),u('trophy','midway',true),u('round','future-course'),u('hole','fireworks')]))},
    // Older builds' course_unlocked milestones still count on the course's own row.
    {day,build:'testflight:0.1:5',counts:counts(sample([{kind:'milestone',name:'course_unlocked',course:'midway',revision:'2026-10-15.1'}]))},
  ]);
  assert.deepEqual([r.unlock.views,r.unlock.firstViews],[10,4]);
  assert.deepEqual(r.unlock.sources,[{source:'scorecard',views:1,first:0},{source:'free_hole',views:3,first:1},{source:'course',views:1,first:1},
    {source:'hole',views:1,first:0},{source:'trophy',views:1,first:1},{source:'settings',views:2,first:1},{source:'round',views:1,first:0}]);
  // Game order, then courses the page doesn't know, alphabetically. Settings belongs to no course.
  assert.deepEqual(r.unlock.courses.map(c=>[c.course,c.views,c.first]),[['daybreak',1,0],['midway',4,2],['fireworks',1,0],['future-course',1,0],['starbase',1,1]]);
  assert.deepEqual(r.unlock.courses[1]!.sources,{scorecard:0,free_hole:3,course:0,hole:0,trophy:1,settings:0,round:0});
  assert.deepEqual(r.builds.map(b=>[b.build,b.unlockViews,b.firstLaunches,b.attempts]),[['appstore:1.0:7',4,0,0],['appstore:1.0:6',6,1,1],['testflight:0.1:5',0,0,0]]);
  assert.deepEqual(r.courses.map(c=>[c.course,c.unlocks]),[['midway',1]]);
  assert.equal(r.firstLaunches,1);assert.equal(r.holes.length,1);
});
test('the stats endpoint returns the purchase screen report with its note',async()=>{
  const rows=[{day:'2026-10-26',build:'appstore:1.0:6',counts:counts(sample([{kind:'unlock',source:'hole',course:'midway',first:true},{kind:'unlock',source:'settings',first:false}]))}];
  const s=store();s.read=async()=>rows;
  const body=await (await handleStats(new Request('https://example.test/stats?channel=appstore&to=2026-10-26',{headers:{Authorization:'Bearer secret'}}),{store:s,secret:'secret'})).json();
  assert.deepEqual(body.unlock,report(rows).unlock);assert.deepEqual([body.unlock.views,body.unlock.firstViews],[2,1]);
  assert.equal(body.notes.some((n:string)=>n.startsWith('Purchase screen views')),true);
});
test('first finishes counted before schema 2 still count',()=>{
  const t=contentToken(attempt());
  const r=report([{day:'2026-10-20',build:'testflight:0.1:3',counts:{[`${t}|milestone.pair_finished`]:2,[`${t}|outcome.finished`]:2}},
    {day:'2026-10-25',build:'testflight:0.1:4',counts:{[`${t}|milestone.hole_finished`]:1,[`${t}|outcome.finished`]:1}}]);
  assert.equal(r.holes.length,1);assert.equal(r.holes[0]!.installsFinished,3);assert.equal(r.holes[0]!.hole,2);
});
