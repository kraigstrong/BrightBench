'use client';
import { useState, type FormEvent } from 'react';
type Row = {build:string;context:{world:string;mode:string;level:number;setup:number;seed:string;revision:string}|null;counts:Record<string,number>;attempts:number;completedAttempts:number;successRate:number|null;allEndedSuccessRate:number|null;deathsWithGrowthPathRate:number|null};
type Report = {notes:string[];rows:Row[]};
const percentage = (x:number|null) => x === null ? '—' : `${(x*100).toFixed(1)}%`;
// Daily totals are kept for 90 days (retentionDays in bigger-fish-analytics.ts), so that's the longest range.
const ranges = [7,30,90];
const utcDay = (ms:number) => new Date(ms).toISOString().slice(0,10);
export default function BiggerFishStats() {
  const [secret,setSecret]=useState(''),[build,setBuild]=useState(''),[channel,setChannel]=useState('testflight'),[days,setDays]=useState(30);
  const [data,setData]=useState<Report|null>(null),[error,setError]=useState(''),[loading,setLoading]=useState(false),[world,setWorld]=useState('');
  async function load(e:FormEvent) {
    e.preventDefault();setLoading(true);setError('');setData(null);
    try {
      const to=utcDay(Date.now()),from=utcDay(Date.parse(to)-(days-1)*86400000);
      const query=new URLSearchParams({channel,from,to});if(build)query.set('build',build);
      const response=await fetch(`/api/bigger-fish/stats?${query}`,{headers:{Authorization:`Bearer ${secret}`},cache:'no-store'});
      if(!response.ok){setError(response.status===401?'Check the private reporting key.':'Report unavailable. Try again later.');return;}
      setData(await response.json());
    }catch{setError('Report unavailable. Try again later.');}finally{setLoading(false);}
  }
  const rows=(data?.rows??[]).filter(r=>r.context&&(!world||r.context.world===world));
  const worlds=[...new Set((data?.rows??[]).flatMap(r=>r.context?[r.context.world]:[]))];
  return <main style={{maxWidth:1200,margin:'0 auto',padding:'40px 20px'}}>
    <h1>Bigger Fish beta report</h1><p>Anonymous aggregate attempts over the last {days} receive-days, sorted by world, level, then newest build. Daily totals are kept for 90 days. Content and builds remain separate.</p>
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
      <label>World <select value={world} onChange={e=>setWorld(e.target.value)}><option value="">All worlds</option>{worlds.map(w=><option key={w} value={w}>{w}</option>)}</select></label>
      <ul>{data.notes.map(n=><li key={n}>{n}</li>)}</ul>
      <div style={{overflowX:'auto'}}><table style={{width:'100%',textAlign:'left',borderSpacing:12}}>
        <caption>Per-level success and death diagnostics</caption>
        <thead><tr>{['World / level','Build / content','Wins / deaths','Quits / abandoned','Win rate','All-ended rate','Deaths with growth path','Unknown death path'].map(h=><th key={h} scope="col">{h}</th>)}</tr></thead>
        <tbody>{rows.map((r,i)=><tr key={`${r.build}:${r.context?.revision}:${r.context?.seed}:${i}`}>
          <th scope="row">{r.context!.world} {r.context!.level}<br/><small>{r.context!.mode}</small></th>
          <td>{r.build}<br/><small>Setup {r.context!.setup} · seed {r.context!.seed}<br/>{r.context!.revision}</small></td>
          <td>{r.counts['outcome.win']??0} / {r.counts['outcome.death']??0}</td>
          <td>{r.counts['outcome.quit']??0} / {r.counts['outcome.abandoned']??0}</td>
          <td>{percentage(r.successRate)} ({r.completedAttempts} attempts)</td>
          <td>{percentage(r.allEndedSuccessRate)} ({r.attempts} ended)</td>
          <td>{percentage(r.deathsWithGrowthPathRate)}</td>
          <td>{r.counts['deathPath.unknown']??0}</td>
        </tr>)}</tbody>
      </table></div>
      {rows.length===0&&<p>No reports in this selection.</p>}
      <details><summary>Detailed histograms and progression counters</summary><pre style={{overflowX:'auto'}}>{JSON.stringify(data.rows,null,2)}</pre></details>
    </>}
  </main>;
}
