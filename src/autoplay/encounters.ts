import { Content } from '../content';
import { Canon } from '../canon/canon';
import { CreatureStore } from '../creature-store';
import { CreatureSchema, type Creature } from '../creature';
import { Battle } from '../battle';
import { Tactics } from '../tactics';
import { Draw } from './draw';

export interface EncounterFailure { seed: string; message: string; kind: string; company: string[] }
export interface EncounterResult {
  fights: number; won: number; lost: number; fled: number; undecided: number; turns: number;
  failures: EncounterFailure[]; ms: number;
}

// The laboratory's nearest horizon: fights alone, on the game's own engine (Battle.encounter over creatures generated
// as the game generates them), many and fast, with no world to keep. A company of one to three callings, at levels one
// to four, meets two or three groups in a row of one of the catalog's kinds (as a company meets fight after fight,
// carrying what the last left on it), weary or ready as the world may bring it, its turns fought by the game's tactics,
// a legal blow at random, or a flight. After every fight every creature is checked as a save is opened.
export class EncounterLab {
  static readonly peoples = ['human', 'dwarf', 'elf'];
  static run(seed: string, count: number): EncounterResult {
    const began = Date.now(), draw = new Draw(seed), kinds = Object.keys(Canon.species);
    const result: EncounterResult = { fights: 0, won: 0, lost: 0, fled: 0, undecided: 0, turns: 0, failures: [],
      ms: 0 };
    for (let i = 0; i < count; i++) { this.one(`${seed}:${i}`, draw, draw.pick(kinds)!, result); }
    result.ms = Date.now() - began;
    return result;
  }
  // One company's fights, one group after another.
  static one(seed: string, draw: Draw, kind: string, result: EncounterResult) {
    const content = new Content(seed), level = 1 + Math.floor(draw.next() * 4);
    let company: Creature[] = [];
    try {
      company = Array.from({ length: 1 + Math.floor(draw.next() * 3) }, (_, i) => {
        const raceId = draw.pick(this.peoples)!, classes = Canon.ancestries[raceId]!.classes.filter(c => c !== 'commoner');
        return content.createCreature(`c${i}`, { raceId, classId: draw.pick(classes)! as 'warrior', level });
      });
      const groups = Array.from({ length: 2 + Math.floor(draw.next() * 2) }, (_, g) =>
        Array.from({ length: 1 + Math.floor(draw.next() * 3) }, (_, i) =>
          content.createCreature(`f${g}_${i}`, { raceId: kind, level: Math.max(1, level - 1 + Math.floor(draw.next() * 3)) })));
      const store = new CreatureStore([...company, ...groups.flat()]);
      for (const [g, group] of groups.entries()) {
        if (!company.some(c => store.get(c.id).state.hp > 0)) { break; }
        this.fight(store, { company: company.map(c => c.id), group: group.map(c => c.id), seed: `${seed}:${g}` }, draw,
          result);
        store.snapshot.forEach(c => CreatureSchema.validate(c));
      }
    } catch (error) {
      result.failures.push({ seed, message: (error as Error).message, kind,
        company: company.map(c => `${c.raceId} ${c.classId} ${c.base.level}`) });
    }
  }
  private static fight(store: CreatureStore, sides: { company: string[]; group: string[]; seed: string }, draw: Draw,
    result: EncounterResult) {
    const seed = sides.seed, standing = sides.company.filter(id => store.get(id).state.hp > 0);
    const battle = Battle.encounter(store, [...standing.map(id => ({ creatureId: id, team: 'fighters' as const })),
      ...sides.group.map(id => ({ creatureId: id, team: 'goblins' as const }))],
    { seed, ...draw.chance(0.4) ? { weary: standing } : {}, ...draw.chance(0.2) ? { ready: standing } : {} });
    let turns = 0;
    while (!battle.state.outcome && turns++ < 400) {
      const legal = battle.legalCommands(), actor = battle.state.actor;
      const blows = legal.filter(c => c.ability !== 'flee' && c.ability !== 'wait');
      const mine = battle.playerControls(actor);
      const chosen = !mine ? battle.chosen() : draw.chance(0.03) && legal.find(c => c.ability === 'flee')
        ? legal.find(c => c.ability === 'flee')! : draw.chance(0.3) && blows.length ? draw.pick(blows)!
          : Tactics.choose(battle.state, legal);
      battle.step(chosen);
    }
    if (!battle.state.outcome) { battle.close(); }
    result.fights++; result.turns += turns;
    const outcome = battle.state.outcome;
    if (outcome === 'fighters') { result.won++; } else if (outcome === 'escaped') { result.fled++; }
    else if (outcome === 'goblins') { result.lost++; } else { result.undecided++; }
  }
}
