// Scratch: one generated world started, for a CPU profile.
const W = process.env.W ?? process.cwd();
const { PlaySession } = await import(`${W}/src/session/play-session`);
const { NodeBundleSource } = await import(`${W}/src/campaign/node-bundle-source`);
const { WorldAssembler } = await import(`${W}/src/world/world-assembler`);
const w = await WorldAssembler.assemble('a1', NodeBundleSource.shared, { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
const t = performance.now(); await PlaySession.start(w.path, 'a1', w.source); console.log(`start ${Math.round(performance.now() - t)} ms`);
