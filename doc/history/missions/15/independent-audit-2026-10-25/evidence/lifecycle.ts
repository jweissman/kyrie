import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { DrawnWorld } from '../src/world/drawn-world';
import { Frontier } from '../src/world/frontier';
import { PlayerView } from '../src/presentation/player-view';
import { ScreenModel } from '../src/ui/screen-model';
import { writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const a=await PlaySession.start('test/fixtures/probes/ordinary/ordinary.campaign.json','failure',new NodeBundleSource());
const prior=a.canonical();
a.extend({async expand(){throw new Error('injected frontier read failure');}});
try{await a.perform('wait');}catch(e){console.log('expander failure',String(e));}
console.log('failure changed canonical',prior!==a.canonical(),'elapsed',a.campaign.state.elapsed,'transcript',a.transcript.steps.length,'events',a.campaign.history.length);

const seed='thorn', drawn={origin:'wanderer',party:[{name:'Wenna',raceId:'human',classId:'warrior'}]};
const s=await DrawnWorld.start(seed,drawn,NodeBundleSource.shared),initial=s.campaign.installed.length;
function next(){
 const w=s.campaign.world,start=w.one('at','party')!,from=new Map<string,[string,string]|undefined>([[start,undefined]]);
 const links=w.related('connects');
 for(const queue=[start];queue.length;){
  const here=queue.shift()!;
  if(here!==start&&/__edge_/.test(here)){
   let at=here;while(from.get(at)![1]!==start){at=from.get(at)![1];}return `go(${from.get(at)![0]},${at})`;
  }
  for(const l of links.filter(l=>l.args[1]===here)){const [way,,to]=l.args;if(!from.has(to!)){from.set(to!,[way!,here]);queue.push(to!);}}
 }
 throw new Error('no edge');
}
for(let n=0;n<30&&!/__edge_/.test(s.campaign.world.one('at','party')??'');n++){await s.perform(next());}
await s.perform('wait');
console.log('multi-region',initial,s.campaign.installed.length,'steps',s.transcript.steps.length);
const canonical=s.canonical();PlayerView.observe(s.campaign);PlayerView.choices(s.campaign);ScreenModel.build(s.campaign);
console.log('observations pure',canonical===s.canonical());
try{await s.perform('invalid-audit-command');}catch{}
console.log('rejection pure',canonical===s.canonical());
writeFileSync('audit/frontier-transcript.json',JSON.stringify(s.transcript));
const checkpoint=s.checkpoint(), resumed=PlaySession.resume(JSON.parse(JSON.stringify(checkpoint))).extend(new Frontier(seed,NodeBundleSource.shared));
console.log('checkpoint equal',canonical===resumed.canonical());
await s.perform('wait'); await resumed.perform('wait');console.log('resume continuation equal',s.canonical()===resumed.canonical());
const cli=spawnSync('bin/kyrie',['replay','audit/frontier-transcript.json'],{encoding:'utf8',maxBuffer:1<<28});
writeFileSync('audit/cli-replay.stderr',cli.stderr??'');
const replay=JSON.parse(cli.stdout);replay.transcript.scenario=checkpoint.transcript.scenario;
console.log('CLI replay status',cli.status,'canonical equal',JSON.stringify(replay)===canonical);
