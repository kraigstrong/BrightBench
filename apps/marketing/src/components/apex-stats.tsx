'use client';
import { useEffect, useEffectEvent, useRef, useState, type FormEvent } from 'react';
import type { BoardStats, LapStats } from '@/lib/apex-laps';
// Lap counters are kept for 90 days (retentionDays in apex-laps.ts), so that's the longest range.
const ranges = [7,30,90];
const utcDay = (ms:number) => new Date(ms).toISOString().slice(0,10);
const seconds = (ms:number|null) => ms === null ? '—' : (ms/1000).toFixed(2);
const percentage = (x:number|null) => x === null ? '—' : `${(x*100).toFixed(0)}%`;
// A board is `<circuit>.r<revision>.p<physics>`; the app names each circuit by its id, capitalized.
function boardName(board:string) {
  const [circuit='',revision='',physics=''] = board.split('.');
  return {circuit:circuit.charAt(0).toUpperCase()+circuit.slice(1),detail:`physics ${physics.slice(1)} · revision ${revision.slice(1)}`,physics:physics.slice(1)};
}
const sum = (laps:Record<string,number>,keep:(board:string)=>boolean=()=>true) => Object.entries(laps).reduce((n,[b,v])=>keep(b)?n+v:n,0);
function BoardsTable({boards}:{boards:BoardStats[]}) {
  return <section aria-labelledby="apex-boards-heading">
    <h2 id="apex-boards-heading">Boards</h2>
    <p><small>Each circuit at one physics version: laps in this range, their lap times, and the share of laps without touching a wall. Players are everyone signed in to Game Center with a best on the board, all time. Faded rows have no laps in this range.</small></p>
    <div style={{overflowX:'auto'}}><table style={{width:'100%',textAlign:'left',borderSpacing:12}}>
      <caption>Laps, lap times and players per board</caption>
      <thead><tr>{['Board','Laps','Players','Fastest lap','Median lap','Laps with no wall hit'].map(h=><th key={h} scope="col">{h}</th>)}</tr></thead>
      <tbody>{boards.map(b=>{const name=boardName(b.board);return <tr key={b.board} style={{opacity:b.laps?1:0.5}}>
        <th scope="row">{name.circuit}<br/><small>{name.detail}</small></th>
        <td>{b.laps}</td>
        <td>{b.players}</td>
        <td>{seconds(b.fastestMs)}</td>
        <td>{seconds(b.medianMs)}</td>
        <td>{percentage(b.laps?(b.walls['0']??0)/b.laps:null)}</td>
      </tr>;})}</tbody>
    </table></div>
  </section>;
}
function DaysTable({days,physics}:{days:LapStats['days'];physics:string[]}) {
  return <section aria-labelledby="apex-days-heading">
    <h2 id="apex-days-heading">Laps per day</h2>
    <div style={{overflowX:'auto'}}><table style={{textAlign:'left',borderSpacing:12}}>
      <caption>Laps per UTC day, newest first, by physics version</caption>
      <thead><tr>{['Day','Laps',...physics.map(p=>`Physics ${p}`)].map(h=><th key={h} scope="col">{h}</th>)}</tr></thead>
      <tbody>{days.map(d=><tr key={d.day} style={{opacity:sum(d.laps)?1:0.5}}>
        <th scope="row">{d.day}</th><td>{sum(d.laps)}</td>
        {physics.map(p=><td key={p}>{sum(d.laps,b=>boardName(b).physics===p)}</td>)}
      </tr>)}</tbody>
    </table></div>
  </section>;
}
// The report, 401 for a rejected key, or null when it's unavailable.
async function fetchReport(query:URLSearchParams,secret:string,signal:AbortSignal):Promise<LapStats|401|null> {
  const response=await fetch(`/api/apex/stats?${query}`,{headers:{Authorization:`Bearer ${secret}`},cache:'no-store',signal});
  return response.status===401?401:response.ok?await response.json() as LapStats:null;
}
// One tab of the stats viewer (stats-viewer.tsx), which holds the key: it loads once on opening, then again from the
// form with a new range. A rejected key is the viewer's to handle (it locks).
export default function ApexStats({secret,onUnauthorized}:{secret:string;onUnauthorized:()=>void}) {
  const [days,setDays]=useState(30),[data,setData]=useState<LapStats|null>(null),[error,setError]=useState(''),[loading,setLoading]=useState(true);
  // The request in flight. A newer one aborts it, and so does the viewer locking, so a late answer changes nothing.
  const pending=useRef<AbortController|null>(null);
  function requestReport() {
    pending.current?.abort();const request=new AbortController();pending.current=request;
    const to=utcDay(Date.now()),from=utcDay(Date.parse(to)-(days-1)*86400000);
    fetchReport(new URLSearchParams({from,to}),secret,request.signal).then(report=>{if(request.signal.aborted)return;if(report===401)onUnauthorized();else if(report)setData(report);else setError('Report unavailable. Try again later.');},
      ()=>{if(!request.signal.aborted)setError('Report unavailable. Try again later.');})
      .finally(()=>{if(pending.current===request){pending.current=null;setLoading(false);}});
  }
  function load(e:FormEvent<HTMLFormElement>) {
    e.preventDefault();setLoading(true);setError('');setData(null);requestReport();
  }
  const loadFirst=useEffectEvent(requestReport);
  useEffect(()=>{loadFirst();return()=>pending.current?.abort();},[]);
  const physics=[...new Set((data?.boards??[]).map(b=>boardName(b.board).physics))];
  const laps=(data?.boards??[]).reduce((n,b)=>n+b.laps,0);
  return <>
    <p>Every finished lap Ghost Thread uploads to the lap service, counted anonymously per board and day. Daily counters are kept for 90 days.</p>
    <form onSubmit={load} style={{display:'flex',gap:12,flexWrap:'wrap',alignItems:'end'}}>
      <label>Range<br/><select value={days} onChange={e=>setDays(Number(e.target.value))}>{ranges.map(n=><option key={n} value={n}>Last {n} days</option>)}</select></label>
      <button disabled={loading}>{loading?'Loading…':'Load report'}</button>
    </form>
    {error&&<p role="alert">{error}</p>}
    {data&&<>
      <p>Showing days {data.from} to {data.to} (UTC). <strong>{laps}</strong> laps{physics.length>1&&<>: {physics.map(p=>`${data.boards.filter(b=>boardName(b.board).physics===p).reduce((n,b)=>n+b.laps,0)} on physics ${p}`).join(', ')}</>}.</p>
      <BoardsTable boards={data.boards}/>
      <DaysTable days={data.days} physics={physics}/>
      <ul>{data.notes.map(n=><li key={n}>{n}</li>)}</ul>
      <details><summary>Raw counters</summary><pre style={{overflowX:'auto'}}>{JSON.stringify(data.boards,null,2)}</pre></details>
    </>}
  </>;
}
