import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {validateBatch,counterUpdates,contentToken,handleEvents,handleStats,report,medals,type Batch,type Event,type DoublePuttStore} from '../src/lib/double-putt-analytics.ts';
type PairEvent = Extract<Event,{kind:'pair'}>;
const context = () => ({course:'midway',pair:2,slug:'springboard',revision:'2026-10-15.1'});
const attempt = (change: Partial<PairEvent> = {}): PairEvent => ({kind:'pair',context:context(),mode:'round',outcome:'finished',replay:false,attempt:1,
  strokes:[2,3],par:5,swings:3,mirrorSwings:1,water:0,aces:0,doubleAce:false,seconds:84,...change});
// Every example in the contract (docs/analytics.md in kraigstrong/double-putt).
const everyKind = (): Event[] => [
  {kind:'milestone',name:'first_launch'},
  {kind:'milestone',name:'course_unlocked',course:'thunderhead',revision:'2026-10-15.1'},
  {kind:'milestone',name:'pair_finished',context:context()},
  {kind:'milestone',name:'trophy_won',context:context()},
  attempt(),
  {kind:'round',action:'started',course:'daybreak',revision:'2026-10-15.1',first:true},
  {kind:'round',action:'left',course:'daybreak',revision:'2026-10-15.1',pair:4},
  {kind:'round',action:'finished',course:'daybreak',revision:'2026-10-15.1',strokes:41,par:40,medal:'none',best:true},
];
const sample = (events: unknown[] = everyKind()): Batch => ({schema:1,appVersion:'0.1',build:'1',channel:'testflight',events:events as Event[]});
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
  const future = {course:'z'+'a'.repeat(31),pair:9,slug:'h'+'-'.repeat(47),revision:'A.b-9'.padEnd(48,'0')};
  for (const e of [
    attempt({context:future}),attempt({context:{...context(),pair:1}}),
    attempt({mode:'single'}),attempt({outcome:'quit',strokes:[0,0],swings:0,mirrorSwings:0,seconds:0}),
    attempt({outcome:'abandoned',strokes:[99,99],swings:200,mirrorSwings:200,water:200,seconds:3600}),
    attempt({replay:true,attempt:0}),attempt({attempt:1000}),attempt({par:2}),attempt({par:12}),
    attempt({strokes:[1,1],aces:2,doubleAce:true}),attempt({replay:true,attempt:0,strokes:[1,1],aces:2,doubleAce:true}),
    // A double ace is only reported as one when the pair was finished: [1, 1] on a quit is two swings that missed.
    attempt({outcome:'quit',strokes:[1,1]}),
    {kind:'milestone',name:'course_unlocked',course:'fireworks',revision:'1'},
    {kind:'round',action:'started',course:'future-course',revision:'2027-01-01.3',first:false},
    {kind:'round',action:'left',course:'daybreak',revision:'1',pair:1},{kind:'round',action:'left',course:'daybreak',revision:'1',pair:9},
    {kind:'round',action:'finished',course:'daybreak',revision:'1',strokes:9,par:18,medal:'gold',best:false},
    {kind:'round',action:'finished',course:'daybreak',revision:'1',strokes:999,par:108,medal:'silver',best:true},
    ...medals.map(medal=>({kind:'round',action:'finished',course:'nightfall',revision:'1',strokes:40,par:40,medal,best:true})),
  ]) assert.equal(validateBatch(sample([e])),true,JSON.stringify(e));
});
test('rejects identifiers, timestamps and any unknown field, anywhere in the batch',()=>{
  for (const key of ['installID','deviceID','sessionID','userID','timestamp','date','locale','extra']) {
    assert.equal(validateBatch({...sample(),[key]:'private'}),false,key);
    everyKind().forEach((e,i)=>assert.equal(validateBatch(sample([{...e,[key]:'private'}])),false,`${key} on event ${i}`));
    assert.equal(validateBatch(sample([attempt({context:{...context(),[key]:'private'} as PairEvent['context']})])),false,`${key} in context`);
  }
  // Each kind carries exactly its own fields: none borrowed from another kind or action, none missing.
  const finished = {kind:'round',action:'finished',course:'daybreak',revision:'1',strokes:41,par:40,medal:'none',best:true};
  for (const e of [
    {kind:'milestone',name:'first_launch',context:context()},{kind:'milestone',name:'first_launch',course:'daybreak',revision:'1'},
    {kind:'milestone',name:'course_unlocked',course:'daybreak'},{kind:'milestone',name:'course_unlocked',revision:'1'},
    {kind:'milestone',name:'course_unlocked',course:'daybreak',revision:'1',context:context()},
    {kind:'milestone',name:'pair_finished'},{kind:'milestone',name:'trophy_won',course:'midway',revision:'1'},
    {kind:'milestone',name:'pair_finished',context:context(),course:'midway'},
    {kind:'round',action:'started',course:'daybreak',revision:'1'},{kind:'round',action:'started',course:'daybreak',revision:'1',first:true,pair:1},
    {kind:'round',action:'left',course:'daybreak',revision:'1'},{kind:'round',action:'left',course:'daybreak',revision:'1',pair:1,first:true},
    {kind:'round',action:'started',revision:'1',first:true},{kind:'round',action:'started',course:'daybreak',first:true},
    {kind:'round',course:'daybreak',revision:'1',first:true},
    ...['strokes','par','medal','best'].map(k=>Object.fromEntries(Object.entries(finished).filter(([key])=>key!==k))),
    {...finished,pair:9},{...finished,context:context()},
    ...Object.keys(attempt()).filter(k=>k!=='kind').map(k=>Object.fromEntries(Object.entries(attempt()).filter(([key])=>key!==k))),
    {...attempt(),course:'midway'},
    attempt({context:{course:'midway',pair:2,slug:'springboard'} as PairEvent['context']}),
  ]) assert.equal(validateBatch(sample([e])),false,JSON.stringify(e));
});
test('rejects every out-of-range, malformed or inconsistent value, and the whole batch with it',()=>{
  const bad: unknown[] = [
    // Batch-level values are checked in the next test; these are events.
    null,'pair',[],42,{},{kind:'run'},{kind:'Milestone',name:'first_launch'},
    {kind:'milestone',name:'level_started'},{kind:'milestone',name:'pair_started',context:context()},{kind:'milestone'},
    // Pair context.
    ...[{pair:0},{pair:10},{pair:1.5},{pair:'2'},{pair:-1},{course:'Daybreak'},{course:'1day'},{course:'day_break'},{course:'a'.repeat(33)},
      {course:''},{course:7},{slug:'Twins'},{slug:'twins_2'},{slug:'-twins'},{slug:'t'.repeat(49)},{slug:''},
      {revision:''},{revision:'a b'},{revision:'2026/10/15'},{revision:'r'.repeat(49)},{revision:1}]
      .map(change=>attempt({context:{...context(),...change} as PairEvent['context']})),
    attempt({context:null as unknown as PairEvent['context']}),attempt({context:[] as unknown as PairEvent['context']}),
    // Pair fields.
    ...([{mode:'practice'},{outcome:'won'},{outcome:'death'},{replay:'no'},{replay:0},
      {attempt:0},{attempt:-1},{attempt:1001},{attempt:1.5},{attempt:'1'},{replay:true,attempt:1},
      {strokes:[2]},{strokes:[2,3,4]},{strokes:[0,3]},{strokes:[2,0]},{strokes:[100,1]},{strokes:[1,-1]},{strokes:[1.5,2]},{strokes:['2','3']},{strokes:{0:2,1:3}},
      {outcome:'quit',strokes:[100,0]},{par:1},{par:13},{par:4.5},{swings:-1},{swings:201},{swings:2.5},
      {swings:2,mirrorSwings:3},{mirrorSwings:-1},{water:-1},{water:201},{aces:-1},{aces:3},{aces:1.5},
      {doubleAce:'yes'},{doubleAce:1},{doubleAce:true},{strokes:[1,2],doubleAce:true},{strokes:[2,1],doubleAce:true},
      {outcome:'quit',strokes:[1,1],doubleAce:true},{outcome:'abandoned',strokes:[1,1],doubleAce:true},
      {seconds:-1},{seconds:3601},{seconds:1.5},{seconds:Infinity},{seconds:NaN},{seconds:null}] as unknown as Partial<PairEvent>[]).map(change=>attempt(change)),
    // Rounds and course milestones.
    {kind:'round',action:'paused',course:'daybreak',revision:'1'},{kind:'round',action:'started',course:'Daybreak',revision:'1',first:true},
    {kind:'round',action:'started',course:'daybreak',revision:'',first:true},{kind:'round',action:'started',course:'daybreak',revision:'1',first:'yes'},
    {kind:'round',action:'left',course:'daybreak',revision:'1',pair:0},{kind:'round',action:'left',course:'daybreak',revision:'1',pair:10},
    {kind:'round',action:'left',course:'daybreak',revision:'1',pair:'4'},
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
  for (const b of [null,[],'batch',noSchema,noEvents,{...sample(),schema:2},{...sample(),schema:'1'},
    ...['1','1.2.3.4','v1.0','1000.0','1.0.','',' 1.0','1.0\n',1.0].map(appVersion=>({...sample(),appVersion})),
    ...['a','','1234567890','1.0','-1',1].map(build=>({...sample(),build})),
    ...['beta','TestFlight','',null].map(channel=>({...sample(),channel})),
    {...sample(),events:[]},{...sample(),events:Array.from({length:26},()=>attempt())},{...sample(),events:attempt()},{...sample(),events:'[]'},
  ]) assert.equal(validateBatch(b),false,JSON.stringify(b));
});
test('stores only aggregate counters per content: pairs, courses and the install',()=>{
  const c = counts(sample());
  const pairToken = contentToken(attempt()), courseToken = contentToken({kind:'round',action:'started',course:'daybreak',revision:'2026-10-15.1',first:true});
  assert.equal(pairToken,contentToken({kind:'milestone',name:'trophy_won',context:{revision:'2026-10-15.1',slug:'springboard',pair:2,course:'midway'}}),'key order does not matter');
  assert.notEqual(pairToken,contentToken(attempt({context:{...context(),revision:'2026-10-15.2'}})),'revisions never mix');
  assert.deepEqual(c,{
    'install|milestone.first_launch':1,
    [`${contentToken({kind:'milestone',name:'course_unlocked',course:'thunderhead',revision:'2026-10-15.1'})}|milestone.course_unlocked`]:1,
    [`${pairToken}|milestone.pair_finished`]:1,[`${pairToken}|milestone.trophy_won`]:1,
    [`${pairToken}|outcome.finished`]:1,[`${pairToken}|sum.swings`]:3,[`${pairToken}|sum.mirrorSwings`]:1,[`${pairToken}|sum.finished.seconds`]:84,
    [`${pairToken}|sum.first.strokesA`]:2,[`${pairToken}|sum.first.strokesB`]:3,[`${pairToken}|sum.first.par`]:5,[`${pairToken}|first.atOrUnderPar`]:1,
    [`${pairToken}|attempt.1`]:1,[`${pairToken}|sum.first.attempt`]:1,
    [`${courseToken}|round.started`]:1,[`${courseToken}|round.started.first`]:1,[`${courseToken}|round.left.4`]:1,
    [`${courseToken}|round.finished`]:1,[`${courseToken}|medal.none`]:1,[`${courseToken}|round.best`]:1,
    [`${courseToken}|sum.round.strokes`]:41,[`${courseToken}|sum.round.par`]:40,
  });
  // Replays, quits and single-hole play are split out; tries to a first finish are bucketed.
  const more = counts(sample([attempt({replay:true,attempt:0,strokes:[1,1],aces:2,doubleAce:true}),attempt({outcome:'quit',mode:'single',strokes:[4,0],water:2,seconds:30}),
    attempt({strokes:[12,10],attempt:6}),attempt({strokes:[1,1],par:12,attempt:1000})]));
  const m = (k: string) => more[`${pairToken}|${k}`];
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
test('report pools builds per pair and revision, and computes what the stats page shows',()=>{
  const r1 = '2026-10-15.1', r2 = '2026-10-15.2';
  const at = (course: string, pair: number, revision: string, change: Partial<PairEvent> = {}) => attempt({context:{course,pair,slug:`pair-${pair}`,revision},...change});
  const day = '2026-10-15';
  const report1 = report([
    {day,build:'testflight:0.1:1',counts:counts(sample([{kind:'milestone',name:'first_launch'},{kind:'milestone',name:'first_launch'},
      at('midway',2,r1,{outcome:'quit',strokes:[3,0],swings:4,mirrorSwings:0,water:1}),at('midway',2,r1,{attempt:2,strokes:[3,3],swings:5,mirrorSwings:1,water:1}),
      at('daybreak',1,r1,{strokes:[1,1],aces:2,doubleAce:true,swings:2,mirrorSwings:0,par:3})]))},
    {day,build:'testflight:0.2:3',counts:counts(sample([{kind:'milestone',name:'first_launch'},
      at('midway',2,r1,{strokes:[2,2],swings:4,mirrorSwings:3}),at('midway',2,r1,{replay:true,attempt:0,strokes:[2,2],swings:4,mirrorSwings:0}),
      at('midway',2,r2,{outcome:'abandoned',strokes:[1,0],swings:1,mirrorSwings:0}),at('future-course',1,r1),at('midway',1,r1),
      {kind:'milestone',name:'pair_finished',context:{course:'midway',pair:2,slug:'pair-2',revision:r1}},
      {kind:'milestone',name:'course_unlocked',course:'midway',revision:r1},
      {kind:'round',action:'started',course:'midway',revision:r1,first:true},{kind:'round',action:'started',course:'midway',revision:r1,first:false},
      {kind:'round',action:'left',course:'midway',revision:r1,pair:3},
      {kind:'round',action:'finished',course:'midway',revision:r1,strokes:44,par:40,medal:'bronze',best:true},
      {kind:'round',action:'finished',course:'daybreak',revision:r1,strokes:36,par:40,medal:'gold',best:true}]))},
  ]);
  assert.deepEqual(report1.builds.map(b=>[b.build,b.firstLaunches,b.attempts,b.roundsStarted,b.roundsFinished]),
    [['testflight:0.2:3',1,5,2,2],['testflight:0.1:1',2,3,0,0]]);
  assert.equal(report1.firstLaunches,3);
  assert.deepEqual(report1.pairs.map(p=>`${p.course} ${p.revision} ${p.pair}`),
    ['daybreak 2026-10-15.1 1','midway 2026-10-15.2 2','midway 2026-10-15.1 1','midway 2026-10-15.1 2','future-course 2026-10-15.1 1']);
  const p = report1.pairs.find(p=>p.course==='midway'&&p.pair===2&&p.revision===r1)!;
  assert.deepEqual([p.attempts,p.finished,p.firstFinishes,p.replayFinishes,p.quits,p.abandoned,p.single],[4,3,2,1,1,0,0]);
  // Finishes: [3,3] +1, [2,2] -1, replay [2,2] -1 over a par of 5.
  assert.equal(p.firstOverPar,0);assert.equal(p.allOverPar,-1/3);assert.equal(p.firstAtOrUnderPar,1/2);assert.equal(p.allAtOrUnderPar,2/3);
  assert.equal(p.triesToFirstFinish,1.5);assert.equal(p.medianTries,'1');assert.deepEqual(p.firstHoleStrokes,[2.5,2.5]);
  assert.equal(p.waterPerAttempt,.5);assert.equal(p.mirrorShare,4/17);assert.equal(p.secondsToFinish,84);
  assert.equal(p.installsFinished,1);assert.equal(p.doubleAces,0);
  const ace = report1.pairs.find(p=>p.course==='daybreak')!;
  assert.equal(ace.doubleAces,1);assert.equal(ace.firstOverPar,-1);assert.equal(ace.firstAtOrUnderPar,1);
  const abandoned = report1.pairs.find(p=>p.revision===r2)!;
  assert.deepEqual([abandoned.attempts,abandoned.abandoned,abandoned.firstOverPar,abandoned.triesToFirstFinish,abandoned.medianTries,abandoned.mirrorShare],[1,1,null,null,null,0]);
  // The median is the bucket holding the middle first finish.
  const tries = report([{day,build:'testflight:0.1:1',counts:counts(sample([1,6,7,6].map(n=>attempt({attempt:n}))))}]).pairs[0]!;
  assert.equal(tries.medianTries,'6–7');assert.equal(tries.triesToFirstFinish,5);
  assert.deepEqual(report1.courses.map(c=>c.course),['daybreak','midway']);
  const midway = report1.courses[1]!;
  assert.deepEqual([midway.started,midway.firstStarts,midway.left,midway.finished,midway.best,midway.overPar,midway.unlocks],
    [2,1,[0,0,1,0,0,0,0,0,0],1,1,4,1]);
  assert.deepEqual(midway.medals,{none:0,bronze:1,silver:0,gold:0});
  assert.equal(report1.courses[0]!.medals.gold,1);
  assert.deepEqual(report([]),{builds:[],firstLaunches:0,pairs:[],courses:[]});
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
  assert.equal((await handleEvents(req('{"schema":1'),{store:store(),appKey:'key'})).status,400);
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
  assert.equal(body.pairs[0].attempts,2);assert.equal(body.firstLaunches,2);assert.equal(body.from,'2026-09-05');
  const one=await (await handleStats(req('?to=2026-10-04&build=1&channel=testflight'),{store:s,secret:'secret'})).json();
  assert.deepEqual(one.builds.map((b:{build:string})=>b.build),['testflight:0.1:1']);
  const debug=await (await handleStats(req('?to=2026-10-04&channel=debug&appVersion=0.1'),{store:s,secret:'secret'})).json();
  assert.equal(debug.pairs[0].attempts,1);
  const down=store();down.read=async()=>{throw new Error('down');};
  assert.equal((await handleStats(req(''),{store:down,secret:'secret'})).status,503);
});

test('accept the real Swift-encoded client contract fixture, which sends every kind, outcome and round action',()=>{
  // Encoded with the app's own AnalyticsEvent and AnalyticsBatch types (kraigstrong/double-putt, MiniGolf/Game/Analytics.swift).
  const payload=JSON.parse(readFileSync(new URL('./fixtures/double-putt-swift.json',import.meta.url),'utf8'));
  assert.equal(validateBatch(payload),true);
  type Sent={kind:string;name?:string;outcome?:string;action?:string};
  const values=(key:'name'|'outcome'|'action')=>new Set((payload.events as Sent[]).flatMap(e=>e[key]?[e[key]]:[]));
  assert.deepEqual(values('name'),new Set(['first_launch','course_unlocked','pair_finished','trophy_won']));
  assert.deepEqual(values('outcome'),new Set(['finished','quit','abandoned']));
  assert.deepEqual(values('action'),new Set(['started','left','finished']));
});
