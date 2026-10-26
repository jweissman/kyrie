// R2 probe: Agency.fruitless (commit a02ee33) is a process-global static Map keyed by `${actor.id}\0${goal.id}`.
// Its `until` gate (retry an hour later) is checked against watch(clock) alone, without the world's lineage.
// It is not part of the save, not rolled back, not per campaign, and is written by PlayerView (Agency.explain).
// Scenarios, each in the same process, the cache cleared only where stated:
//   A continued:  idle (walker's search fails, spent) -> open_gate.  Does walker arrive?
//   B restored:   idle -> save -> [process restart: cache cleared] -> restore -> open_gate.
//   C viewed:     fresh campaign, cache cleared, PlayerView.observe() once, then open_gate.
//   D unviewed:   fresh campaign, cache cleared, open_gate.
//   E leaked:     fresh campaign after A in the same process (cache NOT cleared), open_gate.
import { PlaySession } from '../../../../../src/session/play-session';
import { NodeBundleSource } from '../../../../../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../../../../../src/campaign/overlay-bundle-source';
import { Campaign } from '../../../../../src/campaign/campaign';
import { Agency } from '../../../../../src/campaign/agency';
import { PlayerView } from '../../../../../src/presentation/player-view';
import { ModuleWriter } from '../../../../../src/lang/module-writer';

const flips = Array.from({ length: 12 }, (_, i) => i + 1);
const site = `Module ag "Agency probe" {
  Place field "Field" is wilderness.
  Place room "Room" is room within field at 0, 0.
  Company party "You" of 1 at room.
  ${flips.map(i => `Relation f${i}().`).join(' ')}
  Relation gate_open(). Relation home(group).
  Person walker "a walker" at room { Ancestry human. Calling warrior. Level 1.
    Uses ${flips.map(i => `flip${i}`).join(', ')}, arrive. Plans 6 steps. }
  ${flips.map(i => `Action flip${i}(actor: group) "Flip ${i}" { Requires able(actor) and not company(actor) and not f${i}(). Time 1. On success { Assert f${i}(). } }`).join('\n  ')}
  Action arrive(actor: group) "Arrive" { Requires able(actor) and not company(actor) and gate_open(). Time 1. On success { Assert home(actor). } }
  Action idle(actor: group) "Idle" { Requires company(actor). Time 1. Result "You wait.". }
  Action open_gate(actor: group) "Open the gate" { Requires company(actor) and not gate_open(). Time 1. On success { Assert gate_open(). } Result "The gate opens.". }
  Pursuit go_home for walker "going home" priority 10 when not home(walker) seeks home(walker).
  Goal false.
}`;
const files: Record<string, string> = {
  'ag/site.kyr': site,
  'ag/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'] }),
  'ag.campaign.json': JSON.stringify({ version: 1, name: 'ag', modules: [{ id: 'p', bundle: 'ag/module.json' }],
    party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }),
};
const overlay = new OverlayBundleSource(NodeBundleSource.shared, files);
const fruitless = (Agency as unknown as { fruitless: Map<string, unknown> }).fruitless;
const start = () => PlaySession.start(overlay.resolve('ag.campaign.json'), 'seed', overlay);
const id = (c: Campaign, schema: string) => c.offered().find(o => o.schema === schema || o.schema!.endsWith("__" + schema))!.id;
const walker = (c: Campaign) => c.actors.find(a => !a.player)!.id;
const home = (c: Campaign) => c.world.test(ModuleWriter.call(c.module.relations.find(r => r.name.startsWith('p__') && r.name.endsWith('home'))!.name, walker(c)));
const report = (label: string, c: Campaign) => console.log(label.padEnd(12), JSON.stringify({ elapsed: c.readout.elapsed, npc: c.history.at(-1)?.npc?.map(d => d.action),
  walkerHome: home(c), key: c.world.key(), cache: [...fruitless.entries()].map(([k, v]) => [k.replace('\u0000', '/'), (v as { until?: number }).until]) }));

{ // A
  fruitless.clear(); const s = await start(); const c = s.campaign;
  c.execute(id(c, 'idle')); report('A after idle', c);
  c.execute(id(c, 'open_gate')); report('A continued', c);
}
{ // B
  fruitless.clear(); const s = await start(); const c = s.campaign;
  c.execute(id(c, 'idle')); const save = c.save();
  fruitless.clear(); const r = Campaign.restore(save);
  r.execute(id(r, 'open_gate')); report('B restored', r);
}
{ // C
  fruitless.clear(); const s = await start(); const c = s.campaign;
  PlayerView.observe(c); report('C viewed', c);
  c.execute(id(c, 'open_gate')); report('C after', c);
}
{ // D
  fruitless.clear(); const s = await start(); const c = s.campaign;
  c.execute(id(c, 'open_gate')); report('D unviewed', c);
}
{ // E: A's cache left in place
  fruitless.clear(); const a = (await start()).campaign; a.execute(id(a, 'idle'));
  const c = (await start()).campaign;
  c.execute(id(c, 'open_gate')); report('E leaked', c);
}
{ // F: a command undone (Campaign.undo, as PlaySession does when a later step fails) keeps the cache it wrote
  fruitless.clear(); const c = (await start()).campaign;
  c.execute(id(c, 'idle')); c.undo(); report('F undone', c);
  c.execute(id(c, 'open_gate')); report('F after', c);
}
