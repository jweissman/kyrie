import { describe, expect, it } from 'bun:test';
import { Creation } from '../../web/engine/creation';
import { CreationFlow, type CreationStep } from '../../web/engine/creation-flow';
import type { Setting } from '../../web/engine/protocol';

// What creation sets beside a choice says what it is in play, from the catalog (OR-99, the owner, 18 November: "most
// of the instruments next to the menu in character creation seem impoverished"): a people's qualities as a stat line
// and its gifts by birth, each by what it does; a calling's hit die, armour and first abilities by name and line,
// never "Begins knowing Defend." ten times over; a gift's rule and its sign; a trade's qualities, coin and skills.
const names = { human: { she: ['Wenna'], he: ['Odo'], they: ['Wren'] }, elf: { she: ['Ithil'], he: ['Lorin'],
  they: ['Aerin'] } };
const setting: Setting = { title: 'Marshfen', generated: true, pitch: { heading: '', text: '' }, names,
  party: [Creation.protagonist('human', 'flow', names)] };
const card = (steps: CreationStep[], step: string, id?: string) => {
  const s = steps.find(x => x.id === step)!;
  return s.cards.find(c => c.id === (id ?? s.chosen))!.entry!;
};

describe('the entry beside a choice', () => {
  it('says a people by its qualities and its gifts by birth', () => {
    const flow = new CreationFlow(setting, Creation.catalog()), elf = card(flow.steps(), 'you', 'elf');
    expect(elf.play).toBe('Str −1 · Dex +2 · Con −1 · Int +1 · Wis +2 · Cha +1');
    expect(card(flow.steps(), 'you', 'human').play).toBe('+1 to every quality');
    expect(elf.groups![0]!.heading).toBe('Born with');
    expect(elf.groups![0]!.rows).toContainEqual({ id: 'perceptive', name: 'Keen Senses', line: '+4 to searching' });
    expect(elf.facts.map(([k]) => k)).not.toContain('Names');
  });

  it('says a calling by its hit die and armour, and what it knows from the start by what each does', () => {
    const flow = new CreationFlow(setting, Creation.catalog());
    const warrior = card(flow.steps(), 'calling', 'warrior'), mage = card(flow.steps(), 'calling', 'mage');
    expect(warrior.play).toBe('d12 hit die · any armour');
    expect(mage.play).toBe('d4 hit die · no armour · casts by Intelligence');
    expect(warrior.rules.join(' ')).not.toMatch(/Begins knowing/);
    const knows = warrior.groups!.find(g => g.heading === 'Begins knowing')!.rows;
    expect(knows.find(r => r.id === 'guard')!.line).toBe('Stand in front of a companion');
    expect(knows.every(r => r.line.length > 0)).toBe(true);
    expect(mage.groups![0]!.rows[0]).toMatchObject({ name: 'Light', emblem: 'light' });
    expect(warrior.after).toMatch(/^And Defend, as every calling\. Later, by level: Dig In \(3\)/);
  });

  it('says a sign\'s gifts by their rules, and a trade by what it adds, its coin and its skills', () => {
    const flow = new CreationFlow(setting, Creation.catalog());
    flow.choose('sign', 'sign_bear');
    // Both gifts are the sign's (OR-117: given with it, no step of their own), said on its entry by their rules.
    expect(card(flow.steps(), 'sign', 'sign_bear').facts).toContainEqual(['Gifts', 'Unturned and Hard to fell']);
    expect(card(flow.steps(), 'sign', 'sign_bear').rules).toContain('Hard to fell: +2 against death.');
    flow.choose('calling', 'warrior');
    flow.choose('before', 'arms');
    const trade = card(flow.steps(), 'trade', 'champion');
    expect(trade.play).toBe('Str +3 · Dex +2 · Con +3 · Wis +1 · Cha +2 · 50 gold');
    expect(trade.facts).toEqual([['Brings', 'Brawn, Intimidation'], ['For', 'Warrior only']]);
  });
});
