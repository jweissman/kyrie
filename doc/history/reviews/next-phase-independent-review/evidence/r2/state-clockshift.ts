// R2 probe: ClockShift moves a mid-game installation's timers by the days already gone, but only literal comparisons
// `watch(clock) <op> N` in Rules/Observations/Objectives/Actions, and Initially-set measures compared bare with the
// watch. Timers written through a Query, or as arithmetic (`watch(clock) >= dueAt(x) - 72`, low-water's hearingDay),
// are not moved: installed on day 3, a module's "day 1" timers fire at once.
import { PlaySession } from '../../../../../src/session/play-session';
import { NodeBundleSource } from '../../../../../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../../../../../src/campaign/overlay-bundle-source';
import { ModuleWriter } from '../../../../../src/lang/module-writer';

const files: Record<string, string> = {
  'cs/a/site.kyr': `Module a "A" { Place field "Field" is wilderness. Place room "Room" is room within field at 0, 0.
    Company party "You" of 1 at room. Goal false. }`,
  'cs/a/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'] }),
  'cs/b/site.kyr': `Module b "B" { Place yard "Yard" is site.
    Relation r_literal(). Relation r_query(). Relation r_arith(). Relation r_measure().
    Measure dueAt(place). Measure dueAt2(place). Initially Set dueAt(yard) to 20. Initially Set dueAt2(yard) to 20.
    Query late() means watch(clock) >= 20.
    Rule literal when watch(clock) >= 20 { Assert r_literal(). }
    Rule viaquery when late() { Assert r_query(). }
    Rule arith when watch(clock) >= dueAt(yard) - 0 { Assert r_arith(). }
    Rule measure when watch(clock) >= dueAt2(yard) { Assert r_measure(). }
    Goal false. }`,
  'cs/b/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'] }),
  'cs/a.campaign.json': JSON.stringify({ version: 1, name: 'a', modules: [{ id: 'a', bundle: 'a/module.json' }],
    party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }),
};
const overlay = new OverlayBundleSource(NodeBundleSource.shared, files);
const c = (await PlaySession.start(overlay.resolve('cs/a.campaign.json'), 'seed', overlay)).campaign;
while (c.readout.elapsed < 300) { c.execute(c.offered().find(o => o.schema === 'wait_hour')!.id); }
await c.install({ id: 'b', bundle: overlay.resolve('cs/b/module.json') }, overlay);
c.execute(c.offered().find(o => o.schema === 'wait')!.id);
const r = (n: string) => c.world.test(ModuleWriter.call(`b__${n}`));
console.log(JSON.stringify({ installedAt: 300, now: c.readout.elapsed, shiftedTo: 432 + 20,
  fired: { literal: r('r_literal'), viaQuery: r('r_query'), arith: r('r_arith'), measure: r('r_measure') } }));
