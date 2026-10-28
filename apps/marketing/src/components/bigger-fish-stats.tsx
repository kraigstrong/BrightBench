'use client';
import { useEffect, useEffectEvent, useRef, useState, type FormEvent } from 'react';
import { difficultyRamp, tryGroups, type RampWorld } from '@/lib/bigger-fish-ramp';
import { paywallFunnel, purchaseOutcomes, restoreOutcomes, type PaywallFunnel } from '@/lib/bigger-fish-paywall';
import { openWaterReport, shopReport } from '@/lib/bigger-fish-open-water';
import { OpenWaterChart, ShopChart } from '@/components/bigger-fish-open-water-stats';
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
// Light to dark as first clears take more tries, one shade per entry of `tryGroups`.
const tryShades = ['#fde9a9','#fbd17a','#f6b35a','#ee8f45','#dd6a3a','#bf4630','#8c2318'];
function TriesChart({worlds}:{worlds:RampWorld[]}) {
  return <section aria-labelledby="tries-heading">
    <h2 id="tries-heading">Tries to a first clear</h2>
    <p><small>For each install&rsquo;s first clear of a campaign level: how many runs it took, the winning run and any it quit included. Bars split those first clears by tries; the number on top is the median. Faded bars have fewer than {fewAttempts} first clears; gold level numbers are the Deep End.</small></p>
    <div aria-hidden="true" style={{display:'flex',flexWrap:'wrap',gap:12,margin:'0 0 12px'}}>{tryGroups.map((g,i)=><small key={g.label} style={{display:'flex',alignItems:'center',gap:4}}>
      <span style={{display:'inline-block',width:12,height:12,borderRadius:2,background:tryShades[i]}}/>{g.label} {g.label==='1'?'try':'tries'}</small>)}</div>
    {worlds.map(({world,levels})=><figure key={world} style={{margin:'0 0 24px'}}>
      <figcaption><strong>{world}</strong></figcaption>
      <div style={{display:'flex',alignItems:'flex-end',gap:6,height:170,borderBottom:'1px solid #999',paddingTop:8,overflowX:'auto'}}>
        {levels.map(l=><div key={l.level} role="img" aria-label={`Level ${l.level}: ${l.medianTries===null?'no first clears':`median ${l.medianTries} tries over ${l.firstClears} first clears; `+tryGroups.map((g,i)=>`${l.tries[i]} took ${g.label}`).join(', ')}`}
          style={{flex:'1 0 32px',maxWidth:56,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'flex-end',height:'100%'}}>
          <small>{l.medianTries??'—'}</small>
          <div style={{width:'100%',height:l.firstClears?130:0,display:'flex',flexDirection:'column-reverse',borderRadius:'4px 4px 0 0',overflow:'hidden',opacity:l.firstClears<fewAttempts?0.35:1}}>
            {l.tries.map((n,i)=><div key={i} style={{height:`${l.firstClears?n/l.firstClears*100:0}%`,background:tryShades[i]}}/>)}
          </div>
        </div>)}
      </div>
      <div aria-hidden="true" style={{display:'flex',gap:6}}>{levels.map(l=><small key={l.level} style={{flex:'1 0 32px',maxWidth:56,textAlign:'center',color:l.level>mainLevels?'#b07d0f':undefined}}>{l.level}<br/>n={l.firstClears}</small>)}</div>
    </figure>)}
  </section>;
}
function FunnelChart({worlds}:{worlds:RampWorld[]}) {
  // One scale across every world shown, so the drop from world to world reads as part of the same funnel.
  const most=Math.max(1,...worlds.flatMap(w=>w.levels.map(l=>Math.max(l.started,l.cleared))));
  const height=(n:number)=>`${n/most*130}px`;
  return <section aria-labelledby="funnel-heading">
    <h2 id="funnel-heading">Players clearing each level</h2>
    <p><small>Installs that cleared each campaign level (solid) out of installs that started it (light), each install counted once per level. Use the 90-day range: an install counts only on the days its reports arrived, so a short range can miss its early levels.</small></p>
    {worlds.map(({world,levels})=><figure key={world} style={{margin:'0 0 24px'}}>
      <figcaption><strong>{world}</strong></figcaption>
      <div style={{display:'flex',alignItems:'flex-end',gap:6,height:170,borderBottom:'1px solid #999',paddingTop:8,overflowX:'auto'}}>
        {levels.map(l=>{const color=l.level>mainLevels?'#e0a526':'#2a9d8f';return <div key={l.level} role="img" aria-label={`Level ${l.level}: ${l.cleared} installs cleared it of ${l.started} that started it`}
          style={{flex:'1 0 32px',maxWidth:56,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'flex-end',height:'100%'}}>
          <small>{l.cleared}</small>
          <div style={{position:'relative',width:'100%',height:height(Math.max(l.started,l.cleared))}}>
            <div style={{position:'absolute',inset:0,borderRadius:'4px 4px 0 0',background:color,opacity:0.25}}/>
            <div style={{position:'absolute',left:0,right:0,bottom:0,height:height(l.cleared),borderRadius:'4px 4px 0 0',background:color}}/>
          </div>
        </div>;})}
      </div>
      <div aria-hidden="true" style={{display:'flex',gap:6}}>{levels.map(l=><small key={l.level} style={{flex:'1 0 32px',maxWidth:56,textAlign:'center'}}>{l.level}<br/>of {l.started}</small>)}</div>
    </figure>)}
  </section>;
}
const sourceNames: Record<string,string> = {padlocked_level:'Padlocked level',next_level:'Next level onto a padlock',unlock_all:'Unlock all (world map)',
  locked_world:'Locked world (world map)',conquered:'A world conquered',open_water_limit:'Open Water runs used up',settings:'Settings (restore only)'};
const outcomeNames: Record<string,string> = {unlocked:'Unlocked',pending:'Pending',cancelled:'Cancelled',failed:'Failed',restored:'Restored',not_found:'Nothing found'};
function PaywallChart({funnel}:{funnel:PaywallFunnel}) {
  const anyRuns=funnel.runs.some(w=>w.free.runs+w.unlocked.runs>0);
  return <section aria-labelledby="paywall-heading">
    <h2 id="paywall-heading">The unlock</h2>
    <p><small>Every build in this selection pooled. Shown counts every time the unlock&rsquo;s screen opened; first counts installs seeing it for the first time, by where that was. Purchases and restores count attempts on each screen, not people.</small></p>
    <div style={{overflowX:'auto'}}><table style={{textAlign:'left',borderSpacing:12}}>
      <caption>Where the unlock&rsquo;s screen opened, and what happened there</caption>
      <thead><tr>{['Opened from','Shown','First',...purchaseOutcomes.map(o=>outcomeNames[o]!),...restoreOutcomes.map(o=>`Restore: ${outcomeNames[o]}`)].map(h=><th key={h} scope="col">{h}</th>)}</tr></thead>
      <tbody>{funnel.sources.map(s=><tr key={s.source}>
        <th scope="row">{sourceNames[s.source]??s.source}</th>
        <td>{s.source==='settings'?'—':s.shown}</td><td>{s.source==='settings'?'—':s.first}</td>
        {purchaseOutcomes.map(o=><td key={o}>{s.source==='settings'?'—':s.purchases[o]}</td>)}
        {restoreOutcomes.map(o=><td key={o}>{s.restores[o]}</td>)}
      </tr>)}</tbody>
    </table></div>
    <div style={{overflowX:'auto'}}><table style={{textAlign:'left',borderSpacing:12}}>
      <caption>Installs that conquered each world (its ten main levels beaten)</caption>
      <thead><tr><th scope="col">World</th><th scope="col">Conquered</th></tr></thead>
      <tbody>{funnel.conquered.map(c=><tr key={c.world}><th scope="row">{c.world}</th><td>{c.installs}</td></tr>)}</tbody>
    </table></div>
    {anyRuns&&<div style={{overflowX:'auto'}}><table style={{textAlign:'left',borderSpacing:12}}>
      <caption>Campaign runs with and without the unlock (only runs from builds that sell it; replays included)</caption>
      <thead><tr>{['World','Free: runs','Free: win rate','Unlocked: runs','Unlocked: win rate'].map(h=><th key={h} scope="col">{h}</th>)}</tr></thead>
      <tbody>{funnel.runs.map(w=><tr key={w.world}>
        <th scope="row">{w.world}</th>
        <td>{w.free.runs}</td><td>{percentage(w.free.rate)} ({w.free.wins+w.free.deaths} finished)</td>
        <td>{w.unlocked.runs}</td><td>{percentage(w.unlocked.rate)} ({w.unlocked.wins+w.unlocked.deaths} finished)</td>
      </tr>)}</tbody>
    </table></div>}
  </section>;
}
// The report, 401 for a rejected key, or null when it's unavailable.
async function fetchReport(query:URLSearchParams,secret:string,signal:AbortSignal):Promise<Report|401|null> {
  const response=await fetch(`/api/bigger-fish/stats?${query}`,{headers:{Authorization:`Bearer ${secret}`},cache:'no-store',signal});
  return response.status===401?401:response.ok?await response.json() as Report:null;
}
// One tab of the stats viewer (stats-viewer.tsx), which holds the key: it loads once on opening, then again from the
// form with new filters. A rejected key is the viewer's to handle (it locks).
export default function BiggerFishStats({secret,onUnauthorized}:{secret:string;onUnauthorized:()=>void}) {
  const [build,setBuild]=useState(''),[channel,setChannel]=useState('testflight'),[days,setDays]=useState(30);
  const [data,setData]=useState<Report|null>(null),[error,setError]=useState(''),[loading,setLoading]=useState(true),[world,setWorld]=useState('');
  const [openWaterRevision,setOpenWaterRevision]=useState('');
  // The request in flight. A newer one aborts it, and so does the viewer locking, so a late answer changes nothing.
  const pending=useRef<AbortController|null>(null);
  function requestReport() {
    pending.current?.abort();const request=new AbortController();pending.current=request;
    const to=utcDay(Date.now()),from=utcDay(Date.parse(to)-(days-1)*86400000);
    const query=new URLSearchParams({channel,from,to});if(build)query.set('build',build);
    // State changes only in the callbacks, once the answer is in, so the first load can start from an effect.
    fetchReport(query,secret,request.signal).then(report=>{if(request.signal.aborted)return;if(report===401)onUnauthorized();else if(report)setData(report);else setError('Report unavailable. Try again later.');},
      ()=>{if(!request.signal.aborted)setError('Report unavailable. Try again later.');})
      .finally(()=>{if(pending.current===request){pending.current=null;setLoading(false);}});
  }
  function load(e:FormEvent<HTMLFormElement>) {
    e.preventDefault();setLoading(true);setError('');setData(null);setOpenWaterRevision('');requestReport();
  }
  const loadFirst=useEffectEvent(requestReport);
  useEffect(()=>{loadFirst();return()=>pending.current?.abort();},[]);
  // The campaign's rows: Open Water runs have a section of their own.
  const rows=(data?.rows??[]).filter(r=>r.context&&r.context.mode==='campaign'&&(!world||r.context.world===world));
  const worlds=[...new Set((data?.rows??[]).flatMap(r=>r.context?.mode==='campaign'?[r.context.world]:[]))];
  const perLevel=difficultyRamp(rows.map(r=>({context:r.context,counts:r.counts})));
  const funnel=paywallFunnel(data?.rows??[],world);
  // An Open Water revision chosen for one report, and not in this one, would hide every run: it's let go.
  const shownRevision=data&&openWaterReport(data.rows).revisions.includes(openWaterRevision)?openWaterRevision:'';
  return <>
    <p>Anonymous aggregate attempts by receive-day, sorted by world, level, then newest build. Daily totals are kept for 90 days. Content and builds remain separate.</p>
    <form onSubmit={load} style={{display:'flex',gap:12,flexWrap:'wrap',alignItems:'end'}}>
      <label>Channel<br/><select value={channel} onChange={e=>setChannel(e.target.value)}><option value="testflight">TestFlight</option><option value="appstore">App Store</option><option value="debug">Debug</option></select></label>
      <label>Range<br/><select value={days} onChange={e=>setDays(Number(e.target.value))}>{ranges.map(n=><option key={n} value={n}>Last {n} days</option>)}</select></label>
      <label>Build number (optional)<br/><input value={build} onChange={e=>setBuild(e.target.value)} inputMode="numeric" data-1p-ignore/></label>
      <button disabled={loading}>{loading?'Loading…':'Load report'}</button>
    </form>
    {error&&<p role="alert">{error}</p>}
    {data&&<>
      <p>Showing receive-days {data.from} to {data.to} (UTC).</p>
      <label>World <select value={world} onChange={e=>setWorld(e.target.value)}><option value="">All worlds</option>{worlds.map(w=><option key={w} value={w}>{w}</option>)}</select></label>
      <FunnelChart worlds={perLevel}/>
      <TriesChart worlds={perLevel}/>
      <RampChart worlds={perLevel}/>
      <PaywallChart funnel={funnel}/>
      <OpenWaterChart report={openWaterReport(data.rows,shownRevision||undefined)} revision={shownRevision} onRevision={setOpenWaterRevision}/>
      <ShopChart shop={shopReport(data.rows)}/>
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
  </>;
}
