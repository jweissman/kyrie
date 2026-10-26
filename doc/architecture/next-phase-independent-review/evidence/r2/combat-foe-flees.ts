// One foe's successful Flee ends the whole fight as 'escaped' (src/effects.ts:276-280, battle.ts:239), and
// Campaign.settle counts any end with fled.team === 'goblins' as WON (campaign.ts:331-337), awarding experience for
// every member of the opposing group, including those never touched, who remain alive.
import { Content } from '../../../../../src/content';
import { Battle } from '../../../../../src/battle';
const randomly = Object.entries(Content.statuses).find(([, c]: any) => c.modifiers.randomActions)![0];
console.log('acting-at-random condition put on the foes:', randomly);
let foeFled = 0, untouchedFoes = 0, n = 0, sample = '';
for (let s = 0; s < 400; s++) {
  const content = new Content(`flee-${s}`);
  const combatants = [content.character('warrior', 'hero', 'fighters'), content.character('warrior', 'hero2', 'fighters'),
    ...['w1', 'w2', 'w3'].map(id => content.creature('wolf', id, 'goblins'))];
  combatants.slice(2).forEach(w => w.statuses.push({ id: randomly, remaining: 3 }));
  const b = new Battle({ id: 'flee', combatants, abilities: Content.abilities }, `flee-${s}`, 300);
  while (!b.state.outcome) { b.step(b.chosen()); } n++;
  const end = b.events.find(e => e.type === 'end') as any;
  if (end?.fled?.team === 'goblins') {
    foeFled++;
    const wolves = b.state.combatants.filter(f => f.team === 'goblins');
    untouchedFoes += wolves.filter(f => f.hp === f.maxHp).length;
    if (!sample) sample = `seed flee-${s}: fled=${end.fled.actor}, foes after: ${wolves.map(w => `${w.id} ${w.hp}/${w.maxHp}`).join(', ')}; random-action events: ${b.events.filter(e => e.type === 'random').length}`;
  }
}
console.log({ fights: n, endedByAFoeFleeing: foeFled, foesAtFullHpInThoseFights: untouchedFoes });
console.log(sample);
