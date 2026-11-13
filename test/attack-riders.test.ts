import { describe, expect, it } from 'bun:test';
import { AbilityUse } from '../src/ability-use';
import { Canon } from '../src/canon/canon';
import { CanonValidation } from '../src/canon/canon-validation';
import { Content } from '../src/content';
import { Expressions } from '../src/expressions';
import type { EffectContext } from '../src/effects';
import type { CombatEvent, Fighter } from '../src/model';

// Attack riders (the SRD adaptation briefing, §4): what a blow carries is data on the attack, by its kind's natural
// weapon (Statistics.riders, here the barrow ghoul's breed), resolved after the blow's harm and only when it lands.
// One attack roll decides whether its rider happens: a miss never paralyses; a hit asks the SRD's save (Fortitude
// against 12), and paralyses three turns when it fails.
describe('the barrow ghoul\'s paralysing blows', () => {
  const content = new Content('riders');
  it('rides on its bite and its claws, in place of Orsino\'s touch', () => {
    const g = Canon.creature('ghoul/barrow');
    expect(Object.keys(g.statistics?.riders ?? {})).toEqual(['bite', 'claws']);
    expect(g.abilities).not.toContain('paralyzing_touch');
    const f = content.creature('ghoul/barrow', 'g', 'goblins');
    expect([f.equipment.weapon.onHit?.[0]?.kind, ...f.equipment.routine!.map(w => w.onHit?.length)]).toEqual(['apply', 1, 1, 1]);
    // A body without riders carries none: Orsino's ghoul claws as it did.
    expect(content.creature('ghoul', 'o', 'goblins').equipment.weapon.onHit).toBeUndefined();
  });
  it('paralyses only on a hit, against the save, and every miss carries nothing', () => {
    const expressions = new Expressions('riders'), seen = { hit: 0, miss: 0, held: 0, paralysed: 0 };
    for (let n = 0; n < 60; n++) {
      const ghoul = content.creature('ghoul/barrow', 'g', 'goblins');
      const hero: Fighter = { ...content.character('warrior', 'h', 'fighters'), hp: 200, maxHp: 200 };
      const events: CombatEvent[] = [], context = { fighters: [ghoul, hero], turn: 1, events, content, abilities: [],
        retreat: false, location: null, expressions } as EffectContext;
      const hit = AbilityUse.attack(ghoul, hero, context, false);
      const saves = events.filter(e => e.type === 'save' && e.kind === 'fortitude');
      const paralysed = events.some(e => e.type === 'status' && e.detail === 'paralyzed');
      if (!hit) { seen.miss++; expect([saves.length, paralysed]).toEqual([0, false]); continue; }
      seen.hit++;
      expect(saves.map(e => e.type === 'save' && e.difficulty)).toEqual([12]);
      const held = saves[0]!.type === 'save' && saves[0]!.success;
      expect(paralysed).toBe(!held);
      if (held) { seen.held++; } else { seen.paralysed++; }
    }
    expect(Object.values(seen).every(n => n > 0)).toBe(true);
  });
  it('refuses a rider on a blade, or one that lands on anyone but what was struck', () => {
    const barrow = Canon.variations.barrow!, was = barrow.riders;
    barrow.riders = { longsword: was!.bite!, bite: [{ ...was!.bite![0]!, target: 'self' }] };
    try {
      expect(CanonValidation.problems().filter(p => p.startsWith('variation barrow'))).toEqual([
        'variation barrow: rides on longsword, which is no natural weapon', 'variation barrow: a rider on bite lands on self']);
    } finally { barrow.riders = was; }
  });
});
