import { describe, expect, it } from 'bun:test';
import { SceneBudget, type BudgetLine } from '../src/presentation/scene-budget';

// The scene's telling held to three sentences at a glance (Mission 21's aesthetic investigation, proposal.md), with
// what changed and what an aim bears on always told, and nothing cut mid-sentence. The camp at Millholm as a1 tells it
// on arrival (the baseline capture, 12 November: 357 words in 18 sentences before its acts).
const camp: BudgetLine[] = [
  { kind: 'lead', text: 'Millholm is half houses and half wagons with their wheels taken off, painted saffron and rose and a deep blue. Cook-smoke drifts between them, smelling of cumin and charred onion. Beyond the roofs lies the Mistmere. The town herd has been driven twice this month from the verge of the old road by the Hall’s keeper, and the swineherd has opinions about it that he is happy to share with anyone who will stand still.' },
  { kind: 'standing', text: 'A notice is nailed to the clerk’s trestle by the well, under the shire-reeve’s mark: THE TALLY OF IRON AND GOLD IS TO BE MADE UP BY MIDWINTER. FOR THE WEIGHT OF IRON AND GOLD WANTING, SEE THE CLERK.' },
  { kind: 'standing', text: 'A plank door in the wall, barred on the outside: the lord’s lockup.' },
  { kind: 'life', text: 'Your brother is sitting on a rail with your father’s old spear across his knees. The grey dog barks twice, for form’s sake, then comes to see who you are.' },
];

describe('a scene told within its budget', () => {
  it('tells three sentences of a crowded place: what it is, its life now, and its own next words', () => {
    const b = SceneBudget.compose(camp);
    expect(b.counted).toBe(3);
    expect(b.told.map(t => t.kind)).toEqual(['lead', 'life']);
    expect(b.told[0]!.text).toBe('Millholm is half houses and half wagons with their wheels taken off, painted saffron and rose and a deep blue. Cook-smoke drifts between them, smelling of cumin and charred onion.');
    expect(b.told[1]!.text).toBe('Your brother is sitting on a rail with your father’s old spear across his knees.');
  });
  it('holds the rest whole, in the place’s order, for a deliberate look', () => {
    const b = SceneBudget.compose(camp);
    expect(b.held[0]).toStartWith('Beyond the roofs lies the Mistmere.');
    expect(b.held).toContain('A plank door in the wall, barred on the outside: the lord’s lockup.');
    const told = b.told.map(t => t.text).join(' '), all = camp.map(l => l.text).join(' ');
    expect(SceneBudget.count(told) + b.held.reduce((n, h) => n + SceneBudget.count(h), 0)).toBe(SceneBudget.count(all));
  });
  it('always tells what changed and what an aim bears on, beyond the budget', () => {
    const b = SceneBudget.compose([...camp, { kind: 'changed', text: 'The lockup door stands open now.' },
      { kind: 'bearing', text: 'Hobnail prints run from the well toward the corn-store. Someone heavy went that way.' }]);
    expect(b.counted).toBe(3);
    expect(b.always).toBe(3);
    expect(b.told.map(t => t.kind)).toEqual(['lead', 'life', 'changed', 'bearing']);
    expect(b.held.join(' ')).not.toContain('Hobnail');
  });
  it('tells a short place whole', () => {
    const cellar: BudgetLine[] = [{ kind: 'lead', text: 'A low brick cellar under the corn-store, damp to the touch, with spilled grain trodden black on the floor and the droppings of something bigger than mice.' }];
    const b = SceneBudget.compose(cellar);
    expect(b.held).toEqual([]);
    expect(b.told[0]!.text).toBe(cellar[0]!.text);
  });
  it('fills from the place’s further words when nothing is about', () => {
    const b = SceneBudget.compose(camp.filter(l => l.kind !== 'life'));
    expect(b.counted).toBe(3);
    expect(b.told.map(t => t.kind)).toEqual(['lead']);
  });
  it('does not split a title from its name', () => {
    const b = SceneBudget.compose([{ kind: 'lead', text: 'Mr. Pumphrey keeps the toll. He is asleep. The bar is down. A dog watches.' }], 2);
    expect(b.told[0]!.text).toBe('Mr. Pumphrey keeps the toll. He is asleep.');
  });
  it('tells a clue whole by what it is, never by its words, and counts it against the three', () => {
    const b = SceneBudget.typed([{ parts: [{ text: 'A quay of grey stone runs out into the water. Gulls sit along it in a row.', aspect: 'fixture', teaches: 'why' },
      { text: 'The bell is gone from its frame over the well. Hobs, people say.', teaches: 'bell_taken' }] }],
    ['Gamel is soldering a kettle.'], []);
    expect(b.told.map(t => t.text)).toEqual(['A quay of grey stone runs out into the water. The bell is gone from its frame over the well. Hobs, people say.']);
    expect(b.held).toEqual(['Gulls sit along it in a row.', 'Gamel is soldering a kettle.']);
  });
  it('keeps a fixture that teaches (a place’s history) to the budget, as standing', () => {
    expect(SceneBudget.bears({ aspect: 'fixture', teaches: 'why' })).toBe(false);
    expect(SceneBudget.bears({ aspect: 'sign' })).toBe(true);
    expect(SceneBudget.bears({ teaches: 'found' })).toBe(true);
  });
  it('gives way to what came of coming here, never below the place’s first sentence', () => {
    const b = SceneBudget.typed([{ parts: [{ text: 'A low cellar. Damp. Grain on the floor.' }] }], ['A rat watches.'], [],
      [{ text: 'You light a torch. It catches. The dark draws back.', kind: 'telling' }]);
    expect(b.told.map(t => t.text)).toEqual(['A low cellar.']);
  });
  it('tells what came of coming here before the place\u2019s further words, holding what the three leave', () => {
    const b = SceneBudget.typed([{ parts: [{ text: 'Millholm is half houses and half wagons. Cook-smoke drifts between them.' }] }],
      ['Wellby is mending a pot.'], [], [{ text: 'Your brother is on a rail. He is taller by a head.', kind: 'telling' },
        { text: 'The grey dog barks twice, then comes to see who you are.', kind: 'event' }]);
    expect(b.told.map(t => t.text)).toEqual(['Millholm is half houses and half wagons.']);
    expect(b.unsaid).toEqual(['The grey dog barks twice, then comes to see who you are.']);
    expect(b.held).toContain('The grey dog barks twice, then comes to see who you are.');
  });
});
