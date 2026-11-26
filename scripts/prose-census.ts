#!/usr/bin/env bun
// The prose census (the owner, 17 November night: plain prose; doc/authoring/plain-prose.md). The first hour of
// generated countries walked by the autoplay laboratory's unguided players, each act told as the page tells it
// (Journey.perform: the narrator's lines, the place, what changed, what happened), and every sentence counted by how
// many walks met it and how often. The passages met most are the ones an editor reads first, and the filled text is
// what the prose lint reads (test/small/prose-lint), not the unexpanded template.
//   bun scripts/prose-census.ts [--seeds a1,kite,thorn,iscoed] [--policies investigate,wander] [--steps 40]
//     [--no-meeting] [--top 60] [--json out.json] [--fixture test/fixtures/prose/first-hour.json]
import { AutoplayRun } from '../src/autoplay/run';
import { AutoPlayer, type PolicyName } from '../src/autoplay/player';
import { Draw } from '../src/autoplay/draw';
import { Journey } from '../src/session/journey';
import { Travel } from '../src/session/travel';
import { Origins } from '../src/world/origins';
import { CanonVocabulary } from '../src/canon/canon-vocabulary';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Sentences } from '../src/presentation/sentences';
import { ProseLint } from '../src/presentation/prose-lint';
import { Prologue } from '../src/presentation/prologue';

export interface Told { seed: string; origin: string; policy: string; step: number; label: string; page: string }
export interface Met { sentence: string; times: number; walks: number; first: Told }

export class ProseCensus {
  static option(argv: string[], flag: string, fallback: string): string {
    const at = argv.indexOf(flag);
    return at < 0 ? fallback : argv[at + 1] ?? fallback;
  }
  // The lives a country begins: its own (Iscoed's three), or the ordinary ones every other country offers.
  static async origins(seed: string): Promise<string[]> {
    const loaded = await Origins.load(NodeBundleSource.shared);
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared);
    return Origins.choices(loaded, w.report.region, w.report.placements, CanonVocabulary.context()).map(o => o.id);
  }
  // One walk, every act as the page told it, in the first country (the frontier closed: a first hour's prose, and a
  // walk in seconds, not minutes).
  static async walk(seed: string, origin: string, policy: PolicyName, steps: number): Promise<Told[]> {
    const spec = { seed, origin, policy, steps, frontier: false, protagonist: { name: 'Wenna', raceId: 'human', classId: 'warrior' } };
    const s = await AutoplayRun.start(spec, AutoplayRun.empty()), j = Journey.of(s), c = s.campaign;
    const player = new AutoPlayer(policy, new Draw(`${seed}:${origin}:${policy}`)), told: Told[] = [];
    const opened = this.opening(j);
    if (opened) { told.push({ seed, origin, policy, step: -1, label: 'the opening', page: opened }); }
    for (let step = 0; step < steps && c.running; step++) {
      const move = player.next(AutoplayRun.situation(s, step, AutoPlayer.paged.includes(policy),
        AutoPlayer.prefers[policy]));
      if (!move) { break; }
      const from = j.taken.length;
      try {
        if (move.kind === 'travel') {
          await Travel.go({ campaign: c, perform: this.performing.bind(this, j, player) }, move.to);
        } else { await j.perform(move.id, move.id, undefined, player.controller); }
      } catch { break; }
      for (const t of j.taken.slice(from)) { told.push({ seed, origin, policy, step, label: t.label, page: t.page }); }
    }
    return told;
  }
  // The opening as the page tells it before the first place: its beats, whoever is met on the road, the first aim.
  static opening(j: Journey): string {
    const o = Prologue.of(j.campaign, j.screen(), 'The opening')?.told;
    return o ? [...o.beats, o.meeting?.text ?? '', o.aim ?? ''].filter(Boolean).join(' ') : '';
  }
  // Each answer to whoever is met on the road in, taken in a world drawn fresh for it: every player meets the meeting
  // and takes one of them, so they are the first hour's commonest act results.
  static async meeting(seed: string, origin: string): Promise<Told[]> {
    const spec = { seed, origin, policy: 'investigate' as PolicyName, steps: 1, frontier: false,
      protagonist: { name: 'Wenna', raceId: 'human', classId: 'thief' } };
    const first = Journey.of(await AutoplayRun.start(spec, AutoplayRun.empty()));
    const answers = Prologue.of(first.campaign, first.screen(), 'The opening')?.told.meeting?.choices ?? [];
    const told: Told[] = [];
    for (const [i, a] of answers.entries()) {
      const j = i ? Journey.of(await AutoplayRun.start(spec, AutoplayRun.empty())) : first;
      try { await j.perform(a.command, a.label); } catch { continue; }
      told.push({ seed, origin, policy: 'meeting', step: i, label: a.label, page: j.taken.at(-1)!.page });
    }
    return told;
  }
  private static async performing(j: Journey, player: AutoPlayer, command: string) {
    await j.perform(command, command, undefined, player.controller);
    return j.taken.at(-1)!.event;
  }
  static async run(seeds: string[], policies: PolicyName[], steps: number, meetings = true): Promise<Told[]> {
    const all: Told[] = [];
    for (const seed of seeds) {
      const met = !meetings ? [] : await this.meeting(seed, (await this.origins(seed))[0]!).catch(() => [] as Told[]);
      console.error(`${seed} the meeting on the road: ${met.length} answers`);
      all.push(...met);
      for (const origin of await this.origins(seed)) {
        for (const policy of policies) {
          const began = Date.now(), told = await this.walk(seed, origin, policy, steps)
            .catch((e: Error) => { console.error(`${seed} ${origin} ${policy}: ${e.message}`); return []; });
          console.error(`${seed} ${origin} ${policy}: ${told.length} pages, ${((Date.now() - began) / 1000).toFixed(0)} s`);
          all.push(...told);
        }
      }
    }
    return all;
  }
  // Every sentence told, by how many walks met it and how many times in all, the commonest first.
  static met(told: Told[]): Met[] {
    const by = new Map<string, Met & { seen: Set<string> }>();
    for (const t of told) {
      for (const sentence of Sentences.split(t.page).map(x => x.trim()).filter(x => x.split(/\s+/).length > 3)) {
        const m = by.get(sentence) ?? { sentence, times: 0, walks: 0, first: t, seen: new Set<string>() };
        m.times++; m.seen.add(`${t.seed}:${t.origin}:${t.policy}`); m.walks = m.seen.size;
        by.set(sentence, m);
      }
    }
    return [...by.values()].map(({ seen: _, ...m }) => m).sort((a, b) => b.walks - a.walks || b.times - a.times);
  }
  // The pages as told, each once, for the lint to read filled (test/fixtures/prose/first-hour.json).
  static fixture(told: Told[]): string {
    const pages = [...new Map(told.filter(t => t.page.trim()).map(t => [t.page, t])).values()]
      .map(t => ({ at: `${t.seed}/${t.origin}/${t.policy}#${t.step}`, label: t.label, page: t.page }));
    return `{"about": "Pages of the first hour as the narrator told them, each once (scripts/prose-census.ts --fixture). Re-recorded when the prose moves.",\n "pages": [\n${
      pages.map(p => `  ${JSON.stringify(p)}`).join(',\n')}\n ]}\n`;
  }
  static async main(argv: string[]): Promise<number> {
    const seeds = this.option(argv, '--seeds', 'a1,kite,thorn,iscoed').split(',');
    const policies = this.option(argv, '--policies', 'investigate,wander').split(',') as PolicyName[];
    const steps = Number(this.option(argv, '--steps', '40')), top = Number(this.option(argv, '--top', '60'));
    const json = this.option(argv, '--json', ''), fixture = this.option(argv, '--fixture', '');
    const told = await this.run(seeds, policies, steps, !argv.includes('--no-meeting')), met = this.met(told);
    if (json) { await Bun.write(json, JSON.stringify({ told, met }, null, 1)); }
    if (fixture) { await Bun.write(fixture, this.fixture(told)); }
    const findings = told.flatMap(t => ProseLint.filled(t.page).map(f => ({ ...f, where: `${t.seed}/${t.origin}` })));
    console.log(`${told.length} pages, ${met.length} sentences told; lint findings in filled text: ${findings.length}`);
    for (const f of [...new Map(findings.map(f => [f.text, f])).values()]) {
      console.log(`  ${f.rule} (${f.where}): ${f.text.slice(0, 160)}`);
    }
    for (const m of met.slice(0, top)) { console.log(`${String(m.walks).padStart(3)} ${String(m.times).padStart(4)}  ${m.sentence}`); }
    return 0;
  }
}
if (import.meta.main) { process.exit(await ProseCensus.main(process.argv.slice(2))); }
