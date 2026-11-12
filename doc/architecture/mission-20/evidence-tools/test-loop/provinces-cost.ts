// Scratch: what all-in-one-world spends, province by province: the travel to each gate and the frontier's install,
// and how the install's cost grows with the world (N provinces, default 8).
const W = process.env.W ?? process.cwd();
const { WorldAssembler } = await import(`${W}/src/world/world-assembler`);
const { NodeBundleSource } = await import(`${W}/src/campaign/node-bundle-source`);
const { PlaySession } = await import(`${W}/src/session/play-session`);
const { Frontier } = await import(`${W}/src/world/frontier`);
const { GeneratedWorld } = await import(`${W}/test/support/generated`);
const countries = (await import(`${W}/data/adventures/countries.json`)).default;
const N = Number(process.env.N ?? 8);
let t = performance.now();
const w = await WorldAssembler.assemble('thorn', NodeBundleSource.shared, { region: { terrain: 'mountain' } });
const s = await PlaySession.start(w.path, 'thorn', w.source), frontier = new Frontier('thorn', NodeBundleSource.shared);
console.log(`start ${Math.round(performance.now() - t)} ms`);
const placed = new Set(w.report.region.provinces!.map((p: { country: string }) => p.country));
const ids = (countries.countries as { id: string; province?: boolean }[]).filter(c => c.province && placed.has(c.id)).map(c => c.id);
console.log(`${ids.length} provinces`);
for (const id of ids.slice(0, N)) {
  t = performance.now(); await GeneratedWorld.travel(s, `gate_${id}`); const go = performance.now() - t;
  t = performance.now(); await frontier.expand(s.campaign); const install = performance.now() - t;
  console.log(`${id.padEnd(24)} travel ${String(Math.round(go)).padStart(6)} ms  install ${String(Math.round(install)).padStart(6)} ms  installed ${s.campaign.installed.length}  facts ${s.campaign.world.size ?? '?'}`);
}
