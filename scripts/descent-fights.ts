import { PlayTool } from '../src/cli/play-tool';
import { Runner, type Said } from '../src/cli/runner';
import { RunnerFight } from '../src/cli/runner-fight';
import { StockOpenings } from '../src/world/stock-openings';
import { AsMeant } from '../test/support/as-meant';
import { FirstHourFights, type Fought } from './first-hour-fights';
import { NoviceFights, type Setup } from './novice-fights';
import { Environment } from '../src/campaign/environment';
import type { PlaySession } from '../src/session/play-session';
import type { CombatEvent } from '../src/model';

// The opening's and the first dungeon's fights on the representative route (CB-01: "the opening's and the first
// dungeon's fights cost hit points or a choice on the representative route; challenge measured per round"), as each
// calling plays them: the adit's badger (the stock opening), then the reference journey under Porthalen
// (test/features/world/the-loop-under-porthalen.pin, its steps by their words): the rats and the old buck, the quarry's
// spiders and their mother, the dead in the charnel passage and the man with the black candle, the keeper paid by its
// rite, and the goblin chief in the workings; and apart, the vault's keeper fought at once. For each fight, besides the
// first hour's measure of it (FirstHourFights.read: rounds, hit points lost, how it ended, the reckoning said): what
// the attack's row said beside it, and the ways the page offered with the foe that were not a fight.
//   bun scripts/descent-fights.ts [warrior|thief|mage …]
type Row = { id: string; label: string; aside?: string; opens?: Row[] };
// swung, landed: the foes' attacks on the company and those that hit; need: the least a foe's d20 needed to.
// tried: the same fight over seeded trials, set up as the game sets one up, the company as it stood: won and fell of
// how many, the median rounds and hit points lost, and in how many it lost any.
export interface Tried { trials: number; won: number; fell: number; rounds: number; lost: number; hit: number }
export interface Met extends Fought {
  calling: string; step: string; aside?: string; other: string[]; swung: number; landed: number; need: number;
  tried?: Tried;
}
export class DescentFights {
  // Every row the runner offers, those opened under others too, and the lenses'.
  private static rows(s: Said): Row[] {
    const lensed = Object.values(s.offer?.lenses ?? {}).flat();
    return this.flat([...s.offer?.primary ?? [], ...s.offer?.rest ?? [], ...lensed] as Row[]);
  }
  private static flat(rs: Row[]): Row[] { return rs.flatMap(r => [r, ...this.flat(r.opens ?? [])]); }
  private static median(xs: number[]): number { return [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)] ?? 0; }
  static readonly callings: Record<string, string> = { warrior: 'human/warrior/Wenna', thief: 'human/thief/Haze',
    mage: 'elf/mage/Ilse/scholar' };
  // Out of the adit by its rows' words, as the page walk goes (test/page-walk-browser), the badger fought on the way.
  static readonly adit = ['?~light a (torch|candle)', '~To the old gallery', '~^Attack', 'through',
    '~Heave the fallen prop up alone', '~old drift', '~To the landing at Porthalen'];
  // And as a careful life of few hit points goes: Dai asked along, and the prop lifted with him, not heaved alone (a
  // mage heaving it alone after the badger's bout had died of it: OR-226).
  static readonly aditWithDai = ['?~light a (torch|candle)', '~To the old gallery', '~^Attack', 'through',
    '~tell Dai you will get him out', '?~(Ask|Take) Dai', '~Lift the fallen prop with Dai', '~old drift',
    '~To the landing at Porthalen'];
  // The loop pin's route, by the words of its rows (see the pin for what each part is).
  static readonly established = ['~Read the notice on the well-post', "~To Holgar's salt-house",
    '~Ask Holgar about the rats in the corn-store', '~Buy a torch for', '~Buy one ration from Holgar',
    '~To the old corn-store', '?~Light a torch', '~Down to the corn-store cellar', '~To the rat-runs', '~Attack the rats',
    'through', '~Down to the nest', '~Attack the old buck rat', 'through', '?~light a candle', '~Search here',
    '~Out to the landing at Porthalen', "~To Holgar's salt-house", '~Tell Holgar the rats under the corn-store are dead',
    '~To the taproom of the Stone Horn', '~Talk to Kynes', '~Take a bed and supper', '~Out to the landing at Porthalen',
    "~To Holgar's salt-house", '~Fill a lantern', '~To the landing at Porthalen'];
  static readonly careful = ['~To the old quarry pit', '~quarry adit', '~cut gallery', '~Attack the spider',
    'through', '~To the brood-chamber', "~Attack the spiders' mother", 'through', '~Search here', '~To the cut gallery',
    '~Down to the old working face', '~undercroft', '~Rest six hours', '~To the charnel passage',
    '~Attack the dead in the charnel passage', 'through', '~ossuary', '~Attack the man with the black candle', 'through',
    '~Collect a book of the dead', '~Down to the charnel passage', '~To the undercroft', '~Rest six hours',
    '~Press the three deep-cut letters', '~sealed vault', "~Lay ten coin at the keeper's feet",
    '~Down to the stair below the vault', '~way in'];
  static readonly workings = ['~To the adit$', '~Search here', '~crossing', '~Look closely at the humming thing',
    '~To the old stope', '~Search here', '~To a worked-out stope$', '~Attack the goblin chief', 'through'];
  static readonly churchyard = ['~To the churchyard', '~(Set your shoulder to|Pick the old lock of) the stone door', '~crypt', '~ossuary',
    '~Attack the man with the black candle', 'through', '~Search here', '~Down to the charnel passage',
    '~Attack the dead in the charnel passage', 'through', '~To the undercroft', '~Rest six hours',
    '~Press the three deep-cut letters', '~sealed vault', '~Attack the keeper of the vault', 'through'];
  // One calling down one route: the opening, then the steps; each fight as it was met. A step not offered ends it.
  static async walk(calling: string, route: readonly string[]): Promise<{ met: Met[]; stopped?: string }> {
    const as = this.callings[calling]!;
    // Each calling come down the drove road to Porthalen, the town the journey is under (a mage of the weir life comes
    // out of the adit to Gatesend).
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', as, '--origin', 'drove',
      '--opening', StockOpenings.chosen('iscoed') ?? StockOpenings.none]));
    const s = journey.session, r = new Runner(s), met: Met[] = [];
    let said: Said = r.said('look'), aside: string | undefined, step = '', other: string[] = [];
    let known = FirstHourFights.said(s), tried: Tried | undefined;
    const steps = [...calling === 'mage' ? this.aditWithDai : this.adit, ...route];
    let last = '';
    for (const step0 of steps) {
      // A step marked ? is taken where it is offered (a light already lit is not lit again).
      const optional = step0.startsWith('?'), at = optional ? step0.slice(1) : step0;
      if (said.end) { return { met, stopped: `the company fell at ${last}, before ${at}` }; }
      const row = at.startsWith('~') ? this.rows(said).find(x => new RegExp(at.slice(1), 'i').test(x.label)) : undefined;
      if (optional && !row) { continue; }
      last = row ? `${row.label}${row.aside ? ` [${row.aside}]` : ''}` : at;
      if (at.startsWith('~') && !row) {
        return { met, stopped: `not offered: ${at} (${this.rows(said).map(x => x.label).slice(0, 12).join('; ')})` };
      }
      // What was said of the foe is read as the attack is chosen, before the fight's own frame.
      if (row && /^Attack/i.test(row.label)) {
        [aside, step, other, known] = [row.aside, row.label, this.other(said, row), FirstHourFights.said(s)];
        tried = this.tried(s, row.id.replace(/\/0:.*$/, ''));
      } else if (at !== 'through') { known = FirstHourFights.said(s); }
      const from = s.campaign.history.length, company = new Set(s.campaign.readout.partyIds);
      const line = JSON.stringify({ act: row?.id ?? RunnerFight.through });
      const next = await AsMeant.ask(r, line);
      if ('error' in next) { return { met, stopped: `${at}: ${next.error}` }; }
      said = next;
      for (const e of s.campaign.history.slice(from).filter(x => x.combat.some(c => c.type === 'initiative'))) {
        const f = FirstHourFights.read(s, e, { walk: calling, turn: met.length, company, said: known });
        const struck = e.combat.filter(c => c.type === 'attack' && company.has(c.target));
        const needs = struck.map(c => c.type === 'attack' ? c.need : 0);
        met.push({ ...f, calling, step: step || e.action, ...aside ? { aside } : {}, other,
          swung: struck.length, landed: struck.filter(c => c.type === 'attack' && c.success).length,
          need: needs.length ? Math.min(...needs) : 0, ...tried ? { tried } : {} });
        [aside, step, other, tried] = [undefined, '', [], undefined];
      }
    }
    return { met };
  }
  // The fight with whoever the attack is on, fought over seeded trials from where the company stands, as it stands.
  static tried(s: PlaySession, subject: string, trials = 40): Tried | undefined {
    const c = s.campaign, creatures = c.readout.creatures, party = c.playerActor!, ids = c.readout.partyIds;
    const foes = creatures.filter(k => k.id.startsWith(`${subject}_person`) && k.state.hp > 0);
    const company = ids.map(id => creatures.find(k => k.id === id)).filter(k => !!k).map(k => structuredClone(k));
    if (!foes.length || !company.length) { return undefined; }
    const setup: Setup = { seed: `descent:${subject}`, catalog: c.catalog, company, foes, lead: company[0]!.id, prisoners: false,
      place: Environment.encounter(c.world, party, ids, subject) };
    const out = { trials, won: 0, fell: 0, rounds: [] as number[], lost: [] as number[], hit: 0 };
    for (let t = 0; t < trials; t++) {
      const battle = NoviceFights.battle(setup, `${setup.seed}:${t}`), told: CombatEvent[] = [];
      while (!battle.state.outcome) { told.push(...battle.step(battle.chosen())); }
      const lost = told.reduce((n, x) => n + (x.type === 'damage' && ids.includes(x.target) ? x.amount : 0), 0);
      out.rounds.push(told.filter(x => x.type === 'initiative').length); out.lost.push(lost);
      if (lost > 0) { out.hit++; }
      if (battle.state.outcome === 'fighters') { out.won++; }
      if ((battle.state.combatants.find(f => f.id === setup.lead)?.hp ?? 0) === 0) { out.fell++; }
    }
    return { trials, won: out.won, fell: out.fell, rounds: this.median(out.rounds), lost: this.median(out.lost),
      hit: out.hit };
  }
  // The ways the page offered with the foe that are not a fight: its other rows, but for looking at it.
  private static other(said: Said, attack: Row): string[] {
    const subject = attack.id.replace(/\/0:.*$/, '');
    return this.rows(said).filter(x => x.id.startsWith(`${subject}/`) && x !== attack && !/^Attack|#look$/.test(x.label))
      .map(x => x.label);
  }
  static async main(args: string[]): Promise<number> {
    for (const calling of args.length ? args : Object.keys(this.callings)) {
      for (const [name, route] of [['descent', [...this.established, ...this.careful, ...this.workings]],
        ['keeper', [...this.established, ...this.churchyard]]] as const) {
        const { met, stopped } = await this.walk(calling, route);
        for (const f of met) {
          console.log([calling, name, f.step, f.foes.join('+'), `rounds ${f.rounds}`, `lost ${f.lost}`,
            `struck ${f.landed}/${f.swung} needing ${f.need}+`, f.ended, f.tried ? `over ${f.tried.trials}: won ${f.tried.won}, `
              + `fell ${f.tried.fell}, hurt ${f.tried.hit}, rounds ${f.tried.rounds}, lost ${f.tried.lost}` : 'untried',
            `said ${f.said}`, `aside ${f.aside ?? '-'}`, `else ${f.other.join('; ') || 'none'}`].join(' | '));
        }
        console.log(`${calling} ${name}: ${met.length} fights${stopped ? `, stopped: ${stopped}` : ''}`);
      }
    }
    return 0;
  }
}
if (import.meta.main) { process.exit(await DescentFights.main(process.argv.slice(2))); }
