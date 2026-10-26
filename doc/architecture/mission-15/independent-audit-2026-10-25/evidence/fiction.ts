import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { ScreenModel } from '../src/ui/screen-model';
import { CreatureFacts } from '../src/campaign/creature-facts';
import { CreatureStore } from '../src/creature-store';
import { World } from '../src/lang/world';
import { writeFileSync, mkdirSync } from 'node:fs';
const start=(name:string)=>PlaySession.start(`test/fixtures/patient/${name}/probe.campaign.json`,'p',new NodeBundleSource());
const act=async(s:PlaySession,re:RegExp)=>{const c=PlayerView.choices(s.campaign).find(c=>re.test(c.choice.name));if(!c)throw Error('missing '+re);return s.perform(c.choice.id);};
const s=await start('leaves');
await act(s,/Ask Mirel to join/);await act(s,/held field/);await act(s,/Dig out/);
console.log('departure party names',PlayerView.observe(s.campaign).party.map(p=>p.name));
await act(s,/holders' cord/);
console.log('departure dead narration',JSON.stringify(ScreenModel.build(s.campaign)).includes('Mirel lies dead'));

mkdirSync('audit/speaker',{recursive:true});
writeFileSync('audit/speaker/site.kyr',`Module speaker "Speaker" {
 Place field "Field" is wilderness. Place room "Room" is room within field at 0, 0.
 Company party "You" of 1 at room.
 Person priest "Priest" at room { Role "a priest". Ancestry human. Peaceable. }
 Action argument(actor: group, site: place) "Argue with Priest" {
 Speaker priest. Time 0. Requires able(actor) and at(actor, site) and at(priest, site).
 Result "The priest hears you out and agrees.". }
}`);
writeFileSync('audit/speaker/module.json',JSON.stringify({version:1,source:'site.kyr',rules:'world',globals:['party']}));
writeFileSync('audit/speaker/campaign.json',JSON.stringify({version:1,name:'Speaker',modules:[{id:'s',bundle:'module.json'}],party:[{name:'A',raceId:'human',classId:'warrior'}]}));
const alive=await PlaySession.start('audit/speaker/campaign.json','speaker',new NodeBundleSource()),cp=alive.checkpoint();
for(const c of cp.save.creatures.filter(c=>!cp.save.state.partyIds.includes(c.id))){c.state.hp=0;}
cp.save.state.world=CreatureFacts.project(new World(cp.save.module,cp.save.state.world),cp.save.definition!.actors,new CreatureStore(cp.save.creatures)).snapshot;
const dead=PlaySession.resume(cp);
console.log('dead priest body',dead.campaign.state.creatures.filter(c=>!dead.campaign.state.partyIds.includes(c.id)).map(c=>c.state.hp));
console.log('dead speaker response',(await act(dead,/Argue with Priest/)).response);
mkdirSync('audit/teaching',{recursive:true});
writeFileSync('audit/teaching/site.kyr',`Module teaching "Teaching" {
 Place field "Field" is wilderness. Place room "Room" is room within field at 0, 0.
 Company party "You" of 1 at room.
 Thing lamp "Lamp" at room { State shining "It burns.". }
 Entity lit_fact: fact "The lamp is lit.". Initially Assert established(lit_fact).
 Observe glow near ?lamp when state(?lamp, shining) "{?lamp} burns brightly." teaches lit_fact.
}`);
writeFileSync('audit/teaching/module.json',JSON.stringify({version:1,source:'site.kyr',rules:'world',globals:['party']}));
writeFileSync('audit/teaching/campaign.json',JSON.stringify({version:1,name:'Teaching',modules:[{id:'t',bundle:'module.json'}],party:[{name:'A',raceId:'human',classId:'warrior'}]}));
const t=await PlaySession.start('audit/teaching/campaign.json','teaching',new NodeBundleSource());
const e=await t.perform('wait');
console.log('variable teaching perception',e.perceptions?.filter(p=>p.id.includes('glow')));
console.log('variable teaching known',t.campaign.world.test({kind:'call',name:'knows',args:['party','t__lit_fact']}));
