import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { DeemValue } from 'deem';
import { Content } from '../src/content';
import { CreatureDefinition } from '../src/creature-definition';
import { CombatProjection } from '../src/combat-projection';
import { Battle } from '../src/battle';
import { GenerationSetting } from '../src/generation-setting';
const { templates } = GenerationSetting;

// Test configurations and combat commands, not creature definitions. The shell smoke test invokes the actual CLI.
class Proof {
  static readonly cases: { id: string; parameters: Record<string, DeemValue>; action: string }[] = [
    { id: 'creature', parameters: {}, action: 'attack' },
    { id: 'blue_young', parameters: { family: 'dragon', lineage: 'blue', maturity: 'young' }, action: 'breathe_lightning' },
    { id: 'red_ancient', parameters: { family: 'dragon', lineage: 'red', maturity: 'ancient' }, action: 'breathe_fire' },
    { id: 'frost_wolf', parameters: { family: 'animal', body: 'wolf', adaptation: 'frost' }, action: 'rending_bite' },
    { id: 'frost_ranger', parameters: { family: 'humanoid', classId: 'ranger', adaptation: 'frost', weapon: 'shortbow' }, action: 'ranged' },
    { id: 'frost_construct', parameters: { family: 'construct', adaptation: 'frost' }, action: 'smash' },
    { id: 'bear', parameters: { family: 'animal', body: 'bear' }, action: 'smash' },
    { id: 'copper_dragon', parameters: { family: 'dragon', lineage: 'copper', maturity: 'adult' }, action: 'breathe_acid' },
    { id: 'frost_bear', parameters: { family: 'animal', body: 'bear', adaptation: 'frost' }, action: 'smash' },
    { id: 'stone_guardian', parameters: { family: 'construct', body: 'golem', material: 'stone', role: 'guardian' },
      action: 'smash' },
  ];
  static prepare(dir: string) {
    const callers = Object.fromEntries(this.cases.filter(c => c.id !== 'creature').map(c => [c.id,
      { __no_id: true, _parameters: c.parameters, '*creature': '=gen(' + c.parameters.family + ', #_parameters)' }]));
    writeFileSync(join(dir, 'templates.json'), JSON.stringify({ ...templates, ...callers }));
  }
  static verify(dir: string) {
    return this.cases.map(c => {
      const definition = JSON.parse(readFileSync(join(dir, `${c.id}.json`), 'utf8'));
      const creature = CreatureDefinition.accept(c.id, definition);
      const actor = CombatProjection.fighter(creature, 'fighters');
      const opponents = ['left', 'right'].map(id => CombatProjection.fighter(new Content('targets')
        .createCreature(id, { raceId: 'human', classId: 'warrior', level: 20 }), 'goblins'));
      const battle = new Battle({ id: 'proof', combatants: [actor, ...opponents], abilities: Content.abilities }, 'proof');
      while (battle.state.actor !== actor.id && !battle.state.outcome) {
        battle.step(battle.legalCommands().find(command => command.ability === 'defend')!);
      }
      const command = battle.legalCommands().find(command => command.ability === (c.action === 'attack' ? actor.equipment.weapon.missile ? 'ranged' : 'melee' : c.action));
      if (!command) { throw new Error(`Generated capability is unavailable: ${c.action}`); }
      battle.step(command);
      battle.close();
      return { parameters: c.parameters, commandLine: `deem run --seed public-cli --type ${c.id}`
        + (c.id === 'creature' ? '' : ' --templates "$fixture/templates.json"'),
      definition, creature, command, events: battle.events };
    });
  }
}
const [phase, dir] = Bun.argv.slice(2);
if (!dir) { throw new Error('Use bash test/smoke-deem.sh'); }
if (phase === 'prepare') { Proof.prepare(dir); }
else if (phase === 'verify') { console.log(JSON.stringify(Proof.verify(dir), null, 2)); }
else { throw new Error('Expected prepare or verify'); }
