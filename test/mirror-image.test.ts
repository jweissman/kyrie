import { describe, expect, it } from 'bun:test';
import { Battle } from '../src/arena';
import { Content } from '../src/content';
import { Expressions } from '../src/expressions';
import { CombatTelling } from '../src/ui/combat-telling';
import type { CombatEvent, Fighter, Team } from '../src/model';

// Mirror Image by the SRD's numbers (doc/architecture/mission-22/srd-proving-cases.md, case 40): second level,
// illusion, on the caster, 1d4 images and one each three casting levels to eight; each attack roll at the caster falls
// on the caster or an image, each as likely, and a hit on an image puts it out (Images); harm without an attack roll
// passes them by. Orsino's two harder to hit, +2 to saves and its evasion gone. Its play-identity test.
const c = new Content('mirror-image');
const spell = Content.abilities.find(a => a.id === 'mirror_image')!;
const hardy = (f: Fighter, level = 3): Fighter => ({ ...f, level, hp: 300, maxHp: 300 });
const caster = (id: string, team: Team, known: string): Fighter => {
  const slots = known === 'mirror_image' ? [0, 1] : [1];
  return { ...hardy(c.character('mage', id, team)), abilities: [known], maxSlots: slots, slots: [...slots],
    prepared: slots.map(n => n ? [known] : []), ready: slots.map(n => n ? [known] : []) };
};
const fight = (seed: string, foes: Fighter[]) => {
  const b = new Battle({ id: 'mirror', combatants: [caster('mage', 'fighters', 'mirror_image'), ...foes],
    abilities: Content.abilities }, seed, 200);
  for (let i = 0; i < 40 && b.state.actor !== 'mage'; i++) {
    b.step(b.legalCommands().find(x => x.ability === 'wait') ?? b.chosen());
  }
  b.step(b.legalCommands().find(x => x.ability === 'mirror_image')!);
  return b;
};
const images = (b: Battle) => b.state.combatants.find(f => f.id === 'mage')!.statuses
  .find(s => s.id === 'mirror_images')?.images ?? 0;
describe('Mirror Image, by the SRD\'s numbers', () => {
  it('is a second-level illusion on the caster: 1d4 images and one each three casting levels, to eight', () => {
    expect(spell.spell).toEqual({ tradition: 'arcane', level: 2, school: 'illusion' });
    expect(spell.effects).toEqual([{ kind: 'apply', status: 'mirror_images',
      duration: { kind: 'deem', expression: '10 * #castingLevel' }, target: 'self' }]);
    const dice = Content.statuses.mirror_images!.modifiers.images!, e = new Expressions('images');
    const thrown = (castingLevel: number) => [...Array(60).keys()].map(() => e.number(dice, { castingLevel }));
    for (const [level, least, most] of [[1, 1, 4], [3, 2, 5], [12, 5, 8], [20, 5, 8]] as const) {
      expect([Math.min(...thrown(level)), Math.max(...thrown(level))]).toEqual([least, most]);
    }
  });
  it('takes blows meant for the caster: an image struck is put out, a miss does nothing, the caster unharmed', () => {
    let struck = 0, missed = 0, ended = 0;
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f']) {
      const b = fight(seed, [hardy(c.character('warrior', 'g1', 'goblins')), hardy(c.character('warrior', 'g2',
        'goblins'))]);
      let left = images(b);
      expect(left).toBeGreaterThanOrEqual(2);
      for (let i = 0; i < 30 && !b.state.outcome && left; i++) {
        const mine = b.state.actor === 'mage', before = b.state.combatants.find(f => f.id === 'mage')!.hp;
        const events: CombatEvent[] = b.step(mine ? b.legalCommands().find(x => x.ability === 'wait')! : b.chosen());
        const at = events.filter(e => e.type === 'attack' && e.image && e.target === 'mage');
        if (!at.length) { left = images(b); continue; }
        const hits = at.filter(e => e.type === 'attack' && e.success).length;
        struck += hits; missed += at.length - hits;
        expect(images(b)).toBe(Math.max(0, left - hits));
        expect(b.state.combatants.find(f => f.id === 'mage')!.hp).toBe(before);
        expect(CombatTelling.exchanges(events, b.state).map(t => t.text).join(' ')).toContain('an image');
        left = images(b);
        if (!left) {
          ended++;
          expect(events.some(e => e.type === 'expire' && e.detail === 'mirror_images')).toBe(true);
        }
      }
    }
    expect([struck > 0, missed > 0, ended > 0]).toEqual([true, true, true]);
  });
  it('lets harm without an attack roll pass: a missile finds the caster, the images untouched', () => {
    const b = fight('missile', [{ ...caster('g1', 'goblins', 'magic_missile'), level: 1 }]);
    const left = images(b);
    for (let i = 0; i < 10 && b.state.actor !== 'g1'; i++) {
      b.step(b.legalCommands().find(x => x.ability === 'wait') ?? b.chosen());
    }
    const events = b.step(b.legalCommands().find(x => x.ability === 'magic_missile' && x.target === 'mage')!);
    expect(events.some(e => e.type === 'damage' && e.target === 'mage')).toBe(true);
    expect(images(b)).toBe(left);
  });
});
