import type { Campaign } from '../src/campaign/campaign';
import type { Creature } from '../src/creature';
import type { CombatEvent } from '../src/model';
import type { Danger } from '../src/presentation/danger-sense';
import { Marks } from '../src/ui/marks';
import { Environment } from '../src/campaign/environment';
import { ModuleWriter } from '../src/lang/module-writer';
import { NoviceCountry, type Band } from './novice-country';
import { NoviceFights, type Policy, type Setup } from './novice-fights';
import { NoviceMeeting, type Meeting } from './novice-meeting';

// A band of the first hour's reach fought by the route's company (CB-01; see scripts/first-hour-fights.ts), standing
// to the end, over seeded trials (the fight set up as the game sets one up: NoviceFights, NoviceMeeting): what the
// company's reckoning said of it before it began (DangerSense, as NoviceFights.said reads it), and per trial its
// rounds (one initiative a round), the hit points the company lost, whether the foes' leader (the stoutest) lived past
// the first round, how it ended (won; the foes routed; the company fled, or was beaten), and whether the one who plays
// fell. meeting, signed and heard: how the band meets the company as it comes where the band stands (NoviceMeeting):
// at once, or with a turn to back away first, and whether it shows itself on the way in, is heard next door, or is shut
// in behind a barred way.
export interface Banded {
  band: string; name: string; where: string; minutes: number; members: number; said: Danger; trials: number;
  // Whether the reckoning asks before it (Marks.asks), and whether its own fights felled the one who plays.
  asks: boolean; mortal: boolean;
  won: number; routed: number; fled: number; beaten: number; fell: number; rounds: number[]; lost: number[];
  hit: number; leaderLived: number; meeting: Meeting; signed: boolean; heard: boolean; shut: boolean;
}
// Which bands, and fought by whom: the one who plays alone, or hired, with the first town's hire (the default); the
// bands under and about a town as well (towns: NoviceCountry.read); those within reach minutes (the first hour's);
// fought by the game's tactics to the end (stand, the default), or carefully, running when it goes badly
// (NoviceFights' careful).
export interface Reckoned { who?: 'alone' | 'hired'; towns?: boolean; reach?: number; policy?: Policy }
export class FirstHourBands {
  // The first hour's reach: the bands within this many minutes of where a new life begins (the big ruin's barrow, the
  // first ruin's keeper, the raiders' ring-fort, Redkeep, the Numbered House), the nearest first.
  static readonly reach = 230;
  // The country's bands in reach of the start (begun: a new life's campaign as it stands at the start), fought by the
  // route's company, whole: the one who plays and the first town's hire (the cheapest: Carlin on the warrior's walk,
  // Gesk in Gatesend's guest-hall on the weir's).
  static bands(begun: Campaign, trials: number, how: Reckoned = {}): Banded[] {
    const { who = 'hired', towns = false, reach = this.reach, policy = 'stand' } = how;
    const country = NoviceCountry.read(begun, 'iscoed', towns), creatures = begun.readout.creatures;
    const hired = who === 'hired' ? country.hire?.members ?? [] : [];
    const ids = [...new Set([...begun.readout.partyIds, ...hired])];
    const company = ids.map(id => creatures.find(c => c.id === id))
      .filter((c): c is Creature => !!c).map(c => FirstHourBands.whole(c));
    const near = [...country.bands].filter(b => b.minutes <= reach).sort((a, b) => a.minutes - b.minutes);
    return near.flatMap(b => this.band(begun, b, company, { trials, policy }));
  }
  // The bands of one place and what lies within it (a dungeon, by its places' prefix: region__s1_ud_), each the group
  // standing there with members, fought by the one who plays alone (OR-1430: the reference seed's first dungeon).
  static within(begun: Campaign, prefix: string, trials: number): Banded[] {
    const world = begun.world, creatures = begun.readout.creatures, company = begun.readout.partyIds
      .map(id => creatures.find(c => c.id === id)).filter((c): c is Creature => !!c).map(c => FirstHourBands.whole(c));
    const members = new Map<string, string[]>();
    for (const r of world.related('memberOf')) { members.set(r.args[1]!, [...members.get(r.args[1]!) ?? [], r.args[0]!]); }
    const bands = world.related('at').filter(r => r.args[1]!.startsWith(prefix) && members.has(r.args[0]!)
      && r.args[0] !== begun.playerActor).map(r => ({ id: r.args[0]!, where: r.args[1]!, place: r.args[1]!,
      name: world.module.entities.find(e => e.id === r.args[0])?.name ?? r.args[0]!, installation: '', trouble: '',
      minutes: 0, members: (members.get(r.args[0]!) ?? [])
        .map(m => world.module.entities.find(e => e.id === m)?.creatureId ?? m) }));
    return bands.flatMap(b => this.band(begun, b, company, { trials, policy: 'stand' }));
  }
  // A member as a new life that has hired them stands: at full hit points.
  static whole(c: Creature): Creature {
    const made = structuredClone(c);
    made.state.hp = made.base.maxHp;
    return made;
  }
  static median(xs: number[]): number {
    const s = [...xs].sort((a, b) => a - b);
    return s[Math.floor(s.length / 2)] ?? 0;
  }
  private static band(campaign: Campaign, band: Band, company: Creature[], run: { trials: number; policy: Policy })
    : Banded[] {
    const { trials, policy } = run;
    const creatures = campaign.readout.creatures, world = campaign.world, party = campaign.playerActor!;
    const foes = band.members.map(id => creatures.find(c => c.id === id)).filter((c): c is Creature => !!c);
    const reading = NoviceMeeting.read(campaign, band, company);
    if (reading.tolerated || !foes.length) { return []; }
    const setup: Setup = { seed: `route:${band.id}`, catalog: campaign.catalog, company, foes, lead: company[0]!.id,
      prisoners: world.relates('takesPrisoners') && world.test(ModuleWriter.call('takesPrisoners', band.id)),
      place: Environment.encounter(world, party, company.map(c => c.id), band.id),
      ...reading.moment ? { moment: reading.moment } : {} };
    const said = NoviceFights.reckoned(setup);
    const out: Banded = { band: band.id, name: band.name, where: band.where, minutes: band.minutes,
      members: foes.length, said: said.danger, asks: Marks.asks(said), mortal: !!said.mortal, trials, won: 0,
      routed: 0, fled: 0, beaten: 0, fell: 0, rounds: [], lost: [], hit: 0, leaderLived: 0, meeting: reading.meeting,
      signed: reading.signed, heard: reading.heard, shut: reading.shut };
    const leader = [...foes].sort((a, b) => b.base.maxHp - a.base.maxHp)[0]!.id;
    for (let t = 0; t < trials; t++) { this.trial(setup, { seed: `${setup.seed}:${t}`, policy }, leader, out); }
    return [out];
  }
  private static trial(setup: Setup, run: { seed: string; policy: Policy }, leader: string, out: Banded) {
    const battle = NoviceFights.battle(setup, run.seed), told: CombatEvent[] = [];
    const ours = new Set(setup.company.map(c => c.id));
    while (!battle.state.outcome) { told.push(...battle.step(NoviceFights.next(battle, setup, run.policy))); }
    let r = 0, died = 0, lost = 0;
    for (const x of told) {
      if (x.type === 'initiative') { r++; }
      if (x.type === 'death' && x.actor === leader && !died) { died = r; }
      if (x.type === 'damage' && ours.has(x.target)) { lost += x.amount; }
    }
    out.rounds.push(r); out.lost.push(lost);
    if (lost > 0) { out.hit++; }
    if (!died || died > 1) { out.leaderLived++; }
    const outcome = battle.state.outcome, end = told.find(x => x.type === 'end');
    if (outcome === 'fighters') { out.won++; }
    if (outcome === 'escaped') { out[end?.type === 'end' && end.fled?.team === 'goblins' ? 'routed' : 'fled']++; }
    if (outcome === 'goblins') { out.beaten++; }
    if ((battle.state.combatants.find(f => f.id === setup.lead)?.hp ?? 0) === 0) { out.fell++; }
  }
}
