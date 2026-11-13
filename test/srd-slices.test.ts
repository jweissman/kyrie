import { describe, expect, it } from 'bun:test';
import type { Battle } from '../src/arena';
import { Content } from '../src/content';
import { CombatTelling } from '../src/ui/combat-telling';
import { Canon } from '../src/canon/canon';
import type { CombatEvent } from '../src/model';
import { SrdFights } from './support/srd-fights';
const fight = SrdFights.fight;

// Two of the SRD adaptation briefing's creatures brought to a recognisable adaptation within what Hit Dice, typed
// defenses and the honest catalog now express (increments A–C): the ghoul and the unicorn, each with its source's Hit
// Dice, natural attacks and defenses, and a source record saying what is adapted and what omitted. (The golem waits on
// a decision: see doc/architecture/mission-21/rules/srd-invariants.md.)
// Each is fought, and its defining promise holds in the fight and in its telling.
const told = (b: Battle) => CombatTelling.exchanges(b.events, b.state).map(t => t.text).join(' ');
const blows = (events: CombatEvent[], by: string) => events.filter(e => e.type === 'attack' && e.actor === by);

describe('the ghoul (SRD: 2d12, bite 1d6+1 and two claws 1d3, paralysis)', () => {
  it('is thirteen hit points of bite, claw and claw, with its paralysing touch, and nothing of the undead package', () => {
    const g = Canon.creature('ghoul');
    expect([g.statistics?.hitDice, g.statistics?.attacks, g.abilities]).toEqual(['2d12', ['bite', 'claws', 'claws'],
      ['paralyzing_touch']]);
    expect(g.traits).toEqual(['undead']);
    expect(g.source.srd35).toBe('monster:ghoul');
    // Against one warrior, so that it lives to strike: each blow of its is the three, a roll each.
    const { b } = fight('ghoul', 1, 'ghoul', ['warrior']);
    const struck = b.events.flatMap((e, i) => e.type === 'action' && e.command.actor === 'foe'
      && e.command.ability === 'melee' ? [i] : []);
    expect(struck.length).toBeGreaterThan(0);
    const after = b.events.slice(struck[0]! + 1), next = after.findIndex(e => e.type === 'action');
    expect(blows(next < 0 ? after : after.slice(0, next), 'foe').map(e => e.type === 'attack' && e.weapon))
      .toEqual(['bite', 'claws', 'claws']);
  });
});

describe('the unicorn (SRD: 4d10+20, horn 1d8+8 and two hooves 1d4+2; the record\'s 10/magic and energy 10)', () => {
  it('has forty-two hit points, and its guard against steel (10/magic) is told blow by blow', () => {
    const u = Canon.creature('unicorn');
    expect(u.statistics?.hitDice).toBe('4d10+20');
    expect(new Content('unicorn').creature('unicorn', 'u', 'goblins').maxHp).toBe(42);
    const { b } = fight('unicorn', 3, 'unicorn');
    const guarded = b.events.filter(e => e.type === 'damage' && e.target === 'foe' && e.modifiers?.guarded?.length);
    expect(guarded.length).toBeGreaterThan(0);
    expect(told(b)).toMatch(/the unicorn's guard turns \d+ of the blow/i);
  });
});
