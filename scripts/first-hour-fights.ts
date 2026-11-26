import { readFileSync } from 'node:fs';
import { PlayTool } from '../src/cli/play-tool';
import { Runner } from '../src/cli/runner';
import type { PlaySession } from '../src/session/play-session';
import type { CampaignEvent } from '../src/campaign/campaign-types';
import type { CombatEvent } from '../src/model';
import type { Danger } from '../src/presentation/danger-sense';
import { ScreenModel } from '../src/ui/screen-model';
import { AsMeant } from '../test/support/as-meant';
import { HonestPlayer } from '../test/support/honest-player';
import { FirstHourBands } from './first-hour-bands';

// The first hour's fights as the supported route's own company plays them (CB-01: "a pinned measure of the first
// hour's fights as played by the route's own company (one and a hire)"; BRIEF §3.3: consequential, legible, genuinely
// risky). Iscoed, the warrior and the hire the walk takes on: the golden walk's lines as meant (AsMeant), and the
// gold-follower (HonestPlayer, the page's lead for up to 80 steps). For each fight, read from the command's own
// record of it (CampaignEvent.combat): its rounds (one initiative a round), the hit points the company lost and
// whether any of it was hit, whether the foes' leader (the stoutest of them) lived past the first round, how it ended,
// and what the company's reckoning said of the foe before it (Screen.people's reckoning, DangerSense), or that none
// was said, the fight having come at it. Then every band in the first hour's reach (FirstHourBands).
//   bun scripts/first-hour-fights.ts
export interface Fought {
  walk: string; turn: number; command: string; foes: string[]; rounds: number; lost: number; hit: boolean;
  leader?: string; leaderLived: boolean; ended: 'won' | 'fled' | 'fell' | 'undecided'; said: Danger | 'unsaid';
}
interface Walk { name: string; as: string; lines?: string; steps?: number }
// Where a fight was fought from: the walk, its turn, the company as it stood, and what was said of whom before it.
interface From { walk: string; turn: number; company: Set<string>; said: Map<string, Danger> }
export class FirstHourFights {
  static readonly walks: Walk[] = [
    { name: 'warrior', as: 'human/warrior/Wenna', lines: 'doc/architecture/mission-22/golden/warrior-walk.txt' },
    { name: 'gold', as: 'human/warrior/Wenna', steps: 80 }];
  // What the company's reckoning says now of each it could fight here.
  static said(s: PlaySession): Map<string, Danger> {
    return new Map(ScreenModel.build(s.campaign).people.flatMap(p => p.reckoning ? [[p.id, p.reckoning.danger]] : []));
  }
  static read(s: PlaySession, e: CampaignEvent, from: From): Fought {
    const c = e.combat, round: number[] = [], creatures = s.campaign.readout.creatures, { company } = from;
    let r = 0;
    for (const x of c) { if (x.type === 'initiative') { r++; } round.push(r); }
    const ids = new Set(c.flatMap(x => FirstHourFights.who(x)));
    const foes = [...ids].filter(id => !company.has(id) && creatures.some(k => k.id === id));
    const lost = c.reduce((n, x) => n + (x.type === 'damage' && company.has(x.target) ? x.amount : 0), 0);
    const hit = lost > 0 || c.some(x => x.type === 'attack' && x.success && company.has(x.target));
    const leader = [...foes].sort((a, b) => FirstHourFights.hp(s, b) - FirstHourFights.hp(s, a))[0];
    const at = leader ? FirstHourFights.died(c, leader) : -1;
    const fell = [...company].some(id => FirstHourFights.died(c, id) >= 0);
    const beaten = foes.length > 0 && foes.every(id => FirstHourFights.died(c, id) >= 0);
    const fled = c.some(x => x.type === 'flee' && x.success);
    const known = foes.map(id => from.said.get(id.replace(/_person$/, '')) ?? from.said.get(id)).find(Boolean);
    return { walk: from.walk, turn: from.turn, command: e.action, foes: foes.map(id => FirstHourFights.named(s, id)),
      rounds: r, lost, hit, ...leader ? { leader: FirstHourFights.named(s, leader) } : {},
      leaderLived: at < 0 || round[at]! > 1,
      ended: fell ? 'fell' : beaten ? 'won' : fled ? 'fled' : 'undecided', said: known ?? 'unsaid' };
  }
  private static hp(s: PlaySession, id: string): number {
    return s.campaign.readout.creatures.find(k => k.id === id)?.base.maxHp ?? 0;
  }
  private static named(s: PlaySession, id: string): string {
    return `${s.campaign.readout.creatures.find(k => k.id === id)?.name ?? id} (${FirstHourFights.hp(s, id)} hp)`;
  }
  private static who(x: CombatEvent): string[] {
    return [...'actor' in x ? [x.actor] : [], ...'target' in x ? [x.target] : []];
  }
  private static died(c: CombatEvent[], id: string): number {
    return c.findIndex(x => x.type === 'death' && x.actor === id);
  }
  static async walk(w: Walk): Promise<Fought[]> {
    const { journey } = await PlayTool.start(PlayTool.parse(['--earned', '--world', 'iscoed', '--as', w.as]));
    const s = journey.session, r = new Runner(s), honest = new HonestPlayer(s), out: Fought[] = [];
    const lines = w.lines ? readFileSync(w.lines, 'utf8').split('\n').filter(l => l.trim() && !l.startsWith('#'))
      : Array.from({ length: w.steps ?? 0 }, () => '');
    const said = new Map<string, Danger>();
    for (const [turn, line] of lines.entries()) {
      for (const [id, d] of this.said(s)) { said.set(id, d); }
      const from = s.campaign.history.length, company = new Set(s.campaign.readout.partyIds);
      if (w.lines) { await AsMeant.ask(r, line); } else if (!await honest.step()) { break; }
      for (const e of s.campaign.history.slice(from)) {
        if (e.combat.some(x => x.type === 'initiative')) { out.push(this.read(s, e, { walk: w.name, turn, company, said })); }
      }
      if (ScreenModel.build(s.campaign).party.every(m => m.hp <= 0)) { break; }
    }
    return out;
  }
  static async main(): Promise<number> {
    for (const w of this.walks) {
      const fought = await this.walk(w);
      for (const f of fought) {
        console.log([f.walk, f.turn, f.command, f.foes.join('+'), `rounds ${f.rounds}`, `lost ${f.lost}`,
          f.hit ? 'hit' : 'unhit', `leader ${f.leader ?? '-'} ${f.leaderLived ? 'lived' : 'dead in round 1'}`, f.ended,
          `said ${f.said}`].join(' | '));
      }
      console.log(`${w.name}: ${fought.length} fights`);
    }
    const begun = (await PlayTool.start(PlayTool.parse(['--earned', '--world', 'iscoed', '--as', 'human/warrior/Wenna']))).journey;
    for (const b of FirstHourBands.bands(begun.session.campaign, 10)) {
      console.log([b.name, b.where, `${b.minutes} min`, `${b.members} foes`, `said ${b.said}`, `won ${b.won}/${b.trials}`,
        `fell ${b.fell}`, `rounds ${FirstHourBands.median(b.rounds)}`, `lost ${FirstHourBands.median(b.lost)}`,
        `hit ${b.hit}/${b.trials}`, `leader past round 1 ${b.leaderLived}/${b.trials}`].join(' | '));
    }
    return 0;
  }
}
if (import.meta.main) { process.exit(await FirstHourFights.main()); }
