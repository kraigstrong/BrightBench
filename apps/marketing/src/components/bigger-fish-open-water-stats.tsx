'use client';
import type { Histogram, OpenWaterReport, ShopReport } from '@/lib/bigger-fish-open-water';
// The beta report's Open Water and pearl shop sections (bigger-fish-open-water.ts has the numbers).
const percentage = (x:number|null) => x === null ? '—' : `${(x*100).toFixed(1)}%`;
const share = (part:number,whole:number) => whole ? part/whole : null;
const round = (x:number|null,digits=1) => x === null ? '—' : x.toFixed(digits);
const worldNames: Record<string,string> = {'shallow-reef':'Shallow Reef','jelly-bloom':'Jelly Bloom','kelp-forest':'Kelp Forest','sunset-cove':'Sunset Cove','midnight-zone':'Midnight Zone'};
const endingNames: Record<string,string> = {predator:'Eaten',tentacles:'Stung',hook:'Hooked',urchin:'Urchin',quit:'Quit',abandoned:'Left unfinished'};
// Fewer runs than this reach a level and its bar is faded as too few to trust.
const fewRuns = 5;
// A histogram's buckets as "up to N" ranges, the empty ones at either end left off.
function HistogramTable({caption,histogram,unit}:{caption:string;histogram:Histogram;unit:string}) {
  const first=histogram.findIndex(h=>h.runs>0), last=histogram.length-1-[...histogram].reverse().findIndex(h=>h.runs>0);
  if (first<0) return null;
  const shown=histogram.slice(first,last+1), total=shown.reduce((a,h)=>a+h.runs,0);
  return <div style={{overflowX:'auto'}}><table style={{textAlign:'left',borderSpacing:12}}>
    <caption>{caption}</caption>
    <thead><tr><th scope="col">{unit}</th>{shown.map(h=><th key={h.bound} scope="col">{h.bound===0?'0':`≤ ${h.bound}`}</th>)}</tr></thead>
    <tbody><tr><th scope="row">Runs</th>{shown.map(h=><td key={h.bound}>{h.runs}<br/><small>{percentage(share(h.runs,total))}</small></td>)}</tr></tbody>
  </table></div>;
}
export function OpenWaterChart({report,revision,onRevision}:{report:OpenWaterReport;revision:string;onRevision:(revision:string)=>void}) {
  const most=Math.max(1,...report.levels.map(l=>l.reached));
  const height=(n:number)=>`${n/most*130}px`;
  const endings=[...new Set(report.levels.flatMap(l=>Object.keys(l.endings)))];
  const decided=report.after.retry+report.after.leave;
  return <section aria-labelledby="open-water-heading">
    <h2 id="open-water-heading">The Open Water</h2>
    <p><small>Every build in this selection pooled. A run is counted on the level where it ended; a level&rsquo;s reached count adds up the runs that ended there or later. Levels go round the five worlds; the number after a world is the campaign level its levels are made like.</small></p>
    {report.revisions.length>1&&<label>Open Water revision <select value={revision} onChange={e=>onRevision(e.target.value)}>
      <option value="">All revisions pooled</option>{report.revisions.map(r=><option key={r} value={r}>{r}</option>)}</select></label>}
    {report.runs===0?<p>No Open Water runs in this selection.</p>:<>
      <ul>
        <li>{report.runs} runs: {report.outcomes.death} lost, {report.outcomes.quit} quit, {report.outcomes.abandoned} left unfinished. {report.best} set a new best.</li>
        <li>Per run, on average: {round(report.mean.levels)} levels cleared, {round(report.mean.fish)} fish, {round(report.mean.pearls)} pearls, {round(report.mean.seconds===null?null:report.mean.seconds/60)} minutes.</li>
        <li>After a lost run: Retry {report.after.retry} ({percentage(share(report.after.retry,decided))}), left {report.after.leave}{report.after.unknown?`, unknown ${report.after.unknown}`:''}.</li>
        <li>Installs: {report.installs.started} played a first run; {report.installs.round} got round all five worlds.</li>
        <li>Played dressed: {percentage(share(report.dressed,report.dressed+report.plain))} of runs.</li>
      </ul>
      <figure style={{margin:'0 0 24px'}}>
        <figcaption><strong>Runs reaching each level</strong> (light) <strong>and ending on it</strong> (solid); the number on top is the share that ended there. Faded bars were reached by fewer than {fewRuns} runs.</figcaption>
        <div style={{display:'flex',alignItems:'flex-end',gap:6,height:170,borderBottom:'1px solid #999',paddingTop:8,overflowX:'auto'}}>
          {report.levels.map(l=><div key={l.level} role="img" aria-label={`Level ${l.level}, ${worldNames[l.world]??l.world} ${l.difficulty}: ${l.ended} of ${l.reached} runs that reached it ended there`}
            style={{flex:'1 0 32px',maxWidth:56,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'flex-end',height:'100%',opacity:l.reached<fewRuns?0.35:1}}>
            <small>{l.rate===null?'—':`${Math.round(l.rate*100)}%`}</small>
            <div style={{position:'relative',width:'100%',height:height(l.reached)}}>
              <div style={{position:'absolute',inset:0,borderRadius:'4px 4px 0 0',background:'#2a6f9d',opacity:0.25}}/>
              <div style={{position:'absolute',left:0,right:0,bottom:0,height:height(l.ended),borderRadius:'4px 4px 0 0',background:'#2a6f9d'}}/>
            </div>
          </div>)}
        </div>
        <div aria-hidden="true" style={{display:'flex',gap:6}}>{report.levels.map(l=><small key={l.level} style={{flex:'1 0 32px',maxWidth:56,textAlign:'center'}}>{l.level}<br/>{(worldNames[l.world]??l.world).split(' ').map(w=>w[0]).join('')}{l.difficulty}</small>)}</div>
      </figure>
      <div style={{overflowX:'auto'}}><table style={{textAlign:'left',borderSpacing:12}}>
        <caption>How runs ended, level by level</caption>
        <thead><tr>{['Level','Made like','Reached','Ended there','Share',...endings.map(e=>endingNames[e]??e)].map(h=><th key={h} scope="col">{h}</th>)}</tr></thead>
        <tbody>{report.levels.map(l=><tr key={l.level}>
          <th scope="row">{l.level}</th><td>{worldNames[l.world]??l.world} {l.difficulty}</td><td>{l.reached}</td><td>{l.ended}</td><td>{percentage(l.rate)}</td>
          {endings.map(e=><td key={e}>{l.endings[e]??0}</td>)}
        </tr>)}</tbody>
      </table></div>
      <HistogramTable caption="Fish eaten per run (the score)" histogram={report.fish} unit="Fish"/>
      <HistogramTable caption="Pearls taken per run" histogram={report.pearls} unit="Pearls"/>
      <HistogramTable caption="Game seconds per run" histogram={report.seconds} unit="Seconds"/>
      <h3>Planning on the device</h3>
      <p><small>A level whose next one isn&rsquo;t planned yet plays on, with nothing able to catch you, until it is. {round(report.waitSeconds)} game seconds spent waiting in all.</small></p>
      <HistogramTable caption="Runs by levels that waited on the next plan" histogram={report.planWaits} unit="Waits"/>
      <HistogramTable caption="Runs by their slowest level plan (seconds)" histogram={report.slowestPlan} unit="Seconds"/>
    </>}
  </section>;
}
const shopSourceNames: Record<string,string> = {map:'World map (pearl button)',run_card:'Open Water run card (Shop)'};
export function ShopChart({shop}:{shop:ShopReport}) {
  const sources=Object.keys(shop.visits) as (keyof ShopReport['visits'])[];
  const campaign=shop.dressed.campaign, openWater=shop.dressed.openWater;
  return <section aria-labelledby="shop-heading">
    <h2 id="shop-heading">The pearl shop and looks</h2>
    <p><small>Every build in this selection pooled. Visits and purchases count visits, not people; earned looks count installs; worn counts launches whose first run was played in that piece.</small></p>
    <div style={{overflowX:'auto'}}><table style={{textAlign:'left',borderSpacing:12}}>
      <caption>Visits by door</caption>
      <thead><tr>{['Opened from','Visits','Bought something','Share'].map(h=><th key={h} scope="col">{h}</th>)}</tr></thead>
      <tbody>{sources.map(s=><tr key={s}><th scope="row">{shopSourceNames[s]??s}</th><td>{shop.visits[s]}</td><td>{shop.buyingVisits[s]}</td><td>{percentage(share(shop.buyingVisits[s],shop.visits[s]))}</td></tr>)}</tbody>
    </table></div>
    <p>Runs played dressed: campaign {percentage(share(campaign.dressed,campaign.dressed+campaign.plain))} of {campaign.dressed+campaign.plain}; Open Water {percentage(share(openWater.dressed,openWater.dressed+openWater.plain))} of {openWater.dressed+openWater.plain}.</p>
    {shop.looks.length>0&&<div style={{overflowX:'auto'}}><table style={{textAlign:'left',borderSpacing:12}}>
      <caption>Looks: bought, earned, and worn ({shop.outfits} launches reported an outfit)</caption>
      <thead><tr>{['Look','Bought','Earned (installs)','Worn (launches)'].map(h=><th key={h} scope="col">{h}</th>)}</tr></thead>
      <tbody>{shop.looks.map(l=><tr key={l.id}><th scope="row"><code>{l.id}</code></th><td>{l.bought}</td><td>{l.earned}</td><td>{l.worn}</td></tr>)}</tbody>
    </table></div>}
    <HistogramTable caption="Pearls in hand as the shop opened" histogram={shop.wallet} unit="Pearls"/>
    <HistogramTable caption="Open Water runs finished before an install's first purchase" histogram={shop.firstPurchaseRuns} unit="Runs"/>
  </section>;
}
