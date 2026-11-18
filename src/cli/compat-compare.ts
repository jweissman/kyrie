// Two snapshots of the pinned worlds and journeys (see CompatSnapshot) compared, each difference said by its kind:
//   additive           new facts or rows, nothing taken away
//   presentation-only  labels or lines changed, the same commands offered and the same state after them
//   world-moving       the generated layout, its times or its people changed, or play comes to another state or time
//   replay-breaking    a recorded line or command no longer offered or legal
//   save-breaking      a game saved does not open as it was (in its own build, or the base's save in this one)
// A journey is compared step by step until play first comes otherwise (another watch or place); past that every
// turn differs because play does, and the turns are counted, not told as changes of their own. A label or a line
// changed is presentation-only only where the state after the step is the same (the same digest).
import type { JourneyShot, SaveShot, Snapshot, StepShot, WorldShot } from './compat-snapshot';

export type Kind = 'save-breaking' | 'replay-breaking' | 'world-moving' | 'presentation-only' | 'additive';
export interface Finding { kind: Kind; where: string; text: string }
// opened: the base's saves as this build opens them (by journey), where they were kept.
export interface Reopened { [journey: string]: { digest: string; turn: string[]; why?: string } }

export class CompatCompare {
  static readonly kinds: Kind[] = ['save-breaking', 'replay-breaking', 'world-moving', 'presentation-only', 'additive'];
  static compare(base: Snapshot, now: Snapshot, opened: Reopened = {}): Finding[] {
    const out: Finding[] = [];
    for (const w of now.worlds) {
      const b = base.worlds.find(x => x.name === w.name);
      if (b) { out.push(...this.world(b, w)); }
    }
    // A digest that moved while the worlds only grew is the growth (a fact more), not the world moving.
    const grew = !out.some(f => f.kind === 'world-moving');
    for (const j of now.journeys) {
      const b = base.journeys.find(x => x.name === j.name);
      if (b) { out.push(...this.journey(b, j, grew), ...this.save(b, j.save, opened[j.name])); }
    }
    return out;
  }
  static verdict(fs: Finding[]): Kind | 'same' {
    return this.kinds.find(k => fs.some(f => f.kind === k)) ?? 'same';
  }
  static world(b: WorldShot, w: WorldShot): Finding[] {
    const where = w.name, out: Finding[] = [];
    const parts: [string, Record<string, string>, Record<string, string>][] = [
      ['place', this.set(b.places), this.set(w.places)], ['passage', b.passages, w.passages],
      ['person', b.people, w.people], ['placement', b.placements, w.placements]];
    for (const [what, was, is] of parts) {
      for (const [id, v] of Object.entries(is)) {
        if (!(id in was)) { out.push({ kind: 'additive', where, text: `${what} ${id} added (${v})` }); }
        else if (was[id] !== v) {
          out.push({ kind: 'world-moving', where, text: `${what} ${id}: ${was[id]} -> ${v}` });
        }
      }
      for (const id of Object.keys(was).filter(id => !(id in is))) {
        out.push({ kind: 'world-moving', where, text: `${what} ${id} gone (${was[id]})` });
      }
    }
    return out;
  }
  private static set(xs: string[]): Record<string, string> { return Object.fromEntries(xs.map(x => [x, 'a place'])); }
  static journey(b: JourneyShot, j: JourneyShot, grew: boolean): Finding[] {
    const out: Finding[] = [];
    let moved = false, other = false, after = 0;
    for (const [i, s] of j.steps.entries()) {
      const was = b.steps[i], where = `${j.name} step ${i + 1} ${s.line}`;
      if (!was) { out.push({ kind: 'additive', where, text: 'a step more' }); continue; }
      if (was.ok && !s.ok) { out.push({ kind: 'replay-breaking', where, text: s.error ?? 'not taken' }); }
      else if (!was.ok && s.ok) { out.push({ kind: 'world-moving', where, text: `taken now (refused before: ${was.error})` }); }
      if (moved) { after += Number(was.digest !== s.digest); continue; }
      // Play comes otherwise: another watch or another place. Past it, every turn differs because play does.
      if (this.elapsed(was) !== this.elapsed(s) || was.at !== s.at) {
        moved = true;
        out.push({ kind: 'world-moving', where, text: `play comes otherwise here: ${this.diverged(was, s)}` });
        continue;
      }
      // The same watch and place, another state (a fact more or other): the world's growth, where it only grew.
      if (!other && was.digest !== s.digest) {
        other = true;
        out.push({ kind: grew ? 'additive' : 'world-moving', where, text: 'the state differs from here, at the same'
          + ' watch and place' });
      }
      out.push(...this.turn(was, s, { where, told: was.digest === s.digest ? 'presentation-only' : 'world-moving' }));
    }
    if (b.steps.length > j.steps.length) {
      out.push({ kind: 'replay-breaking', where: j.name, text: `${b.steps.length - j.steps.length} steps fewer` });
    }
    if (after) { out.push({ kind: 'world-moving', where: j.name, text: `${after} later turns differ, after that` }); }
    return out;
  }
  // The watches (ten minutes each) a game has run, from its digest (key.elapsed.creatures).
  private static elapsed(s: StepShot): string { return s.digest.split('.').at(-2) ?? ''; }
  private static diverged(was: StepShot, s: StepShot): string {
    return [this.elapsed(was) !== this.elapsed(s) ? `watch ${this.elapsed(was)} -> ${this.elapsed(s)}` : '',
      was.at !== s.at ? `at ${was.at} -> ${s.at}` : ''].filter(Boolean).join(', ');
  }
  // One turn at the same watch and place on both sides: rows by id (a row gone is a command no longer offered), their
  // labels, the scene's lines. told: what a label or a line changed is, the state being the same or not.
  static turn(was: StepShot, s: StepShot, o: { where: string; told: Kind }): Finding[] {
    const out: Finding[] = [], before = this.rows(was), now = this.rows(s), where = o.where;
    for (const [id, label] of now) {
      if (!before.has(id)) { out.push({ kind: 'additive', where, text: `row ${id} offered (${label})` }); }
      else if (before.get(id) !== label) {
        out.push({ kind: o.told, where, text: `row ${id}: "${before.get(id)}" -> "${label}"` });
      }
    }
    for (const [id, label] of before) {
      if (!now.has(id)) { out.push({ kind: 'world-moving', where, text: `row ${id} no longer offered (${label})` }); }
    }
    const gone = was.lines.filter(l => !s.lines.includes(l)), come = s.lines.filter(l => !was.lines.includes(l));
    if (gone.length || come.length) {
      out.push({ kind: come.length && !gone.length ? 'additive' : o.told, where,
        text: `lines: ${gone.slice(0, 1).map(l => `"${l}"`).join('') || '(none)'} -> ${
          come.slice(0, 1).map(l => `"${l}"`).join('') || '(none)'}` });
    }
    return out;
  }
  private static rows(s: StepShot): Map<string, string> {
    return new Map(s.rows.map(r => { const at = r.indexOf(' | '); return [r.slice(0, at), r.slice(at + 3)]; }));
  }
  static save(b: JourneyShot, s: SaveShot, opened?: Reopened[string]): Finding[] {
    const out: Finding[] = [], where = `${b.name} save`;
    if (b.save.restores && !s.restores) {
      out.push({ kind: 'save-breaking', where, text: `does not restore in its own build: ${s.why}` });
    }
    if (opened?.why) { out.push({ kind: 'save-breaking', where, text: `the base's save does not open: ${opened.why}` }); }
    else if (opened && opened.digest !== b.save.digest) {
      out.push({ kind: 'save-breaking', where, text: 'the base\'s save opens as another game' });
    } else if (opened && opened.turn.join('\n') !== b.save.turn.join('\n')) {
      out.push({ kind: 'presentation-only', where, text: 'the base\'s save opens to the same game, told otherwise' });
    }
    return out;
  }
  // The report: the verdict, then each kind with how many, and the first few of each world and journey it is found in.
  static report(fs: Finding[], o: { base: string; now: string; examples?: number }): string[] {
    const out = [`compat: ${o.base} -> ${o.now}: ${this.verdict(fs)}`];
    for (const k of this.kinds) {
      const of = fs.filter(f => f.kind === k), roots = [...new Set(of.map(f => f.where.split(' ')[0]!))];
      out.push(`${k}: ${of.length}`);
      for (const root of roots) {
        const here = of.filter(f => f.where.split(' ')[0] === root), n = o.examples ?? 3;
        out.push(`  ${root} (${here.length})`, ...here.slice(0, n).map(f => `    ${f.where}: ${f.text}`));
      }
    }
    return out;
  }
}
