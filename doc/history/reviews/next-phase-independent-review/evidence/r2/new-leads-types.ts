// Probe (f25d8d1, CommunityWriter.knowing): `Initially Assert leadsTo(fact, X)` is emitted for each place a willow
// grows near (RegionGrowth.near), but RegionGrowth.places includes roads by their passage id (`r.way`), while
// discovery.kyr declares `Relation leadsTo(fact, place)`. Are ill-typed leadsTo facts loaded, and what do they do?
// Usage: bun new-leads-types.ts [seeds...]
import { WorldAssembler } from '../../../../../src/world/world-assembler';
import { Campaign } from '../../../../../src/campaign/campaign';
const seeds = process.argv.slice(2).length ? process.argv.slice(2) : [...Array(12).keys()].map(i => `s${i}`);
let total = 0, bad = 0;
for (const seed of seeds) {
  const world = await WorldAssembler.assemble(seed, (await import('../../../../../src/campaign/node-bundle-source')).NodeBundleSource.shared);
  let c: Campaign;
  try { c = await Campaign.load(world.path, seed, world.source); } catch (e) { console.log(`${seed}: does not load (${(e as Error).message})`); continue; }
  const types = new Map(c.module.entities.map(e => [e.id, e.type]));
  const leads = c.world.view.relations.filter(r => r.name === 'leadsTo');
  const ill = leads.filter(r => types.get(r.args[1]!) !== 'place');
  const willow = ill.filter(r => /_willows$/.test(r.args[0]!));
  total += leads.length; bad += ill.length;
  console.log(`${seed}: leadsTo ${leads.length}, second arg not a place ${ill.length} (willow facts ${willow.length})`
    + (ill[0] ? `; e.g. leadsTo(${ill[0].args.join(', ')}) where ${ill[0].args[1]} is a ${types.get(ill[0].args[1]!)}` : ''));
}
console.log(`total leadsTo ${total}, ill-typed ${bad}`);
