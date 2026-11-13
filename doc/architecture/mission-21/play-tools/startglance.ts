const W = '/var/tmp/kyrie/wt-m21-play/src';
process.chdir('/var/tmp/kyrie/wt-m21-play');
const { PlaySession } = await import(`${W}/session/play-session.ts`);
const { NodeBundleSource } = await import(`${W}/campaign/node-bundle-source.ts`);
const { Journey } = await import(`${W}/session/journey.ts`);
const { ScreenModel } = await import(`${W}/ui/screen-model.ts`);
const { Narrator } = await import(`${W}/presentation/narrator.ts`);
const { Undertakings } = await import(`${W}/presentation/undertakings.ts`);
const s = await PlaySession.start(process.argv[2]!, 'lull', NodeBundleSource.shared);
const c = s.campaign; Undertakings.follow(c, Undertakings.held(c)[0]!.id);
const j = Journey.of(s);
for (const step of process.argv.slice(3)) {
  const g = Narrator.leaf(c, ScreenModel.build(c)).glance!;
  console.log(c.world.one('at', 'party'), g.acts.map((a: any) => `${a.label}${a.continues ? ' [GOLD]' : ''}`).join(' | '));
  await j.play(step);
}
const g = Narrator.leaf(c, ScreenModel.build(c)).glance!;
console.log(c.world.one('at', 'party'), g.acts.map((a: any) => `${a.label}${a.continues ? ' [GOLD]' : ''}`).join(' | '));
