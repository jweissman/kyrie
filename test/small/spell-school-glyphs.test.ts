import { describe, expect, it } from 'bun:test';
import { SpellSchools } from '../../src/presentation/spell-schools';
import { Emblems } from '../../src/presentation/emblems';
import { BookPresentationForPlayer } from '../../src/presentation/book-presentation';
import { ChoiceList } from '../../src/ui/choice-list';
import { AbilityRows } from '../../src/ui/ability-rows';
import { EncyclopediaHtml } from '../../src/handbook/encyclopedia-html';
import { HandbookHtml } from '../../src/handbook/render-html';
import type { CombatScreen } from '../../src/ui/screen-types';
import { Creation } from '../../web/engine/creation';
import { CreationFlow } from '../../src/creation/creation-flow';
import type { Setting } from '../../src/creation/protocol';

// The schools' and domains' emblems drawn wherever a spell or a school is shown (the owner, 18 November, OR-92: "we
// have glyphs/icons for the spell schools and we don't surface those in the menu or in the display area"): a spell by
// the emblem of the way that teaches it, in a fight's spells, the scene's casting and preparing, the company's book and
// the Encyclopedia; creation's school step by each school's; and the school's entry its first spells, each with the
// emblem of what it is for and a line of what it does (OWN-15's strip, lost with the cards page).
const names = { human: { she: ['Wenna'], he: ['Odo'], they: ['Wren'] } };
const setting: Setting = { title: 'Marshfen', generated: true, pitch: { heading: '', text: '' }, names,
  party: [Creation.protagonist('human', 'glyphs', names)] };

describe('the schools\' emblems', () => {
  it('names a spell by its school, or a prayer by its domain', () => {
    expect(['firebolt', 'ward', 'bless', 'siphon_life'].map(id => SpellSchools.emblem(id)))
      .toEqual(['evoker', 'abjurer', 'vitalist', 'necromancer']);
    expect(SpellSchools.emblem('melee')).toBeUndefined();
    // What is prepared, not what it is prepared in place of.
    expect(SpellSchools.among(['mage', 'circle_1', 'ward', 'firebolt'])).toBe('evoker');
  });

  it('marks the scene\'s spell acts, a fight\'s spells and the company\'s book', () => {
    const act = ChoiceList.choice({ key: 'k', label: 'Firebolt', command: 'prepare_spell(m,firebolt,ward,circle_1)',
      targets: ['m', 'circle_1', 'ward', 'firebolt'] }, 'prepare', 'spell');
    expect(act.emblem).toBe('evoker');
    expect(ChoiceList.choice({ key: 'k', label: 'Wait', command: 'wait' }, 'p', 'way').emblem).toBeUndefined();
    const fight = { ours: true, outcome: null, foes: [], allies: [], actorName: 'Ivo', abilities: [
      { id: 'firebolt', name: 'Firebolt', text: '', cost: 0, price: '', cooldown: 0, scope: 'enemy',
        spell: { level: 0, ready: 0 }, targets: [] }] } as unknown as CombatScreen;
    const spells = ChoiceList.combat(fight).find(s => s.id === 'spells')!;
    expect(spells.choices[0]!.emblem).toBe('evoker');
    expect(AbilityRows.of({ abilities: ['bless'], level: 1 })[0]!.emblem).toBe('vitalist');
  });

  it('draws a spell\'s school in the Encyclopedia, in ink', () => {
    const book = { chapters: [], where: () => new Map() } as never;
    const html = new EncyclopediaHtml(book, BookPresentationForPlayer.value).chapter({ id: 'magic', title: 'Magic', lede: [],
      sections: [{ id: 's', title: 'Cantrips', entries: [{ id: 'ability:firebolt', title: 'Firebolt' }] }] } as never);
    expect(html).toContain(Emblems.svg('evoker'));
  });

  it('uses the supplied book presentation rather than a global one', () => {
    const book = { chapters: [], where: () => new Map() } as never;
    const presentation = { game: 'Another & Game', emblem: (id: string) => `<i>${id}</i>` };
    const html = new EncyclopediaHtml(book, presentation).chapter({ id: 'magic', title: 'Magic', lede: [],
      sections: [{ id: 's', title: 'Cantrips', entries: [{ id: 'ability:firebolt', title: 'Firebolt' }] }] } as never);
    expect(html).toContain('Another &amp; Game');
    expect(html).toContain('<i>ability:firebolt</i>');
    expect(new HandbookHtml(new Map(), [], presentation).page('Book', '', 'index')).toContain('Another &amp; Game');
  });

  it('draws each school beside its name, and lists the spells it sets out knowing', () => {
    const flow = new CreationFlow(setting, Creation.catalog());
    for (const [id, v] of [['you', 'human'], ['sign', 'sign_ship'], ['calling', 'mage']]) {
      flow.choose(id as never, v!);
    }
    const school = flow.steps().find(x => x.id === 'specialty')!;
    expect(school.emblems).toBe(true);
    expect(school.cards.every(c => c.emblem === c.id && Emblems.has(c.id) || c.id === 'generalist')).toBe(true);
    const evoker = school.cards.find(c => c.id === 'evoker')!.entry!;
    const [atWill, first] = evoker.groups!;
    expect(atWill!.rows.map(r => r.name)).toEqual(['Frostbite', 'Ray of Frost', 'Scald']);
    expect(first!.rows.length).toBe(3);
    expect([...atWill!.rows, ...first!.rows].every(r => r.line && r.emblem && Emblems.has(r.emblem))).toBe(true);
    expect(evoker.after).toMatch(/^Every mage knows Light too\. Later: /);
  });
});
