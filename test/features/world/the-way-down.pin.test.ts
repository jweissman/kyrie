import { describe, expect, it } from 'bun:test';
import { Tiny } from '../../support/tiny';
import { ModuleWriter } from '../../../src/lang/index';
import { DeepShortcuts } from '../../../src/world/deep/deep-shortcuts';
import { DeepPurposes } from '../../../src/world/deep/deep-purposes';
import { DeepLayouts, type DeepLayout, type DeepLevel } from '../../../src/world/deep/deep-layout';

// Feature pins: see test/features/choice/consequence.pin.test.ts. World › The way down (the cold play of 25 November,
// D1: out of a deep site was one move, and in was every cleared room again, so a fifth expedition was mostly walking).
// A delver's way down to a depth already reached is made by the company from below, where it first comes down to that
// level, at what it costs (a coil of rope bought in town; oil for the mine's cage, once its winding wheel is free);
// once made it stays made, and the site's way in offers it as a way of its own, straight down to that level in one
// act. The generator's own lines (DeepShortcuts.lines) with each purpose's own words, on levels of a room or two
// drawn by hand.
const level = (id: string, index: number, rooms: [string, string][]): DeepLevel => ({ id: `b_${id}`, index,
  name: id, flooded: false, rooms: rooms.map(([room, role], x) => ({ id: room, level: index, role, x, y: 1, name: room,
    scene: '', lit: true })) });
const barrow: DeepLayout = { site: 'b', links: [], levels: [level('barrow', 0, [['mouth', 'mouth']]),
  level('halls', 1, [['foot', 'stair_foot']]), level('grave', 2, [['ante', 'antechamber']])] };
const mine: DeepLayout = { site: 'b', levels: [level('adit', 0, [['mouth', 'mouth'], ['head', 'shaft_head']]),
  level('haulage', 1, [['foot', 'shaft_bottom']])],
links: [{ id: 'cage', a: 'head', b: 'foot', kind: 'shaft', name: 'the cage', minutes: 4, between: true,
  mechanism: 'winch' }] };
const world = (layout: DeepLayout, art: string, extra: string) => `
  Place b "the way in" is site.
${layout.levels.map(l => `  Place ${l.id} "${l.name}" is level within b.\n${l.rooms.map(r => `  Place ${r.id} "${r.name}"`
    + ` is room within ${l.id} at ${r.x}, 1 underground.`).join('\n')}`).join('\n')}
  Passage b_in "the way in" is tunnel between b and mouth taking 2 minutes.
${extra}
  Item coil "a coil of rope" is rope at foot.
  Item flask "a flask of lamp oil" is lamp_oil at foot.
  Company party "You" of 1 at foot.
${DeepShortcuts.lines(layout, DeepPurposes.all[art]!.mechanisms.shortcuts!).join('\n')}
  Goal false.`;
const labels = (t: Tiny) => t.journey.choices().map(c => c.label);
const way = (t: Tiny, to: string) => t.journey.choices().find(c => new RegExp(`^go\\(t__\\w+,t__${to}\\)$`).test(c.command));
const go = (t: Tiny, place: string) => {
  const w = way(t, place);
  if (!w) { throw new Error(`no way to ${place} among ${t.journey.choices().map(c => c.command).join(' ')}`); }
  return t.perform(w.command);
};
const take = (t: Tiny, item: string) => t.perform(t.journey.choices().find(c => c.command.includes(`t__${item}`))!.command);
const carried = (t: Tiny, item: string) => t.world.related('ownedItem').some(r => r.args[0] === `t__${item}`);
describe('World › The way down', () => {
  it('is made from below with a rope, stays made, and is offered from the way in straight down to that depth', async () => {
    const t = await Tiny.start(world(barrow, 'bone', `  Passage down "the stair" is stair between mouth and foot.
  Passage deeper "the king's door" is door between foot and ante.`), { party: [{ name: 'Wynn', raceId: 'human',
      classId: 'warrior' }] });
    // Nothing to make without a rope, and no way up from here but the long one.
    expect(way(t, 'b')).toBeUndefined();
    expect(labels(t).some(l => /^Climb the dead-shaft/.test(l))).toBe(false);
    await take(t, 'coil');
    await t.play('Climb the dead-shaft and leave a rope hanging in it');
    expect(carried(t, 'coil')).toBe(false);
    expect(t.world.test(ModuleWriter.call('knows', 'party', 't__foot_short_known'))).toBe(true);
    // Up to the way in, the long way, and the way down offered there: one act to the halls.
    await go(t, 'mouth'); await go(t, 'b');
    expect(way(t, 'foot')?.label).toMatch(/dead-shaft/);
    expect(way(t, 'ante')).toBeUndefined();
    await go(t, 'foot');
    expect(t.where()).toBe('t__foot');
    // A depth not yet made is not offered: the king's grave needs its own rope, from its own antechamber.
    await go(t, 'ante');
    expect(labels(t).some(l => /^Climb the king's chimney/.test(l))).toBe(false);
  });
  it('in the mine is the cage, hooked to its chain with oil once the winding wheel above is free', async () => {
    const t = await Tiny.start(world(mine, 'deep', `  Passage walk "the adit" is tunnel between mouth and head.
  Thing cage_wheel "the winding wheel" at head {
    State seized "The wheel is seized.".
    State turning "The wheel turns.".
    Change free "Work the seized wheel free" from seized to turning needing brawn.
  }
  Passage cage "the cage" is shaft between head and foot opening when state(cage_wheel, turning) "The cage is below.".
  Passage cage_chain "the chain" is climb between head and foot.`), { party: [{ name: 'Wynn', raceId: 'human',
      classId: 'warrior' }] });
    await take(t, 'flask');
    expect(way(t, 'b')).toBeUndefined();
    // Withheld while the wheel is seized: the cage cannot be hooked to a chain that will not run.
    expect(labels(t).some(l => /^Oil the cage's sheaves/.test(l))).toBe(false);
    await go(t, 'head'); await t.play('Work the seized wheel free'); await go(t, 'foot');
    await t.play("Oil the cage's sheaves and hook it to the chain");
    expect(carried(t, 'flask')).toBe(false);
    await go(t, 'head'); await go(t, 'mouth'); await go(t, 'b');
    await go(t, 'foot');
    expect(t.where()).toBe('t__foot');
  });
  it('is there for every level below the first of every kind of deep site, whatever its draw', () => {
    for (const [art, purpose] of Object.entries(DeepPurposes.all)) {
      for (const key of ['a', 'b', 'c', 'd', 'e', 'f']) {
        const layout = DeepLayouts.make(purpose, 's', key);
        const ways = DeepShortcuts.lines(layout, purpose.mechanisms.shortcuts ?? [])
          .filter(l => /^ {2}Passage /.test(l));
        expect([art, key, ways.length]).toEqual([art, key, layout.levels.length - 1]);
      }
    }
  });
});
