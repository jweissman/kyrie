#!/usr/bin/env bun
// The first quarter hour (the owner, 19 November: "the conflicts are just way too thin — quests are over too quickly,
// we're sent out of town immediately and the dungeons are deathly dull, with almost no content or combat; it sends
// you on a random chain of quests that don't circle back or explain themselves"; wanted: 3x–10x content in the first
// 15 minutes). A player who follows the gold, as the owner does, in each origin of a country; per walk, what came of
// it act by act: where, a fight, an aim taken or finished, and what the walk added up to. A measure, not a gate.
//   bun scripts/first-quarter.ts [--seeds iscoed] [--origins drove,debt,kin,herbs,order,wanderer] [--steps 60]
//     [--calling warrior] [--timeline] [--lead N]
import { AutoplayRun } from '../src/autoplay/run';
import { AutoPlayer } from '../src/autoplay/player';
import { Draw } from '../src/autoplay/draw';
import { Undertakings } from '../src/presentation/undertakings';
import { ScreenModel } from '../src/ui/screen-model';
import { AimLeading } from '../src/presentation/aim-lead';
import { Narrator } from '../src/presentation/narrator';
import type { PlaySession } from '../src/session/play-session';

interface Step { step: number; command: string; place: string; minute: number; fight: boolean; taken: string[];
  done: string[]; under: boolean }
export interface Quarter {
  seed: string; origin: string; steps: Step[]; fights: number; places: number; aims: number; finished: number;
  outAt?: number; sites: number; minutes: number; talks: number; looks: number;
}

export class FirstQuarter {
  static option(argv: string[], flag: string, fallback: string): string {
    const at = argv.indexOf(flag);
    return at < 0 ? fallback : argv[at + 1] ?? fallback;
  }
  static async main(argv: string[]): Promise<number> {
    const seeds = this.option(argv, '--seeds', 'iscoed').split(',');
    const origins = this.option(argv, '--origins', 'drove,debt,kin,herbs,order,wanderer').split(',');
    const steps = Number(this.option(argv, '--steps', '60')), calling = this.option(argv, '--calling', 'warrior');
    const rows: Quarter[] = [];
    for (const seed of seeds) {
      for (const origin of origins) {
        const q = await this.walk(seed, origin, calling, steps).catch((e: Error) => {
          console.error(`${seed}/${origin}: ${e.message}`);
        });
        if (!q) { continue; }
        rows.push(q);
        if (argv.includes('--timeline')) { console.log(this.timeline(q)); }
      }
    }
    console.log(this.table(rows));
    return 0;
  }
  static minutes(s: PlaySession): number {
    return s.campaign.readout.elapsed * 10 + (s.campaign.readout.minutes ?? 0);
  }
  static async walk(seed: string, origin: string, classId: string, steps: number): Promise<Quarter> {
    const spec = { seed, origin, policy: 'gold' as const, steps, protagonist: { name: 'Wenna', raceId: 'human', classId } };
    const metrics = AutoplayRun.empty(), s = await AutoplayRun.start(spec, metrics), c = s.campaign;
    const player = new AutoPlayer('gold', new Draw(`${seed}:${origin}:gold`));
    const start = this.minutes(s), first = ScreenModel.build(c).place.id, out: Step[] = [];
    let held = new Set(Undertakings.held(c).map(o => o.id));
    const lead = Number(this.option(process.argv, '--lead', '0'));
    for (let step = 0; step < steps && c.running; step++) {
      // A player follows the first aim they hold, as Follow this is chosen.
      const aims = Undertakings.held(c);
      if (aims.length && !Undertakings.followed(c, aims)) { Undertakings.follow(c, aims[0]!.id); }
      const move = player.next(AutoplayRun.situation(s, step, true, 'undertaking'));
      if (!move) { break; }
      const fights = metrics.fights;
      try { await AutoplayRun.apply(s, move, player, metrics); } catch { break; }
      const now = new Set(Undertakings.held(c).map(o => o.id)), screen = ScreenModel.build(c);
      out.push({ step, command: move.kind === 'command' ? move.id : `travel:${move.to}`,
        place: screen.place.name, minute: this.minutes(s) - start, fight: metrics.fights > fights,
        taken: [...now].filter(x => !held.has(x)), done: [...held].filter(x => !now.has(x)),
        under: !!screen.place.underground || (!!screen.place.indoors && screen.place.id !== first
          && /__(?!s\d)/.test(screen.place.id)) });
      held = now;
      if (lead && step >= lead) { console.log(this.lead(s)); }
    }
    const town = out.findIndex(x => /country|wild|road|fields|woods|wet ground|moor|hill/i.test(x.place));
    return { seed, origin, steps: out, fights: out.filter(x => x.fight).length,
      places: new Set(out.map(x => x.place)).size, aims: out.flatMap(x => x.taken).length,
      finished: out.flatMap(x => x.done).length, ...town >= 0 ? { outAt: town } : {},
      sites: new Set(out.filter(x => x.under).map(x => x.place)).size, minutes: out.at(-1)?.minute ?? 0,
      talks: out.filter(x => /talk|ask|topic/.test(x.command)).length,
      looks: out.filter(x => /look|search|listen|examine|read/.test(x.command)).length };
  }
  // What the aim followed is led by where the company stands, and what is gold (--lead N, from act N).
  static lead(s: PlaySession): string {
    const c = s.campaign, screen = ScreenModel.build(c), g = Narrator.leaf(c, screen).glance;
    return `  lead ${JSON.stringify(AimLeading.of(c, screen))} gold ${JSON.stringify(g?.acts.filter(a => a.continues)
      .map(a => [a.choice, a.why]))}`;
  }
  static timeline(q: Quarter): string {
    return [`## ${q.seed}/${q.origin}`, ...q.steps.map(x => `${String(x.step).padStart(2)} ${String(x.minute).padStart(5)}m `
      + `${x.place.slice(0, 34).padEnd(34)} ${x.command.slice(0, 60)}${x.fight ? ' FIGHT' : ''}`
      + `${x.taken.length ? ` +${x.taken.join(',')}` : ''}${x.done.length ? ` -${x.done.join(',')}` : ''}`)].join('\n');
  }
  static table(rows: Quarter[]): string {
    return ['| walk | fights | places | sites | aims taken | aims ended | first out (act) | talks | looks | game min |',
      '|---|---|---|---|---|---|---|---|---|---|', ...rows.map(q => `| ${q.seed}/${q.origin} | ${q.fights} | ${q.places} | `
      + `${q.sites} | ${q.aims} | ${q.finished} | ${q.outAt ?? '-'} | ${q.talks} | ${q.looks} | ${q.minutes} |`)].join('\n');
  }
}

if (import.meta.main) { process.exit(await FirstQuarter.main(process.argv.slice(2))); }
