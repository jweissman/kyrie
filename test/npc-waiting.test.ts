import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { Campaign } from '../src/campaign/campaign';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';

// Someone who found no way to a goal after a long look tries again an hour later: a rule of the world, kept with the
// campaign's own state, so the game goes the same continued or kept and opened again, looked at by the page or not,
// in a second game in the same process, and after a command undone (the architecture review's A1, from its probe
// state-agency: a cache in the process, written by the page, made all of these differ).
class Walker {
  static readonly flips = Array.from({ length: 12 }, (_, i) => i + 1);
  static readonly site = `Module ag "Agency probe" {
  Place field "Field" is wilderness.
  Place room "Room" is room within field at 0, 0.
  Company party "You" of 1 at room.
  ${Walker.flips.map(i => `Relation f${i}().`).join(' ')}
  Relation gate_open(). Relation home(group).
  Person walker "a walker" at room { Ancestry human. Calling warrior. Level 1.
    Uses ${Walker.flips.map(i => `flip${i}`).join(', ')}, arrive. Plans 6 steps. }
  ${Walker.flips.map(i => `Action flip${i}(actor: group) "Flip ${i}" { Requires able(actor) and not company(actor) and not f${i}(). Time 1. On success { Assert f${i}(). } }`).join('\n  ')}
  Action arrive(actor: group) "Arrive" { Requires able(actor) and not company(actor) and gate_open(). Time 1. On success { Assert home(actor). } }
  Action idle(actor: group) "Idle" { Requires company(actor). Time 1. Result "You wait.". }
  Action open_gate(actor: group) "Open the gate" { Requires company(actor) and not gate_open(). Time 1. On success { Assert gate_open(). } Result "The gate opens.". }
  Pursuit go_home for walker "going home" priority 10 when not home(walker) seeks home(walker).
  Goal false.
}`;
  static readonly source = new OverlayBundleSource(NodeBundleSource.shared, { 'ag/site.kyr': Walker.site,
    'ag/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'] }),
    'ag.campaign.json': JSON.stringify({ version: 1, name: 'ag', modules: [{ id: 'p', bundle: 'ag/module.json' }],
      party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }) });
  static async start() { return (await PlaySession.start(this.source.resolve('ag.campaign.json'), 'seed', this.source)).campaign; }
  static act(c: Campaign, schema: string) { c.execute(c.offered().find(o => o.schema!.endsWith(schema))!.id); }
  static home(c: Campaign): boolean {
    const walker = c.actors.find(a => !a.player)!.id, home = c.module.relations.find(r => r.name.startsWith('p__') && r.name.endsWith('home'))!.name;
    return c.world.test(ModuleWriter.call(home, walker));
  }
}
describe('someone who could find no way', () => {
  it('tries again when the world says, whatever else the process or the page has done', async () => {
    const continued = await Walker.start();
    Walker.act(continued, 'idle'); Walker.act(continued, 'open_gate');
    const kept = await Walker.start();
    Walker.act(kept, 'idle');
    const restored = Campaign.restore(kept.save());
    Walker.act(restored, 'open_gate');
    // Waiting an hour after a long fruitless look, both continued and opened again.
    expect([Walker.home(continued), Walker.home(restored)]).toEqual([false, false]);
    expect(restored.world.key()).toBe((() => { Walker.act(kept, 'open_gate'); return kept.world.key(); })());
    const viewed = await Walker.start();
    PlayerView.observe(viewed); Walker.act(viewed, 'open_gate');
    const unviewed = await Walker.start();
    Walker.act(unviewed, 'open_gate');
    const second = await Walker.start();
    Walker.act(second, 'open_gate');
    const undone = await Walker.start();
    Walker.act(undone, 'idle'); undone.undo(); Walker.act(undone, 'open_gate');
    // The gate opened first: home at once, looked at by the page or not, in a later game, and after an undo.
    expect([viewed, unviewed, second, undone].map(c => Walker.home(c))).toEqual([true, true, true, true]);
    expect(new Set([viewed, unviewed, second, undone].map(c => c.world.key())).size).toBe(1);
  }, 120000);
});
