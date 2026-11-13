// Scratch (the bounded demonstration): a1's first country and two countries beyond its march-stones, realised in
// different orders (B then C, C then B, B then a save and restore then C), each country's identities and facts
// compared across the orders. SEED (a1). Run from the worktree's root.
const W = process.env.W ?? process.cwd();
const { WorldAssembler } = await import(`${W}/src/world/world-assembler`);
const { NodeBundleSource } = await import(`${W}/src/campaign/node-bundle-source`);
const { PlaySession } = await import(`${W}/src/session/play-session`);
const { Frontier } = await import(`${W}/src/world/frontier`);
const { GeneratedWorld } = await import(`${W}/test/support/generated`);
const seed = process.env.SEED ?? 'a1';
let t = performance.now();
const lap = (what: string) => { const n = performance.now(); console.log(`${Math.round(n - t)} ms ${what}`); t = n; };
const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared, { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
const s0 = await PlaySession.start(w.path, seed, w.source); lap('start');
const sides = (process.env.SIDES ?? 'west,north').split(',');
console.log('beyond', JSON.stringify(w.report.region.beyond));
// The consequential event, in the first country before any crossing: someone willing asked to join the company.
const { PlayerView } = await import(`${W}/src/presentation/player-view`);
const willing = s0.campaign.world.related('willing').find(f => f.args[1] === 'party');
let recruit = '';
if (willing) {
  recruit = willing.args[0]!; const where = s0.campaign.world.one('at', recruit)!;
  const c = s0.campaign as unknown as { world: any; commit(w: unknown): void };
  c.commit(c.world.apply([{ kind: 'retract', call: { kind: 'call', name: 'at', args: ['party', s0.campaign.world.one('at', 'party')] } },
    { kind: 'assert', call: { kind: 'call', name: 'at', args: ['party', where] } }]));
  const ask = PlayerView.choices(s0.campaign).find(x => x.choice.id.startsWith(`recruit(party,${recruit},`));
  console.log(`recruit ${recruit} at ${where}: ${ask ? ask.choice.id : 'no choice'}`);
  if (ask) { await s0.leg(ask.choice.id); }
}
const event = (s: S) => ({ party: s.campaign.state.partyIds.join(','), travels: s.campaign.world.related('travelsWith').map(f => f.args.join('>')).join(';'),
  gold: s.campaign.world.number({ kind: 'call', name: 'quantity', args: ['party', 'gold'] } as any) });
console.log('after the event', JSON.stringify(event(s0)));
const cp = JSON.stringify(s0.checkpoint()); lap(`checkpoint ${Math.round(cp.length / 1e6)} MB`);
type S = InstanceType<typeof PlaySession>;
async function cross(s: S, f: InstanceType<typeof Frontier>, side: string) {
  GeneratedWorld.put(s, `edge_${side}`); const r = await f.expand(s.campaign); return r?.rid;
}
function digest(s: S, rid: string) {
  const c = s.campaign, mine = (id: string) => id.startsWith(rid);
  const entities = Object.fromEntries(c.module.entities.filter(e => mine(e.id)).map(e => [e.id, `${e.type}|${e.name}`]));
  const facts = c.world.view.relations.filter(f => f.args.some(mine) && !f.args.includes('party')).map(f => `${f.name}(${f.args.join(',')})`).sort();
  const creatures = c.creatures.snapshot.filter((x: any) => mine(x.id)).map((x: any) => `${x.id}|${x.base?.name ?? x.name}|${x.raceId ?? x.base?.raceId}`).sort();
  return { modules: c.installed.filter(mine), entities, facts, creatures };
}
function compare(label: string, a: ReturnType<typeof digest>, b: ReturnType<typeof digest>) {
  const ka = Object.keys(a.entities), kb = new Set(Object.keys(b.entities));
  const onlyA = ka.filter(k => !kb.has(k)), onlyB = [...kb].filter(k => !(k in a.entities));
  const renamed = ka.filter(k => kb.has(k) && a.entities[k] !== b.entities[k]);
  const fb = new Set(b.facts), fa = new Set(a.facts);
  const fOnlyA = a.facts.filter(f => !fb.has(f)), fOnlyB = b.facts.filter(f => !fa.has(f));
  const cb = new Set(b.creatures), cOnlyA = a.creatures.filter(x => !cb.has(x));
  const same = !onlyA.length && !onlyB.length && !renamed.length && !fOnlyA.length && !fOnlyB.length && !cOnlyA.length
    && JSON.stringify(a.modules) === JSON.stringify(b.modules);
  console.log(`${label}: ${same ? 'SAME' : 'DIFFERENT'} — modules ${a.modules.length}/${b.modules.length}, entities ${ka.length}/${kb.size} (only first ${onlyA.length}, only second ${onlyB.length}, renamed ${renamed.length}), facts ${a.facts.length}/${b.facts.length} (only first ${fOnlyA.length}, only second ${fOnlyB.length}), creatures differing ${cOnlyA.length}`);
  if (!same) {
    console.log(`   modules ${JSON.stringify(a.modules)} vs ${JSON.stringify(b.modules)}`);
    for (const k of renamed.slice(0, 6)) { console.log(`   renamed ${k}: ${a.entities[k]} -> ${b.entities[k]}`); }
    for (const k of onlyA.slice(0, 4)) { console.log(`   only first ${k}: ${a.entities[k]}`); }
    for (const k of onlyB.slice(0, 4)) { console.log(`   only second ${k}: ${b.entities[k]}`); }
    for (const f of fOnlyA.slice(0, 4)) { console.log(`   fact only first ${f}`); }
    for (const f of fOnlyB.slice(0, 4)) { console.log(`   fact only second ${f}`); }
    for (const x of cOnlyA.slice(0, 4)) { console.log(`   creature only first ${x}`); }
  }
}
const [B, C] = sides as [string, string];
const runs: Record<string, Record<string, ReturnType<typeof digest>>> = {};
for (const order of ['BC', 'CB', 'B|C']) {
  const s = PlaySession.resume(JSON.parse(cp), { trusted: true }); const f = new Frontier(seed, NodeBundleSource.shared);
  const rB = order === 'CB' ? undefined : await cross(s, f, B);
  let live = s, rid: Record<string, string> = {};
  if (order === 'B|C') {
    live = PlaySession.resume(JSON.parse(JSON.stringify(s.checkpoint())), { trusted: false });
    rid[B] = rB!; rid[C] = (await cross(live, new Frontier(seed, NodeBundleSource.shared), C))!;
  } else if (order === 'BC') { rid[B] = rB!; rid[C] = (await cross(s, f, C))!; }
  else { rid[C] = (await cross(s, f, C))!; rid[B] = (await cross(s, f, B))!; }
  lap(`${order}: ${JSON.stringify(rid)} installed ${live.campaign.installed.length}`);
  console.log(`   event in ${order}: ${JSON.stringify(event(live))}`);
  runs[order] = { B: digest(live, rid[B]!), C: digest(live, rid[C]!), A: digest(live, 'region__') };
}
for (const r of ['A', 'B', 'C']) {
  compare(`${r} BC vs CB`, runs.BC![r]!, runs.CB![r]!); compare(`${r} BC vs B|C`, runs.BC![r]!, runs['B|C']![r]!);
}
