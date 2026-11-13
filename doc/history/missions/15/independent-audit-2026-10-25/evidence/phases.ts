import { SimBench } from '../scripts/sim-bench';
import { PlayerView } from '../src/presentation/player-view';
import { CampaignTick } from '../src/campaign/campaign-tick';
import { readFileSync, writeFileSync } from 'node:fs';
const totals:Record<string,number>={},counts:Record<string,number>={};
function wrap(owner:any,key:string,label:string){const original=owner[key];owner[key]=function(...args:any[]){const t=performance.now();try{return original.apply(this,args);}finally{totals[label]=(totals[label]??0)+performance.now()-t;counts[label]=(counts[label]??0)+1;}};}
wrap(CampaignTick,'rules','rules');wrap(CampaignTick,'npcs','npc');wrap(PlayerView,'observe','observe');wrap(PlayerView,'choices','choices');
const began=performance.now(),s=await SimBench.start('wren','warrior');
console.log('generation and load ms',performance.now()-began);
const rows:any[]=[];
for(const line of readFileSync('test/fixtures/descent/wren.choices','utf8').split('\n').filter(Boolean)){
 const re=new RegExp(line,'i'),prior={...totals};
 const c=PlayerView.choices(s.campaign).find(c=>re.test(c.choice.name));if(!c)break;
 const t=performance.now(),event=await s.perform(c.choice.id);
 PlayerView.observe(s.campaign);PlayerView.choices(s.campaign);
 rows.push({step:rows.length+1,kind:SimBench.kind(event.action,event.combat.some(e=>e.type==='end')),ms:performance.now()-t,...Object.fromEntries(Object.entries(totals).map(([k,v])=>[k,v-(prior[k]??0)]))});
}
writeFileSync('../phases.jsonl',rows.map(r=>JSON.stringify(r)).join('\n')+'\n');
console.log(JSON.stringify({steps:rows.length,totals,counts,facts:Bun.hash(JSON.stringify(s.campaign.world.describe())).toString(16)}));
