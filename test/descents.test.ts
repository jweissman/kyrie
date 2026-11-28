import { describe, expect, it } from 'bun:test';
import { Tiny } from './support/tiny';
import { DeepMechanisms } from '../src/world/deep/deep-mechanisms';
import type { DeepLayout, DeepLink } from '../src/world/deep/deep-layout';
import type { MechanismWords } from '../src/world/deep/deep-purposes';

// The way down a company has made sure, gone in one act (Descents; the cold-play review's Wave 2): a deep site's
// winding-gear set working secures the foot of its way (secured, data/rules/passages.kyr), and from above ground the
// company may go down to it as a journey, leg by leg, each the ordinary way, its every room one it has been in; it
// stops where anything on the way asks for the player, and is not offered once the gear is seized again. From the
// place made sure, the way out is the same way up (OR-1862). A fragment: a green, a field, a mound, and three rooms
// under it, with the barrow's counterweight between the last two.
const winch: NonNullable<MechanismWords['winch']> = { kind: 'stair', thing: "the portal stone's counterweight",
  seized: 'The counterweight hangs jammed in its slot.', turning: 'The counterweight runs free in its slot.',
  free: 'Lever the jammed counterweight free', shut: 'A portal stone stands down across the stair.',
  climb: 'the gap over the portal stone' };
const stair: DeepLink = { id: 'back__foot', a: 'back', b: 'foot', kind: 'stair', name: 'the stair behind the portal stone',
  minutes: 3, mechanism: 'winch', between: true };
const layout: DeepLayout = { site: 'pit', levels: [], links: [stair] };
// The gear as the deep sites write it (DeepMechanisms), its jammed state named apart from the shared rules' seized.
const gear = DeepMechanisms.lines(layout, { fate: '', oldup: '' }, { winch }).map(l => l.replace(/\bseized\b/g, 'jammed'));
const kyr = ['Place nm "Newmeet" is settlement at 0, 0.',
  'Place green "the market-place" is room within nm at 1, 1 outdoors.',
  'Place field "the long field" is room within nm at 1, 2 outdoors.',
  'Place mound "the mound" is room within nm at 1, 3 outdoors.',
  'Place mouth "the forecourt" is room within nm at 1, 4 underground.',
  'Place back "the back-stone" is room within nm at 1, 5 underground.',
  'Place foot "the foot of the stair" is room within nm at 1, 6 underground.',
  'Place den "a den" is room within nm at 4, 4 underground.',
  'Passage path "the field path" is path between green and field taking 15 minutes.',
  'Passage up "the slope" is path between field and mound taking 20 minutes.',
  'Passage in "the way in" is tunnel between mound and mouth taking 2 minutes.',
  'Passage long "the long passage" is tunnel between mouth and back taking 6 minutes.',
  ...gear,
  'Company party "You" of 1 at green.',
  'Person rats "the rats" at den { Role "rats". Species rat. Level 1. Numbers 3. Temperament savage. }',
  'Goal false.'].join('\n');
const party = [{ name: 'Aud', raceId: 'human', classId: 'warrior' }];
const call = (name: string, ...args: string[]) => ({ kind: 'call' as const, name, args });
const down = 'travel:t__foot';
// The rows every client draws from (the screen's walks), the descent among them.
const descent = (t: Tiny) => (t.look().screen.around ?? []).find(d => d.descent);
// Walked down by hand, the gear freed, and walked back up to the green.
const secured = async () => {
  const t = await Tiny.start(kyr, { seed: 'd0', party, horizon: ['inhabitants', 'probing'] });
  await t.play('>t__back');
  expect(descent(t)).toBeUndefined();
  await t.play('Lever the jammed counterweight free', '>t__foot');
  await t.play('>t__green');
  return t;
};
const moveIn = (t: Tiny, to: string) => {
  const c = t.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
  c.commit(c.world.apply([{ kind: 'retract', call: call('at', 't__rats', 't__den') },
    { kind: 'assert', call: call('at', 't__rats', to) }]));
};
describe('the way down made sure', () => {
  it('is written by the deep sites where their gear secures the foot of a way', () => {
    expect(DeepMechanisms.lines(layout, { fate: '', oldup: '' }, { winch }))
      .toContain('  Initially Assert securedBy(back__foot_wheel, foot). Initially Assert secureWhen(back__foot_wheel, turning).');
  });
  it('is offered from above once the gear is set working, and named by the place and the way made sure', async () => {
    const t = await secured();
    expect(t.world.test(call('secured', 't__foot'))).toBe(true);
    const d = descent(t)!;
    expect(d.name).toBe('the foot of the stair');
    expect(d.legs.at(-1)!.way).toBe('the stair behind the portal stone');
    expect(d.legs.map(l => l.to)).toEqual(['the long field', 'the mound', 'the forecourt', 'the back-stone',
      'the foot of the stair']);
    expect(t.glance.offer!.primary.concat(t.glance.offer!.rest).find(o => o.command === down)?.label)
      .toBe('Down to the foot of the stair');
  });
  it('goes down in one act, by the same legs and the same time as walked one by one', async () => {
    const [a, b] = [await secured(), await secured()];
    await a.perform(down);
    await b.play('>t__foot');
    expect([a.where(), b.where()]).toEqual(['t__foot', 't__foot']);
    expect(a.campaign.readout.elapsed).toBe(b.campaign.readout.elapsed);
    const legs = (t: Tiny) => t.campaign.history.slice(-5).map(e => e.action.replace(/^go\(party,(\w+).*$/, '$1'));
    expect(legs(a)).toEqual(legs(b));
    expect(a.session.journeyed?.arrived).toBe(true);
  });
  it('stops where a band has come onto the way, and the rest is played as any way is', async () => {
    const t = await secured();
    moveIn(t, 't__back');
    await t.perform('wait');
    await t.perform(down);
    expect(t.where()).not.toBe('t__foot');
    expect(t.session.journeyed?.arrived).toBe(false);
    expect(t.session.journeyed?.stopped).toBeDefined();
  });
  it('stops where the way comes into the dark with no light burning', async () => {
    const t = await Tiny.start(`${kyr}\nInitially Assert unlit(mouth).`, { seed: 'd0', party, horizon: ['inhabitants', 'probing'] });
    await t.play('>t__back', 'Lever the jammed counterweight free', '>t__foot', '>t__green');
    await t.perform(down);
    expect(t.where()).toBe('t__mouth');
    expect(t.session.journeyed?.stopped).toBe('It is dark here, and no light burns');
  });
  it('is not offered once the gear is seized again, nor from under the ground', async () => {
    const t = await secured();
    const c = t.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply([{ kind: 'retract', call: call('state', 't__back__foot_wheel', 'turning') },
      { kind: 'assert', call: call('state', 't__back__foot_wheel', 't__jammed') }]));
    await t.perform('wait');
    expect(descent(t)).toBeUndefined();
    const u = await secured();
    await u.play('>t__mouth');
    expect(descent(u)).toBeUndefined();
  });
  it('makes the way out from the place made sure the same way up, and from nowhere else (OR-1862)', async () => {
    const t = await secured();
    await t.perform(down);
    expect(t.glance.compass?.out?.secured).toBe(true);
    await t.play('>t__back');
    expect(t.glance.compass?.out?.secured).toBeUndefined();
  });
});
