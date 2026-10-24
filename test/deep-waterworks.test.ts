import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ActionFeedbackView } from '../src/presentation/action-feedback';
import { ModuleWriter } from '../src/lang/module-writer';
import type { Change } from '../src/lang/module';
import type { Region } from '../src/world/region-writer';

// A third purpose from the same generator (data/generation/deep/waterworks.json): where a country's first makers were
// the Water-Wardens, its deep site is their cisterns under a hill. A bronze gate on a seized wheel across the stair;
// a great pipe to go down feet first; the gate of the deep cistern sealed with the Wardens' warning cut round it; a
// cistern standing under water that drains only while the master sluice turns the springs onto the great wheel and
// its pump-rods are coupled; and at the bottom a keeper that shrinks not from the day but from the Wardens' oath, on
// a tablet of the cisterns' own. Reading the old script is not the oath: a bard who reads it, or anyone with a
// glossary, was enough until thorn was played, and the archive was never wanted. Thorn is a marsh of the stone and
// water arts.
class Cisterns {
  static async world(seed: string, classId = 'warrior') {
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId }] });
    const region = w.report.region as Region, deep = region.sites.find(s => s.work?.deep)!;
    return { s: await PlaySession.start(w.path, seed, w.source), deep, room: (r: string) => `region__${deep.id}_${r}` };
  }
  static names(s: PlaySession) { return PlayerView.choices(s.campaign).map(c => c.choice.name); }
  static seen(s: PlaySession) { return PlayerView.observe(s.campaign).observations.map(o => o.text); }
  static set(s: PlaySession, changes: Change[]) {
    const c = s.campaign as unknown as { world: { apply(c: Change[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply(changes));
  }
  // Empties the cisterns of all that lives there but the keeper, as a test of the works and not of the fights.
  static clear(s: PlaySession, deep: string) {
    const groups = s.campaign.module.entities.filter(e => e.type === 'group' && e.id.startsWith(`region__${deep}_`)
      && !e.id.endsWith('_keeper')).map(e => e.id);
    this.set(s, s.campaign.world.related('at').filter(r => groups.includes(r.args[0]!))
      .map(r => ({ kind: 'retract' as const, call: ModuleWriter.call('at', ...r.args) })));
  }
  // Puts the company in a room by light.
  static enter(s: PlaySession, room: string) {
    this.set(s, [{ kind: 'retract', call: ModuleWriter.call('unlit', room) },
      { kind: 'assert', call: ModuleWriter.call('at', 'party', room) }]);
  }
  static async take(s: PlaySession, pattern: RegExp) {
    const c = PlayerView.choices(s.campaign).find(x => pattern.test(x.choice.name));
    if (!c) { throw new Error(`No ${pattern}: ${this.names(s).join(' | ')}`); }
    const before = PlayerView.observe(s.campaign), event = await s.perform(c.choice.id);
    const f = ActionFeedbackView.read(s.campaign, event, before);
    return [f.result, ...f.observations, ...f.events].join(' ');
  }
}

describe('the Water-Wardens\' cisterns from the same generator as the mine', () => {
  it('stands where the makers were the Water-Wardens, and is told of at the inn', async () => {
    const { s, deep } = await Cisterns.world('thorn');
    expect(deep.work?.art).toBe('water');
    const topics = s.campaign.module.actions.filter(a => a.speaker?.endsWith('_innkeeper')).map(a => a.name);
    expect(topics.some(n => /about the old cisterns$/.test(n))).toBe(true);
  }, 90000);
  it('works its own gear: the gate-wheel freed, the great pipe, the deep cistern\'s gate sealed', async () => {
    const { s, deep, room } = await Cisterns.world('thorn');
    Cisterns.clear(s, deep.id);
    Cisterns.enter(s, room('gatehouse_stair_head'));
    expect(Cisterns.names(s).some(n => n.startsWith('Take the stair behind the bronze gate'))).toBe(false);
    await Cisterns.take(s, /^Work the seized gate-wheel free$/);
    expect(Cisterns.names(s)).toContain('Take the stair behind the bronze gate to the foot of the stair');
    Cisterns.enter(s, room('gatehouse_gate_hall'));
    expect(Cisterns.names(s)).toContain('Take the great pipe, feet first to the pipe gallery');
    Cisterns.enter(s, room('galleries_deep_gate'));
    expect(Cisterns.names(s)).toContain('Tear the bronze plate from the gate');
    expect(Cisterns.names(s).some(n => n.startsWith('Take the gate of the deep cistern'))).toBe(false);
    await Cisterns.take(s, /^Tear the bronze plate from the gate$/);
    expect(Cisterns.names(s)).toContain('Take the gate of the deep cistern to the landing');
  }, 90000);
  it('drains the deep cistern while the springs turn the great wheel and its rods are coupled', async () => {
    const { s, deep, room } = await Cisterns.world('thorn');
    Cisterns.clear(s, deep.id);
    Cisterns.enter(s, room('cistern_landing'));
    await Cisterns.take(s, /^Search the landing$/);
    expect(Cisterns.seen(s)).toContain('Black water fills the cistern to the top of the steps.');
    Cisterns.enter(s, room('gatehouse_race_head'));
    expect(await Cisterns.take(s, /^Swing the master sluice-gate across/)).toContain('something great is turning');
    // The springs go down the race now, and not out at the door.
    Cisterns.enter(s, room('gatehouse_mouth'));
    expect(Cisterns.seen(s).some(t => t.startsWith('Only a trickle comes out from under the sill now'))).toBe(true);
    Cisterns.enter(s, room('galleries_pump'));
    expect(await Cisterns.take(s, /^Drive the bronze pin home/)).toContain('water comes up out of the deep cistern');
    // A watch's worth of water at a time, however much is done in the watch: a look at the rods takes none.
    const water = () => s.campaign.world.number(ModuleWriter.call('region__deepWater', room('cistern')));
    const pumped = water();
    await Cisterns.take(s, /^Look closely at the pump-rods$/);
    expect([pumped, water()]).toEqual([11, 11]);
    let heard = '';
    for (let i = 0; i < 4 && !heard.includes('the deep cistern empty'); i++) { heard = await Cisterns.take(s, /^Wait an hour$/); }
    expect(heard).toContain('the deep cistern empty');
    Cisterns.enter(s, room('cistern_landing'));
    await Cisterns.take(s, /^Wait a while$/);
    expect(Cisterns.seen(s)).not.toContain('Black water fills the cistern to the top of the steps.');
    // The way on is open, if not yet safe: a trap stands on it, to be risked or made safe first.
    expect(Cisterns.names(s).some(n => /drowned hall$|^Risk the /.test(n))).toBe(true);
    // Drained, the wheel's pit says so to whoever comes by, not only to whoever was there when it emptied.
    Cisterns.enter(s, room('galleries_pump'));
    expect(Cisterns.seen(s).some(t => t.includes('the deep cistern empty'))).toBe(true);
  }, 90000);
  it('has a keeper that shrinks from the Wardens\' oath, on its tablet, and not from the old script read', async () => {
    const bard = await Cisterns.world('thorn', 'bard');
    Cisterns.clear(bard.s, bard.deep.id);
    Cisterns.enter(bard.s, bard.room('galleries_deep_gate'));
    expect(await Cisterns.take(bard.s, /^Read what is cut round the gate$/))
      .toContain('READ IT THE OATH, AND IT MUST GO BACK');
    Cisterns.enter(bard.s, bard.room('still_shore'));
    expect(await Cisterns.take(bard.s, /^Take .* to the still water$/)).not.toContain('draws back from the words');
    const { s, deep, room } = await Cisterns.world('thorn');
    Cisterns.clear(s, deep.id);
    await Cisterns.take(s, /^Light a torch$/);
    Cisterns.enter(s, room('cistern_archive'));
    await Cisterns.take(s, /^Collect the Wardens' oath-tablet/);
    await Cisterns.take(s, /^Equip the Wardens' oath-tablet/);
    Cisterns.enter(s, room('still_shore'));
    expect(await Cisterns.take(s, /^Take .* to the still water$/)).toContain('draws back from the words into the source');
    expect(Cisterns.names(s)).toContain('Collect the Wardens\' reading-glass for Wenna');
  }, 90000);
});
