// Scratch: how much the page tells on arrival: the first place and the first town's green, by origin and seed
// (situation + presence + changed, as the scene's telling), in words and sentences, against a three-sentence budget.
const W = process.cwd();
const { DrawnWorld } = await import(`${W}/src/world/drawn-world`);
const { NodeBundleSource } = await import(`${W}/src/campaign/node-bundle-source`);
const { ScreenModel } = await import(`${W}/src/ui/screen-model`);
const { Narrator } = await import(`${W}/src/presentation/narrator`);
const { ModuleWriter } = await import(`${W}/src/lang/module-writer`);
const count = (lines: string[]) => { const t = lines.join(' '); return { words: t.split(/\s+/).filter(Boolean).length, sentences: (t.match(/[.!?](\s|$)/g) ?? []).length, paras: lines.length }; };
for (const [seed, origin] of [['a1', 'kin'], ['kahitude', 'debt'], ['pine', 'map'], ['wren', 'wanderer']]) {
  const s = await DrawnWorld.start(seed, { origin, party: [{ name: 'R', raceId: 'human', classId: 'warrior' }] }, NodeBundleSource.shared);
  const c = s.campaign as any;
  const tell = () => { const sc = ScreenModel.build(c), l = Narrator.leaf(c, sc); return { place: sc.place.name, lines: [...l.situation, ...l.presence, ...l.changed], acts: l.glance?.acts.length ?? 0 }; };
  const first = tell();
  const green = c.module.entities.find((e: any) => /^region__s\d+_green$/.test(e.id) && c.world.test(ModuleWriter.call('at', 'region__s1_innkeeper', e.id.replace('_green', '_taproom'))) ) ?? c.module.entities.find((e: any) => /^region__s\d+_green$/.test(e.id));
  c.commitWorld(c.world.apply([{ kind: 'retract', call: ModuleWriter.call('at', 'party', c.world.one('at', 'party')) }, { kind: 'assert', call: ModuleWriter.call('at', 'party', green.id) }]));
  const town = tell();
  for (const [what, t] of [['first place', first], ['a green', town]] as const) {
    const n = count(t.lines);
    console.log(`${seed}/${origin}\t${what}\t${t.place}\t${n.words} words\t${n.sentences} sentences\t${n.paras} paragraphs\t${t.acts} led acts`);
  }
}
