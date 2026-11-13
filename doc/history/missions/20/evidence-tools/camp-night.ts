// Scratch: what "Make camp" says it lasts until, at hours through the night, in the open.
const W = '/var/tmp/kyrie/wt-m20';
const { DrawnWorld } = await import(`${W}/src/world/drawn-world`);
const { NodeBundleSource } = await import(`${W}/src/campaign/node-bundle-source`);
const { Journey } = await import(`${W}/src/session/journey`);
const { ScreenModel } = await import(`${W}/src/ui/screen-model`);
const { ChoiceList } = await import(`${W}/src/ui/choice-list`);
const { GeneratedWorld } = await import(`${W}/test/support/generated`);
const s = await DrawnWorld.start('kahitude', { origin: 'debt', party: [{ name: 'R', raceId: 'human', classId: 'warrior' }] }, NodeBundleSource.shared);
GeneratedWorld.put(s, 'w2');
const j = Journey.of(s);
for (const at of ['=18:00', '=20:00', '=22:00', '=day 2 0:30', '=day 2 3:00', '=day 2 5:30']) {
  try { await j.play(at); } catch (e) { console.log(at, (e as Error).message.slice(0, 100)); continue; }
  const sc = ScreenModel.build(s.campaign), flat = (cs: any[]): any[] => cs.flatMap(c => [c, ...flat(c.children ?? [])]);
  const camp = flat(ChoiceList.all(ChoiceList.explore(sc))).filter((c: any) => /camp|sleep/i.test(c.label ?? ''));
  console.log(sc.clock, camp.map((c: any) => `${c.label} [${c.note ?? ''}]`).join(' | '));
}
