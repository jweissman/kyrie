import { describe, expect, it } from 'bun:test';
import { Creation } from '../../web/engine/creation';
import { CreationFlow } from '../../src/creation/creation-flow';
import type { Setting } from '../../src/creation/protocol';

// What a life did before, and a caster's art, asked as the life knows them (the owner, 18 November): every kind of
// life on one page, each said by what it is with the encyclopedia's entry beside it (OR-88); then the trade within the
// kind chosen, asked in its own words ("What did you do on the water?"), and a mage's school or a cleric's domain
// asked as a question of the life (OR-90).
const names = { human: { she: ['Wenna'], he: ['Odo'], they: ['Wren'] } };
const setting: Setting = { title: 'Marshfen', generated: true, pitch: { heading: '', text: '' }, names,
  party: [Creation.protagonist('human', 'flow', names)] };
const step = (flow: CreationFlow, id: string) => flow.steps().find(x => x.id === id);
// Through the steps as a player goes, each chosen where it is asked.
const made = (...chosen: [string, string][]) => {
  const flow = new CreationFlow(setting, Creation.catalog());
  for (const [id, value] of chosen) { expect(flow.current()).toBe(id as never); flow.choose(id as never, value); }
  return flow;
};

describe('a life before, and a caster\'s art', () => {
  it('shows every kind of life at once, each with what it means', () => {
    const flow = new CreationFlow(setting, Creation.catalog());
    flow.choose('you', 'human');
    const before = step(flow, 'before')!, kinds = Creation.catalog().kinds;
    expect([before.all, before.present, before.cards.length]).toEqual([true, 'list', kinds.length]);
    expect(before.cards.every(c => c.say && /^A life/.test(c.say))).toBe(true);
    const water = before.cards.find(c => c.id === 'water')!;
    expect(water.entry!.facts.map(([k]) => k)).toEqual(['Brings', 'Carries', 'Knows', 'Trades']);
    expect(water.entry!.rules[0]).toMatch(/^Climbing: /);
  });

  // Who one is comes before what one did (the owner, 19 November: "you can be a male abbess"): how one presents is
  // asked second, so every trade is named for the one choosing it, in the one flow every client reads.
  it('asks how one presents before any trade, and names the trade for them', () => {
    expect(new CreationFlow(setting, Creation.catalog()).steps().map(x => x.id).slice(0, 2)).toEqual(['you', 'presenting']);
    for (const [who, word] of [['she', 'fisherwoman'], ['he', 'fisherman']] as const) {
      const flow = made(['you', 'human'], ['presenting', who], ['sign', 'sign_ship'], ['calling', 'warrior']);
      flow.choose('before', 'water');
      expect(step(flow, 'trade')!.cards.find(c => c.id === 'fisherman')?.name.toLowerCase()).toBe(word);
    }
  });
  it('asks the trade within the kind chosen, in its words, and the life says it', () => {
    const flow = made(['you', 'human'], ['presenting', 'he'], ['sign', 'sign_ship'], ['calling', 'warrior']);
    expect(step(flow, 'trade')).toBeUndefined();
    flow.choose('before', 'water');
    expect(flow.current()).toBe('trade');
    const trade = step(flow, 'trade')!, sailors = Creation.catalog().backgrounds.filter(b => b.kind === 'water');
    expect(trade.ask).toBe('What did you do on the water?');
    expect(trade.cards.every(c => sailors.some(b => b.id === c.id))).toBe(true);
    expect(trade.cards.map(c => c.id)).toContain(trade.chosen!);
    flow.choose('trade', 'fisherman');
    // The trade chosen, the perk is asked next, the last before the name (OR-153).
    expect([flow.member.backgroundId, flow.current()]).toEqual(['fisherman', 'perk']);
    expect(flow.life()).toContain('Once a fisherman.');
  });

  it('deals the trades of a large kind a hand at a time', () => {
    const flow = made(['you', 'human'], ['presenting', 'he'], ['sign', 'sign_ship'], ['calling', 'warrior'], ['before', 'trade']);
    const hand = () => step(flow, 'trade')!.cards.map(c => c.id), first = hand();
    expect([first.length <= CreationFlow.trades, step(flow, 'trade')!.roll]).toEqual([true, 'other trades']);
    flow.choose('roll', '');
    expect(hand().some(id => first.includes(id))).toBe(false);
  });

  it('asks a mage the art learnt and a cleric what their god keeps, each way with its entry', () => {
    const flow = made(['you', 'human'], ['presenting', 'he'], ['sign', 'sign_ship'], ['calling', 'mage']);
    expect(flow.current()).toBe('specialty');
    const school = step(flow, 'specialty')!;
    expect([school.ask, school.cards.length]).toEqual(['Which art did you learn?', 8]);
    expect(school.cards.find(c => c.id === 'evoker')!.entry!.groups!.map(g => g.heading)).toEqual(['At will', 'First level']);
    flow.choose('specialty', 'evoker');
    expect([flow.member.traits, flow.current(), flow.life()[0]]).toEqual([['evoker'], 'learn', 'A human evoker.']);
    flow.choose('back', ''); flow.choose('back', ''); flow.choose('calling', 'cleric');
    expect(step(flow, 'specialty')!.ask).toBe('What does your god keep?');
    flow.choose('calling', 'warrior');
    expect(step(flow, 'specialty')).toBeUndefined();
  });
});
// A row says what it does (the owner's playtest, 26 November, OR-1274: "Roll again" over a list in its order promised
// a draw it did not make): the names are drawn, so another hand is "Roll again"; the trades are the next of a list,
// best suited first, so another hand is "More…". The words are the engine's, every client alike.
describe('another hand of a step\'s options', () => {
  it('is a roll where the hand is drawn, and more where it is the list\'s next', () => {
    const flow = made(['you', 'human'], ['presenting', 'he'], ['sign', 'sign_ship'], ['calling', 'warrior']);
    flow.choose('before', 'stage');
    const trade = step(flow, 'trade')!;
    if (trade.roll) { expect(trade.again).toBe('More…'); }
    expect(step(flow, 'name')!.again).toBe('Roll again');
  });
});
// Who one is starts unmarked (the owner's playtest, 26 November, OR-1272): ancestry and how one presents are shown
// chosen only once the player has chosen them.
describe('who one is', () => {
  it('is shown unchosen until chosen', () => {
    const flow = new CreationFlow(setting, Creation.catalog());
    expect([step(flow, 'you')!.chosen, step(flow, 'presenting')!.chosen]).toEqual([undefined, undefined]);
    flow.choose('you', 'human');
    flow.choose('presenting', 'she');
    expect([step(flow, 'you')!.chosen, step(flow, 'presenting')!.chosen]).toEqual(['human', 'she']);
  });
});
