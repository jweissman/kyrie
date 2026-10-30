import { Battle } from '../src/battle';
import { CreatureStore } from '../src/creature-store';
import type { Creature } from '../src/creature';
import type { CombatEvent, Command, Moment } from '../src/model';
import { DangerSense, type Danger } from '../src/presentation/danger-sense';

// One band against one company, set up as the game sets up the fight (Campaign.encounterBattle): the place's laws,
// weariness and readiness (Environment.encounter), and the moment a fight that came at the company gives it.
export interface Setup {
  seed: string; company: Creature[]; foes: Creature[]; lead: string; prisoners: boolean; moment?: Moment;
  place: { environment?: string; laws: string[]; weary?: string[]; ready?: string[] };
}
// What came of a band's trials: won (the band beaten or driven off), escaped (the company got away), died (beaten
// by those who kill), taken (beaten by those who take prisoners: Mercy), undecided (the turn limit), declined (a
// careful company that was given a turn and did not take on a fight it reckoned beyond it). fell: the one who plays
// down at the end; tried: fights in which the company tried to get away; attempts and away: its tries, and those
// that came off.
export interface Tally {
  trials: number; won: number; escaped: number; died: number; taken: number; undecided: number; declined: number;
  fell: number; tried: number; attempts: number; away: number;
}
export type Policy = 'stand' | 'careful';

// The fights, both sides by the game's own choice (Campaign.autofight: battle.chosen()), for two companies:
//   stand: fights every band to the end, as PT-11's investigation and the page's reckoning (DangerSense) did;
//   careful: a novice who does what the page tells it to stay alive. Given a turn (a warning, or a band that holds
//     off), it takes on no fight the page reckons grave or deadly. In a fight, it runs on its own turn in the moment
//     before one that came at it closes (sure, PT-10) if the page's word then is grave or deadly, and whenever the one
//     who plays is at half their hit points or fewer.
export class NoviceFights {
  static readonly maxTurns = 150;
  static readonly beyond: ReadonlySet<Danger> = new Set<Danger>(['grave', 'deadly']);
  static empty(): Tally {
    return { trials: 0, won: 0, escaped: 0, died: 0, taken: 0, undecided: 0, declined: 0, fell: 0, tried: 0,
      attempts: 0, away: 0 };
  }
  // The page's reckoning before a fight the company is given a turn to choose: DangerSense.reckon plays the fight
  // out from where everyone stands, both sides by the game's tactics, as the trials standing do, and reads the odds
  // first (more than the company can take under a quarter, could be lost under three in five); the rest of its
  // reading (hard, fair, slight) is by who falls and how hurt, and is not needed here.
  static odds(stand: Tally): Danger {
    const won = stand.won / (stand.trials || 1);
    return won < 0.25 ? 'deadly' : won < 0.6 ? 'grave' : won < 0.9 ? 'hard' : 'fair';
  }
  // What the page says in the moment before a fight that came at the company closes (DangerSense.of, shown with the
  // fight's opening by CombatModel), as it says it when the company acts first.
  static said(setup: Setup): Danger { return DangerSense.of(this.battle(setup, `${setup.seed}:said`)).danger; }
  static trials(setup: Setup, policy: Policy, n: number): Tally {
    const tally = this.empty();
    for (let t = 0; t < n; t++) { this.fight(setup, policy, `${setup.seed}:${policy}:${t}`, tally); }
    return tally;
  }
  static declined(n: number): Tally { return { ...this.empty(), trials: n, declined: n }; }
  private static battle(setup: Setup, seed: string): Battle {
    const store = new CreatureStore(structuredClone([...setup.company, ...setup.foes]));
    return Battle.encounter(store, [...setup.company.map(c => ({ creatureId: c.id, team: 'fighters' as const })),
      ...setup.foes.map(c => ({ creatureId: c.id, team: 'goblins' as const }))],
    { seed, maxTurns: this.maxTurns, ...setup.place, ...setup.moment ? { moment: setup.moment } : {} });
  }
  private static fight(setup: Setup, policy: Policy, seed: string, tally: Tally) {
    const battle = this.battle(setup, seed), ours = new Set(setup.company.map(c => c.id));
    const told: CombatEvent[] = [];
    while (!battle.state.outcome) { told.push(...battle.step(this.next(battle, setup, policy))); }
    const flights = told.filter(e => e.type === 'flee' && ours.has(e.actor));
    tally.trials++;
    tally.attempts += flights.length;
    tally.away += flights.filter(e => e.type === 'flee' && e.success).length;
    if (flights.length) { tally.tried++; }
    const end = told.find(e => e.type === 'end'), outcome = battle.state.outcome;
    const routed = end?.type === 'end' && end.fled?.team === 'goblins';
    if (outcome === 'fighters' || (outcome === 'escaped' && routed)) { tally.won++; }
    else if (outcome === 'escaped') { tally.escaped++; }
    else if (outcome === 'goblins') { tally[setup.prisoners ? 'taken' : 'died']++; }
    else { tally.undecided++; }
    if ((battle.state.combatants.find(f => f.id === setup.lead)?.hp ?? 0) === 0) { tally.fell++; }
  }
  private static next(battle: Battle, setup: Setup, policy: Policy): Command {
    const chosen = battle.chosen();
    if (policy === 'stand' || !battle.playerControls(battle.state.actor) || !this.backs(battle, setup)) {
      return chosen;
    }
    return battle.legalCommands().find(c => c.ability === 'flee') ?? chosen;
  }
  private static backs(battle: Battle, setup: Setup): boolean {
    if (battle.opening && this.beyond.has(DangerSense.of(battle).danger)) { return true; }
    const lead = battle.state.combatants.find(f => f.id === setup.lead);
    return !!lead && lead.hp * 2 <= lead.maxHp;
  }
}
