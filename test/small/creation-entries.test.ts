import { ItemCatalog } from '../../src/item-catalog';
import { describe, expect, it } from 'bun:test';
import { Creation } from '../../web/engine/creation';
import { CreationFlow, type CreationStep } from '../../src/creation/creation-flow';
import type { Setting } from '../../src/creation/protocol';
import { Content } from '../../src/content';

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
    expect(trade.play).toBe('Str +3 · Dex +2 · Con +3 · Wis +1 · Cha +2 · 5 coin');
    expect(trade.facts).toEqual([['Brings', 'Brawn, Intimidation'], ['For', 'Warrior only']]);
  });

  // Creation's lists promised what was not there (OR-256, the first blind cold play's P19-28): Commoner among the
  // birdfolk's callings, and none offered; a thief's Deactivate Device "(not playable)"; a cleric listing no prayer.
  it('promises only what a life can be and do', () => {
    const catalog = Creation.catalog();
    for (const a of catalog.ancestries) {
      const flow = new CreationFlow({ ...setting, names: { ...names, [a.id]: names.human } }, catalog);
      const said = card(flow.steps(), 'you', a.id).facts.find(([k]) => k === 'Callings')?.[1].split(', ') ?? [];
      const offered = a.callings.map(c => catalog.callings.find(x => x.id === c)!.name);
      expect([a.id, said.sort()]).toEqual([a.id, offered.sort()]);
      flow.choose('you', a.id);
      for (const c of a.callings) {
        const entry = card(flow.steps(), 'calling', c), rows = (entry.groups ?? []).flatMap(g => g.rows);
        expect([c, rows.filter(r => /not playable/.test(r.name)).map(r => r.name)]).toEqual([c, []]);
        if (catalog.callings.find(x => x.id === c)!.casts && !rows.some(r => r.emblem)) {
          expect([c, entry.after]).toEqual([c, expect.stringMatching(/first (prayers|spells)[^.]*chosen next/)]);
        }
      }
    }
    const flow = new CreationFlow(setting, Creation.catalog());
    expect(card(flow.steps(), 'calling', 'cleric').after).toContain('Its first prayers are its god\'s, chosen next.');
  });

  // The purse at setting out (OR-257, the first blind cold play's P56) had 13 coin, where creation had said the bard's
  // "Gold 25" and the inquisitor's "70 gold": the calling's gold is given to no one, and a trade's is paid as coin.
  it('says only the coin a life is given, as the purse counts it', () => {
    const catalog = Creation.catalog(), flow = new CreationFlow(setting, catalog);
    for (const c of catalog.callings) {
      expect([c.id, card(flow.steps(), 'calling', c.id).facts.map(([k]) => k)]).not.toContainEqual([c.id,
        expect.arrayContaining(['Gold'])]);
    }
    for (const b of catalog.backgrounds) {
      const made = new Content(`purse-${b.id}`).createCreature(ItemCatalog.canon, 'pc', { raceId: 'human', classId: b.calling ?? 'warrior',
        backgroundId: b.id });
      expect([b.id, made.state.gold]).toEqual([b.id, b.coin]);
    }
    const inquisitor = catalog.backgrounds.find(b => b.id === 'inquisitor')!;
    expect(inquisitor.coin).toBe(7);
  });
});
