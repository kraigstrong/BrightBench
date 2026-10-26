'use client';
import { useEffect, useEffectEvent, useRef, useState, type FormEvent } from 'react';
import type { CourseRow, HoleRow, Report } from '@/lib/double-putt-analytics';
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
const sortValue: Record<Exclude<SortKey,'course'>,(p:HoleRow)=>number|null> = {
  attempts:p=>p.attempts, finishRate:p=>p.attempts?p.finished/p.attempts:null, quitRate:p=>p.attempts?p.quits/p.attempts:null,
  overPar:p=>p.firstOverPar, atOrUnderPar:p=>p.firstAtOrUnderPar, doubleAces:p=>p.doubleAces, triesToFirstFinish:p=>p.triesToFirstFinish,
  waterPerAttempt:p=>p.waterPerAttempt, mirrorShare:p=>p.mirrorShare,
};
const columns: {key:SortKey;label:string}[] = [
  {key:'course',label:'Hole'},{key:'attempts',label:'Attempts'},{key:'finishRate',label:'Finishes (first / replay)'},{key:'quitRate',label:'Quit rate'},
  {key:'overPar',label:'Strokes over par'},{key:'atOrUnderPar',label:'At or under par'},{key:'doubleAces',label:'Double aces'},
  {key:'triesToFirstFinish',label:'Tries to a first finish'},{key:'waterPerAttempt',label:'Water per attempt'},{key:'mirrorShare',label:'Swings in Mirror'},
];
// `course` keeps the report's order (course, newest revision, hole). Every other column puts empty cells last.
function sorted(holes:HoleRow[],key:SortKey,descending:boolean) {
  if (key==='course') return descending?[...holes].reverse():holes;
  const value=sortValue[key];
  return holes.map((p,i)=>({p,i,v:value(p)})).sort((a,b)=>a.v===null||b.v===null?Number(a.v===null)-Number(b.v===null)||a.i-b.i
    :(descending?b.v-a.v:a.v-b.v)||a.i-b.i).map(x=>x.p);
}
function HolesTable({holes}:{holes:HoleRow[]}) {
  const [key,setKey]=useState<SortKey>('course'),[descending,setDescending]=useState(false);
  function sortBy(next:SortKey) {
    // A new column starts hardest-first for strokes over par and biggest-first for counts; course order starts at the top.
    if (next===key) setDescending(!descending); else { setKey(next); setDescending(next!=='course'); }
  }
  return <section aria-labelledby="holes-heading">
    <h2 id="holes-heading">Holes</h2>
    <p><small>Every attempt at each hole, by course and content revision. Strokes over par, at or under par, green strokes and tries count first finishes, each install&rsquo;s first finish of the hole (1 = first try); the small figures beside them include replays, which are mostly players chasing the trophy. Water and Mirror count every attempt. Choose a heading to sort; sort by strokes over par to find the hardest holes. Faded rows have fewer than {fewAttempts} attempts.</small></p>
    <div style={{overflowX:'auto'}}><table style={{width:'100%',textAlign:'left',borderSpacing:12}}>
      <caption>Attempts and difficulty per hole</caption>
      <thead><tr>{columns.map(c=><th key={c.key} scope="col" aria-sort={key===c.key?(descending?'descending':'ascending'):'none'}>
        <button type="button" onClick={()=>sortBy(c.key)} style={{background:'none',border:0,color:'inherit',cursor:'pointer',font:'inherit',fontWeight:700,padding:0,textAlign:'left'}}>
          {c.label}{key===c.key?(descending?' ▼':' ▲'):''}
        </button></th>)}</tr></thead>
      <tbody>{sorted(holes,key,descending).map(p=><tr key={`${p.course}:${p.revision}:${p.hole}:${p.slug}`} style={{opacity:p.attempts<fewAttempts?0.5:1}}>
        <th scope="row">{courseName(p.course)} {p.hole}<br/><small>{p.slug} · {p.revision}</small></th>
        <td>{p.attempts}<br/><small>{p.single} in Free Play</small></td>
        <td>{p.firstFinishes} / {p.replayFinishes}<br/><small>{percentage(p.attempts?p.finished/p.attempts:null)} of attempts</small></td>
        <td>{percentage(p.attempts?p.quits/p.attempts:null)}<br/><small>{p.quits} quit · {p.abandoned} abandoned</small></td>
        <td>{signed(p.firstOverPar)}<br/><small>{p.firstGreenStrokes&&<>greens {decimal(p.firstGreenStrokes[0]!)} + {decimal(p.firstGreenStrokes[1]!)} · </>}all finishes {signed(p.allOverPar)}</small></td>
        <td>{percentage(p.firstAtOrUnderPar)}<br/><small>all finishes {percentage(p.allAtOrUnderPar)}</small></td>
        <td>{p.doubleAces}<br/><small>{p.trophies} trophies won</small></td>
        <td>{decimal(p.triesToFirstFinish)}<br/><small>median {p.medianTries??'—'} · {p.installsFinished} installs finished</small></td>
        <td>{decimal(p.waterPerAttempt,2)}</td>
        <td>{percentage(p.mirrorShare)}</td>
      </tr>)}</tbody>
    </table></div>
    {holes.length===0&&<p>No holes played in this selection.</p>}
  </section>;
}
function CoursesTable({courses}:{courses:CourseRow[]}) {
  return <section aria-labelledby="courses-heading">
    <h2 id="courses-heading">Courses</h2>
    <p><small>Course rounds by revision. Left counts rounds left unfinished (Leave Round, or a new round started over one), by the hole the round was on, to show where players stop. Unlocks count installs whose medal opened the course (Daybreak and Nightfall are open from the start).</small></p>
    <div style={{overflowX:'auto'}}><table style={{width:'100%',textAlign:'left',borderSpacing:12}}>
      <caption>Rounds, medals and unlocks per course</caption>
      <thead><tr>{['Course','Rounds started (first time)','Left, by hole','Finished (personal bests)','Medals: gold / silver / bronze / none','Strokes over par','Unlocks'].map(h=><th key={h} scope="col">{h}</th>)}</tr></thead>
      <tbody>{courses.map(c=>{const left=c.left.reduce((a,b)=>a+b,0);return <tr key={`${c.course}:${c.revision}`}>
        <th scope="row">{courseName(c.course)}<br/><small>{c.revision}</small></th>
        <td>{c.started} ({c.firstStarts})</td>
        <td>{left}{left>0&&<><br/><small>{c.left.flatMap((n,i)=>n?[`hole ${i+1}: ${n}`]:[]).join(' · ')}</small></>}</td>
        <td>{c.finished} ({c.best})</td>
        <td>{medalOrder.map(m=>c.medals[m]).join(' / ')}</td>
        <td>{signed(c.overPar)}</td>
        <td>{c.unlocks}</td>
      </tr>;})}</tbody>
    </table></div>
    {courses.length===0&&<p>No rounds or unlocks in this selection.</p>}
  </section>;
}
// The report, 401 for a rejected key, or null when it's unavailable.
async function fetchReport(query:URLSearchParams,secret:string,signal:AbortSignal):Promise<Report|401|null> {
  const response=await fetch(`/api/double-putt/stats?${query}`,{headers:{Authorization:`Bearer ${secret}`},cache:'no-store',signal});
  return response.status===401?401:response.ok?await response.json() as Report:null;
}
// One tab of the stats viewer (stats-viewer.tsx), which holds the key: it loads once on opening, then again from the
// form with new filters. A rejected key is the viewer's to handle (it locks).
export default function DoublePuttStats({secret,onUnauthorized}:{secret:string;onUnauthorized:()=>void}) {
  const [appVersion,setAppVersion]=useState(''),[build,setBuild]=useState(''),[channel,setChannel]=useState('testflight'),[days,setDays]=useState(30);
  const [data,setData]=useState<Report|null>(null),[error,setError]=useState(''),[loading,setLoading]=useState(true),[course,setCourse]=useState('');
  // The request in flight. A newer one aborts it, and so does the viewer locking, so a late answer changes nothing.
  const pending=useRef<AbortController|null>(null);
  function requestReport() {
    pending.current?.abort();const request=new AbortController();pending.current=request;
    const to=utcDay(Date.now()),from=utcDay(Date.parse(to)-(days-1)*86400000);
    const query=new URLSearchParams({channel,from,to});if(appVersion)query.set('appVersion',appVersion);if(build)query.set('build',build);
    // State changes only in the callbacks, once the answer is in, so the first load can start from an effect.
    fetchReport(query,secret,request.signal).then(report=>{if(request.signal.aborted)return;if(report===401)onUnauthorized();else if(report)setData(report);else setError('Report unavailable. Try again later.');},
      ()=>{if(!request.signal.aborted)setError('Report unavailable. Try again later.');})
      .finally(()=>{if(pending.current===request){pending.current=null;setLoading(false);}});
  }
  function load(e:FormEvent<HTMLFormElement>) {
    e.preventDefault();setLoading(true);setError('');setData(null);setCourse('');requestReport();
  }
  const loadFirst=useEffectEvent(requestReport);
  useEffect(()=>{loadFirst();return()=>pending.current?.abort();},[]);
  const courseIds=[...new Set([...(data?.holes??[]),...(data?.courses??[])].map(r=>r.course))].sort((a,b)=>courseRank(a)-courseRank(b)||a.localeCompare(b));
  const holes=(data?.holes??[]).filter(p=>!course||p.course===course),courses=(data?.courses??[]).filter(c=>!course||c.course===course);
  return <>
    <p>Anonymous aggregate attempts and rounds by receive-day. Daily totals are kept for 90 days. Every build in the selection is pooled; content revisions stay separate.</p>
    <form onSubmit={load} style={{display:'flex',gap:12,flexWrap:'wrap',alignItems:'end'}}>
      <label>Channel<br/><select value={channel} onChange={e=>setChannel(e.target.value)}><option value="testflight">TestFlight</option><option value="appstore">App Store</option><option value="debug">Debug</option></select></label>
      <label>Range<br/><select value={days} onChange={e=>setDays(Number(e.target.value))}>{ranges.map(n=><option key={n} value={n}>Last {n} days</option>)}</select></label>
      <label>App version (optional)<br/><input value={appVersion} onChange={e=>setAppVersion(e.target.value)} inputMode="decimal" placeholder="0.1" data-1p-ignore/></label>
      <label>Build number (optional)<br/><input value={build} onChange={e=>setBuild(e.target.value)} inputMode="numeric" data-1p-ignore/></label>
      <button disabled={loading}>{loading?'Loading…':'Load report'}</button>
    </form>
    {error&&<p role="alert">{error}</p>}
    {data&&<>
      <p>Showing receive-days {data.from} to {data.to} (UTC). <strong>{data.firstLaunches}</strong> first launches.</p>
      <div style={{overflowX:'auto'}}><table style={{textAlign:'left',borderSpacing:12}}>
        <caption>Builds in this selection, newest first</caption>
        <thead><tr>{['Build','First launches','Hole attempts','Rounds started','Rounds finished'].map(h=><th key={h} scope="col">{h}</th>)}</tr></thead>
        <tbody>{data.builds.map(b=><tr key={b.build}><th scope="row">{b.build}</th><td>{b.firstLaunches}</td><td>{b.attempts}</td><td>{b.roundsStarted}</td><td>{b.roundsFinished}</td></tr>)}</tbody>
      </table></div>
      {data.builds.length===0&&<p>No reports in this selection.</p>}
      <label>Course <select value={course} onChange={e=>setCourse(e.target.value)}><option value="">All courses</option>{courseIds.map(c=><option key={c} value={c}>{courseName(c)}</option>)}</select></label>
      <HolesTable holes={holes}/>
      <CoursesTable courses={courses}/>
      <ul>{data.notes.map(n=><li key={n}>{n}</li>)}</ul>
      <details><summary>Raw counters</summary><pre style={{overflowX:'auto'}}>{JSON.stringify({holes:data.holes,courses:data.courses},null,2)}</pre></details>
    </>}
  </>;
}
