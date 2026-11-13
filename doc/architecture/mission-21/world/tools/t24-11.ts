// T24-11, before and after: each province's install in one thorn world (the company set at its way in), and the
// next refresh of everyone's facts; with PROBE=1, whether the road's install projected anything new (it should not).
// N provinces (default 10). Run from the worktree's root.
const W = process.env.W ?? process.cwd();
const { WorldAssembler } = await import(`${W}/src/world/world-assembler`);
const { NodeBundleSource } = await import(`${W}/src/campaign/node-bundle-source`);
const { PlaySession } = await import(`${W}/src/session/play-session`);
const { Frontier } = await import(`${W}/src/world/frontier`);
const { GeneratedWorld } = await import(`${W}/test/support/generated`);
const { CreatureFacts } = await import(`${W}/src/campaign/creature-facts`);
const { Campaign } = await import(`${W}/src/campaign/campaign`);
const countries = (await import(`${W}/data/adventures/countries.json`)).default;
const N = Number(process.env.N ?? 10);
const wrote: string[] = [];
const { Discovery } = await import(`${W}/src/information/discovery`);
let discovery = 0;
{ const v = Discovery.validate; Discovery.validate = function (...a: Parameters<typeof v>) { const t = performance.now(); try { return v.apply(Discovery, a); } finally { discovery += performance.now() - t; } } as typeof v; }
if (process.env.PROBE) {
  let installing = '';
  const install = Campaign.prototype.install;
  Campaign.prototype.install = function (this: unknown, request: { id: string }, ...rest: unknown[]) {
    installing = request.id; return (install as Function).call(this, request, ...rest);
  };
  const project = CreatureFacts.project;
  CreatureFacts.project = function (world: any, actors: any, store: any) {
    const out = project.call(CreatureFacts, world, actors, store);
    if (installing.startsWith('link') && out !== world) { { const ch = out.changesSince(world) as { call: { name: string } }[]; const by: Record<string, number> = {};
      for (const x of ch) { by[x.call.name] = (by[x.call.name] ?? 0) + 1; } wrote.push(`${installing}: ${ch.length} changes ${JSON.stringify(by)}`); } }
    return out;
  } as typeof project;
}
const w = await WorldAssembler.assemble('thorn', NodeBundleSource.shared, { region: { terrain: 'mountain' } });
const s = await PlaySession.start(w.path, 'thorn', w.source), frontier = new Frontier('thorn', NodeBundleSource.shared);
const placed = new Set(w.report.region.provinces!.map((p: { country: string }) => p.country));
const ids = (countries.countries as { id: string; province?: boolean }[]).filter(x => x.province && placed.has(x.id)).map(x => x.id);
let sum = 0;
for (const id of ids.slice(0, N)) {
  discovery = 0; GeneratedWorld.put(s, `gate_${id}`); let t = performance.now(); await frontier.expand(s.campaign);
  const install = performance.now() - t; t = performance.now(); s.campaign.refreshProjection(); const next = performance.now() - t;
  sum += install;
  console.log(`${id.padEnd(14)} install ${String(Math.round(install)).padStart(5)} ms  next refresh ${String(Math.round(next)).padStart(5)} ms  discovery ${String(Math.round(discovery)).padStart(4)} ms  creatures ${s.campaign.creatures.snapshot.length}  key ${s.campaign.world.key().slice(0, 12)}`);
}
console.log(`sum ${Math.round(sum)} ms over ${Math.min(N, ids.length)}; road projections that wrote: ${wrote.length ? wrote.join('; ') : 'none'}`);
