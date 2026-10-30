import { describe, expect, it } from 'bun:test';
import { Creation } from '../web/engine/creation';
import { Content } from '../src/content';
import { Canon } from '../src/canon/canon';
import { SpellSelection } from '../src/rules/spell-selection';
import { SpellKinds } from '../src/presentation/spell-kinds';
import { SpellLines } from '../src/presentation/spell-lines';
import { MechanicsText } from '../src/presentation/mechanics-text';
import { Glyphs } from '../web/reader/creation/glyphs';

// A school's or a god's spells are shown before it is chosen (OWN-15: a school had been its name and "First spells of
// abjuration"), and what is shown is what is had: the picks the page gives as chosen are legal by SpellSelection, and
// a protagonist made with them knows exactly the spells shown, no more and none fewer (an evoker had "picked" the
// Light its calling teaches, and set out a spell short). Each is drawn with the emblem of what it is for, and said in
// a line read from what it does: every die the line names is one the spell rolls (Magic Missile's inherited words had
// said 1d3 of a spell that rolls 1d4).
describe('the spells shown at creation', () => {
  const catalog = Creation.catalog();
  const ways = catalog.callings.flatMap(c => c.specializations.filter(t => t.spells)
    .map(t => [c.id, t.id, t] as const));
  it('are shown for every school and every god, and nothing for a warrior\'s or a monk\'s way', () => {
    expect(ways.map(([c]) => c).sort()).toEqual([...Array<string>(12).fill('cleric'), ...Array<string>(8).fill('mage')]);
    for (const c of catalog.callings.filter(k => k.id === 'warrior' || k.id === 'monk')) {
      expect(c.specializations.every(t => !t.spells && !t.picks)).toBe(true);
    }
  });
  it.each(ways)('are the spells a %s of %s is made with, given as chosen', (calling, id, way) => {
    const plan = SpellSelection.plan(Canon.traits[id]!);
    expect(() => SpellSelection.validate(plan, way.picks!, id)).not.toThrow();
    const made = new Content('first-spells').createCreature('p', { name: 'Ada', raceId: 'human', classId: calling,
      traits: [id], spells: way.picks });
    const known = made.base.abilities.filter(a => Canon.abilities[a]?.spell);
    expect(way.spells!.map(s => s.id).sort()).toEqual([...known].sort());
    expect(new Set(way.spells!.map(s => s.id)).size).toBe(way.spells!.length);
    for (const s of way.spells!) {
      expect([s.name, s.line, s.does].every(Boolean)).toBe(true);
      expect(`${s.line} ${s.does}`).not.toMatch(/floor|bonusSpellDC|#|undefined/);
      expect(SpellKinds.emblems).toContain(s.kind as typeof SpellKinds.emblems[number]);
      const effects = Content.abilities.find(a => a.id === s.id)!.effects
        .flatMap(e => e.kind === 'random' ? e.effects : [e]);
      const rolled = effects.flatMap(e => 'amount' in e && e.amount
        ? [MechanicsText.amount(e.amount, SpellLines.actor)] : []).join(' ').replace(/\s+/g, '');
      for (const die of `${s.line} ${s.does}`.match(/\d+d\d+/g) ?? []) {
        expect([s.id, rolled]).toEqual([s.id, expect.stringContaining(die)]);
      }
    }
  });
  it('names a god\'s domain by the domain, and its clerics\' title only behind Details', () => {
    const cleric = catalog.callings.find(c => c.id === 'cleric')!.specializations;
    const domains = cleric.map(t => Canon.traits[t.id]!.spellAccess!.domain!);
    expect(cleric.map(t => t.name)).toEqual(domains.map(d => d.charAt(0).toUpperCase() + d.slice(1)));
    expect(cleric.find(t => t.id === 'vitalist')).toMatchObject({ name: 'Life', title: 'Vitalist', who: 'cleric of Life' });
    const missile = SpellLines.of(Content.abilities.find(a => a.id === 'magic_missile')!);
    expect(missile).toBe('1d4 force to three foes at random');
  });
  it('gives a mage the Light its calling teaches, and never as one of its picks', () => {
    for (const t of catalog.callings.find(c => c.id === 'mage')!.specializations) {
      expect(t.spells!.filter(s => s.id === 'conjure_light').map(s => s.own)).toEqual([true]);
      expect(t.picks).not.toContain('conjure_light');
    }
    // An evoker's first-level picks are three of its own school's, though Light is of it too.
    const evoker = catalog.callings.find(c => c.id === 'mage')!.specializations.find(t => t.id === 'evoker')!;
    const first = evoker.spells!.filter(s => s.level === 1 && !s.own);
    expect([first.length, first.every(s => Canon.abilities[s.id]?.spell?.school === 'evocation')]).toEqual([3, true]);
  });
  it('draws each school, god and way, and each thing a spell is for, with an emblem of its own', () => {
    const emblems = [...catalog.callings.flatMap(c => c.specializations.map(t => t.id)), ...SpellKinds.emblems];
    expect(emblems.filter(id => !Glyphs.has(id))).toEqual([]);
  });
  // A wanderer's trade until chosen is one the calling may have.
  it('gives each calling a trade of its own for one who brings only their trade', () => {
    for (const c of catalog.callings) {
      const trade = catalog.backgrounds.find(b => b.id === c.trade);
      expect([c.id, !!trade && (!trade.calling || trade.calling === c.id)]).toEqual([c.id, true]);
    }
  });
});
