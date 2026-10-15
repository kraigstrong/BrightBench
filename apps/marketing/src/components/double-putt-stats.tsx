'use client';
import { useState, type FormEvent } from 'react';
import type { CourseRow, PairRow, Report } from '@/lib/double-putt-analytics';
const percentage = (x:number|null) => x === null ? '—' : `${(x*100).toFixed(1)}%`;
const decimal = (x:number|null,digits=1) => x === null ? '—' : x.toFixed(digits);
const signed = (x:number|null) => x === null ? '—' : `${x > 0 ? '+' : ''}${x.toFixed(2)}`;
// Daily totals are kept for 90 days (retentionDays in double-putt-analytics.ts), so that's the longest range.
const ranges = [7,30,90];
const utcDay = (ms:number) => new Date(ms).toISOString().slice(0,10);
// Rows with fewer attempts than this are faded as too few to trust.
const fewAttempts = 5;
// Display names only; any other course shows its id.
const courseNames: Record<string,string> = {daybreak:'Daybreak',nightfall:'Nightfall',thunderhead:'Thunderhead',midway:'Midway',bigtop:'Big Top',fireworks:'Fireworks'};
const courseName = (id:string) => courseNames[id] ?? id;
const courseRank = (id:string) => { const i = Object.keys(courseNames).indexOf(id); return i < 0 ? Infinity : i; };
const medalOrder = ['gold','silver','bronze','none'] as const;
type SortKey = 'course'|'attempts'|'finishRate'|'quitRate'|'overPar'|'atOrUnderPar'|'doubleAces'|'triesToFirstFinish'|'waterPerAttempt'|'mirrorShare';
const sortValue: Record<Exclude<SortKey,'course'>,(p:PairRow)=>number|null> = {
  attempts:p=>p.attempts, finishRate:p=>p.attempts?p.finished/p.attempts:null, quitRate:p=>p.attempts?p.quits/p.attempts:null,
  overPar:p=>p.overPar, atOrUnderPar:p=>p.atOrUnderPar, doubleAces:p=>p.doubleAces, triesToFirstFinish:p=>p.triesToFirstFinish,
  waterPerAttempt:p=>p.waterPerAttempt, mirrorShare:p=>p.mirrorShare,
};
const columns: {key:SortKey;label:string}[] = [
  {key:'course',label:'Pair'},{key:'attempts',label:'Attempts'},{key:'finishRate',label:'Finishes (first / replay)'},{key:'quitRate',label:'Quits'},
  {key:'overPar',label:'Strokes over par'},{key:'atOrUnderPar',label:'At or under par'},{key:'doubleAces',label:'Double aces'},
  {key:'triesToFirstFinish',label:'Tries to a first finish'},{key:'waterPerAttempt',label:'Water per attempt'},{key:'mirrorShare',label:'Swings in Mirror'},
];
// `course` keeps the report's order (course, newest revision, pair). Every other column puts empty cells last.
function sorted(pairs:PairRow[],key:SortKey,descending:boolean) {
  if (key==='course') return descending?[...pairs].reverse():pairs;
  const value=sortValue[key];
  return pairs.map((p,i)=>({p,i,v:value(p)})).sort((a,b)=>a.v===null||b.v===null?Number(a.v===null)-Number(b.v===null)||a.i-b.i
    :(descending?b.v-a.v:a.v-b.v)||a.i-b.i).map(x=>x.p);
}
function PairsTable({pairs}:{pairs:PairRow[]}) {
  const [key,setKey]=useState<SortKey>('course'),[descending,setDescending]=useState(false);
  function sortBy(next:SortKey) {
    // A new column starts hardest-first for strokes over par and biggest-first for counts; course order starts at the top.
    if (next===key) setDescending(!descending); else { setKey(next); setDescending(next!=='course'); }
  }
  return <section aria-labelledby="pairs-heading">
    <h2 id="pairs-heading">Pairs</h2>
    <p><small>Every attempt at each pair, by course and content revision. Strokes over par, at or under par and hole strokes count finished attempts; tries to a first finish count each install&rsquo;s first finish (1 = first try). Water and Mirror count every attempt. Choose a heading to sort; sort by strokes over par to find the hardest pairs. Faded rows have fewer than {fewAttempts} attempts.</small></p>
    <div style={{overflowX:'auto'}}><table style={{width:'100%',textAlign:'left',borderSpacing:12}}>
      <caption>Attempts and difficulty per pair</caption>
      <thead><tr>{columns.map(c=><th key={c.key} scope="col" aria-sort={key===c.key?(descending?'descending':'ascending'):'none'}>
        <button type="button" onClick={()=>sortBy(c.key)} style={{background:'none',border:0,color:'inherit',cursor:'pointer',font:'inherit',fontWeight:700,padding:0,textAlign:'left'}}>
          {c.label}{key===c.key?(descending?' ▼':' ▲'):''}
        </button></th>)}</tr></thead>
      <tbody>{sorted(pairs,key,descending).map(p=><tr key={`${p.course}:${p.revision}:${p.pair}:${p.slug}`} style={{opacity:p.attempts<fewAttempts?0.5:1}}>
        <th scope="row">{courseName(p.course)} {p.pair}<br/><small>{p.slug} · {p.revision}</small></th>
        <td>{p.attempts}<br/><small>{p.single} in Single Hole</small></td>
        <td>{p.firstFinishes} / {p.replayFinishes}<br/><small>{percentage(p.attempts?p.finished/p.attempts:null)} of attempts</small></td>
        <td>{p.quits}<br/><small>{p.abandoned} abandoned</small></td>
        <td>{signed(p.overPar)}<br/><small>first finishes {signed(p.firstOverPar)}{p.firstHoleStrokes&&<> · holes {decimal(p.firstHoleStrokes[0]!)} + {decimal(p.firstHoleStrokes[1]!)}</>}</small></td>
        <td>{percentage(p.atOrUnderPar)}</td>
        <td>{p.doubleAces}<br/><small>{p.trophies} trophies won</small></td>
        <td>{decimal(p.triesToFirstFinish)}<br/><small>{p.installsFinished} installs finished</small></td>
        <td>{decimal(p.waterPerAttempt,2)}</td>
        <td>{percentage(p.mirrorShare)}</td>
      </tr>)}</tbody>
    </table></div>
    {pairs.length===0&&<p>No pairs played in this selection.</p>}
  </section>;
}
function CoursesTable({courses}:{courses:CourseRow[]}) {
  return <section aria-labelledby="courses-heading">
    <h2 id="courses-heading">Courses</h2>
    <p><small>Course rounds by revision. Left counts rounds left unfinished (Leave Round, or a new round started over one), by the pair the round was on, to show where players stop. Unlocks count installs whose medal opened the course (Daybreak and Nightfall are open from the start).</small></p>
    <div style={{overflowX:'auto'}}><table style={{width:'100%',textAlign:'left',borderSpacing:12}}>
      <caption>Rounds, medals and unlocks per course</caption>
      <thead><tr>{['Course','Rounds started (first time)','Left, by pair','Finished (personal bests)','Medals: gold / silver / bronze / none','Strokes over par','Unlocks'].map(h=><th key={h} scope="col">{h}</th>)}</tr></thead>
      <tbody>{courses.map(c=>{const left=c.left.reduce((a,b)=>a+b,0);return <tr key={`${c.course}:${c.revision}`}>
        <th scope="row">{courseName(c.course)}<br/><small>{c.revision}</small></th>
        <td>{c.started} ({c.firstStarts})</td>
        <td>{left}{left>0&&<><br/><small>{c.left.flatMap((n,i)=>n?[`pair ${i+1}: ${n}`]:[]).join(' · ')}</small></>}</td>
        <td>{c.finished} ({c.best})</td>
        <td>{medalOrder.map(m=>c.medals[m]).join(' / ')}</td>
        <td>{signed(c.overPar)}</td>
        <td>{c.unlocks}</td>
      </tr>;})}</tbody>
    </table></div>
    {courses.length===0&&<p>No rounds or unlocks in this selection.</p>}
  </section>;
}
export default function DoublePuttStats() {
  const [secret,setSecret]=useState(''),[build,setBuild]=useState(''),[channel,setChannel]=useState('testflight'),[days,setDays]=useState(30);
  const [data,setData]=useState<Report|null>(null),[error,setError]=useState(''),[loading,setLoading]=useState(false),[course,setCourse]=useState('');
  async function load(e:FormEvent) {
    e.preventDefault();setLoading(true);setError('');setData(null);
    try {
      const to=utcDay(Date.now()),from=utcDay(Date.parse(to)-(days-1)*86400000);
      const query=new URLSearchParams({channel,from,to});if(build)query.set('build',build);
      const response=await fetch(`/api/double-putt/stats?${query}`,{headers:{Authorization:`Bearer ${secret}`},cache:'no-store'});
      if(!response.ok){setError(response.status===401?'Check the private reporting key.':'Report unavailable. Try again later.');return;}
      setData(await response.json());
    }catch{setError('Report unavailable. Try again later.');}finally{setLoading(false);}
  }
  const courseIds=[...new Set([...(data?.pairs??[]),...(data?.courses??[])].map(r=>r.course))].sort((a,b)=>courseRank(a)-courseRank(b)||a.localeCompare(b));
  const pairs=(data?.pairs??[]).filter(p=>!course||p.course===course),courses=(data?.courses??[]).filter(c=>!course||c.course===course);
  return <main style={{maxWidth:1200,margin:'0 auto',padding:'40px 20px'}}>
    <h1>Double Putt beta report</h1><p>Anonymous aggregate attempts and rounds by receive-day. Daily totals are kept for 90 days. Every build in the selection is pooled; content revisions stay separate.</p>
    <form onSubmit={load} style={{display:'flex',gap:12,flexWrap:'wrap',alignItems:'end'}}>
      <label>Private reporting key<br/><input type="password" value={secret} onChange={e=>setSecret(e.target.value)} autoComplete="off" required/></label>
      <label>Channel<br/><select value={channel} onChange={e=>setChannel(e.target.value)}><option value="testflight">TestFlight</option><option value="appstore">App Store</option><option value="debug">Debug</option></select></label>
      <label>Range<br/><select value={days} onChange={e=>setDays(Number(e.target.value))}>{ranges.map(n=><option key={n} value={n}>Last {n} days</option>)}</select></label>
      <label>Build number (optional)<br/><input value={build} onChange={e=>setBuild(e.target.value)} inputMode="numeric"/></label>
      <button disabled={loading}>{loading?'Loading…':'Load report'}</button>
    </form>
    <p>The key stays in this page’s memory and is sent in an authorization header, never a URL or local storage.</p>
    {error&&<p role="alert">{error}</p>}
    {data&&<>
      <p>Showing receive-days {data.from} to {data.to} (UTC). <strong>{data.firstLaunches}</strong> first launches.</p>
      <div style={{overflowX:'auto'}}><table style={{textAlign:'left',borderSpacing:12}}>
        <caption>Builds in this selection, newest first</caption>
        <thead><tr>{['Build','First launches','Pair attempts','Rounds started','Rounds finished'].map(h=><th key={h} scope="col">{h}</th>)}</tr></thead>
        <tbody>{data.builds.map(b=><tr key={b.build}><th scope="row">{b.build}</th><td>{b.firstLaunches}</td><td>{b.attempts}</td><td>{b.roundsStarted}</td><td>{b.roundsFinished}</td></tr>)}</tbody>
      </table></div>
      {data.builds.length===0&&<p>No reports in this selection.</p>}
      <label>Course <select value={course} onChange={e=>setCourse(e.target.value)}><option value="">All courses</option>{courseIds.map(c=><option key={c} value={c}>{courseName(c)}</option>)}</select></label>
      <PairsTable pairs={pairs}/>
      <CoursesTable courses={courses}/>
      <ul>{data.notes.map(n=><li key={n}>{n}</li>)}</ul>
      <details><summary>Raw counters</summary><pre style={{overflowX:'auto'}}>{JSON.stringify({pairs:data.pairs,courses:data.courses},null,2)}</pre></details>
    </>}
  </main>;
}
