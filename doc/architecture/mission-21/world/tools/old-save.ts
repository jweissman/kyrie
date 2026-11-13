// Scratch (steps 2, 3): a checkpoint kept by an earlier build (FILE) opened as bin/kyrie resume opens it, and played on.
const W = process.cwd();
const { PlaySession } = await import(`${W}/src/session/play-session`);
const file = process.env.FILE ?? '/var/tmp/kyrie/play21/a1-cellar.json';
const parsed = JSON.parse(await Bun.file(file).text());
const was = parsed.save.world?.relations?.length ?? parsed.save.state?.world?.relations?.length;
const t = performance.now();
const s = PlaySession.resume(parsed);
const c = s.campaign, n = (r: string) => c.world.related(r).length;
console.log(`opened ${file.replace(/^.*\//, '')} in ${Math.round(performance.now() - t)} ms: facts ${was ?? '?'} kept, ${c.world.view.relations.length} now; proficient ${n('proficient')}, hasCalling ${n('hasCalling')}, at ${c.world.one('at', 'party')}`);
const ev = await s.leg('wait'); console.log(`wait: ${ev.result ?? 'done'}; elapsed ${c.state.elapsed}`);
if (process.env.INSTALL) {
  const { Frontier } = await import(`${W}/src/world/frontier`);
  const { GeneratedWorld } = await import(`${W}/test/support/generated`);
  const gate = c.module.entities.find(e => /^region__gate_[a-z]+$/.test(e.id))!.id;
  GeneratedWorld.put(s, gate.replace(/^region__/, ''));
  const t2 = performance.now(); await new Frontier(parsed.transcript.seed, (await import(`${W}/src/campaign/node-bundle-source`)).NodeBundleSource.shared).expand(c);
  console.log(`installed at ${gate} in ${Math.round(performance.now() - t2)} ms: ${c.installed.slice(-3).join(' ')}; hasCalling ${n('hasCalling')}, proficient ${n('proficient')}`);
  const e2 = await s.leg('wait'); console.log(`wait after the install: ${e2.result ?? 'done'}`);
}
