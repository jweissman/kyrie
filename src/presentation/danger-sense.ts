import { LevelDrain } from '../rules/level-drain';
import { Canon } from '../canon/canon';
import { Battle } from '../battle';
import { Beside } from '../campaign/beside';
import { CombatProjection } from '../combat-projection';
import { CreatureStore } from '../creature-store';
import { Tactics } from '../tactics';
import { Effects } from '../effects';
import { Environment } from '../campaign/environment';
import { ConditionSense } from './condition-sense';
import type { Campaign } from '../campaign/campaign';
import type { Creature } from '../creature';
import type { CombatEvent, Fighter, Moment } from '../model';

export type Danger = 'slight' | 'fair' | 'hard' | 'grave' | 'deadly';
export interface Reckoning { danger: Danger; text: string }

// Where a fight is fought, and, for one already joined, how it opened.
type Place = ReturnType<typeof Environment.encounter> & { moment?: Moment };

// How a fight with a group would likely go, as the company reckons it before it starts: the fight played out a few
// times from where everyone stands now, both sides fighting as the game's own tactics would. It decides nothing; it
// is what a seasoned eye makes of the odds, said by the most seasoned member in words, not numbers.
// A fight won is held when the foes lost more turns than they took, and by what was laid on them most (prone). The
// company's blows that landed on the foes, and how many of them the foes mostly shrugged off, and what the foes are
// hurt by, tell a fight that will be a grind before it is begun (PT-23).
interface Trial { won: boolean; fell: string[]; hurt: number; held?: string; blows: number; blunted: number;
  hurtBy: string[]; harmed?: boolean }
// worst: the most any fight won took; harmed: whether any left someone poisoned, or otherwise hurt past its end.
interface Fight { odds: number; fallen: number; hurt: number; frail?: string; held?: string; blunted: number;
  hurtBy: string[]; worst: number; harmed: boolean }
export class DangerSense {
  static readonly trials = 6;
  // How a foe is kept from fighting back, by what keeps it so; anything else, from fighting back.
  private static readonly keeping: Record<string, string> = { prone: 'down', asleep: 'asleep' };
  private static readonly reckoned = new Map<string, Reckoning>();
  static reckon(campaign: Campaign, group: string): Reckoning | undefined {
    const read = campaign.readout;
    const foes = this.standing(campaign, Beside.members(campaign.world, read.inhabitants, group));
    const ours = this.standing(campaign, read.partyIds);
    if (!foes.length || !ours.length) { return undefined; }
    // What each has in hand is part of it: a sword bought since is a different fight.
    // So is the level one stands at (drained of some), and what one has used today.
    // And whether the company has a light to fight by where it stands with them: in the dark it had been "easily won"
    // of what nobody could see. A band elsewhere is not reckoned by the light here, which is not the light there.
    const w = campaign.world, actor = campaign.playerActor;
    const together = !!actor && w.one('at', group) === w.one('at', actor);
    const dark = together ? Environment.dark(w, actor, read.partyIds) : {};
    // (The key seeds the trials: a fight in the light is keyed, and so reckoned, as it was before darkness counted.)
    const key = JSON.stringify([group, ...dark.dark ? ['dark'] : [], ...[...ours, ...foes].map(c => [c.id, c.state.hp,
      c.state.mana, LevelDrain.level(c), c.state.conditions.map(s => s.id),
      (c.state.inventory ?? []).filter(i => i.equipped).map(i => i.definition), c.state.daily ?? {}])]);
    // A bout is reckoned as it will be fought, and said to be one: the odds of a sparring bout had read as a killing
    // (the Quiet in the Sky's QIS-04).
    const place = { ...Environment.encounter(campaign.world, campaign.playerActor, [], group), ...dark };
    const reckoning = this.kept(key, () => {
      const reckoning = this.judge(this.play(ours, foes, key, place), ours, foes);
      return place.terms?.yields ? { ...reckoning, text: `${reckoning.text} ${DangerSense.bout}` } : reckoning;
    });
    this.foreseen.set(this.lineup(ours, foes), reckoning);
    if (this.foreseen.size > 200) { this.foreseen.delete(this.foreseen.keys().next().value!); }
    return reckoning;
  }
  // What the company reckoned of a fight before it began, by who would be in it and how each stands: a fight joined
  // is reckoned as it was foreseen until something in it has changed (someone hurt, a spell spent). Each reckoning is
  // a few fights played out, and two of them had said two things of one fight a breath apart: "Easily won: Sable
  // reckons it is no match for you" over the attack on a great centipede, then, the fight begun and no blow struck,
  // "Traubon reckons you would likely beat it, but Sable could fall" (the fresh playtest of 7 November).
  private static readonly foreseen = new Map<string, Reckoning>();
  private static lineup(ours: Creature[], foes: Creature[]): string {
    return JSON.stringify([ours, foes].map(side => side.toSorted((a, b) => a.id.localeCompare(b.id))
      .map(c => [c.id, c.state.hp, c.state.mana, LevelDrain.level(c), (c.state.ready ?? []).flat().length,
        (c.state.inventory ?? []).filter(i => i.equipped).map(i => i.definition).sort()])));
  }
  static readonly bout = 'It is a bout, to the first fall: no one will be killed.';
  // A fight already joined, as it would go from where everyone stands: what the company reckons in the moment before
  // one that came at it closes, and backs away from if it is beyond it (PT-10). The place's laws are held by the
  // fighters already. Each is built back with what they came in with: built from the fight alone, they had left
  // their packs and arms behind, and a warrior who won such a fight four times in four was told, fighting it again
  // with fists, "They are more than you can take" (the novice viability measure, 2026-10-30). And it is fought as it
  // opens: seen as it began, the company strikes first.
  static of(battle: Battle): Reckoning {
    const { ours, foes } = this.fighters(battle), standing = battle.state.combatants.filter(f => f.hp > 0);
    const foreseen = this.foreseen.get(this.lineup(ours, foes));
    if (foreseen) { return foreseen; }
    const moment = battle.opening;
    const key = JSON.stringify(['joined', moment ?? '', ...standing.map(f => [f.id, f.hp, f.mana, f.level,
      f.statuses.map(s => s.id), f.equipment.weapon.name, f.equipment.armorAc])]);
    return this.kept(key, () => this.judge(this.play(ours, foes, key, { laws: [], ...moment ? { moment } : {} }),
      ours, foes));
  }
  // Those still standing in a fight, each side, as the creatures they came into it as, less what they have spent.
  static fighters(battle: Battle): { ours: Creature[]; foes: Creature[] } {
    const standing = battle.state.combatants.filter(f => f.hp > 0);
    return { ours: standing.filter(f => f.team === 'fighters').map(f => this.back(battle, f)),
      foes: standing.filter(f => f.team !== 'fighters').map(f => this.back(battle, f)) };
  }
  private static back(battle: Battle, f: Fighter): Creature {
    return CombatProjection.creature(f, battle.original(f.id));
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
  private static play(ours: Creature[], foes: Creature[], key: string, place: Place): Fight {
    const played: Trial[] = [];
    // Six fights decide most reckonings, all six played: three lost to begin with had been taken to leave no doubt,
    // and two great rats a warrior beats two times in three were "more than you can take" (a1's corn-store, 3
    // November). One won some of the time and not nearly always is played six more times before it is said (M16's
    // free play heard "you would likely beat them" of a fight won less than half the time, from four wins in six).
    for (let trial = 0; trial < this.trials; trial++) { played.push(this.trial(ours, foes, `${key}:${trial}`, place)); }
    // And one won every time but only just (a lone cleric left at a hit point by the corn-store's rats, which kill one
    // in four: told "You should beat them", she died: M19-87) is played six more times too.
    const first = played.filter(t => t.won).length / this.trials, near = played.some(t => t.won && t.hurt > 0.6);
    // One whose first six fall between the bands (a third to nine in ten) is played eighteen times in all: twelve had
    // reckoned an owlbear a novice beats sixteen times in forty as one he would likely beat (M19-122).
    const more = first > 0.3 && first < 0.9 ? this.trials * 3 : this.trials * 2;
    for (let trial = this.trials; first > 0 && (first < 0.9 || near) && trial < more; trial++) {
      played.push(this.trial(ours, foes, `${key}:${trial}`, place));
    }
    const won = played.filter(t => t.won), falls = new Map<string, number>();
    for (const id of won.flatMap(t => t.fell)) { falls.set(id, (falls.get(id) ?? 0) + 1); }
    const frail = [...falls].sort((a, b) => b[1] - a[1])[0]?.[0], held = this.heldBy(won);
    return { odds: won.length / played.length,
      fallen: won.length ? won.reduce((n, t) => n + t.fell.length, 0) / won.length : ours.length,
      hurt: won.length ? DangerSense.worse(won.map(t => t.hurt)) : 1, ...frail ? { frail } : {},
      worst: Math.max(0, ...won.map(t => t.hurt)), harmed: won.some(t => t.harmed),
      ...held ? { held } : {}, ...this.bite(played) };
  }
  // How hurt the company could come out of a fight it wins: as it does one time in four, not on average (two great
  // rats were "no match" to a fresh warrior on their mean, and one bit him from fifteen to six: Mission 19's play).
  private static worse(hurts: number[]): number {
    const sorted = hurts.toSorted((a, b) => b - a), mean = hurts.reduce((n, h) => n + h, 0) / (hurts.length || 1);
    return Math.max(mean, sorted[Math.floor(sorted.length / 4)] ?? 0);
  }
  // How much of what the company landed the foes shrugged off, over every fight played, and what hurts them more.
  private static bite(played: Trial[]): Pick<Fight, 'blunted' | 'hurtBy'> {
    const blows = played.reduce((n, t) => n + t.blows, 0), blunted = played.reduce((n, t) => n + t.blunted, 0);
    return { blunted: blows ? blunted / blows : 0, hurtBy: played[0]?.hurtBy ?? [] };
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
  private static trial(ours: Creature[], foes: Creature[], seed: string, place: Place): Trial {
    const store = new CreatureStore(structuredClone([...ours, ...foes]));
    const battle = Battle.encounter(store, [...ours.map(c => ({ creatureId: c.id, team: 'fighters' as const })),
      ...foes.map(c => ({ creatureId: c.id, team: 'goblins' as const }))], { seed, maxTurns: 150, ...place });
    while (!battle.state.outcome) { battle.step(Tactics.choose(battle.state, battle.plain(battle.legalCommands()))); }
    const bite = this.blows(battle, new Set(ours.map(c => c.id)), new Set(foes.map(f => f.id)));
    // The last foe running off is the company's fight won, not lost (three rats with a flee in them, beaten in play,
    // had been reckoned "more than you can take": a1's corn-store, 3 November).
    const end = battle.events.findLast(e => e.type === 'end'), routed = battle.state.outcome === 'escaped'
      && end?.type === 'end' && !!end.fled && end.fled.team !== 'fighters';
    if (battle.state.outcome !== 'fighters' && !routed) { return { won: false, fell: [], hurt: 1, ...bite }; }
    const company = battle.state.combatants.filter(f => f.team === 'fighters');
    return { won: true, fell: company.filter(f => f.hp === 0).map(f => f.id),
      harmed: company.some(f => f.statuses.some(c => ConditionSense.tone(c.id) === 'hurt')),
      hurt: 1 - company.reduce((sum, f) => sum + f.hp, 0) / ours.reduce((sum, c) => sum + c.state.hp, 0),
      ...this.held(battle.events, new Set(foes.map(f => f.id))), ...bite };
  }
  // The company's blows that landed on the foes in a fight, those half or more shrugged off, and the kinds of harm
  // any foe is the worse for.
  private static blows(battle: Battle, ours: Set<string>, foes: Set<string>): Pick<Trial, 'blows' | 'blunted' | 'hurtBy'> {
    const landed = battle.events.flatMap(e => e.type === 'damage' && ours.has(e.actor ?? '') && foes.has(e.target)
      ? [e.modifiers?.resistance ?? 0] : []);
    const hurtBy = new Set(battle.state.combatants.filter(f => foes.has(f.id))
      .flatMap(f => Object.entries(Effects.modifiers(f).resistances ?? {}).filter(([, v]) => v < 0).map(([k]) => k)));
    return { blows: landed.length, blunted: landed.filter(r => r >= 0.5).length, hurtBy: [...hurtBy].sort() };
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
    // Alone, a fight lost is the end of the game, so "likely" is three in four, not three in five (a lone warrior told
    // she would likely beat the quarry's spiders died to them: the builder's descent of 8 November, M19-122).
    const grave = ours.length === 1 ? 0.75 : 0.6;
    // No match for you only where no fight played went badly and none left anyone poisoned or otherwise hurt past its
    // end: a great centipede told "no match" bit a thief from eight to four and poisoned her (Mission 20's sixth round,
    // J 46–47), its venom a save, round the armour the fights played had mostly kept it from.
    const danger: Danger = fight.odds < 0.25 ? 'deadly' : fight.odds < grave ? 'grave'
      : fight.odds < 0.9 || fight.fallen > 0 ? 'hard'
        : fight.hurt > 0.25 || fight.worst > 0.4 || fight.harmed ? 'fair' : 'slight';
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
    return { danger, text: (ours.length > 1 ? `${judge.name} reckons ${told}.`
      : `${told.charAt(0).toUpperCase()}${told.slice(1)}.`) + this.grind(fight, them) };
  }
  // A fight in which most of what the company lands is shrugged off is a long one, whoever wins it, and says so
  // before it is begun, with what would serve better where the foe is the worse for something (PT-23).
  private static grind(fight: Fight, them: string): string {
    if (fight.blunted <= 0.5) { return ''; }
    const better = fight.hurtBy.filter(k => k !== 'all');
    return ` It will be long: your weapons barely bite ${them}${better.length ? `; ${better.join(' or ')} would serve better`
      : ''}.`;
  }
}
