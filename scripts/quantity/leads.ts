import { PlayTool } from '../../src/cli/play-tool';
import { Runner, type Offered, type Said } from '../../src/cli/runner';
import { RunnerFight } from '../../src/cli/runner-fight';
import { RunnerOffer } from '../../src/cli/runner-offer';
import { Indicator } from '../../src/presentation/indicator';
import { Undertakings } from '../../src/presentation/undertakings';
import type { Aspect } from '../../src/presentation/glance-types';
import type { Module } from '../../src/lang/index';
import type { PlaySession } from '../../src/session/play-session';
import { HonestPlayer } from '../../test/support/honest-player';
import { QuantityWalks } from './walks';

// Pointless wandering on the reference game (the owner's playtest of 27 November: quests thin, few of the Atlas's
// colours met, the dungeon hard to find, circles walked looking for somewhere worth going; OR-1500). Each calling
// (warrior, mage, thief) begun in each of the reference town's lives (the five reasons a life comes to Oakhythe, as
// creation gives them by the kind of past chosen), on the reference seed, played for its first hour two ways:
// - by the page's own leads (HonestPlayer, the gold-follower), and
// - by a curious wanderer who never follows the gold: a way not yet taken first, else an act the page marks, else
//   back by the way least walked; whoever is met fought through.
// Read from each: (a) the moves from a new life to the first dungeon's mouth; (b) the Atlas's colours met, and those
// met above ground; (c) each aim taken up and seen through, and whether its seeing through opened anything later play
// reads (another aim, a fact some condition asks or a thing is hidden until, someone joined); (d) the moves made where
// the page marked nothing in reach worth going to but the aim's own gold (for the wanderer, nothing at all).
export interface Job { id: string; text: string; opens: string[] }
export interface Led {
  name: string; mouth: number | null; wandered: number | null; tones: string[]; above: string[]; jobs: Job[];
  blank: { led: number; wandered: number }; moves: { led: number; wandered: number };
  // Where the blank moves were made (the place stood in), each with how many.
  blanks: Record<string, number>;
}
interface Step { held: Set<string>; facts: Set<string>; members: number; history: number }
export class QuantityLeads {
  static readonly seed = 's0';
  static readonly callings = ['warrior', 'mage', 'thief'];
  static readonly origins = ['order', 'debt', 'wanderer', 'map', 'lost'];
  // The first hour: so many of the page's steps (each a choice the player makes, about a minute of play).
  static readonly steps = 60;
  static readonly mouth = 'region__s1_ud';
  static async run(callings = this.callings, origins = this.origins): Promise<Led[]> {
    const out: Led[] = [];
    for (const calling of callings) {
      for (const origin of origins) { out.push(await this.one(calling, origin)); }
    }
    return out;
  }
  static async one(calling: string, origin: string): Promise<Led> {
    const led = await this.led(calling, origin), wandered = await this.wandered(calling, origin);
    const blanks: Record<string, number> = {};
    for (const [at, n] of [...led.blanks, ...wandered.blanks]) { blanks[at] = (blanks[at] ?? 0) + n; }
    return { name: `${calling} ${origin}`, mouth: led.mouth, wandered: wandered.mouth, tones: led.tones, above: led.above,
      jobs: led.jobs, blank: { led: led.blank, wandered: wandered.blank },
      moves: { led: led.moves, wandered: wandered.moves }, blanks };
  }
  private static async start(calling: string, origin: string): Promise<PlaySession> {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', this.seed, '--as', `human/${calling}/Wenna`,
      '--opening', 'none', '--origin', origin]));
    return journey.session;
  }
  // By the page's leads.
  private static async led(calling: string, origin: string) {
    const s = await this.start(calling, origin), h = new HonestPlayer(s), r = new Runner(s);
    const reads = this.reads(s.campaign.module), tones = new Set<string>(), above = new Set<string>(), jobs: Job[] = [];
    const blanks: [string, number][] = [];
    let mouth: number | null = null, blank = 0;
    const pending: { job: Job; at: Step; left: number }[] = [];
    let was = this.step(s);
    for (let i = 0; i < this.steps && s.campaign.running; i++) {
      const ok = await h.step().catch(() => false), now = this.step(s), said = r.said();
      const turned = QuantityWalks.turned(r, said);
      for (const t of Object.keys(turned.tones)) { tones.add(t); if (!this.below(s)) { above.add(t); } }
      if (!turned.fight && !this.besides(said, true)) {
        blank += now.history - was.history; blanks.push([this.here(s), now.history - was.history]);
      }
      // An aim seen through: what it opened is read over the next two steps (what is said on its heels).
      for (const id of [...was.held].filter(x => !now.held.has(x))) {
        const o = s.campaign.module.objectives?.find(x => x.id === id);
        pending.push({ job: { id, text: o?.text ?? id, opens: [] }, at: was, left: 2 });
      }
      for (const p of pending.filter(x => x.left >= 0)) {
        p.job.opens = this.opened(p.at, now, p.job.id, reads);
        if (--p.left < 0) { jobs.push(p.job); }
      }
      if (mouth === null && this.below(s)) { mouth = now.history; }
      was = now;
      if (!ok) { break; }
    }
    jobs.push(...pending.filter(p => p.left >= 0).map(p => p.job));
    return { mouth, tones: [...tones].sort(), above: [...above].sort(), jobs, blank, blanks, moves: was.history };
  }
  // By a curious wanderer, who never follows the gold.
  private static async wandered(calling: string, origin: string) {
    const s = await this.start(calling, origin), r = new Runner(s), walked = new Map<string, number>();
    const tried = new Set<string>(), blanks: [string, number][] = [];
    let said: Said = r.said('look'), mouth: number | null = null, blank = 0;
    for (let i = 0; i < this.steps && s.campaign.running && !said.end; i++) {
      const from = s.campaign.history.length, here = this.here(s);
      const next = said.moment === 'fight' ? RunnerFight.through : this.wander(said, here, walked, tried);
      if (!next) { break; }
      tried.add(`${here}|${next}`);
      if (next.startsWith('exit:')) { walked.set(next, (walked.get(next) ?? 0) + 1); }
      const got = await r.ask(JSON.stringify({ act: next }));
      if ('error' in got) { tried.add(`${here}|${next}`); said = r.said('look'); continue; }
      said = got as Said;
      if (said.moment !== 'fight' && !this.besides(said, false)) {
        blank += s.campaign.history.length - from; blanks.push([this.here(s), s.campaign.history.length - from]);
      }
      if (mouth === null && this.below(s)) { mouth = s.campaign.history.length; }
    }
    return { mouth, blank, blanks, moves: s.campaign.history.length };
  }
  // A way not yet taken, else an act the page marks not yet done here, else the way least walked.
  static wander(said: Said, here: string, walked: Map<string, number>, tried: Set<string>): string | undefined {
    const rows = this.rows(said).filter(o => !/^(buy|sell|haggle)/.test(o.does ?? o.id));
    const ways = rows.filter(o => o.id.startsWith('exit:'));
    const fresh = ways.find(o => !walked.has(o.id));
    if (fresh) { return fresh.id; }
    const marked = rows.find(o => !o.id.startsWith('exit:') && !tried.has(`${here}|${o.id}`) && this.marked(o, true));
    if (marked) { return marked.id; }
    return [...ways].sort((a, b) => (walked.get(a.id) ?? 0) - (walked.get(b.id) ?? 0))[0]?.id;
  }
  private static rows(said: Said): Offered[] {
    return RunnerOffer.flat([...said.offer.primary, ...said.offer.rest]).filter(o => !o.opens?.length);
  }
  // Whether a row is marked as an opportunity: a colour or an icon; besides the aim's own gold, where gold is not
  // counted (the gold-follower has the gold always: what else is in reach is the measure).
  private static marked(o: Offered, gold: boolean): boolean {
    const shown = Indicator.of({ aspects: o.aspects as Aspect[] });
    return (!!shown.tone && (gold || shown.tone !== 'gold')) || shown.icons.length > 0;
  }
  private static besides(said: Said, lead: boolean): boolean {
    return this.rows(said).some(o => this.marked(o, !lead));
  }
  private static step(s: PlaySession): Step {
    const c = s.campaign, w = c.world;
    return { held: new Set(Undertakings.held(c).map(o => o.id)), members: c.readout.partyIds.length,
      facts: new Set(w.related('knows').filter(r => r.args[0] === 'party').map(r => r.args[1]!)),
      history: c.history.length };
  }
  // What seeing an aim through opened: another aim held, a fact learned that some condition asks, someone joined.
  static opened(a: Step, b: Step, id: string, reads: Set<string>): string[] {
    return [...[...b.held].filter(x => !a.held.has(x) && x !== id).map(x => `aim ${x}`),
      ...[...b.facts].filter(f => !a.facts.has(f) && reads.has(f)).map(f => `fact ${f}`),
      ...b.members > a.members ? ['joined'] : []];
  }
  // The facts some condition asks to be known: an aim's, an act's or a rule's, or what a thing is hidden until.
  static reads(m: Module): Set<string> {
    const out = new Set<string>();
    this.known([(m.objectives ?? []).map(o => o.when), m.actions.map(a => a.requires),
      (m.rules ?? []).map(r => (r as { when?: unknown }).when)], out);
    for (const c of m.initial) { if (c.call?.name === 'revealedBy') { out.add(c.call.args[1]!); } }
    return out;
  }
  // Every fact a condition asks to be known (knows(…, f)), anywhere within it.
  private static known(x: unknown, out: Set<string>): void {
    if (!x || typeof x !== 'object') { return; }
    if (Array.isArray(x)) { for (const y of x) { this.known(y, out); } return; }
    const o = x as Record<string, unknown>;
    if (o.kind === 'call' && o.name === 'knows' && Array.isArray(o.args)) { out.add(String(o.args.at(-1))); }
    for (const y of Object.values(o)) { this.known(y, out); }
  }
  private static here(s: PlaySession): string { return s.campaign.world.one('at', 'party') ?? ''; }
  private static below(s: PlaySession): boolean { return this.here(s).startsWith(this.mouth); }
}

if (import.meta.main) {
  const only = process.argv.slice(2);
  const callings = only.filter(x => QuantityLeads.callings.includes(x));
  const origins = only.filter(x => QuantityLeads.origins.includes(x));
  const lives = await QuantityLeads.run(callings.length ? callings : undefined, origins.length ? origins : undefined);
  for (const l of lives) {
    console.log(JSON.stringify(l));
  }
}
