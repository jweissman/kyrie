// Drain heals its user by what it dealt (src/effects.ts:283-286) without asking whether the user still lives. The
// target's onAttacked hook (ion_shield strikes back at the attacker) runs inside Effects.damage, before the heal.
import { Content } from '../../../../../src/content';
import { AbilityUse } from '../../../../../src/ability-use';
import { Expressions } from '../../../../../src/expressions';
import type { CombatEvent } from '../../../../../src/model';
const drain = Content.abilities.find(a => a.id === 'life_drain')!;
console.log('life_drain effects', JSON.stringify(drain.effects));
let killed = 0, cameBack = 0, sample = '';
for (let s = 0; s < 200; s++) {
  const content = new Content(`d-${s}`);
  const actor = content.character('warrior', 'drainer', 'fighters');
  const target = content.character('warrior', 'shielded', 'goblins');
  actor.hp = 1; target.statuses.push({ id: 'ion_shield', remaining: 5 });
  const events: CombatEvent[] = [];
  const ctx: any = { actor, fighters: [actor, target], turn: 1, events, content, abilities: Content.abilities.map(a => a.id),
    retreat: false, location: null, free: true };
  try { AbilityUse.perform(drain, 'shielded', new Expressions(`d-${s}`), ctx); } catch (e) { continue; }
  const died = events.some(e => e.type === 'death' && e.actor === 'drainer');
  const savedDeath = events.some(e => e.type === 'revive' && e.target === 'drainer');
  if (died) killed++;
  if (died && !savedDeath && actor.hp > 0) { cameBack++; if (!sample) sample = JSON.stringify(events.filter(e => ['damage', 'heal', 'death', 'save'].includes(e.type)).map(e => ({ t: e.type, a: (e as any).actor, tg: (e as any).target, amt: (e as any).amount, hp: (e as any).hp }))); }
}
console.log({ drainerKilledByShield: killed, drainerAliveAfterDeathEventWithoutRevive: cameBack });
console.log('sample events:', sample);
