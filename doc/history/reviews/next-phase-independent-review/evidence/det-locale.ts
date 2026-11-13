// Probe: does Tactics.choose (used for every NPC turn and the auto controller) depend on the host's collation locale?
// Bun is fixed at en-US; a browser uses the reader's locale. We simulate an Estonian/Czech browser by patching
// String.prototype.localeCompare's default locale, then play the same seeded fight and compare event logs.
import { Content } from '../../../../src/content';
import { CreatureStore } from '../../../../src/creature-store';
import { Battle } from '../../../../src/battle';
import { Tactics } from '../../../../src/tactics';

const original = String.prototype.localeCompare;
function fight(seed: string, ids: [string, string]): string {
  const content = new Content('det-locale');
  const hero = content.createCreature('hero', { raceId: 'human', classId: 'warrior' });
  const a = content.createCreature(ids[0], { raceId: 'goblin', classId: 'commoner' }, 'twin');
  const b = content.createCreature(ids[1], { raceId: 'goblin', classId: 'commoner' }, 'twin');
  const store = new CreatureStore([hero, a, b]);
  const battle = Battle.encounter(store, [{ creatureId: 'hero', team: 'fighters' },
    { creatureId: ids[0], team: 'goblins' }, { creatureId: ids[1], team: 'goblins' }], { seed });
  const picks: string[] = [];
  while (!battle.state.outcome) {
    const c = Tactics.choose(battle.state, battle.legalCommands());
    picks.push(`${c.actor}>${c.ability}>${c.target}`); battle.step(c);
  }
  return JSON.stringify({ outcome: battle.state.outcome, picks, hp: battle.state.combatants.map(f => [f.id, f.hp]) });
}
for (const [locale, ids] of [['et', ['tom', 'zed']], ['cs', ['hank', 'chuck']], ['da', ['zack', 'aage']]] as const) {
  let differ = 0, first = '';
  for (let s = 0; s < 20; s++) {
    String.prototype.localeCompare = original;
    const en = fight(`seed-${s}`, [...ids]);
    String.prototype.localeCompare = function (this: string, that: string, l?: string | string[], o?: Intl.CollatorOptions) {
      return original.call(this, that, l ?? locale, o);
    } as typeof original;
    const other = fight(`seed-${s}`, [...ids]);
    if (en !== other) { differ++; if (!first) { first = `seed-${s}\n en: ${en.slice(0, 220)}\n ${locale}: ${other.slice(0, 220)}`; } }
  }
  String.prototype.localeCompare = original;
  console.log(`${locale} ids=${ids.join(',')}: ${differ}/20 fights differ from en-US`);
  if (first) { console.log(first); }
}
