import { describe, expect, it } from 'bun:test';
import { DeepLoosed } from '../../../src/world/deep/deep-loosed';
import type { DeepLayout, DeepRoom } from '../../../src/world/deep/deep-layout';
import type { DeepContent } from '../../../src/world/deep/deep-pacing';
import { Tiny } from '../../support/tiny';

// A seal's answers read later (OR-1444, the maintained mechanism's grammar of OR-1392; DeepLoosed): broken, the king's
// door lets those who kept its far side up through it at the first dawn the company is off the level above, and they
// are met at the door; set back before then, it keeps them where they were.
const room = (id: string, level: number): DeepRoom => ({ id, level, role: id, x: 0, y: 0, name: id, scene: '', lit: true });
const door = room('door', 0), guard = { ...room('guards', 1), role: 'guard_room' };
const layout: DeepLayout = { site: 'pit', links: [{ id: 'kd', a: 'door', b: 'guards', kind: 'door', name: "the king's door",
  minutes: 1, between: true, mechanism: 'seal' }], levels: [
  { id: 'pit_halls', index: 0, name: 'the halls', flooded: false, rooms: [door] },
  { id: 'pit_grave', index: 1, name: 'the grave', flooded: false, rooms: [guard] }] };
const content = [{ room: guard, guide: 'mob', dwellers: { id: 'men', level: 2, group: { species: 'zombie', count: 2,
  label: "the king's men", role: 'guards', temperament: 'wary' } } }] as DeepContent[];
const kyr = [`  Place door "the king's door" is room at 0, 0.`, `  Place guards "the guard room" is room at 0, 1.`,
  `  Place stair "the stair" is room at 1, 0.`, `  Relation deepLevelOf(place, place).`,
  `  Initially Assert deepLevelOf(door, pit_halls). Initially Assert deepLevelOf(guards, pit_grave).`,
  `  Place pit_halls "the halls" is room at 5, 5. Place pit_grave "the grave" is room at 6, 6.`,
  `  Passage stair_door "the stair" is stair between stair and door taking 1 minute.`,
  `  Passage kd "the king's door" is door between door and guards taking 1 minute.`,
  `  Thing kd_wall "the seal-stone" on kd {`, `    State standing blocking "A seal-stone closes the door.".`,
  `    State broken "The seal-stone lies cracked.".`, `    Change break "Break the seal-stone" from standing to broken.`,
  `    Change rebuild "Set the seal-stone back" from broken to standing at door.`, '  }',
  `  Company party "You" of 1 at door.`,
  `  Person men "the king's men" at guards { Role "guards". Species zombie. Level 2. Numbers 2. Temperament wary. }`,
  ...DeepLoosed.lines(layout, content, { loosed: { role: 'guard_room', scene: "The king's men are at the door." } } as never)]
  .join('\n');
const party = [{ name: 'Aud', raceId: 'human', classId: 'warrior' }];
const night = async (t: Tiny) => { for (let i = 0; i < 26; i++) { await t.perform('wait_hour'); } };
describe('World › A seal broken, read later', () => {
  it('lets the king\'s men up to the door at the first dawn the company is off the level', async () => {
    const t = await Tiny.start(kyr, { seed: 'k0', party });
    await t.perform('change_thing(t__kd_wall_break)');
    await t.perform('go(t__stair_door,t__stair)');
    await night(t);
    expect(t.where('t__men')).toBe('t__door');
    await t.perform('go(t__stair_door,t__door)');
    expect(t.leaf.situation.join(' ')).toMatch(/The king.s men are at the door\./);
  });
  it('keeps them where they were when it is set back first, or while the company stays', async () => {
    const t = await Tiny.start(kyr, { seed: 'k0', party });
    await t.perform('change_thing(t__kd_wall_break)');
    await t.perform('change_thing(t__kd_wall_rebuild)');
    await t.perform('go(t__stair_door,t__stair)');
    await night(t);
    expect(t.where('t__men')).toBe('t__guards');
    const u = await Tiny.start(kyr, { seed: 'k0', party });
    await u.perform('change_thing(t__kd_wall_break)');
    await night(u);
    expect(u.where('t__men')).toBe('t__guards');
  });
});
