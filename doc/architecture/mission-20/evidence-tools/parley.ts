// Scratch: a failed parley with a deadline already given keeps it; with none given, two watches.
const W = '/var/tmp/kyrie/wt-m20';
const { WorldAssembler } = await import(`${W}/src/world/world-assembler`);
const { NodeBundleSource } = await import(`${W}/src/campaign/node-bundle-source`);
const { PlaySession } = await import(`${W}/src/session/play-session`);
const { PlayerView } = await import(`${W}/src/presentation/player-view`);
const { ModuleWriter } = await import(`${W}/src/lang/module-writer`);
const take = async (s: any, p: RegExp) => { const c = PlayerView.choices(s.campaign).find((x: any) => p.test(x.choice.name)); if (!c) throw new Error(`no ${p}`); return s.leg(c.choice.id); };
const inn = [/^Ask Fargrim about the old workings$/];
for (const [given, name] of [[true, 'Ada'], [true, 'Bo'], [true, 'Cy'], [true, 'Di'], [true, 'Ed'], [false, 'Ada'], [false, 'Bo'], [false, 'Cy']] as const) {
  const w = await WorldAssembler.assemble('wren', NodeBundleSource.shared, { origin: 'wanderer', party: [{ name, raceId: 'human', classId: 'warrior' }] });
  const s = await PlaySession.start(w.path, 'wren', w.source);
  // The same walk as the deep expedition's goblins case.
  const names = () => PlayerView.choices(s.campaign).map((c: any) => c.choice.name);
  const walk = [/^Ask .* about the old workings$/, /^To the old workings|^Set out|old workings/];
  try {
    const src = await Bun.file(`${W}/test/deep-expedition.test.ts`).text();
    const road = /static readonly road = \[([^\]]*)\]/.exec(src)?.[1]; const innP = /static readonly inn = \[([^\]]*)\]/.exec(src)?.[1];
    const pats = [...eval(`[${innP}]`), /^Ask Fargrim about the old workings$/, ...eval(`[${road}]`), /^Light a torch$/, /^Take the gallery to the crossing$/, /^Talk to the goblins$/];
    for (const p of pats) await take(s, p);
  } catch (e) { console.log(name, 'walk', (e as Error).message.slice(0, 120)); continue; }
  const c = s.campaign as any, gob = c.module.entities.find((e: any) => e.name === 'the goblins').id;
  const n = (r: string, a: string) => c.world.number(ModuleWriter.call(r, a)), Wn = n('watch', 'clock');
  if (given) c.commitWorld(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('warned', gob, 'party') }, { kind: 'set', call: ModuleWriter.call('patience', gob), value: ModuleWriter.number(Wn + 1) }]));
  const before = n('patience', gob);
  await take(s, /^Ask the goblins to let you by/);
  const t = (r: string, ...a: string[]) => c.world.test(ModuleWriter.call(r, ...a));
  console.log(name, given ? 'given' : 'none', 'W', Wn, 'before', before, 'after', n('patience', gob), 'watch now', n('watch', 'clock'), t('tolerates', gob, 'party') ? 'LET BE' : t('warned', gob, 'party') ? 'warned' : t('assails', gob, 'party') ? 'assails' : '?');
}
