import { readFileSync, writeFileSync } from 'node:fs';
import { PlayTool } from '../src/cli/play-tool';
import { Runner } from '../src/cli/runner';
import { PlaySession } from '../src/session/play-session';
import { Attest } from '../src/presentation/attest';
import { SceneModel } from '../src/ui/scene';
import { Attending } from '../src/ui/attention';
import { ScreenModel } from '../src/ui/screen-model';
import type { Choice } from '../src/ui/choice-list';
import { Glanced } from '../test/support/glanced';
import { AsMeant } from '../test/support/as-meant';

// The three continuity invariants of the alpha acceptance record (mission-22/alpha-acceptance.md), counted over every
// turn of the golden walks as shipped, before beta changes anything (mission-22-beta/preparation-report.md, Sprint 0).
// A measure, not a gate: each breach is named with its turn, so that beta's Sprint 1 and 2 can be judged by the count.
// - opportunity: a reply of someone here is blue (its witness says knowledge) exactly when asking it teaches: each
//   reply asked, what the company knows compared, and the act undone (Campaign.undo); and no likeness is blue while
//   none of its replies is.
// - undertaking: when the followed aim is done and others are still held, the next turn follows one of them.
// - focus: only counted here (the frames engaged, by threat or occasion); what the page draws of them is the browser's.
//   bun scripts/continuity-census.ts [out.json]
interface Walk { name: string; as: string; lines: string }
interface Breach { walk: string; turn: number; invariant: string; what: string }
// Where a reply is tried: the walk, the turn, and whose it is.
interface At { walk: string; turn: number; who: string }
const walks: Walk[] = [
  { name: 'warrior', as: 'human/warrior/Wenna', lines: 'doc/architecture/mission-22/golden/warrior-walk.txt' },
  { name: 'mage', as: 'elf/mage/Ilse/scholar', lines: 'doc/architecture/mission-22/cold/cold-5-lines.txt' }];
export class ContinuityCensus {
  static lines(path: string): string[] {
    return readFileSync(path, 'utf8').split('\n').filter(l => l.trim() && !l.startsWith('#'));
  }
  // What the company knows, as a count: what asking a reply would add to it.
  private static known(s: PlaySession): number { return ScreenModel.build(s.campaign).knowledge.length; }
  // Each act on someone or something here, and each question once a talk with them is opened: blue by its witness,
  // and whether doing it teaches (done, then undone). A talk's questions are asked on a copy of the game, opened there.
  static opportunity(s: PlaySession, walk: string, turn: number): Breach[] {
    const out: Breach[] = [];
    for (const sub of this.subjects(s)) {
      const replies = this.replies(sub);
      const at: At = { walk, turn, who: sub.name };
      out.push(...this.tried(s, replies, at));
      const opener = replies.find(c => /^talk_to\(/.test(c.command ?? ''));
      if (opener) { out.push(...this.talk(s, opener.command!, sub.id, at)); }
      const likeness = Glanced.of(s).glance.likenesses?.[sub.id];
      if (likeness?.aspects.includes('knowledge') && !this.blueSomewhere(s, sub.id, opener?.command)) {
        out.push({ walk, turn, invariant: 'opportunity', what: `a blue likeness with no blue reply: ${sub.name}` });
      }
    }
    return out;
  }
  private static subjects(s: PlaySession) {
    return Attending.place(SceneModel.build(ScreenModel.build(s.campaign))).subjects;
  }
  private static replies(sub: { choices?: Choice[] }): Choice[] {
    return Attending.all(sub.choices ?? []).filter((c: Choice) => c.command && !/^(buy|sell)_/.test(c.command));
  }
  private static tried(s: PlaySession, replies: Choice[], at: At): Breach[] {
    const g = Glanced.of(s).glance, out: Breach[] = [];
    for (const c of replies.filter(x => !/^talk_to\(/.test(x.command ?? ''))) {
      const blue = Attest.reply(g, c).some(w => w.aspects.includes('knowledge')), before = this.known(s);
      try { s.campaign.execute(c.command!); } catch { continue; }
      const taught = this.known(s) > before;
      s.campaign.undo();
      if (blue !== taught) {
        out.push({ walk: at.walk, turn: at.turn, invariant: 'opportunity',
          what: `${blue ? 'blue, teaches nothing' : 'teaches, not blue'}: ${at.who}: ${c.label}` });
      }
    }
    return out;
  }
  // The talk opened on a copy, and its questions tried there.
  private static talk(s: PlaySession, opener: string, id: string, at: At): Breach[] {
    const copy = PlaySession.fromSave(s.campaign.save());
    try { copy.campaign.execute(opener); } catch { return []; }
    const sub = this.subjects(copy).find(x => x.id === id);
    return sub ? this.tried(copy, this.replies(sub), at) : [];
  }
  private static blueSomewhere(s: PlaySession, id: string, opener?: string): boolean {
    const at = opener ? PlaySession.fromSave(s.campaign.save()) : s;
    if (opener) { try { at.campaign.execute(opener); } catch { return false; } }
    const sub = this.subjects(at).find(x => x.id === id), g = Glanced.of(at).glance;
    return this.replies(sub ?? {}).some(c => Attest.reply(g, c).some(w => w.aspects.includes('knowledge')));
  }
  private static aims(s: PlaySession): { followed?: string; held: string[] } {
    const aims = ScreenModel.build(s.campaign).aims ?? [];
    return { followed: aims.find(a => a.followed)?.id, held: aims.map(a => a.id) };
  }
  static async walk(w: Walk): Promise<{ breaches: Breach[]; turns: number; engaged: number }> {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', w.as]));
    const s = journey.session, r = new Runner(s), lines = this.lines(w.lines), breaches: Breach[] = [];
    let engaged = 0, before = this.aims(s);
    for (const [turn, line] of lines.entries()) {
      breaches.push(...this.opportunity(s, w.name, turn));
      await AsMeant.ask(r, line);
      const after = this.aims(s), screen = ScreenModel.build(s.campaign);
      if (screen.engaged || screen.warned) { engaged++; }
      // The followed aim done (gone from those held), others still held, and none followed now.
      const done = before.followed && !after.held.includes(before.followed);
      if (done && after.held.length && !after.followed) {
        breaches.push({ walk: w.name, turn, invariant: 'undertaking', what: `"${before.followed}" done; `
          + `${after.held.length} still held, none followed` });
      }
      before = after;
    }
    return { breaches, turns: lines.length, engaged };
  }
  private static count(breaches: Breach[], invariant: string): number {
    return breaches.filter(b => b.invariant === invariant).length;
  }
  static async main(args: string[]): Promise<number> {
    const all: Breach[] = [];
    for (const w of walks) {
      const { breaches, turns, engaged } = await this.walk(w);
      all.push(...breaches);
      console.log(`${w.name}: ${turns} turns, ${engaged} engaged; opportunity ${this.count(breaches, 'opportunity')}, `
        + `undertaking ${this.count(breaches, 'undertaking')}`);
    }
    for (const b of all) { console.log(`  ${b.walk} t${b.turn} ${b.invariant}: ${b.what}`); }
    if (args[0]) { writeFileSync(args[0], JSON.stringify(all, null, 1)); }
    return 0;
  }
}
if (import.meta.main) { process.exit(await ContinuityCensus.main(process.argv.slice(2))); }
