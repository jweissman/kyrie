import { describe, expect, it } from 'bun:test';
import type { Battle } from '../src/arena';
import { Content } from '../src/content';
import { CombatTelling } from '../src/ui/combat-telling';
import { Canon } from '../src/canon/canon';
import { SrdFights } from './support/srd-fights';
const fight = SrdFights.fight;

// Two of the SRD adaptation briefing's creatures brought to a recognisable adaptation within what Hit Dice, typed
// defenses and the honest catalog now express (increments A–C): the unicorn (the ghoul withdrawn, below), with its
// source's Hit Dice, natural attacks and defenses, and a source record saying what is adapted and what omitted. (The
// golem: a material variation may carry Hit Dice and defenses, the lead's decision; see srd-invariants.md.)
// Each is fought, and its defining promise holds in the fight and in its telling.
const told = (b: Battle) => CombatTelling.exchanges(b.events, b.state).map(t => t.text).join(' ');

// The ghoul's SRD stat block is withdrawn (the lead, 13 November): put in the place of Orsino's ghoul, a brood of them
// in the first town's ossuary killed a first-level warrior who had won that fight before, and the king-barrow and the
// Howe went the same way (the full suite on 76fa804f). It comes back as a variant once the challenge table is measured
// again and its placements are reviewed (srd-invariants.md, "Withdrawn").
describe('the ghoul (SRD: 2d12, bite 1d6+1 and two claws 1d3, paralysis)', () => {
  it.todo('is thirteen hit points of bite, claw and claw, with its paralysing touch: withdrawn until it is re-measured');
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
