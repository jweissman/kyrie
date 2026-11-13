// Scratch: what wants a painting. For every place of a generated world, the painting the scene gives it and how:
// by its own binding, by a named kind, by a generic fallback (the country's or a room's), or none (a dim ground);
// and everyone and everything met there shown by an emblem, not a likeness. Prints a TSV per seed to $OUT.
const W = process.env.W ?? process.cwd();
const { DrawnWorld } = await import(`${W}/src/world/drawn-world`);
const { NodeBundleSource } = await import(`${W}/src/campaign/node-bundle-source`);
const { ScreenModel } = await import(`${W}/src/ui/screen-model`);
const { Scenery } = await import(`${W}/src/ui/scenery`);
const { SceneKinds } = await import(`${W}/src/ui/scene-kinds`);
const { ModuleWriter } = await import(`${W}/src/lang/module-writer`);
const { writeFileSync, mkdirSync } = await import('node:fs');
const OUT = process.env.OUT ?? '/var/tmp/kyrie/m20/paint-demand'; mkdirSync(OUT, { recursive: true });
const [seed = 'a1', origin = 'wanderer'] = process.argv.slice(2);
const s = await DrawnWorld.start(seed, { origin, party: [{ name: 'R', raceId: 'human', classId: 'warrior' }] }, NodeBundleSource.shared);
const c = s.campaign as any;
const places = c.module.entities.filter((e: any) => e.type === 'place' && e.space?.kind === 'room');
const rows: string[] = ['place\tname\tkind\thow\tpainting\tunder\troofed'];
const faces: string[] = ['place\tsubject\tkind\tname'];
for (const p of places) {
  c.commitWorld(c.world.apply([{ kind: 'retract', call: ModuleWriter.call('at', 'party', c.world.one('at', 'party')) },
    { kind: 'assert', call: ModuleWriter.call('at', 'party', p.id) }]));
  let sc: any;
  try { sc = ScreenModel.build(c); } catch { rows.push(`${p.id}\t${p.name}\t\tERROR\t\t\t`); continue; }
  const lit = { ...sc, dark: false }, named = SceneKinds.of(lit), kind = named?.kind?.kind ?? '';
  const own = (Scenery as any).places?.[p.id];
  const painting = Scenery.seen(lit) ?? '';
  const how = own ? 'bound' : !painting ? 'none' : named && (SceneKinds.views(named, { roofed: Scenery.roofed(lit), underground: !!lit.place.underground }) ?? []).includes(painting) ? 'kind' : 'generic';
  rows.push(`${p.id}\t${sc.place.name}\t${kind}\t${how}\t${painting}\t${lit.place.underground ? 'under' : ''}\t${Scenery.roofed(lit) ? 'roofed' : ''}`);
  for (const x of sc.people ?? []) {
    if (!x.portrait && !x.companion) { faces.push(`${p.id}\t${x.id}\t${x.kind}\t${x.name}`); }
  }
}
writeFileSync(`${OUT}/${seed}-places.tsv`, rows.join('\n'));
writeFileSync(`${OUT}/${seed}-faces.tsv`, [...new Set(faces)].join('\n'));
console.log(`${seed}: ${places.length} places; ${faces.length - 1} emblem-only sightings`);
