import { describe, expect, it } from 'bun:test';
import { Battle } from '../../src/arena';
import { Canon } from '../../src/canon/canon';
import { Content } from '../../src/content';
import { FoeIntents } from '../../src/foe-intents';
import { ItemCatalog } from '../../src/item-catalog';
import type { Fighter } from '../../src/model';
import { Telegraph } from '../../src/telegraph';

// What a foe means to do looks like what it is (Telegraph, data/catalog/telegraphs.json): wolves circle to flank, an
// archer draws, a caster's hands kindle. Only the she-bear's maul had said so (its windup); every other intent read
// "is going for Wenna with its bite" or "means to use sleep on Wenna".
const repertoire = new Map(Content.abilities.map(a => [a.id, a]));
const called = (f: { id: string; name: string }) => f.id === 'w' ? 'Wenna' : `the ${f.name.toLowerCase()}`;
const hero = () => new Content('w').character('warrior', 'w', 'fighters', 'human');
const held = (f: Fighter) => [...new Set(['melee', ...f.abilities, ...f.innate ?? [], ...(f.prepared ?? []).flat()])]
  .filter(id => repertoire.has(id));
const classes = ['warrior', 'mage', 'thief', 'cleric', 'bard', 'ranger', 'monk', 'commoner'] as const;
const foes = (): Fighter[] => [
  ...Canon.catalogued.filter(id => Canon.isSpecies(id)).flatMap(kind => [1, 5].map(level =>
    new Content(`${kind}${level}`).creature(kind, `${kind}${level}`, 'goblins', level))),
  ...classes.flatMap(k => (['human', 'goblin', 'elf', 'dwarf'] as const)
    .filter(r => Canon.ancestries[r]?.classes.includes(k))
    .map(r => new Content(`${r}-${k}`).character(k, `${r}-${k}`, 'goblins', r)))];
const intents = (kinds: string[]) => {
  const against = kinds.map((kind, i) => new Content(`f${i}`).creature(kind, `f${i}`, 'goblins', 1));
  const said = new Set<string>();
  for (let seed = 0; seed < 8; seed++) {
    const battle = new Battle({ id: 'bout', combatants: [hero(), ...structuredClone(against)],
      abilities: Content.abilities }, `telegraph-${kinds.join('-')}-${seed}`);
    for (let i = 0; i < 10 && !battle.state.outcome; i++) {
      if (battle.state.actor === 'w') {
        for (const l of FoeIntents.lines(battle, new Map([['w', 'Wenna'], ['f0', 'the first'], ['f1', 'the second']]))) {
          said.add(l);
        }
      }
      battle.step(battle.chosen());
    }
  }
  return [...said].join(' ');
};

describe('telegraphs', () => {
  it('give every foe of the catalog, and every calling, a line of its own for whatever it can mean to do', () => {
    const generic: string[] = [];
    for (const foe of foes()) {
      for (const id of held(foe)) {
        const target = repertoire.get(id)!.effects.every(e => e.target === 'self') ? foe : hero();
        const { line, source } = Telegraph.of(foe, repertoire.get(id)!, target, called);
        if (source === 'generic') { generic.push(`${foe.raceId}/${id}: ${line}`); }
        expect(line).not.toMatch(/\{|\}|undefined/);
      }
    }
    expect(generic).toEqual([]);
  });
  it('circle to flank, as wolves do, when a pack goes for one of the company', () => {
    expect(intents(['wolf', 'wolf'])).toMatch(/The first and the second circle Wenna, teeth bared/);
  });
  it("draw on the company with a bow, and kindle in a caster's hands", () => {
    const archer = new Content('a').character('ranger', 'a', 'goblins', 'human');
    archer.equipment = { ...archer.equipment, weapon: ItemCatalog.canon.weapon('longbow') };
    expect(Telegraph.of(archer, repertoire.get('ranged')!, hero(), called).line)
      .toMatch(/^The .* nocks an arrow and draws on Wenna\.$/);
    const mage = new Content('m').character('mage', 'm', 'goblins', 'human');
    expect(Telegraph.of(mage, repertoire.get('burning_hands')!, hero(), called).line)
      .toMatch(/^The .*'s hands kindle with fire: burning hands at Wenna\.$/);
  });
  it('wind a blow up as the body does: a bear rears, a titan raises its fists', () => {
    const maul = repertoire.get('maul')!;
    expect(Telegraph.gesture({ raceId: 'bear' }, maul)).toBe('rears up on its hind legs');
    expect(Telegraph.gesture({ raceId: 'titan' }, maul)).toBe('raises both fists high');
    expect(intents(['bear'])).toMatch(/The first (rises over Wenna, to maul|towers over Wenna)/);
  });
});
