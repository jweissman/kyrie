import { Canon } from '../canon/canon';
import { Battle } from '../battle';
import { CombatProjection } from '../combat-projection';
import { CreatureStore } from '../creature-store';
import { Tactics } from '../tactics';
import { Effects } from '../effects';
import { Environment } from '../campaign/environment';
import type { Campaign } from '../campaign/campaign';
import type { Creature } from '../creature';
import type { CombatEvent } from '../model';

export type Danger = 'slight' | 'fair' | 'hard' | 'grave' | 'deadly';
export interface Reckoning { danger: Danger; text: string }

// How a fight with a group would likely go, as the company reckons it before it starts: the fight played out a few
// times from where everyone stands now, both sides fighting as the game's own tactics would. It decides nothing; it
// is what a seasoned eye makes of the odds, said by the most seasoned member in words, not numbers.
// A fight won is held when the foes lost more turns than they took, and by what was laid on them most (prone).
interface Trial { won: boolean; fell: string[]; hurt: number; held?: string }
interface Fight { odds: number; fallen: number; hurt: number; frail?: string; held?: string }
export class DangerSense {
  static readonly trials = 6;
  // How a foe is kept from fighting back, by what keeps it so; anything else, from fighting back.
  private static readonly keeping: Record<string, string> = { prone: 'down', asleep: 'asleep' };
  private static readonly reckoned = new Map<string, Reckoning>();
  static reckon(campaign: Campaign, group: string): Reckoning | undefined {
    const read = campaign.readout;
    const foes = this.standing(campaign, read.inhabitants[group] ?? []), ours = this.standing(campaign, read.partyIds);
    if (!foes.length || !ours.length) { return undefined; }
    const key = JSON.stringify([group, ...[...ours, ...foes].map(c => [c.id, c.state.hp, c.state.mana, c.base.level,
      c.state.conditions.map(s => s.id)])]);
    return this.kept(key, () => this.judge(this.play(ours, foes, key,
      Environment.encounter(campaign.world, campaign.playerActor)), ours, foes));
  }
  // A fight already joined, as it would go from where everyone stands: what the company reckons in the moment before
  // one that came at it closes, and backs away from if it is beyond it (PT-10). The place's laws are held by the
  // fighters already.
  static of(battle: Battle): Reckoning {
    const standing = battle.state.combatants.filter(f => f.hp > 0);
    const ours = standing.filter(f => f.team === 'fighters').map(f => CombatProjection.creature(f));
    const foes = standing.filter(f => f.team !== 'fighters').map(f => CombatProjection.creature(f));
    const key = JSON.stringify(['joined', ...standing.map(f => [f.id, f.hp, f.mana, f.level, f.statuses.map(s => s.id)])]);
    return this.kept(key, () => this.judge(this.play(ours, foes, key, { laws: [] }), ours, foes));
  }
  private static kept(key: string, reckon: () => Reckoning): Reckoning {
    let reckoning = this.reckoned.get(key);
    if (!reckoning) {
      reckoning = reckon();
      if (this.reckoned.size > 200) { this.reckoned.clear(); }
      this.reckoned.set(key, reckoning);
    }
    return reckoning;
  }
  private static standing(campaign: Campaign, ids: readonly string[]): Creature[] {
    const creatures = campaign.readout.creatures;
    return ids.map(id => creatures.find(c => c.id === id)).filter((c): c is Creature => !!c && c.state.hp > 0);
  }
  // The fight played out: how often the company wins, and in a win, how many of it fall, how hurt it is, and who fell
  // most often.
  private static play(ours: Creature[], foes: Creature[], key: string,
    place: ReturnType<typeof Environment.encounter>): Fight {
    const played: Trial[] = [];
    for (let trial = 0; trial < this.trials; trial++) {
      played.push(this.trial(ours, foes, `${key}:${trial}`, place));
      // Half the trials lost leave no doubt.
      if (trial === this.trials / 2 - 1 && played.every(t => !t.won)) {
        return { odds: 0, fallen: ours.length, hurt: 1 };
      }
    }
    // Six fights decide most reckonings; one in the uneven middle (could be lost, or likely won) is played six more
    // times before it is said (M16's free play heard "you would likely beat them" of a fight won less than half the
    // time, from four wins in six).
    const first = played.filter(t => t.won).length / this.trials;
    for (let trial = this.trials; first >= 0.25 && first < 0.9 && trial < this.trials * 2; trial++) {
      played.push(this.trial(ours, foes, `${key}:${trial}`, place));
    }
    const won = played.filter(t => t.won), falls = new Map<string, number>();
    for (const id of won.flatMap(t => t.fell)) { falls.set(id, (falls.get(id) ?? 0) + 1); }
    const frail = [...falls].sort((a, b) => b[1] - a[1])[0]?.[0], held = this.heldBy(won);
    return { odds: won.length / played.length,
      fallen: won.length ? won.reduce((n, t) => n + t.fell.length, 0) / won.length : ours.length,
      hurt: won.length ? won.reduce((n, t) => n + t.hurt, 0) / won.length : 1, ...frail ? { frail } : {},
      ...held ? { held } : {} };
  }
  // What kept the foes from fighting back in most of the fights won, if they were kept so: a lone barrow-king, a
  // level-five revenant, read "no match" to a fresh warrior because Sweep had him prone nearly every turn of it.
  private static heldBy(won: Trial[]): string | undefined {
    const held = won.flatMap(t => t.held ? [t.held] : []), counts = new Map<string, number>();
    if (held.length * 2 <= won.length) { return undefined; }
    for (const h of held) { counts.set(h, (counts.get(h) ?? 0) + 1); }
    return [...counts].sort((a, b) => b[1] - a[1])[0]![0];
  }
  // Whether the foes lost more turns than they took in a fight, and to what was laid on them most often.
  private static held(events: CombatEvent[], foes: Set<string>): Pick<Trial, 'held'> {
    const lost = events.filter(e => e.type === 'skip' && foes.has(e.actor)).length;
    const taken = events.filter(e => e.type === 'action' && foes.has(e.command.actor)).length;
    if (lost <= taken) { return {}; }
    const laid = new Map<string, number>();
    for (const e of events) {
      if (e.type === 'status' && foes.has(e.target) && !foes.has(e.actor) && Effects.skips(e.detail)) {
        laid.set(e.detail, (laid.get(e.detail) ?? 0) + 1);
      }
    }
    return { held: [...laid].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'held' };
  }
  // One fight played out: whether the company won it, who of it fell, and how hurt it came out.
  private static trial(ours: Creature[], foes: Creature[], seed: string,
    place: ReturnType<typeof Environment.encounter>): Trial {
    const store = new CreatureStore(structuredClone([...ours, ...foes]));
    const battle = Battle.encounter(store, [...ours.map(c => ({ creatureId: c.id, team: 'fighters' as const })),
      ...foes.map(c => ({ creatureId: c.id, team: 'goblins' as const }))], { seed, maxTurns: 150, ...place });
    while (!battle.state.outcome) { battle.step(Tactics.choose(battle.state, battle.plain(battle.legalCommands()))); }
    if (battle.state.outcome !== 'fighters') { return { won: false, fell: [], hurt: 1 }; }
    const company = battle.state.combatants.filter(f => f.team === 'fighters');
    return { won: true, fell: company.filter(f => f.hp === 0).map(f => f.id),
      hurt: 1 - company.reduce((sum, f) => sum + f.hp, 0) / ours.reduce((sum, c) => sum + c.state.hp, 0),
      ...this.held(battle.events, new Set(foes.map(f => f.id))) };
  }
  // Anyone falling in any of the fights played out makes it a hard one: one who falls may not get up. Who would
  // fall is said by name (Wenna, at seven hit points, where the beetles are no match for Tharash).
  private static judge(fight: Fight, ours: Creature[], foes: Creature[]): Reckoning {
    // One who is of a people is spoken of as they are, as a band is: not "it"; one person alone, by name ("Sir Hamo
    // Ashdown is more than you can take", where a challenge to single combat had read "They are more than the company
    // can take" to one who had come alone).
    const people = foes.length > 1 || foes.some(f => !!Canon.ancestries[f.raceId]);
    const one = foes.length === 1 && people ? foes[0]!.name.split(', ')[0] : undefined;
    const they = one ? `${one} is` : people ? 'they are' : 'it is', them = one ?? (people ? 'them' : 'it');
    const danger: Danger = fight.odds < 0.25 ? 'deadly' : fight.odds < 0.6 ? 'grave'
      : fight.odds < 0.9 || fight.fallen > 0 ? 'hard' : fight.hurt > 0.25 ? 'fair' : 'slight';
    // The most seasoned says it; of one who would fall, someone else does.
    const judge = [...ours].sort((a, b) => Number(a.id === fight.frail) - Number(b.id === fight.frail)
      || b.base.level - a.base.level || b.state.experience - a.state.experience)[0]!;
    // Alone, the one who could fall is you, and no one would get you up (a lone warrior took on hobs reckoned only
    // "someone could fall", and died).
    const frail = ours.length === 1 ? 'you' : ours.find(c => c.id === fight.frail)?.name;
    const said: Record<Danger, string> = {
      deadly: `${they} more than ${ours.length === 1 ? 'you' : 'the company'} can take`,
      grave: `a fight with ${them} could be lost`,
      hard: `you would likely beat ${them}, but ${frail ?? 'someone'} could fall${ours.length === 1
        ? ', with no one to get you up' : ''}`,
      fair: `you should beat ${them}, though not unhurt`,
      slight: `${they} no match for you`,
    };
    // An easy win that rests on keeping the foe from fighting back says so: the company that does not, or cannot,
    // meets the foe as it is.
    const told = said[danger] + (fight.held && (danger === 'slight' || danger === 'fair')
      ? `, so long as you keep ${one ? 'them' : them} ${this.keeping[fight.held] ?? 'from fighting back'}` : '');
    return { danger, text: ours.length > 1 ? `${judge.name} reckons ${told}.`
      : `${told.charAt(0).toUpperCase()}${told.slice(1)}.` };
  }
}
