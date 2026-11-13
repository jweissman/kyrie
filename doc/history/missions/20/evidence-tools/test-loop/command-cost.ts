// Scratch: what a command costs, in a generated world (resumed from the kept checkpoint) and an authored campaign.
const W = process.env.W ?? process.cwd();
const { PlaySession } = await import(`${W}/src/session/play-session`);
const { NodeBundleSource } = await import(`${W}/src/campaign/node-bundle-source`);
const { PlayerView } = await import(`${W}/src/presentation/player-view`);
const { ScreenModel } = await import(`${W}/src/ui/screen-model`);
const { deserialize } = await import('node:v8');
const { readFileSync } = await import('node:fs');
async function walk(s: any, label: string, n = 12) {
  const parts: Record<string, number> = { choices: 0, leg: 0, screen: 0 };
  for (let i = 0; i < n; i++) {
    let t = performance.now(); const cs = PlayerView.choices(s.campaign); parts.choices += performance.now() - t;
    const go = cs.find((c: any) => /^go\(|^wait/.test(c.choice.id)) ?? cs[0]; if (!go) break;
    t = performance.now(); await s.leg(go.choice.id); parts.leg += performance.now() - t;
    t = performance.now(); ScreenModel.build(s.campaign); parts.screen += performance.now() - t;
  }
  console.log(`${label}: per step choices ${Math.round(parts.choices / n)} ms, leg ${Math.round(parts.leg / n)} ms, screen ${Math.round(parts.screen / n)} ms`);
}
const a1 = PlaySession.resume(deserialize(readFileSync(process.env.CHECKPOINT ?? '/var/tmp/kyrie/m20/a1.checkpoint')), { trusted: true });
await walk(a1, 'a1 (generated)');
const lw = await PlaySession.start('data/campaigns/low-water.campaign.json', 'x', NodeBundleSource.shared);
await walk(lw, 'low-water (authored)');
const lm = await PlaySession.start('data/campaigns/the-long-man.campaign.json', 'x', NodeBundleSource.shared);
await walk(lm, 'the long man (authored)');
