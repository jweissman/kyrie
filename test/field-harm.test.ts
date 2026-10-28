import { describe, expect, it } from 'bun:test';
import { Content } from '../src/content';
import { CreatureStore } from '../src/creature-store';
import { Items } from '../src/campaign/items';
import type { Entity } from '../src/lang/module';

// Harm met outside a fight hurts, and begins nothing that lasts a fight: a night's cold chills a penitent kneeling on
// the Steps, and does not leave her encased in ice until the next fight ends (A Winter in Carth's friction 4, the
// register's CTH-04: a bard who knelt one night was frozen, and died). Over two dozen nights, none freezes.
describe('harm met outside a fight', () => {
  it('chills, and freezes no one', () => {
    const night = { id: 'steps_cold', type: 'hazard', name: 'a night on the Steps',
      effect: 'Deal (1d4) cold damage to ally.' } as unknown as Entity;
    const struck: string[][] = [];
    for (let i = 0; i < 24; i++) {
      const bard = new Content(`chill${i}`).createCreature('bard', { raceId: 'human', classId: 'bard', name: 'Maren' });
      const store = new CreatureStore([bard]);
      Items.expose(store, { target: 'bard', ability: 'steps_cold', source: 'steps_cold', seed: `chill${i}`, entities: [night] });
      const after = store.get('bard');
      struck.push((after.state.conditions ?? []).map(c => c.id));
      expect(after.state.hp).toBeLessThan(bard.state.hp);
    }
    expect(struck.flat()).not.toContain('frozen');
  });
});
