import { describe, expect, it } from 'bun:test';
import { DeepLoosed } from '../../../src/world/deep/deep-loosed';
import { DeepTime } from '../../../src/world/deep/deep-time';
import type { DeepLayout, DeepRoom } from '../../../src/world/deep/deep-layout';
import type { DeepContent } from '../../../src/world/deep/deep-pacing';
import type { DeepPurpose } from '../../../src/world/deep/deep-purposes';
import { Tiny } from '../../support/tiny';

// What goes on below while the company is away is seen, and costs it the longer it waits (OR-1449, OR-1460; the
// review's routine, OR-1395). Newcomers moved into a room the company emptied are seen at the way onto the level; a
// dawn later they have dug in, and fall on whoever comes without warning (DeepTime). The king's men loosed through a
// broken door come a room further up the level each dawn it stands broken, and are seen at its way in (DeepLoosed).
const room = (id: string, level = 0): DeepRoom => ({ id, level, role: id, x: 0, y: 0, name: id, scene: '', lit: true });
const top = [room('mouth'), room('hall'), room('door')];
const layout: DeepLayout = { site: 'pit', levels: [{ id: 'pit_top', index: 0, name: 'the top', flooded: false, rooms: top },
  { id: 'pit_low', index: 1, name: 'the low', flooded: false, rooms: [{ ...room('guards', 1), role: 'guard_room' }] }],
  links: [{ id: 'mouth_hall', a: 'mouth', b: 'hall', kind: 'tunnel', name: 'the passage', minutes: 2 },
    { id: 'hall_door', a: 'hall', b: 'door', kind: 'tunnel', name: 'the passage', minutes: 2 },
    { id: 'kd', a: 'door', b: 'guards', kind: 'door', name: "the king's door", minutes: 1, between: true,
      mechanism: 'seal' }] };
const group = (label: string, temperament: string) => ({ species: 'rat', count: 2, label, role: label, temperament });
const content = [{ room: top[1]!, guide: 'mob', dwellers: { id: 'rats', level: 1, group: group('the rats', 'wary') } },
  { room: layout.levels[1]!.rooms[0]!, guide: 'mob', dwellers: { id: 'men', level: 2, group: group("the king's men",
    'wary') } }] as DeepContent[];
const purpose = { dwellers: [{ depth: 0, groups: [group('the rats', 'wary'), group('the gnawers', 'territorial')] }] };
const kyr = [`  Place mouth "the mouth" is room at 0, 0.`, `  Place hall "the hall" is room at 1, 0.`,
  `  Place door "the king's door" is room at 2, 0.`, `  Place guards "the guard room" is room at 2, 1.`,
  `  Place outside "outside" is room at 0, 5.`, `  Relation deepLevelOf(place, place).`,
  ...['mouth', 'hall', 'door'].map(r => `  Initially Assert deepLevelOf(${r}, pit_top).`),
  `  Initially Assert deepLevelOf(guards, pit_low).`,
  `  Place pit_top "the top" is room at 5, 5. Place pit_low "the low" is room at 6, 6.`,
  `  Passage out "the way in" is tunnel between outside and mouth taking 1 minute.`,
  `  Passage mouth_hall "the passage" is tunnel between mouth and hall taking 2 minutes.`,
  `  Passage hall_door "the passage" is tunnel between hall and door taking 2 minutes.`,
  `  Passage kd "the king's door" is door between door and guards taking 1 minute.`,
  `  Thing kd_wall "the seal-stone" on kd {`, `    State standing blocking "A seal-stone closes the door.".`,
  `    State broken "The seal-stone lies cracked.".`, `    Change break "Break the seal-stone" from standing to broken.`, '  }',
  `  Company party "You" of 1 at hall.`,
  `  Person rats "the rats" at hall { Role "rats". Species rat. Level 1. Numbers 2. Temperament wary. }`,
  `  Person men "the king's men" at guards { Role "guards". Species zombie. Level 2. Numbers 2. Temperament wary. }`,
  ...DeepTime.lines(purpose as unknown as DeepPurpose, layout, content.slice(0, 1), 'delay'),
  ...DeepLoosed.lines(layout, content, { loosed: { role: 'guard_room', scene: 'The king\'s men are at the door.',
    sign: 'The dead are walking.' } } as never)].join('\n');
const party = [{ name: 'Aud', raceId: 'human', classId: 'warrior' }];
const dawn = async (t: Tiny) => {
  const day = t.world.number({ kind: 'call', name: 'day', args: ['clock'] });
  for (let i = 0; i < 30 && t.world.number({ kind: 'call', name: 'day', args: ['clock'] }) === day; i++) {
    await t.perform('wait_hour');
  }
  for (let i = 0; i < 8; i++) { await t.perform('wait_hour'); }
};
describe('World › What goes on below, seen and costly', () => {
  it('sees newcomers at the way onto the level, and finds them dug in a dawn later', async () => {
    const t = await Tiny.start(kyr, { seed: 'd0', party });
    await t.perform('attack(t__rats)');
    expect(t.world.test({ kind: 'call', name: 'dead', args: ['t__rats'] })).toBe(true);
    await t.perform('go(t__mouth_hall,t__mouth)');
    await t.perform('go(t__out,t__outside)');
    await dawn(t);
    expect(t.where('t__pit_top_newcomers')).toBe('t__hall');
    expect(t.world.related('dugIn')).toEqual([]);
    await t.perform('go(t__out,t__mouth)');
    expect(t.leaf.situation.join(' ') + JSON.stringify(t.leaf.glance)).toContain('trodden fresh');
    await t.perform('go(t__out,t__outside)');
    await dawn(t);
    expect(t.world.related('dugIn').map(r => r.args)).toEqual([['t__pit_top_newcomers']]);
    expect(t.world.one('temperament', 't__pit_top_newcomers')).toBe('temper_savage');
  });
  it('lets the king\'s men a room further up each dawn the door stands broken, seen at the way in', async () => {
    const t = await Tiny.start(kyr, { seed: 'd0', party });
    await t.perform('go(t__hall_door,t__door)');
    await t.perform('change_thing(t__kd_wall_break)');
    for (const step of ['go(t__hall_door,t__hall)', 'go(t__mouth_hall,t__mouth)', 'go(t__out,t__outside)']) {
      await t.perform(step);
    }
    await dawn(t);
    expect(t.where('t__men')).toBe('t__door');
    await dawn(t);
    expect(t.where('t__men')).toBe('t__hall');
    await dawn(t);
    expect(t.where('t__men')).toBe('t__mouth');
    await t.perform('go(t__out,t__mouth)');
    expect(JSON.stringify(t.leaf)).toContain('The dead are walking.');
  });
});
