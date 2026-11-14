// EX-01 (the owner, 15 November): the generated tier's unpursuable turns, each classed by what the turn itself shows,
// before any change to exploration. The walks are the matrix's (--create, a1/b2/c3, every calling, straight and
// curious); each lost turn (RunnerWalk.lostIndices, unless amid with somewhere to explore) is classed first by the
// obstacle it stands at, then by where it stands. Regenerate with
//   bun scripts/exploration-sample.ts [--seeds a1,b2,c3] [--turns 30] [--out file]
import { writeFile } from 'node:fs/promises';
import { Runner, type Said } from '../src/cli/runner';
import { RunnerWalk, type Policy, type Walk } from '../src/cli/runner-walk';
import { TerminalMatrix } from './terminal-matrix';

type Class = 'unreachable aim content' | 'navigational confusion' | 'repeated rooms' | 'missing investigation acts'
  | 'genuine lack of interesting content';
interface Sampled { walk: string; turn: number; at: string; aim: string; after: string; class: Class; why: string }

export class ExplorationSample {
  static readonly classes: Class[] = ['unreachable aim content', 'navigational confusion', 'repeated rooms',
    'missing investigation acts', 'genuine lack of interesting content'];
  // What the turn shows, in order: an obstacle said (a barred way's need, the dark, a grave choice the aim's place
  // asks); away from the aim's site, going back and forth; in it, a room come back to; a place with nothing to look
  // into but ways; a place with ways not yet taken and nothing else.
  static classify(walk: Walk, i: number, seen: Map<string, number>): { class: Class; why: string } {
    const t = walk.turns[i]!, all = [...t.offer.primary, ...t.offer.rest];
    const barred = (t.need ?? []).find(n => /: needs |^No light$|^Dark$/.test(n));
    if (barred) { return { class: 'unreachable aim content', why: barred }; }
    const grave = all.find(o => o.marks.includes('grave'));
    if (t.amid && grave) { return { class: 'unreachable aim content', why: `only a grave choice: ${grave.label}` }; }
    const ats = walk.turns.slice(Math.max(0, i - 4), i + 1).filter(x => x.moment === 'arrive').map(x => x.at);
    if (!t.amid) {
      return { class: 'navigational confusion', why: new Set(ats).size < ats.length ? 'back and forth away from the aim'
        : 'away from the aim, nothing leading back' };
    }
    if ((seen.get(t.at ?? '') ?? 0) > 1) { return { class: 'repeated rooms', why: `in ${t.scene.lines[0]?.split(' · ')[0]} again` }; }
    const looks = all.filter(o => ['search', 'talk', 'study', 'act'].includes(o.type) && !/^put_item\(/.test(o.id));
    const unexplored = all.filter(o => o.type === 'go' && o.aspects.includes('exploration'));
    if (!looks.length) { return { class: 'missing investigation acts', why: `${unexplored.length} ways untaken, nothing to look into` }; }
    return { class: 'genuine lack of interesting content', why: `${looks.length} acts, none toward the aim` };
  }
  static sample(name: string, walk: Walk): Sampled[] {
    const seen = new Map<string, number>(), lost = new Set(RunnerWalk.lostIndices(walk)), out: Sampled[] = [];
    walk.turns.forEach((t: Said, i) => {
      if (t.moment === 'arrive' && t.at) { seen.set(t.at, (seen.get(t.at) ?? 0) + 1); }
      if (!lost.has(i)) { return; }
      const c = this.classify(walk, i, seen);
      out.push({ walk: name, turn: t.turn, at: (t.scene.lines[0] ?? '').slice(0, 90), after: walk.chosen[i - 1]?.label ?? '',
        aim: (t.aims?.find(a => a.followed)?.text ?? '').slice(0, 70), ...c });
    });
    return out;
  }
  static report(rows: Sampled[]): string {
    return ['## EX-01: the unpursuable turns, classed', '',
      `${rows.length} lost turns (an aim followed, nothing leading to it) over the generated tier's walks, each classed by `
        + 'what the turn shows ([exploration-sample.ts](../../../../scripts/exploration-sample.ts)).', '',
      '| class | turns | walks |', '|---|---|---|',
      ...this.classes.map(c => `| ${c} | ${rows.filter(r => r.class === c).length} | `
        + `${new Set(rows.filter(r => r.class === c).map(r => r.walk)).size} |`), '',
      'By what the turn showed:', '', ...[...this.tally(rows.map(r => `${r.class}: ${r.why.replace(/^in .* again$/, 'a room'
        + ' come back to').replace(/^\d+ acts.*/, 'acts, none toward the aim').replace(/^\d+ ways untaken.*/, 'nothing to '
        + 'look into').replace(/^A .*: needs .*/, 'a barred way (needs …)').replace(/^only a grave choice.*/, 'only a grave '
        + 'choice')}`))].map(([k, n]) => `- ${n} ${k}`), '',
      ...this.classes.flatMap(c => [`### ${c}`, '', ...this.examples(rows.filter(r => r.class === c)), ''])].join('\n');
  }
  // Three, from different seeds where there are, each the middle of its walk's run.
  private static examples(rows: Sampled[]): string[] {
    const walks = [...new Set(rows.map(r => r.walk))];
    const seeds = [...new Set(walks.map(w => w.split(' ')[0]!))];
    const one = seeds.flatMap(s => walks.filter(w => w.startsWith(`${s} `)).slice(0, 1))
      .concat(walks).filter((w, i, all) => all.indexOf(w) === i).slice(0, 3)
      .map(w => { const of = rows.filter(r => r.walk === w); return of[Math.floor(of.length / 2)]!; });
    return one.length ? one.map(r => `- ${r.walk}, turn ${r.turn}, at ${r.at}, after "${r.after}" (${r.why}): ${r.aim}`)
      : ['- none'];
  }
  private static tally(xs: string[]): [string, number][] {
    const m = new Map<string, number>();
    for (const x of xs) { m.set(x, (m.get(x) ?? 0) + 1); }
    return [...m].sort((a, b) => b[1] - a[1]);
  }
  static async main() {
    const seeds = TerminalMatrix.flag('seeds', 'a1,b2,c3').split(','), turns = Number(TerminalMatrix.flag('turns', '30'));
    const out = TerminalMatrix.flag('out', '/dev/stdout'), rows: Sampled[] = [];
    for (const [si, seed] of seeds.entries()) {
      for (const [bi, [calling]] of TerminalMatrix.builds.entries()) {
        const origin = TerminalMatrix.origins[(bi + si * 3) % TerminalMatrix.origins.length]!;
        for (const policy of ['straight', 'curious'] as Policy[]) {
          const walk = await RunnerWalk.run(new Runner(await TerminalMatrix.made(seed, origin, calling)), policy, turns,
            si + 1);
          rows.push(...this.sample(`${seed} ${calling} ${origin} ${policy}`, walk));
          console.error(`${seed} ${calling} ${origin} ${policy}`);
        }
      }
    }
    await writeFile(out, this.report(rows));
  }
}
if (import.meta.main) { await ExplorationSample.main(); }
