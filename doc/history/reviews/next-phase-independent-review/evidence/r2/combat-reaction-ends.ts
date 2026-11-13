// MechanicsText says Overwatching / Blade Barrier answer an enemy who strikes in reach "and it ends". The reaction's
// remove effect targets 'enemy' (the striker, src/reactions.ts:28), so the holder keeps the stance.
import { Content } from '../../../../../src/content';
import { AbilityUse } from '../../../../../src/ability-use';
import { Expressions } from '../../../../../src/expressions';
import { MechanicsText } from '../../../../../src/presentation/mechanics-text';
import type { CombatEvent } from '../../../../../src/model';
for (const stance of ['overwatch', 'blade_barrier']) {
  console.log('TEXT:', MechanicsText.condition(stance));
  const content = new Content(`r-${stance}`);
  const striker = content.character('warrior', 'striker', 'fighters');
  const holder = content.character('warrior', 'holder', 'goblins');
  striker.hp = striker.maxHp = 999; holder.hp = holder.maxHp = 999;
  holder.statuses.push({ id: stance, remaining: 10 });
  const events: CombatEvent[] = [];
  const melee = Content.abilities.find(a => a.id === 'melee')!;
  const ex = new Expressions(`r-${stance}`);
  for (let i = 0; i < 4; i++) {
    AbilityUse.perform(melee, 'holder', ex, { actor: striker, fighters: [striker, holder], turn: i + 1, events, content,
      abilities: Content.abilities.map(a => a.id), retreat: false, location: null, free: true });
  }
  console.log(`  4 melee strikes -> react events: ${events.filter(e => e.type === 'react').length}; holder still has ${stance}: ${holder.statuses.some(s => s.id === stance)}; remove events: ${events.filter(e => e.type === 'remove').length}`);
}
