// Scratch: how many texts a generated world's start parses, how many are distinct, and how long parsing takes.
const W = process.env.W ?? process.cwd();
const { ModuleParser } = await import(`${W}/src/lang/module-parser`);
const { PlaySession } = await import(`${W}/src/session/play-session`);
const { NodeBundleSource } = await import(`${W}/src/campaign/node-bundle-source`);
const { WorldAssembler } = await import(`${W}/src/world/world-assembler`);
const orig = ModuleParser.parse.bind(ModuleParser); let n = 0, ms = 0, bytes = 0; const texts = new Set<string>();
(ModuleParser as any).parse = (t: string, ...rest: unknown[]) => { n++; texts.add(t); bytes += t.length; const s = performance.now(); try { return orig(t, ...rest); } finally { ms += performance.now() - s; } };
const party = [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }];
for (const run of ['cold', 'warm']) {
  n = 0; ms = 0; bytes = 0; texts.clear();
  const w = await WorldAssembler.assemble('a1', NodeBundleSource.shared, { origin: 'wanderer', party });
  const t = performance.now(); await PlaySession.start(w.path, 'a1', w.source);
  console.log(`${run}: start ${Math.round(performance.now() - t)} ms; parses ${n} (${texts.size} distinct texts, ${Math.round(bytes / 1024)} KiB) in ${Math.round(ms)} ms`);
}
