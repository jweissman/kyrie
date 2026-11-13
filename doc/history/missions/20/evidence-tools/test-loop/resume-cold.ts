// Scratch: a started generated world kept as a checkpoint, and resumed in a fresh process.
const W = process.env.W ?? process.cwd();
const { PlaySession } = await import(`${W}/src/session/play-session`);
const { NodeBundleSource } = await import(`${W}/src/campaign/node-bundle-source`);
const { WorldAssembler } = await import(`${W}/src/world/world-assembler`);
const { ScreenModel } = await import(`${W}/src/ui/screen-model`);
const { serialize, deserialize } = await import('node:v8');
const { writeFileSync, readFileSync, existsSync } = await import('node:fs');
const file = process.env.CHECKPOINT ?? '/var/tmp/kyrie/m20/a1.checkpoint';
const t = performance.now();
if (!existsSync(file)) {
  const w = await WorldAssembler.assemble('a1', NodeBundleSource.shared, { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
  const s = await PlaySession.start(w.path, 'a1', w.source);
  writeFileSync(file, serialize(s.checkpoint()));
  console.log(`assembled, started and kept in ${Math.round(performance.now() - t)} ms; ${Math.round(readFileSync(file).length / 1e6)} MB`);
} else {
  const cp = deserialize(readFileSync(file)); const r = performance.now();
  const s = PlaySession.resume(cp, { trusted: true }); const q = performance.now();
  ScreenModel.build(s.campaign);
  console.log(`read ${Math.round(r - t)} ms; resumed in ${Math.round(q - r)} ms; screen ${Math.round(performance.now() - q)} ms; at ${s.campaign.world.one('at', 'party')}`);
}
