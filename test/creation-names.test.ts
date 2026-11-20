/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
import { describe, expect, it } from 'bun:test';
import { Creation } from '../web/engine/creation';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ProtagonistNames } from '../src/world/protagonist-names';
import { Outfitters } from '../src/world/outfitters';
import { EngineCreation } from '../web/engine/engine-creation';
import { CreationDefaults } from '../src/creation/creation-defaults';
import type { Member, Setting } from '../src/creation/protocol';
import folk from '../data/generation/scenes/folk.json';
import naming from '../data/generation/scenes/naming.json';

// The engine's making of a life (EngineCreation), for a country of two circumstances: coming home with a trade of
// one's own (the first, the one the making begins with) or over the hills with none.
class Making {
  static of(names: NonNullable<Setting['names']>, home = true): EngineCreation {
    const origins = [{ id: 'kin', title: 'Coming home', choice: 'Home.', background: 'herdsman' },
      { id: 'wanderer', title: 'Over the hills', choice: 'Over the hills.' }];
    const setting: Setting = { title: 'Thorn', pitch: { heading: '', text: '' }, generated: true,
      origins: home ? origins : origins.reverse(), names, party: [Creation.protagonist('human', 'thorn', names)] };
    const made = new EngineCreation();
    made.begun(setting, { campaign: 'world', seed: 'thorn' });
    return made;
  }
}
const given = folk.given as Record<string, Record<string, string[]>>;
const more = naming.more as Record<string, Record<string, string[]>>;
// Names for a test, each people's as a woman's, a man's and anyone's.
const few = (she: string[], he: string[], they: string[] = []) => ({ she, he, they: [...they, ...she, ...he] });

// A protagonist is named as their people name their own, drawn for the country (OWN-16: everyone had been Wenna, of
// whatever people), none a name someone of the country already has, and as they present (a woman, a man, neither:
// the owner, 2026-10-30); the names are offered as tables of up to six to roll on, a new people or a new way of
// presenting draws again while the name is not one the player wrote, and Set out never sets out nameless.
describe('a protagonist\'s name', () => {
  it('is drawn from their people\'s names as they present, none a townsperson\'s, the same for the same country',
    async () => {
      const world = await WorldAssembler.assemble('thorn', NodeBundleSource.shared, {});
      const names = ProtagonistNames.drawn(world.report.region, 'thorn'), taken = Outfitters.everyone(world.report.region);
      expect(Object.keys(names).sort()).toEqual(['birdfolk', 'catfolk', 'dwarf', 'elf', 'human']);
      for (const [people, lists] of Object.entries(names)) {
        const own = given[people]!;
        // Their people's names, its folk's first, then the deeper names of naming.json (PA-03: a dwarf in wren's dwarf
        // country had been offered one).
        const deeper = more[people]!, ours = (as: string) => [...own[as]!, ...deeper[as]!];
        const strange = (list: string[], as: string) => list.filter(n => !ours(as).includes(n));
        expect([strange(lists.she, 'she'), strange(lists.he, 'he')]).toEqual([[], []]);
        expect(lists.he.length).toBeGreaterThanOrEqual(20);
        // One who is neither is offered the names given to anyone first, then every other.
        const anyone = own.they!.filter(n => !taken.has(n)).length;
        expect(lists.they.slice(0, anyone).every(n => own.they!.includes(n))).toBe(true);
        expect(new Set(lists.they).size).toBe(lists.they.length);
        for (const list of Object.values(lists)) {
          expect(list.length).toBeGreaterThan(6);
          expect(list.filter(n => taken.has(n))).toEqual([]);
        }
      }
      expect(ProtagonistNames.drawn(world.report.region, 'thorn')).toEqual(names);
      const elf = Creation.protagonist('elf', 'thorn', names);
      expect(['she', 'he']).toContain(elf.pronouns!);
      expect(elf.name).toBe(names.elf![elf.pronouns!]![0]!);
      expect(Creation.protagonist('gnome', 'thorn', names).name).toBe(names.human![elf.pronouns!]![0]!);
    }, 60000);
  it('is drawn again for a new people or presentation until the player writes one', () => {
    const names = { human: few(['Hild', 'Maud'], ['Ralf', 'Odo'], ['Wren']), elf: few(['Birel'], ['Aelar']),
      dwarf: few(['Hulda'], ['Baern']) };
    const made = Making.of(names), name = () => made.state().member.name;
    made.choose('presenting', 'she');
    expect(name()).toBe('Hild');
    made.choose('presenting', 'he');
    expect([name(), made.state().member.pronouns]).toEqual(['Ralf', 'he']);
    made.choose('presenting', 'they');
    expect(name()).toBe('Wren');
    made.choose('you', 'elf');
    expect(name()).toBe('Birel');
    made.choose('presenting', 'he');
    expect(name()).toBe('Aelar');
    // Written, it is the player's: neither a new way of presenting nor a new people draws again (one taken from the
    // list is drawn again, as the list is: see the browser's naming test).
    made.choose('you', 'human');
    made.choose('name', 'Odo');
    made.choose('presenting', 'she');
    made.choose('you', 'dwarf');
    expect(name()).toBe('Odo');
    // Emptied, it is no name written: a new people's is drawn again (one letter typed had kept an elf's name on a man).
    made.choose('name', '');
    made.choose('you', 'elf');
    expect(name()).toBe('Birel');
    made.choose('you', 'human');
    expect(name()).toBe('Hild');
    // Written away to nothing, it sets out as the first of the people's names here for how they present.
    made.choose('name', ' {"} ');
    expect(made.starting().party.map(m => [m.name, m.pronouns])).toEqual([['Hild', 'she']]);
  });
  it('is offered as tables to roll on: no more than six names, each roll all new, in turn, the same each time', () => {
    const name = (n: number) => Array.from({ length: n }, (_, i) => `N${i}`), many = name(14);
    const setting = { names: { human: { she: many, he: ['Ralf', 'Odo'], they: name(40) }, elf: { she: name(10),
      he: name(8) } } } as unknown as Setting;
    const she: Member = { raceId: 'human', pronouns: 'she' }, he: Member = { ...she, pronouns: 'he' };
    const rolls = [0, 1, 2, 3].map(n => CreationDefaults.table(she, setting, n));
    expect(rolls).toEqual([many.slice(0, 5), many.slice(5, 10), many.slice(10), many.slice(0, 5)]);
    expect(CreationDefaults.table(she, setting, 1)).toEqual(rolls[1]!);
    // Ten are two tables of five and eight two of four (a window of six sliding round ten had offered an elf the same
    // names again at the second roll); forty are seven, of six or five, and every name is offered once in a round.
    const tables = (m: Member, n: number) => Array.from({ length: n }, (_, r) => CreationDefaults.table(m, setting, r));
    const elf: Member = { raceId: 'elf', pronouns: 'she' };
    expect([tables(elf, 2), tables({ ...elf, pronouns: 'he' }, 2)].map(t => t.map(r => r.length)))
      .toEqual([[5, 5], [4, 4]]);
    const round = tables({ ...she, pronouns: 'they' }, 7);
    expect([round.map(r => r.length), round.flat()]).toEqual([[6, 6, 6, 6, 6, 5, 5], name(40)]);
    // Fewer than a table's worth are all offered, and there is nothing to roll again for.
    expect([CreationDefaults.table(he, setting, 0), CreationDefaults.table(he, setting, 5)]).toEqual([['Ralf', 'Odo'],
      ['Ralf', 'Odo']]);
    expect(CreationDefaults.named({ ...he, name: '' }, setting)).toBe('Ralf');
  });
});

// What creation no longer asks stands in the open until changed (OWN-14): a calling's first way the people may take,
// with the spells its card shows given as chosen; and for one who brings only their trade, the calling's own.
describe('a protagonist as it stands until changed', () => {
  it('takes a way and its spells in the open, and the way the player chooses with its own spells', () => {
    const made = Making.of({ human: few(['Hild'], ['Ralf']), elf: few(['Birel'], ['Aelar']),
      dwarf: few(['Hulda'], ['Baern']) });
    const me = (): Member => made.state().member, ways = Creation.catalog().callings;
    made.choose('calling', 'warrior');
    expect(me().traits).toEqual(['toughness']);
    expect(me().spells).toBeUndefined();
    made.choose('calling', 'mage');
    expect([me().traits, me().spells]).toEqual([['abjurer'], ways.find(c => c.id === 'mage')!.specializations[0]!.picks]);
    made.choose('specialty', 'necromancer');
    const necromancer = ways.find(c => c.id === 'mage')!.specializations.find(t => t.id === 'necromancer')!;
    expect(me().spells).toEqual(necromancer.picks!);
    // An elf is no necromancer: the way goes back to the first an elf may take.
    made.choose('you', 'elf');
    expect([me().classId, me().traits]).toEqual(['mage', ['abjurer']]);
  });
  it('gives a calling its own trade until another is chosen, and keeps one chosen that any calling may have', () => {
    const made = Making.of({ human: few(['Hild'], ['Ralf']), elf: few(['Birel'], ['Aelar']),
      dwarf: few(['Hulda'], ['Baern']) }, false);
    const trade = () => made.state().member.backgroundId;
    made.choose('calling', 'warrior');
    expect(trade()).toBe('soldier');
    made.choose('calling', 'mage');
    expect(trade()).toBe('apprentice');
    made.choose('trade', 'scribe');
    made.choose('calling', 'bard');
    expect(trade()).toBe('scribe');
  });
});
