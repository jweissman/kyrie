// Scratch: an authored campaign's start, cold and warm, in one process.
const W = process.env.W ?? process.cwd();
const { PlaySession } = await import(`${W}/src/session/play-session`);
const { NodeBundleSource } = await import(`${W}/src/campaign/node-bundle-source`);
for (const c of process.argv.slice(2)) for (const run of ['cold', 'warm']) {
  const t = performance.now(); await PlaySession.start(c, 'x', NodeBundleSource.shared);
  console.log(`${Math.round(performance.now() - t)} ms  ${run}  ${c}`);
}
