import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Undertakings } from '../src/presentation/undertakings';
import { ScreenModel } from '../src/ui/screen-model';
import { Narrator } from '../src/presentation/narrator';
import { PlayerView } from '../src/presentation/player-view';
import { AimAdvances } from '../src/presentation/aim-advances';
import { ModuleWriter } from '../src/lang/module-writer';
import { GeneratedWorld } from './support/generated';

// The thread of the gold, followed from the reason the company came (the owner's player report, 12 November: led
// out of a place and back to it, and nothing there to advance the aim). A company that follows its errand and takes
// only the gold sees it through, or comes to a danger the page leads with instead; never a place where the aim is held
// and nothing is gold, and never the same act at the same place three times over.
class Thread {
  static async walk(seed: string, origin: string, most = 30) {
    const s = await DrawnWorld.start(seed, { origin, party: [{ name: 'Ralf', raceId: 'human', classId: 'warrior' }] },
      NodeBundleSource.shared);
    const c = s.campaign, trail: string[] = [], seen = new Map<string, number>();
    Undertakings.follow(c, Undertakings.held(c).find(o => Undertakings.errand(c, o))!.id);
    for (let i = 0; i < most && c.running; i++) {
      const aim = Undertakings.followed(c)?.id;
      if (!aim) { return { end: 'done', trail }; }
      const screen = ScreenModel.build(c), acts = Narrator.leaf(c, screen).glance?.acts ?? [];
      const lead = acts.find(a => a.continues);
      if (!lead) {
        return { end: acts.some(a => ['danger', 'warned', 'dark'].includes(a.why)) ? 'danger' : 'lost', trail };
      }
      const key = `${aim}|${screen.place.id}|${lead.choice}`;
      seen.set(key, (seen.get(key) ?? 0) + 1);
      if (seen.get(key)! > 2) { return { end: 'circle', trail }; }
      trail.push(`${screen.place.id}: ${lead.label}`);
      await s.leg(lead.command?.startsWith('travel:') ? lead.command : lead.for ?? lead.command!);
    }
    return { end: 'going', trail };
  }
}
describe('the gold\'s thread', () => {
  it('sees a found thing taken up, where it was found: the dead man\'s box, a sister\'s pin', async () => {
    for (const origin of ['map', 'lost']) {
      const walked = await Thread.walk('kahitude', origin);
      expect([origin, walked.end]).toEqual([origin, 'done']);
      expect(walked.trail.at(-1)).toMatch(/box|pin/);
    }
  }, 240000);
  // At a keep's door with its gate-passage open and not yet gone into, "Search here" had not been the aim's, and the
  // gold had gone in, room by room, while the cross on the map was under the door-stone (round 9, P).
  it('searches where the thing the aim waits on is hidden, before any way on', async () => {
    const s = await DrawnWorld.start('kahitude', { origin: 'map', party: [{ name: 'Ralf', raceId: 'human', classId: 'warrior' }] },
      NodeBundleSource.shared);
    const c = s.campaign, aim = Undertakings.held(c).find(o => Undertakings.errand(c, o))!;
    Undertakings.follow(c, aim.id);
    const door = c.world.related('revealedBy').find(r => r.args[0] === 'origin__cache')!;
    const place = c.module.observations!.find(o => o.teaches === door.args[1])!.place!;
    c.commitWorld(c.world.apply([{ kind: 'retract', call: ModuleWriter.call('at', 'party', c.world.one('at', 'party')!) },
      { kind: 'assert', call: ModuleWriter.call('at', 'party', place) }]));
    const rows = PlayerView.choices(c), lead = AimAdvances.of(c, rows);
    expect([...lead].map(id => rows.find(r => r.choice.id === id)?.action.schema)).toContain('search');
  }, 120000);
  // Gone on in past the door, the cross not yet found, the gold leads back out to it, not on up the wall-walk
  // (round 10, S at Murkweard; R at Ísencepan, the sister's pin under its door).
  it('leads back out to where the thing is hidden, from inside the place past it', async () => {
    const s = await DrawnWorld.start('a1', { origin: 'map',
      party: [{ name: 'Ralf', raceId: 'human', classId: 'warrior' }] }, NodeBundleSource.shared);
    const c = s.campaign, aim = Undertakings.held(c).find(o => Undertakings.errand(c, o))!;
    Undertakings.follow(c, aim.id);
    const door = c.world.related('revealedBy').find(r => r.args[0] === 'origin__cache')!;
    const place = c.module.observations!.find(o => o.teaches === door.args[1])!.place!;
    await GeneratedWorld.travel(s, place);
    // Past the door (shut here, the riddle's), and a room further in by a way the company takes.
    const gate = ScreenModel.build(c).exits.find(e => e.destination.id.startsWith(`${place}_`))!;
    GeneratedWorld.put(s, gate.destination.id.replace(/^region__/, ''));
    const on = ScreenModel.build(c).exits.find(e => e.local && !e.blocked && !e.visited && e.destination.id !== place);
    if (on) { await GeneratedWorld.travel(s, on.destination.id); }
    expect(c.world.one('at', 'party')).not.toBe(place);
    const screen = ScreenModel.build(c), next = Narrator.leaf(c, screen).glance!.acts.find(a => a.continues);
    const exit = screen.exits.find(e => e.id === next?.choice || next?.choice.startsWith(`${e.id}/`));
    expect(exit).toBeDefined();
    // The way it leads is the first step of the shortest way back to the door.
    expect(GeneratedWorld.path(s, place)[0]?.[1]).toBe(exit!.destination.id);
  }, 180000);
  // What the aim waits on is learned by seeing something come about: Neblalac's marks read, the Water-Wardens' history
  // known. The pillar is the step, not the sluice-niche past it (round 11, T).
  it('leads to what teaches what the aim waits on, where its teaching is seen', async () => {
    const s = await DrawnWorld.start('a1', { origin: 'order',
      party: [{ name: 'B', raceId: 'dwarf', classId: 'cleric' }] }, NodeBundleSource.shared);
    const c = s.campaign;
    await s.leg(PlayerView.choices(c).find(x => /the brothers' letter/.test(x.choice.name))!.choice.id);
    Undertakings.follow(c, Undertakings.held(c).find(o => Undertakings.errand(c, o))!.id);
    GeneratedWorld.put(s, 'w2_hall');
    await s.leg(PlayerView.choices(c).find(x => /light a candle|light a torch/i.test(x.choice.name))!.choice.id);
    const next = Narrator.leaf(c, ScreenModel.build(c)).glance!.acts.find(a => a.continues);
    expect(next?.subject).toBe('region__w2_marks');
    expect(next?.inside?.[0]?.command).toBe('change_thing(region__w2_marks_read)');
  }, 180000);
  // At the door of the place the aim names, the way in barred by it, the door is the aim's step (round 11, T at
  // Neblalac: "the gate entry wasn't marked as my aim"; R10-18).
  it('leads to the barred door of the place the aim names', async () => {
    const s = await DrawnWorld.start('a1', { origin: 'order',
      party: [{ name: 'B', raceId: 'dwarf', classId: 'cleric' }] }, NodeBundleSource.shared);
    const c = s.campaign;
    await s.leg(PlayerView.choices(c).find(x => /the brothers' letter/.test(x.choice.name))!.choice.id);
    Undertakings.follow(c, Undertakings.held(c).find(o => Undertakings.errand(c, o))!.id);
    GeneratedWorld.put(s, 'w2');
    const next = Narrator.leaf(c, ScreenModel.build(c)).glance!.acts.find(a => a.continues);
    expect(next?.choice).toMatch(/^exit:region__w2_stair\//);
  }, 180000);
  it('leads to the one who has the aim\'s next step, and to what they ask: the fever nursed', async () => {
    expect((await Thread.walk('kahitude', 'herbs')).end).toBe('done');
  }, 120000);
  // Into a site only so far as what the aim waits on is known to lie within it (the lead's ruling of 13 November,
  // PL-23): kahitude's brothers' errand names Lapisrecs, whose writing tells another people's history than the one
  // the errand waits on (PL-24), so the gold stops at its door; never the same door over and over.
  it('goes on into a site only as far as what the aim waits on is known to be, and does not ask the same door over and over',
    async () => {
      expect(['danger', 'done', 'going', 'lost']).toContain((await Thread.walk('kahitude', 'order')).end);
      expect((await Thread.walk('a1', 'order')).end).not.toBe('circle');
    }, 240000);
  // The debt's coin is not known to lie in Ísencepan: the gold goes to its door, and its rooms are exploration, not
  // the debt's (PL-23; the find taken up and led home with is test/small/gold-site's).
  it('leads the debt to the old place it was told of, and not on through its rooms', async () => {
    const walked = await Thread.walk('a1', 'debt');
    expect(walked.trail.at(-1)).toMatch(/Set out for/);
    expect(walked.trail.some(t => /^region__w\d+_/.test(t))).toBe(false);
  }, 180000);
});
