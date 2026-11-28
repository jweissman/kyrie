import { describe, expect, it } from 'bun:test';
import { DeepTime } from '../../../src/world/deep/deep-time';
import { DeepCarried } from '../../../src/world/deep/deep-carried';
import type { DeepLayout, DeepRoom } from '../../../src/world/deep/deep-layout';
import type { DeepContent } from '../../../src/world/deep/deep-pacing';
import type { DeepPurpose } from '../../../src/world/deep/deep-purposes';
import { Tiny } from '../../support/tiny';

// The deep renewed (OR-1622): a level emptied is not emptied for good. Bands wait beyond the workings one after
// another; the first moves into a room the company emptied, the first dawn after it is gone off the level, and once
// it is killed the next comes, a rank stronger, into the room where it fell. Each brings what such dwellers carry,
// rolled on Deem's `carried` template by their kind and the level (DeepCarried), set down where they fall: a return
// finds danger and reward both.
const room = (id: string): DeepRoom => ({ id, level: 0, role: id, x: 0, y: 0, name: id, scene: '', lit: true });
const top = [room('mouth'), room('hall')];
const layout: DeepLayout = { site: 'pit', levels: [{ id: 'pit_top', index: 0, name: 'the top', flooded: false,
  rooms: top }], links: [{ id: 'mouth_hall', a: 'mouth', b: 'hall', kind: 'tunnel', name: 'the passage', minutes: 2 }] };
const rats = { species: 'rat', count: 1, label: 'the rats', role: 'rats', temperament: 'wary' };
const robbers = { ancestry: 'human', calling: 'thief', count: 1, label: 'the robbers', role: 'robbers',
  temperament: 'wary' };
const content = [{ room: top[1]!, guide: 'mob', dwellers: { id: 'rats', level: 1, group: rats } }] as DeepContent[];
const purpose = { dwellers: [{ depth: 0, groups: [rats, robbers] }] } as unknown as DeepPurpose;
const kyr = [`  Place mouth "the mouth" is room at 0, 0.`, `  Place hall "the hall" is room at 1, 0.`,
  `  Place outside "outside" is room at 0, 5.`, `  Relation deepLevelOf(place, place).`,
  ...['mouth', 'hall'].map(r => `  Initially Assert deepLevelOf(${r}, pit_top).`),
  `  Place pit_top "the top" is room at 5, 5.`,
  `  Passage out "the way in" is tunnel between outside and mouth taking 1 minute.`,
  `  Passage mouth_hall "the passage" is tunnel between mouth and hall taking 2 minutes.`,
  `  Company party "You" of 1 at hall.`,
  `  Person rats "the rats" at hall { Role "rats". Species rat. Level 1. Temperament wary. }`,
  ...DeepTime.lines(purpose, layout, content, 'renewed')].join('\n');
const party = [{ name: 'Aud', raceId: 'human', classId: 'warrior', level: 8 }];
const dawn = async (t: Tiny) => {
  const day = t.world.number({ kind: 'call', name: 'day', args: ['clock'] });
  for (let i = 0; i < 30 && t.world.number({ kind: 'call', name: 'day', args: ['clock'] }) === day; i++) {
    await t.perform('wait_hour');
  }
  for (let i = 0; i < 8; i++) { await t.perform('wait_hour'); }
};
const away = async (t: Tiny) => {
  for (const step of ['go(t__mouth_hall,t__mouth)', 'go(t__out,t__outside)']) { await t.perform(step); }
  await dawn(t);
  for (const step of ['go(t__out,t__mouth)', 'go(t__mouth_hall,t__hall)']) { await t.perform(step); }
};
const lying = (t: Tiny, where: string) => t.world.related('at').filter(r => r.args[1] === where
  && /_carried\d+$|_coins$/.test(r.args[0]!)).map(r => r.args[0]!);
describe('World › The deep renewed', () => {
  it('rolls what newcomers carry on Deem by their kind and depth, more deeper', () => {
    const at = (kind: string, depth: number) => [0, 1, 2, 3, 4, 5, 6, 7].map(n => DeepCarried.roll(`k${n}`, kind, depth));
    // Robbers and their like carry a purse and a thing or two; beasts carry little coin and seldom anything.
    expect(at('humanoid', 0).every(r => r.things >= 1 && r.coin > 0)).toBe(true);
    expect(at('beast', 0).reduce((n, r) => n + r.things, 0)).toBeLessThan(at('humanoid', 0).reduce((n, r) => n + r.things, 0));
    // Deeper, a better tier and more coin.
    expect(at('humanoid', 0).every(r => ['negligible', 'minor'].includes(r.tier))).toBe(true);
    expect(at('humanoid', 3).every(r => ['major', 'grand'].includes(r.tier))).toBe(true);
    expect(at('humanoid', 2).reduce((n, r) => n + r.coin, 0)).toBeGreaterThan(at('humanoid', 0).reduce((n, r) => n + r.coin, 0));
  });
  it('sends one band after another into the room emptied, each leaving what it carried where it fell', async () => {
    const t = await Tiny.start(kyr, { seed: 'r0', party });
    await t.perform('attack(t__rats)');
    expect(t.world.test({ kind: 'call', name: 'dead', args: ['t__rats'] })).toBe(true);
    // Off the level a night: the robbers, the depth's other kind, have moved in, their things still with them beyond.
    await away(t);
    expect(t.where('t__pit_top_newcomers')).toBe('t__hall');
    const carried = lying(t, 't__pit_top_beyond').filter(x => x.startsWith('t__pit_top_newcomers_'));
    expect(carried.length).toBeGreaterThan(0);
    expect(lying(t, 't__hall')).toEqual([]);
    // Beaten, what they brought down is set down where they fell, to be taken.
    await t.perform('attack(t__pit_top_newcomers)');
    expect(t.world.test({ kind: 'call', name: 'dead', args: ['t__pit_top_newcomers'] })).toBe(true);
    expect(lying(t, 't__hall').sort()).toEqual(carried.sort());
    expect(t.leaf.situation.join(' ') + JSON.stringify(t.leaf)).toContain(DeepCarried.said);
    // Another night away: the next band, a rank stronger, has come into the room where the last fell.
    expect(t.where('t__pit_top_newcomers2')).toBe('t__pit_top_beyond');
    await away(t);
    expect(t.where('t__pit_top_newcomers2')).toBe('t__hall');
    expect(t.where('t__pit_top_newcomers3')).toBe('t__pit_top_beyond');
  });
});
