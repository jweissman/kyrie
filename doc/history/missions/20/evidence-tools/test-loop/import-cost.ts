// Scratch: each module's own import cost, in order, in one process (cumulative minus what came before).
const mods = process.argv.slice(2);
let last = performance.now();
for (const m of mods) {
  await import(`${process.env.W ?? process.cwd()}/${m}`);
  const now = performance.now(); console.log(`${Math.round(now - last)} ms  ${m}`); last = now;
}
