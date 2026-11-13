import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Canon } from '../src/canon/canon';
import { ItemCatalog } from '../src/item-catalog';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleParser } from '../src/lang/module-parser';
import { World } from '../src/lang/world';
import { CampaignTick } from '../src/campaign/campaign-tick';
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';

const s = await PlaySession.start('test/fixtures/probes/local-kind/probe.campaign.json', 'audit', new NodeBundleSource());
console.log('local kind before second game', !!Canon.items.dreg_ox, !!ItemCatalog.definitions.dreg_ox);
const before = s.canonical();
const take = PlayerView.choices(s.campaign).find(x => x.choice.id.startsWith('take_item('))?.choice.id;
console.log('take command',take);
console.log('offered',PlayerView.choices(s.campaign).map(x=>x.choice.id));
await PlaySession.start('test/fixtures/probes/ordinary/ordinary.campaign.json', 'audit2', new NodeBundleSource());
console.log('local kind after second game', !!Canon.items.dreg_ox, !!ItemCatalog.definitions.dreg_ox);
try { console.log('lookup first games item',ItemCatalog.get('dreg_ox')); } catch(e) {console.log('lookup error',String(e));}
try { console.log('first game choices', PlayerView.choices(s.campaign).length); } catch(e) { console.log('first game choices error', String(e)); }
try { console.log('first game unchanged', s.canonical() === before); } catch(e) { console.log('first game canonical error', String(e)); }
try { await s.perform(take!); console.log('take succeeded'); } catch(e) { console.log('take after second game error', String(e)); }

const m = ModuleParser.parse(`Module probe "Probe" {
  Kind thing. Entity a: thing "A". Entity b: thing "B".
  Relation marked(thing). Relation candidate(thing). Relation awarded(thing).
  Query clear(t: thing) means not marked(t) and candidate(t).
  Rule award when clear(?t) { Assert awarded(?t). }
}`);
const c = (name: string, ...args: string[]) => ({kind:'call' as const, name, args});
const w = new World(m, {relations:[c('marked','b'),c('candidate','a'),c('candidate','b')], measures:[]});
console.log('clear a closed', w.test(c('clear','a')), 'clear variable', [...w.solve(c('clear','?t'),{})]);
console.log('award rule instances', CampaignTick.instances(m.rules![0]!,w));
const q = ModuleParser.parse(`Module probe2 "Probe 2" { Kind thing. Entity a: thing "A". Entity b: thing "B".
 Relation pair(thing, thing). Query diagonal(x: thing, y: thing) means pair(x,y). }`);
const v = new World(q,{relations:[c('pair','a','b')],measures:[]});
console.log('diagonal repeated variable', [...v.solve(c('diagonal','?t','?t'),{})]);

mkdirSync('audit/catalog-a',{recursive:true}); mkdirSync('audit/catalog-b',{recursive:true});
for (const [dir, value] of [['catalog-a',2],['catalog-b',99]] as const) {
 writeFileSync(`audit/${dir}/site.kyr`, `Module shared "Same module label" { Place field "Field" is wilderness. Place room "Room" is room within field at 0, 0. ${dir === 'catalog-a' ? 'Company party "You" of 1 at room.' : ''} Kind audit_coin "Coin" is treasure worth ${value}. Item coin "Coin" is audit_coin at room. }`);
 writeFileSync(`audit/${dir}/module.json`,JSON.stringify({version:1,source:'site.kyr',rules:'world',...(dir === 'catalog-a' ? {globals:['party']} : {})}));
}
writeFileSync('audit/two.campaign.json',JSON.stringify({version:1,name:'Two',modules:[{id:'a',bundle:'catalog-a/module.json'},{id:'b',bundle:'catalog-b/module.json'}],party:[{name:'A',raceId:'human',classId:'warrior'}]}));
try { const two = await PlaySession.start('audit/two.campaign.json','two',new NodeBundleSource()); console.log('conflicting kinds accepted',Canon.items.audit_coin?.value,two.campaign.installed.length); } catch(e) {console.log('conflicting kinds rejected',String(e));}
