import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { PlayerView } from '../../src/presentation/player-view';
import type { CreatureStore } from '../../src/creature-store';

// A party cleric's Raise Dead outside a fight (mission-22 brief Phase 4A: "Healing, regeneration, Raise Dead, and
// Resurrection in combat and outside it"): between fights it had been only a town priest's service (test/raising),
// because a raising was not a field technique (FieldUse.safe) and the field's one route asked the recipient to be
// awake. Now the company's own cleric, with the spell prepared, raises a dead companion by the same route as a healing
// (field_spell → Resolve invoke → FieldUse.perform): the slot spent, the dead back with the spell's share of their
// health; a healing is no help to the dead, and a raising that makes them something else (Animate Dead) is not one.
const glade = `
  Place glade "the glade" is room at 0, 0 outdoors.
  Company party "You" of 2 at glade.`;
const party = [{ name: 'Aud', raceId: 'human' as const, classId: 'cleric' as const, level: 7, traits: ['vitalist'] },
  { name: 'Wat', raceId: 'human' as const, classId: 'warrior' as const, level: 3 }];
// Wat dead where he fell; Aud, a vitalist of the seventh level, with Raise Dead in her fourth-level slot, or not.
const dead = async (prepared: boolean) => {
  const t = await Tiny.start(glade, { party });
  const store = (t.campaign as unknown as { creatures: CreatureStore }).creatures;
  const ids = ['Aud', 'Wat'].map(n => t.campaign.readout.creatures.find(c => c.name === n)!.id);
  const lease = store.acquire(ids);
  try {
    const [a, w] = lease.creatures as [typeof lease.creatures[0], typeof lease.creatures[0]];
    if (prepared) {
      a.state.learnedAbilities.push('raise_dead'); a.state.ready![3] = ['raise_dead']; a.state.prepared![3] = ['raise_dead'];
    }
    w.state.hp = 0; w.state.conditions.push({ id: 'slain', remaining: 1, clock: 'until-removed' });
    lease.commit(lease.creatures);
  } finally { lease.release(); }
  return t.play('Wait a while');
};
const on = (t: Tiny, who: string) => PlayerView.choices(t.campaign).map(r => r.choice)
  .filter(c => c.name.endsWith(` on ${who}`));
const wat = (t: Tiny) => t.campaign.readout.creatures.find(c => c.name === 'Wat')!;

describe('a party cleric\'s Raise Dead between fights', () => {
  it('is offered on the dead, and nothing that only heals is', async () => {
    expect(on(await dead(true), 'Wat').map(c => c.name)).toEqual(['Have Aud use Raise Dead on Wat']);
    expect(on(await dead(false), 'Wat')).toEqual([]);
  });
  it('spends the slot and brings the dead back with the spell\'s share of their health', async () => {
    const t = await dead(true), most = wat(t).base.maxHp;
    await t.perform(on(t, 'Wat')[0]!.id);
    expect(t.campaign.events.at(-1)!.combat.some(e => e.type === 'revive' && e.target === wat(t).id)).toBe(true);
    expect(wat(t).state.hp).toBe(Math.floor(most / 2));
    expect(wat(t).state.conditions.some(s => s.id === 'slain')).toBe(false);
    expect(t.campaign.readout.creatures.find(c => c.name === 'Aud')!.state.ready![3]).toEqual([]);
    expect(on(t, 'Wat').some(c => /Raise Dead/.test(c.name))).toBe(false);
  });
});
