import { describe, expect, it } from 'bun:test';
import { DeepKnown } from '../../../src/world/deep/deep-known';
import type { DeepLayout, DeepRoom } from '../../../src/world/deep/deep-layout';
import { Journey } from '../../../src/session/journey';
import { Tiny } from '../../support/tiny';

// A deep level's ground, once known, crossed in one act while nothing on it has changed (OR-1448, the review's routine,
// OR-1395; DeepKnown): from where the company comes onto the level to where it goes down, taking as long as the rooms
// would. A band come in that does not let the company be, or a trap set on the way, shuts it, and says so.
const room = (id: string): DeepRoom => ({ id, level: 0, role: id, x: 0, y: 0, name: id, scene: '', lit: true });
const layout: DeepLayout = { site: 'pit', levels: [{ id: 'pit_top', index: 0, name: 'the top', flooded: false,
  rooms: [room('mouth'), room('hall'), room('foot')] }], links: [
  { id: 'mouth_hall', a: 'mouth', b: 'hall', kind: 'tunnel', name: 'the passage', minutes: 4 },
  { id: 'hall_foot', a: 'hall', b: 'foot', kind: 'tunnel', name: 'the passage', minutes: 6 },
  { id: 'foot_down', a: 'foot', b: 'below', kind: 'stair', name: 'the stair', minutes: 2, between: true }] };
const kyr = [`  Place mouth "the mouth" is room at 0, 0.`, `  Place hall "the hall" is room at 1, 0.`,
  `  Place foot "the stair's head" is room at 2, 0.`, `  Place lair "a lair" is room at 3, 3.`,
  `  Passage mouth_hall "the passage" is tunnel between mouth and hall taking 4 minutes.`,
  `  Passage hall_foot "the passage" is tunnel between hall and foot taking 6 minutes.`,
  `  Company party "You" of 1 at mouth.`,
  `  Person rats "the rats" at lair { Role "rats". Species rat. Level 1. Numbers 3. Temperament wary. }`,
  ...DeepKnown.lines(layout)].join('\n');
const party = [{ name: 'Aud', raceId: 'human', classId: 'warrior' }];
const through = (t: Tiny) => Journey.of(t.session).choices().find(c => c.command === 'go(t__pit_top_through,t__foot)');
const walked = async () => {
  const t = await Tiny.start(kyr, { seed: 'w0', party });
  expect(through(t)).toBeUndefined();
  await t.perform('go(t__mouth_hall,t__hall)');
  await t.perform('go(t__hall_foot,t__foot)');
  await t.perform('go(t__pit_top_through,t__mouth)');
  return t;
};
describe('World › Known ground crossed in one act', () => {
  it('is offered once every room on the way has been walked, and takes as long as they would', async () => {
    const t = await walked();
    expect(t.where()).toBe('t__mouth');
    expect(through(t)).toBeDefined();
    await t.perform('go(t__pit_top_through,t__foot)');
    expect(t.where()).toBe('t__foot');
    expect(kyr).toContain('is tunnel between mouth and foot taking 10 minutes');
  });
  it('is shut, and says so, once a band that does not let the company be has come onto the way', async () => {
    const t = await walked();
    const c = t.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply([{ kind: 'retract', call: { kind: 'call', name: 'at', args: ['t__rats', 't__lair'] } },
      { kind: 'assert', call: { kind: 'call', name: 'at', args: ['t__rats', 't__hall'] } }]));
    await t.perform('wait');
    expect(through(t)).toBeUndefined();
    expect(JSON.stringify(t.leaf)).toContain(DeepKnown.said.shut);
  });
});
