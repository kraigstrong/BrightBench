'use client';
import { useState, type FormEvent } from 'react';
import { difficultyRamp, type RampWorld } from '@/lib/bigger-fish-ramp';
type Row = {build:string;context:{world:string;mode:string;level:number;setup:number;seed:string;revision:string}|null;counts:Record<string,number>;attempts:number;completedAttempts:number;successRate:number|null;allEndedSuccessRate:number|null;deathsWithGrowthPathRate:number|null};
type Report = {from:string;to:string;notes:string[];rows:Row[]};
const percentage = (x:number|null) => x === null ? '—' : `${(x*100).toFixed(1)}%`;
// Daily totals are kept for 90 days (retentionDays in bigger-fish-analytics.ts), so that's the longest range.
const ranges = [7,30,90];
const utcDay = (ms:number) => new Date(ms).toISOString().slice(0,10);
// Levels past ten are a world's Deep End. Fewer finished attempts than this and a bar is faded as too few to trust.
const mainLevels = 10, fewAttempts = 5;
function RampChart({worlds}:{worlds:RampWorld[]}) {
  return <section aria-labelledby="ramp-heading">
    <h2 id="ramp-heading">Win rate by level</h2>
    <p><small>Wins ÷ (wins + deaths) for campaign levels, every build in this selection pooled. Gold bars are the Deep End; faded bars have fewer than {fewAttempts} finished attempts.</small></p>
    {worlds.map(({world,levels})=><figure key={world} style={{margin:'0 0 24px'}}>
      <figcaption><strong>{world}</strong></figcaption>
      <div style={{display:'flex',alignItems:'flex-end',gap:6,height:170,borderBottom:'1px solid #999',paddingTop:8,overflowX:'auto'}}>
        {levels.map(l=>{const n=l.wins+l.deaths;return <div key={l.level} role="img" aria-label={`Level ${l.level}: ${l.rate===null?'no finished attempts':`${percentage(l.rate)} of ${n} finished attempts`}`}
          style={{flex:'1 0 32px',maxWidth:56,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'flex-end',height:'100%'}}>
          <small>{l.rate===null?'—':`${Math.round(l.rate*100)}%`}</small>
          <div style={{width:'100%',height:`${(l.rate??0)*130}px`,minHeight:l.rate===null?0:2,borderRadius:'4px 4px 0 0',
            background:l.level>mainLevels?'#e0a526':'#2a9d8f',opacity:n<fewAttempts?0.35:1}}/>
        </div>;})}
      </div>
      <div aria-hidden="true" style={{display:'flex',gap:6}}>{levels.map(l=><small key={l.level} style={{flex:'1 0 32px',maxWidth:56,textAlign:'center'}}>{l.level}<br/>n={l.wins+l.deaths}</small>)}</div>
    </figure>)}
  </section>;
}
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
    <h1>Bigger Fish beta report</h1><p>Anonymous aggregate attempts by receive-day, sorted by world, level, then newest build. Daily totals are kept for 90 days. Content and builds remain separate.</p>
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
      <p>Showing receive-days {data.from} to {data.to} (UTC).</p>
      <label>World <select value={world} onChange={e=>setWorld(e.target.value)}><option value="">All worlds</option>{worlds.map(w=><option key={w} value={w}>{w}</option>)}</select></label>
      <RampChart worlds={difficultyRamp(rows.map(r=>({context:r.context,counts:r.counts})))}/>
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
