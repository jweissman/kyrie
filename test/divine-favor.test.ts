import { describe, expect, it } from 'bun:test';
import { Battle } from '../src/arena';
import { Content } from '../src/content';
import type { Fighter } from '../src/model';

// Divine Favor by the SRD's resolution (doc/architecture/mission-22/srd-proving-cases.md, case 23, the owner's word of
// 18 November): on the caster alone, +1 to hit and +1 damage (blessed) for a minute, ten rounds, at Orsino's level (a
// War cantrip, kept); Orsino's keen (+2 more, a telling blow on 18) and its three rounds gone. Its play-identity test.
const c = new Content('favor');
const hardy = (f: Fighter): Fighter => ({ ...f, level: 3, hp: 300, maxHp: 300 });
const cleric = (): Fighter => ({ ...hardy(c.character('cleric', 'cleric', 'fighters')), abilities: ['divine_favor'],
  maxSlots: [1], slots: [1], prepared: [['divine_favor']], ready: [['divine_favor']] });
const battle = () => {
  const b = new Battle({ id: 'favor', combatants: [hardy(c.character('warrior', 'warrior', 'fighters')), cleric(),
    hardy(c.character('warrior', 'g1', 'goblins'))], abilities: Content.abilities }, 'favor', 200);
  for (let i = 0; i < 40 && b.state.actor !== 'cleric'; i++) {
    b.step(b.legalCommands().find(x => x.ability === 'wait') ?? b.chosen());
  }
  return b;
};
describe('Divine Favor, by the SRD\'s resolution', () => {
  it('is cast on the caster alone, a War cantrip of evocation', () => {
    const b = battle(), favor = Content.abilities.find(a => a.id === 'divine_favor')!;
    expect(b.legalCommands().filter(x => x.ability === 'divine_favor').map(x => x.target ?? 'cleric'))
      .toEqual(['cleric']);
    expect(favor.spell).toEqual({ tradition: 'divine', level: 0, domain: 'war', school: 'evocation' });
  });
  it('blesses the caster for ten rounds, and lays nothing keen', () => {
    const b = battle(), favor = b.legalCommands().find(x => x.ability === 'divine_favor')!;
    b.step(favor);
    const statuses = b.state.combatants.find(f => f.id === 'cleric')!.statuses;
    expect(statuses.find(s => s.id === 'blessed')?.remaining).toBe(10);
    expect(statuses.some(s => s.id === 'keen')).toBe(false);
  });
});
