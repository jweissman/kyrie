// Scratch: follow the origin's errand and take only the gold, across origins and seeds; where the gold vanishes while
// an aim is followed, where it goes round in circles, and whether the aim is seen through.
const W = '/var/tmp/kyrie/wt-m20';
const { DrawnWorld } = await import(`${W}/src/world/drawn-world`);
const { NodeBundleSource } = await import(`${W}/src/campaign/node-bundle-source`);
const { Undertakings } = await import(`${W}/src/presentation/undertakings`);
const { ScreenModel } = await import(`${W}/src/ui/screen-model`);
const { Narrator } = await import(`${W}/src/presentation/narrator`);
const { PlayerView } = await import(`${W}/src/presentation/player-view`);
const seeds = (process.env.SEEDS ?? 'kahitude,a1').split(','), origins = (process.env.ORIGINS ?? 'debt,kin,herbs,lost,map,order,courier,wanderer').split(',');
const steps = Number(process.env.STEPS ?? 30), verbose = !!process.env.V;
for (const seed of seeds) for (const origin of origins) {
  let s: any;
  try { s = await DrawnWorld.start(seed, { origin, party: [{ name: 'Ralf', raceId: 'human', classId: 'warrior' }] }, NodeBundleSource.shared); }
  catch (e) { console.log(`${seed}/${origin}: no start (${(e as Error).message.slice(0, 60)})`); continue; }
  const c = s.campaign;
  const errand = Undertakings.held(c).find((o: any) => Undertakings.errand(c, o));
  if (!errand) { console.log(`${seed}/${origin}: no errand held at start (${Undertakings.held(c).map((o: any) => o.id).join(',')})`); continue; }
  Undertakings.follow(c, errand.id);
  const trail: string[] = [], seen = new Map<string, number>(); let lost = 0, circles = 0, done = '';
  for (let i = 0; i < steps && c.running; i++) {
    const aim = Undertakings.followed(c)?.id;
    if (!aim) { done = `aim ended at step ${i} (${trail.at(-1) ?? ''})`; break; }
    const screen = ScreenModel.build(c), g = Narrator.leaf(c, screen).glance, lead = g?.acts.find((a: any) => a.continues);
    const here = screen.place.id;
    if (!lead && (g?.acts ?? []).some((a: any) => ['danger', 'warned', 'dark', 'retreat'].includes(a.why))) {
      done = `paused at a danger or the dark at step ${i} (${here}: ${(g?.acts ?? []).map((a: any) => a.label).join(' | ').slice(0, 80)})`; break;
    }
    if (!lead) { lost++; trail.push(`${i}:${here} NO GOLD [${aim}] led=${(g?.acts ?? []).map((a: any) => a.label).join(' | ')}`); break; }
    const key = `${aim}|${here}|${lead.choice}`; seen.set(key, (seen.get(key) ?? 0) + 1);
    if (seen.get(key)! > 2) { circles++; trail.push(`${i}:${here} CIRCLE ${lead.label}`); break; }
    trail.push(`${i}:${here} ${lead.why} ${lead.label}`);
    const id = lead.command?.startsWith('travel:') ? lead.command : lead.for ?? lead.command;
    const offered = id?.startsWith('travel:') || PlayerView.choices(c).some((x: any) => x.choice.id === id);
    if (!id || !offered) { trail.push(`  not offered: ${id}`); break; }
    try { await s.leg(id); } catch (e) { trail.push(`  refused: ${(e as Error).message.slice(0, 80)}`); break; }
  }
  const last = trail.at(-1) ?? '';
  console.log(`${seed}/${origin} [${errand.id}]: ${done || (lost ? 'LOST' : circles ? 'CIRCLE' : `still going after ${trail.length}`)} — ${last.slice(0, 160)}`);
  if (verbose) for (const t of trail) console.log('   ', t.slice(0, 200));
}
