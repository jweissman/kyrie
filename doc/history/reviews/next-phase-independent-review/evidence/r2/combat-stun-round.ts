// "Apply stun to enemies for 1 turn": MechanicsText says "for a turn"; Battle.round (src/battle.ts:277-279) ticks every
// untimed condition down once per ROUND for everyone, so a stun landed on someone who already acted this round expires
// before their next turn and costs them nothing.
import { Content } from '../../../../../src/content';
import { Battle } from '../../../../../src/battle';
import { Tactics } from '../../../../../src/tactics';
import { MechanicsText } from '../../../../../src/presentation/mechanics-text';
const howl = Content.abilities.find(a => a.id === 'winter_howl')!;
console.log('MechanicsText:', MechanicsText.full(howl));
let stuns = 0, wasted = 0, effective = 0;
for (let s = 0; s < 300; s++) {
  const content = new Content(`stun-${s}`);
  const combatants = [content.character('warrior', 'hero', 'fighters'), content.creature('frost_wolf', 'wolf', 'goblins')];
  const b = new Battle({ id: 'stun', combatants, abilities: Content.abilities }, `stun-${s}`, 200);
  while (!b.state.outcome) { b.step(b.chosen()); }
  const ev = b.events;
  ev.forEach((e, i) => {
    if (e.type !== 'status' || e.detail !== 'stun' || e.target !== 'hero') return;
    stuns++;
    // Did the hero lose a turn (a 'skip' event for hero) before the stun's 'expire' event?
    const rest = ev.slice(i + 1), exp = rest.findIndex(x => x.type === 'expire' && x.target === 'hero' && x.detail === 'stun');
    const window = exp < 0 ? rest : rest.slice(0, exp);
    if (window.some(x => x.type === 'skip' && x.actor === 'hero')) effective++; else if (exp >= 0) wasted++;
  });
}
console.log({ stunsLandedOnHero: stuns, heroLostATurn: effective, expiredWithNoTurnLost: wasted });
