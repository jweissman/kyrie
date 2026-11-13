const W = '/var/tmp/kyrie/wt-m21-play/src';
process.chdir('/var/tmp/kyrie/wt-m21-play');
const { DrawnWorld } = await import(`${W}/world/drawn-world.ts`);
const { NodeBundleSource } = await import(`${W}/campaign/node-bundle-source.ts`);
const { Undertakings } = await import(`${W}/presentation/undertakings.ts`);
const { ScreenModel } = await import(`${W}/ui/screen-model.ts`);
const { Narrator } = await import(`${W}/presentation/narrator.ts`);
const { PlayerView } = await import(`${W}/presentation/player-view.ts`);
const { AimLeads } = await import(`${W}/presentation/aim-leads.ts`);
const { Stakes } = await import(`${W}/ui/stakes.ts`);
const s = await DrawnWorld.start(process.argv[2] ?? 'kahitude', { origin: process.argv[3] ?? 'herbs', party: [{ name: 'Ralf', raceId: 'human', classId: 'warrior' }] }, NodeBundleSource.shared);
const c = s.campaign;
Undertakings.follow(c, Undertakings.held(c).find((o: any) => Undertakings.errand(c, o))!.id);
for (let i = 0; i < 8 && c.running; i++) {
  const def = Undertakings.followed(c); if (!def) { console.log('done'); break; }
  const screen = ScreenModel.build(c), acts = Narrator.leaf(c, screen).glance!.acts;
  console.log(i, c.world.one('at', 'party'), def.id, 'named', [...Stakes.named(c, def)], '| advances', [...AimLeads.advances(c, PlayerView.choices(c))]);
  for (const a of acts) console.log('   ', a.label, a.why, a.aspects.join(','), a.continues ? 'GOLD' : '', a.for ?? '');
  const lead = acts.find((a: any) => a.continues); if (!lead) { console.log('lost'); break; }
  await s.leg(lead.command?.startsWith('travel:') ? lead.command : lead.for ?? lead.command!);
}
