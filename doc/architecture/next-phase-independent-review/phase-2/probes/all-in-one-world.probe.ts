// Phase II feasibility probe (review artifact). Run: bun doc/architecture/next-phase-independent-review/phase-2/probes/all-in-one-world.probe.ts
// Can each standalone authored adventure be installed, unchanged except for its company declaration, into a live
// generated world (seed a1), all of them into one campaign, and joined to it by a road? This is what a registry of
// world contributions instantiated on demand would do at a crossing. Each adventure's `Company party ...` is replaced,
// in an overlay only, by an import of the world's company (as The Long Man's placed.json already does), and its own
// starting gold and rations are dropped. Nothing in data/ is changed. Reports, per adventure: whether it installs, how
// long it takes, facts and modules after, what the company is offered at the adventure's entry once there, and why
// it fails if it does.
import { WorldAssembler } from '../../../../../src/world/world-assembler';
import { NodeBundleSource } from '../../../../../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../../../../../src/campaign/overlay-bundle-source';
import { PlaySession } from '../../../../../src/session/play-session';
import { PlayerView } from '../../../../../src/presentation/player-view';
import { readFileSync } from 'node:fs';

const base = NodeBundleSource.shared, seed = 'a1';
const w = await WorldAssembler.assemble(seed, base);
const s = await PlaySession.start(w.path, seed, w.source);
const c = s.campaign;
const company = /\s*Company party "[^"]*" of \d+ at [a-z_]+\.\s*(Initially Set quantity\(party, (gold|rations)\) to \d+\.\s*)*/;
const adventures = [
  { id: 'thrume', dir: 'thrume', entry: 'salt_road', file: 'company.kyr' },
  { id: 'corrow', dir: 'let-one-remember', entry: 'eighth_bend', file: 'company.kyr' },
  { id: 'hhg', dir: 'house-that-grows', entry: 'kezu_kitchen', file: 'cobble-ring.kyr' },
];
const files: Record<string, string> = {};
for (const a of adventures) {
  const dir = `data/adventures/${a.dir}`, manifest = JSON.parse(readFileSync(`${dir}/module.json`, 'utf8'));
  const text = readFileSync(`${dir}/${a.file}`, 'utf8');
  if (!company.test(text)) { throw new Error(`no company declaration in ${a.dir}/${a.file}`); }
  files[`${dir}/${a.file}`] = text.replace(company, '\n  Entity party: group "Your company".\n');
  files[`${dir}/placed-review.json`] = JSON.stringify({ ...manifest, imports: ['party'], roles: { party: { type: 'group' } },
    exports: { ...manifest.exports, entry: a.entry } });
}
const overlay = new OverlayBundleSource(base, files);
const facts = () => c.world.describe().length;
console.log(`world a1: ${c.installed.length} modules, ${facts()} facts`);
for (const a of adventures) {
  const t0 = performance.now();
  try {
    await c.install({ id: a.id, bundle: overlay.resolve(`data/adventures/${a.dir}/placed-review.json`),
      imports: { party: 'region.party' } }, overlay, true, true);
    const t1 = performance.now();
    // A road from the start region's first march-stone to the adventure's entry, as Frontier.road writes one.
    const link = `link${a.id}`;
    await c.install({ id: link, bundle: `${link}/module.json`, imports: { here: 'region.edge_north', there: `${a.id}.entry` } },
      new OverlayBundleSource(base, { [`${link}/module.json`]: JSON.stringify({ version: 1, source: 'link.kyr', rules: ['world'],
        imports: ['here', 'there'], roles: { here: { type: 'place' }, there: { type: 'place' } } }),
      [`${link}/link.kyr`]: `Module ${link} "A road" { Place here "here" is room. Place there "there" is room. Passage march "the long road" is road between here and there taking 2 hours. Goal false. }` }));
    console.log(`${a.id}: installed in ${Math.round(t1 - t0)} ms (+ road ${Math.round(performance.now() - t1)} ms); now ${c.installed.length} modules, ${facts()} facts`);
  } catch (e) {
    console.log(`${a.id}: FAILED after ${Math.round(performance.now() - t0)} ms: ${(e as Error).message.split('\n')[0]}`);
  }
}
console.log('choices at the start, after installing:', PlayerView.choices(c).length);
const t2 = performance.now(); await s.perform(PlayerView.choices(c).find(x => x.choice.id === 'wait')!.choice.id);
console.log(`a wait in the joined world: ${Math.round(performance.now() - t2)} ms`);
const save = JSON.stringify(s.checkpoint()); console.log(`checkpoint: ${Math.round(save.length / 1024)} kB`);
// Walk, by offered `go` choices only, from the start to Thrume's entry over the road just laid.
async function travel(target: string) {
  const world = c.world, links = world.related('connects');
  const start = world.one('at', 'party')!, came = new Map<string, [string, string]>([[start, ['', '']]]);
  for (const q = [start]; q.length && !came.has(target);) {
    const h = q.shift()!;
    for (const l of links.filter(r => r.args[1] === h && !came.has(r.args[2]!))) { came.set(l.args[2]!, [h, l.args[0]!]); q.push(l.args[2]!); }
  }
  if (!came.has(target)) { console.log('no way to', target); return; }
  const steps: [string, string][] = [];
  for (let at = target; at !== start; at = came.get(at)![0]) { steps.unshift([came.get(at)![1], at]); }
  for (const [p, to] of steps) {
    const id = `go(${p},${to})`;
    if (!PlayerView.choices(c).some(x => x.choice.id === id)) { console.log('not offered:', id); return; }
    await s.perform(id);
  }
  console.log(`walked ${steps.length} steps to ${c.world.one('at', 'party')}, elapsed ${c.readout.elapsed} watches`);
}
await travel('thrume__salt_road');
const here = PlayerView.observe(c);
console.log('observations at the entry:', here.observations.map(o => o.text.slice(0, 120)));
console.log('choices at the entry:', PlayerView.choices(c).map(x => x.choice.name).slice(0, 14));
console.log('situations:', here.situations.map(x => x.name));
