import { describe, expect, it } from 'bun:test';
import type { Battle } from '../src/arena';
import { Content } from '../src/content';
import { CombatTelling } from '../src/ui/combat-telling';
import { Canon } from '../src/canon/canon';
import type { CombatEvent } from '../src/model';
import { SrdFights } from './support/srd-fights';
const fight = SrdFights.fight;

// Two of the SRD adaptation briefing's creatures brought to a recognisable adaptation within what Hit Dice, typed
// defenses and the honest catalog now express (increments A–C): the unicorn (the ghoul withdrawn, below), with its
// source's Hit Dice, natural attacks and defenses, and a source record saying what is adapted and what omitted. (The
// golem: a material variation may carry Hit Dice and defenses, the lead's decision; see srd-invariants.md.)
// Each is fought, and its defining promise holds in the fight and in its telling.
const told = (b: Battle) => CombatTelling.exchanges(b.events, b.state).map(t => t.text).join(' ');

// The ghoul's SRD stat block, withdrawn from Orsino's ghoul (the lead, 13 November: put in its place, a brood in the
// first town's ossuary killed a first-level warrior who had won that fight before), is the barrow ghoul: Orsino's ghoul
// with the SRD's breed laid over it (ghoul/barrow, variations.json), placed nowhere until placements.md says where.
const blows = (events: CombatEvent[], by: string) => events.filter(e => e.type === 'attack' && e.actor === by);
describe('the barrow ghoul (SRD: 2d12, bite 1d6+1 and two claws 1d3, paralysis)', () => {
  it('is thirteen hit points of bite, claw and claw, with its paralysing touch and none of the undead package', () => {
    const g = Canon.creature('ghoul/barrow');
    expect([g.statistics?.hitDice, g.statistics?.attacks, g.abilities, g.traits]).toEqual(['2d12',
      ['bite', 'claws', 'claws'], ['paralyzing_touch'], ['undead']]);
    expect([1, 5].map(level => new Content('barrow').createCreature(`g${level}`, { raceId: 'ghoul/barrow', level })
      .base.maxHp)).toEqual([13, 13]);
    expect(Canon.creature('ghoul').statistics?.hitDice).toBeUndefined();
    // Against one warrior, so that it lives to strike: each blow of its is the three, a roll each.
    const { b } = fight('ghoul/barrow', 1, 'barrow', ['warrior']);
    const struck = b.events.findIndex(e => e.type === 'action' && e.command.actor === 'foe'
      && e.command.ability === 'melee');
    expect(struck).toBeGreaterThan(-1);
    const after = b.events.slice(struck + 1), next = after.findIndex(e => e.type === 'action');
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

// The golem of flesh (SRD: 9d10+30, two slams 2d8+5, 5/adamantine), one archetype as the bestiary keeps it: the golem
// with the flesh of its materials (golem/flesh), placed nowhere yet.
describe('the golem of flesh', () => {
  it('shrugs off ordinary blades: every blow of steel loses five, and the telling says so', () => {
    const golem = Canon.creature('golem/flesh');
    expect([golem.statistics?.hitDice, golem.statistics?.attacks]).toEqual(['9d10+30', ['great_slam', 'great_slam']]);
    expect(new Content('flesh').creature('golem/flesh', 'g', 'goblins').maxHp).toBe(79);
    const { b } = fight('golem/flesh', 7, 'flesh', ['warrior', 'warrior', 'thief', 'cleric']);
    const steel = b.events.filter(e => e.type === 'damage' && e.target === 'foe'
      && ['slashing', 'piercing', 'bludgeoning'].includes(e.damageType ?? ''));
    expect(steel.length).toBeGreaterThan(0);
    for (const e of steel) { if (e.type === 'damage') { expect(e.modifiers?.reduction).toBe(5); } }
    expect(told(b)).toMatch(/the flesh golem's guard turns \d of the blow/i);
  });
});
