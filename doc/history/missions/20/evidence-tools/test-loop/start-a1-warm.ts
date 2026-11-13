// Scratch: a generated world started twice in one process; the profile is of the second (warm) start.
const W = process.env.W ?? process.cwd();
const { PlaySession } = await import(`${W}/src/session/play-session`);
const { NodeBundleSource } = await import(`${W}/src/campaign/node-bundle-source`);
const { WorldAssembler } = await import(`${W}/src/world/world-assembler`);
const party = [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }];
const w = await WorldAssembler.assemble('a1', NodeBundleSource.shared, { origin: 'wanderer', party });
await PlaySession.start(w.path, 'a1', w.source);
const w2 = await WorldAssembler.assemble('a1', NodeBundleSource.shared, { origin: 'wanderer', party });
const t = performance.now(); console.log('MARK'); await PlaySession.start(w2.path, 'a1', w2.source); console.log(`warm start ${Math.round(performance.now() - t)} ms`);
