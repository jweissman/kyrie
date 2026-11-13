// Scratch: ScreenModel.build in a1, many times, for a profile.
const W = process.env.W ?? process.cwd();
const { PlaySession } = await import(`${W}/src/session/play-session`);
const { ScreenModel } = await import(`${W}/src/ui/screen-model`);
const { deserialize } = await import('node:v8');
const { readFileSync } = await import('node:fs');
const s = PlaySession.resume(deserialize(readFileSync(process.env.CHECKPOINT ?? '/var/tmp/kyrie/m20/a1.checkpoint')), { trusted: true });
await s.leg('wait');
const t = performance.now(); for (let i = 0; i < 30; i++) ScreenModel.build(s.campaign);
console.log(`build ${Math.round((performance.now() - t) / 30)} ms each`);
