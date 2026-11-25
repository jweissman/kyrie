import { readFileSync, writeFileSync } from 'node:fs';
import { PlayTool } from '../src/cli/play-tool';
import { Runner, type Said } from '../src/cli/runner';
import type { PlaySession } from '../src/session/play-session';
import { Attest } from '../src/presentation/attest';
import { SceneModel } from '../src/ui/scene';
import { Attending } from '../src/ui/attention';
import { ScreenModel } from '../src/ui/screen-model';
import type { Choice } from '../src/ui/choice-list';
import { Glanced } from '../test/support/glanced';
import { AsMeant } from '../test/support/as-meant';
import { HonestPlayer } from '../test/support/honest-player';
import { GoldenWalk } from '../test/support/golden-walk';
import { DrawerTruth } from '../test/support/drawer-truth';
import { TalkTruth } from '../test/support/talk-truth';
import { Outcome } from '../src/ui/outcome';
import { EntityIndex } from '../src/lang/entity-index';
import { PlayerView } from '../src/presentation/player-view';
import { RunnerOffer } from '../src/cli/runner-offer';
import { MenuModel } from '../web/reader/menu-model';
import type { Screen } from '../src/ui/screen-types';

// The three continuity invariants of the alpha acceptance record (mission-22/alpha-acceptance.md), counted over every
// turn of the golden walks as shipped, before beta changes anything (mission-22-beta/preparation-report.md, Sprint 0).
// A measure, not a gate: each breach is named with its turn, so that beta's Sprint 1 and 2 can be judged by the count.
// - opportunity: a reply of someone here is blue (its witness says knowledge) exactly when asking it teaches: each
//   reply asked, what the company knows compared, and the act undone (Campaign.undo); and each person's likeness
//   agrees with the talk drawer the page renders for them, both ways (DrawerTruth: it replaced two checks that read
//   the drawer by a parallel list of its own, TalkFocus over the replies, which had been both stale and blind).
// - undertaking: when the followed aim is done and others are still held, the next turn follows one of them.
// - focus: in a frame engaged, by a threat or an occasion (a riddle, a hand of cards), and not yet fought, the runner
//   offers nothing that does not answer it (no journey, no map, no aim taken up, no wait but standing one's ground
//   before a threat), leaving stays possible (a way off, or standing one's ground), and the page's menu draws nothing
//   the runner does not offer (OR-177). How the page lays them out is the browser's. And every turn, each talk drawer
//   as the page renders it, every page of it: leaving drawn on each, nothing drawn not theirs, every topic within reach
//   (TalkTruth, OR-212).
//   bun scripts/continuity-census.ts [out.json]
// lines: the walk's own lines; none, and the walk follows the page's lead (the gold) as HonestPlayer plays it.
interface Walk { name: string; as: string; lines?: string; steps?: number }
interface Breach { walk: string; turn: number; invariant: string; what: string }
// Where a reply is tried: the walk, the turn, and whose it is.
interface At { walk: string; turn: number; who: string }
const walks: Walk[] = [
  { name: 'warrior', as: 'human/warrior/Wenna', lines: 'doc/architecture/mission-22/golden/warrior-walk.txt' },
  { name: 'mage', as: 'elf/mage/Ilse/scholar', lines: 'doc/architecture/mission-22/cold/cold-5-lines.txt' },
  { name: 'gold', as: 'human/warrior/Wenna', steps: 80 }];
// And an occasion, not a threat, engaged in for the focus invariant (the golden walks hold none): the riddle.
const occasions: Walk[] = [{ name: 'riddle', as: 'human/warrior/Wenna',
  lines: 'doc/architecture/mission-22/golden/riddle-walk.txt' }];
export class ContinuityCensus {
  static readonly walks = walks;
  static readonly occasions = occasions;
  static lines(path: string): string[] {
    return readFileSync(path, 'utf8').split('\n').filter(l => l.trim() && !l.startsWith('#'));
  }
  // Each act on someone or something here, their questions among them (a question is offered at the place; opening a
  // talk is the page's): blue by its witness, and whether doing it teaches (done, then undone).
  static opportunity(s: PlaySession, walk: string, turn: number): Breach[] {
    // And each person's likeness against the talk drawer the page renders for them, both ways (DrawerTruth, OR-201).
    const out: Breach[] = DrawerTruth.of(Glanced.of(s).frame())
      .map(what => ({ walk, turn, invariant: 'opportunity', what: `likeness and drawer disagree: ${what}` }));
    for (const sub of this.subjects(s)) {
      const replies = this.replies(sub);
      const at: At = { walk, turn, who: sub.name };
      out.push(...this.tried(s, replies, at));
    }
    return out;
  }
  private static subjects(s: PlaySession) {
    return Attending.place(SceneModel.build(ScreenModel.build(s.campaign))).subjects;
  }
  private static replies(sub: { choices?: Choice[] }): Choice[] {
    return Attending.all(sub.choices ?? []).filter((c: Choice) => c.command && !/^(buy|sell)_/.test(c.command));
  }
  // Whether each act teaches, as its blue says (Attest.reply, of the Outcome: OR-206): tried and undone, by what the
  // company knows after it beyond what an hour idle would have brought it (the town's dogs heard while the riddle was
  // listened to are the hour's); and the Outcome's prediction against what was learned, where the act came off (an
  // act with a check is read on its success: a failure teaching nothing is that contingency, not a breach).
  private static tried(s: PlaySession, replies: Choice[], at: At): Breach[] {
    const g = Glanced.of(s).glance, out: Breach[] = [], c = s.campaign, idle = this.idle(s);
    for (const r of replies.filter(x => !/^talk_to\(/.test(x.command ?? ''))) {
      const blue = Attest.reply(g, r).some(w => w.aspects.includes('knowledge')), before = this.facts(s);
      const op = this.operator(s, r.command!), predicted = op ? Outcome.taught(c.module, c.world, op, 'party') : [];
      let result: string;
      try { result = c.execute(r.command!).result; } catch { continue; }
      const learned = [...this.facts(s)].filter(f => !before.has(f) && !idle.has(f));
      c.undo();
      const taught = learned.length > 0, contingent = result === 'failure' && blue && predicted.length > 0;
      if (blue !== taught && !contingent) {
        out.push({ walk: at.walk, turn: at.turn, invariant: 'opportunity',
          what: `${blue ? 'blue, teaches nothing' : 'teaches, not blue'}: ${at.who}: ${r.label}` });
      }
      const missed = learned.filter(f => !predicted.includes(f)), wrong = predicted.filter(f => !learned.includes(f));
      if (result === 'success' && (missed.length || wrong.length)) {
        out.push({ walk: at.walk, turn: at.turn, invariant: 'opportunity', what: `predicted is not observed: ${at.who}: `
          + `${r.label}: predicted [${predicted.join(', ')}], learned [${learned.join(', ')}]` });
      }
    }
    return out;
  }
  // What the company knows by name now (the facts its notes could tell), and what an hour idle here would add to it.
  private static facts(s: PlaySession): Set<string> {
    const c = s.campaign, byId = EntityIndex.of(c.module.entities).byId;
    return new Set(c.world.related('knows', c.playerActor ?? 'party').map(r => r.args[1]!).filter(f => !!byId.get(f)?.name));
  }
  private static idle(s: PlaySession): Set<string> {
    const c = s.campaign, offered = c.offered();
    const wait = offered.find(o => /^wait_hour\(/.test(o.id)) ?? offered.find(o => /^wait\(/.test(o.id));
    if (!wait) { return new Set(); }
    const before = this.facts(s);
    try { c.execute(wait.id); } catch { return new Set(); }
    const after = this.facts(s);
    c.undo();
    return new Set([...after].filter(f => !before.has(f)));
  }
  private static operator(s: PlaySession, command: string) {
    try {
      const id = PlayerView.resolve(s.campaign, command);
      return s.campaign.offered().find(o => o.id === id);
    } catch { return undefined; }
  }
  // The talk drawer's first page as the page draws it (web/reader/stage/talk-stage.tsx): TalkFocus over their replies,
  // led and marked by what the glance found in their opener, an answer owed and the salient three.
  static aims(s: PlaySession): { followed?: string; held: string[] } {
    const aims = ScreenModel.build(s.campaign).aims ?? [];
    return { followed: aims.find(a => a.followed)?.id, held: aims.map(a => a.id) };
  }
  static async walk(w: Walk): Promise<{ breaches: Breach[]; turns: number; engaged: number }> {
    const { journey } = await PlayTool.start(PlayTool.parse(GoldenWalk.args(w.as, w.lines ?? GoldenWalk.file)));
    const s = journey.session, r = new Runner(s), breaches: Breach[] = [];
    const lines = w.lines ? this.lines(w.lines) : Array.from({ length: w.steps ?? 0 }, () => ''), honest = new HonestPlayer(s);
    let engaged = 0, played = 0, before = this.aims(s);
    for (const [turn, line] of lines.entries()) {
      breaches.push(...this.opportunity(s, w.name, turn));
      let asked: Said | { error: string } | undefined;
      if (w.lines) { asked = await AsMeant.ask(r, line); } else if (!await honest.step()) { break; }
      played++;
      const after = this.aims(s), screen = ScreenModel.build(s.campaign);
      if (screen.engaged || screen.warned) {
        engaged++;
        breaches.push(...this.focus(s, asked ?? r.said(), screen, { walk: w.name, turn }));
      }
      breaches.push(...this.talks(s, asked, { walk: w.name, turn }));
      breaches.push(...this.undertaking(before, after, { walk: w.name, turn }));
      before = after;
    }
    return { breaches, turns: played, engaged };
  }
  // The followed aim done (gone from those held), others still held, and none followed now.
  static undertaking(before: { followed?: string }, after: { followed?: string; held: string[] },
    where: { walk: string; turn: number }): Breach[] {
    const done = before.followed && !after.held.includes(before.followed);
    return done && after.held.length && !after.followed ? [{ ...where, invariant: 'undertaking',
      what: `"${before.followed}" done; ${after.held.length} still held, none followed` }] : [];
  }
  // The frame engaged, as the runner offered it to the walk's line and the page's menu draws it (see focus above); a
  // fight once begun is its own frame, the fight's, and not read here.
  static focus(s: PlaySession, said: Said | { error: string }, screen: Screen, where: { walk: string; turn: number }):
    Breach[] {
    if ('error' in said || said.moment === 'fight' || said.end) { return []; }
    const rows = RunnerOffer.flat([...said.offer.primary, ...said.offer.rest]), threat = !!screen.warned;
    const acts = new Set(rows.map(o => RunnerOffer.act(o))), at = { ...where, invariant: 'focus' };
    const by = screen.warned?.id ?? screen.engaged?.id;
    const stray = rows.filter(o => /^(travel:|view:map|follow:)/.test(RunnerOffer.act(o))
      || (/^wait/.test(RunnerOffer.act(o)) && !(threat && RunnerOffer.act(o) === 'wait')));
    const out: Breach[] = stray.map(o => ({ ...at, what: `offered beside ${by}: ${o.label}` }));
    const leaves = [...acts].some(a => /^go\(/.test(a) || (threat && a === 'wait'));
    if (!leaves) { out.push({ ...at, what: `no way to leave ${by}` }); }
    const drawn = this.flat(MenuModel.build(Glanced.of(s).frame(), 'here', []).choices).filter(c => c.command);
    out.push(...drawn.filter(c => !acts.has(c.command!) && !acts.has(c.id))
      .map(c => ({ ...at, what: `the page draws what the runner does not offer: ${c.label}` })));
    return out;
  }
  // Each talk drawer as the page draws it, every page of it, held to the focus contract (TalkTruth, OR-212); not
  // while a fight is fought, whose frame is the fight's.
  private static talks(s: PlaySession, asked: Said | { error: string } | undefined,
    where: { walk: string; turn: number }): Breach[] {
    if (asked && 'moment' in asked && asked.moment === 'fight') { return []; }
    return TalkTruth.of(Glanced.of(s).frame()).map(what => ({ ...where, invariant: 'focus', what: `talk: ${what}` }));
  }
  private static flat(cs: Choice[]): Choice[] { return cs.flatMap(c => [c, ...this.flat(c.children ?? [])]); }
  private static count(breaches: Breach[], invariant: string): number {
    return breaches.filter(b => b.invariant === invariant).length;
  }
  static async main(args: string[]): Promise<number> {
    const all: Breach[] = [];
    for (const w of [...walks, ...occasions]) {
      const { breaches, turns, engaged } = await this.walk(w);
      all.push(...breaches);
      console.log(`${w.name}: ${turns} turns, ${engaged} engaged; opportunity ${this.count(breaches, 'opportunity')}, `
        + `undertaking ${this.count(breaches, 'undertaking')}, focus ${this.count(breaches, 'focus')}`);
    }
    for (const b of all) { console.log(`  ${b.walk} t${b.turn} ${b.invariant}: ${b.what}`); }
    if (args[0]) { writeFileSync(args[0], JSON.stringify(all, null, 1)); }
    return 0;
  }
}
if (import.meta.main) { process.exit(await ContinuityCensus.main(process.argv.slice(2))); }
