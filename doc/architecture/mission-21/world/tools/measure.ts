// Scratch (steps 2, 3): a1's start cold and warm, its facts, its checkpoint's size, and a command's cost.
const W = process.cwd();
const { serialize } = await import('node:v8');
const { PlaySession } = await import(`${W}/src/session/play-session`);
const { NodeBundleSource } = await import(`${W}/src/campaign/node-bundle-source`);
const { WorldAssembler } = await import(`${W}/src/world/world-assembler`);
const party = [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }];
async function start() {
  const t = performance.now();
  const w = await WorldAssembler.assemble('a1', NodeBundleSource.shared, { origin: 'kin', party });
  const s = await PlaySession.start(w.path, 'a1', w.source);
  return { s, ms: Math.round(performance.now() - t) };
}
const cold = await start(), c = cold.s.campaign, n = (r: string) => c.world.related(r).length;
console.log(`start cold ${cold.ms} ms; facts ${c.world.view.relations.length}, entities ${c.module.entities.length}; proficient ${n('proficient')}, hasCalling ${n('hasCalling')}, hasAncestry ${n('hasAncestry')}`);
const cp = cold.s.checkpoint();
console.log(`checkpoint JSON ${(JSON.stringify(cp).length / 1e6).toFixed(1)} MB, v8 ${(serialize(cp).length / 1e6).toFixed(1)} MB`);
const ms: number[] = [];
for (let i = 0; i < 3; i++) { const t = performance.now(); await cold.s.leg('wait'); ms.push(Math.round(performance.now() - t)); }
console.log(`wait ×3: ${ms.join(', ')} ms; key ${c.world.key().slice(0, 16)}`);
const warm = await start();
console.log(`start warm ${warm.ms} ms`);
