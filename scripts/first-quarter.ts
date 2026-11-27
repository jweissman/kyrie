#!/usr/bin/env bun
// The first quarter hour (the owner, 19 November: "the conflicts are just way too thin — quests are over too quickly,
// we're sent out of town immediately and the dungeons are deathly dull, with almost no content or combat; it sends
// you on a random chain of quests that don't circle back or explain themselves"; wanted: 3x–10x content in the first
// 15 minutes). A player who follows the gold, as the owner does, in each origin of a country; per walk, what came of
// it act by act: where, a fight, an aim taken or finished, and what the walk added up to. A measure, not a gate.
//   bun scripts/first-quarter.ts [--seeds iscoed] [--origins drove,debt,kin,herbs,order,wanderer] [--steps 60]
//     [--calling warrior] [--timeline] [--lead N]
import { AutoplayRun } from '../src/autoplay/run';
import { AutoPlayer, type Move } from '../src/autoplay/player';
import { Draw } from '../src/autoplay/draw';
import { Undertakings } from '../src/presentation/undertakings';
import { ScreenModel } from '../src/ui/screen-model';
import { AimLeading } from '../src/presentation/aim-lead';
import { Narrator } from '../src/presentation/narrator';
import { Guarded } from '../src/presentation/guarded';
import { AimContinuity } from '../src/presentation/aim-continuity';
import { EntityIndex } from '../src/lang/entity-index';
import { Spatial } from '../src/lang/spatial';
import { KnownWays } from '../src/ui/known-ways';
import { Stakes } from '../src/ui/stakes';
import { Itineraries } from '../src/ui/itinerary';
import type { Objective } from '../src/lang/module';
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
  // A command led, as a move: a journey about the town by its place.
  private static move(command: string): Move {
    return command.startsWith('travel:') ? { kind: 'travel', to: command.slice('travel:'.length) } : { kind: 'command', id: command };
  }
  static minutes(s: PlaySession): number {
    return s.campaign.readout.elapsed * 10 + (s.campaign.readout.minutes ?? 0);
  }
  // What the player does first, before following the gold (a job asked after: a notice's jobs are leads, HP-01).
  static async walk(seed: string, origin: string, classId: string, by: number | { steps: number; asked: string[] })
    : Promise<Quarter> {
    const [steps, asked] = typeof by === 'number' ? [by, []] : [by.steps, by.asked];
    const spec = { seed, origin, policy: 'gold' as const, steps, protagonist: { name: 'Wenna', raceId: 'human', classId } };
    const metrics = AutoplayRun.empty(), s = await AutoplayRun.start(spec, metrics), c = s.campaign;
    for (const act of asked) { await s.leg(act); }
    const player = new AutoPlayer('gold', new Draw(`${seed}:${origin}:gold`));
    const start = this.minutes(s), first = ScreenModel.build(c).place.id, out: Step[] = [];
    let held = new Set(Undertakings.held(c).map(o => o.id));
    const lead = Number(this.option(process.argv, '--lead', '0'));
    for (let step = 0; step < steps && c.running; step++) {
      // A player follows the first aim they hold, as Follow this is chosen.
      // A player follows the first aim they hold, as Follow this is chosen; and, turned back from a step they will not
      // take yet (a fight the page reckons deadly), going to and fro, the next.
      // So too where the aim followed says what stands between it and the company, beyond it (Guarded: the keeper of
      // the vault, reckoned deadly): a player reads that and follows another.
      // OR-1396: a needed camp must not hide a to-and-fro route from the player's loop detection.
      const aims = Undertakings.held(c), places = out.map(x => x.place);
      const was = places.filter((p, i) => !i || p !== places[i - 1]).slice(-4);
      const fro = was.length === 4 && was[0] === was[2] && was[1] === was[3] && was[0] !== was[1];
      const glance = Narrator.leaf(c, ScreenModel.build(c)).glance, stands = glance?.continuance;
      const between = stands?.kind === 'frontier' && !!stands.need;
      // Unless the need names someone to take along, and the page leads to them: a player reads that, and goes to ask
      // (OR-417: the Hall cellar's rats beyond a mage and the hand, Carlin in the taproom).
      const help = between ? glance?.acts.find(a => a.why === 'help') : undefined;
      const next = !help && (fro || between) ? aims.find(o => o.id !== Undertakings.followed(c, aims)?.id) : undefined;
      if (next) { Undertakings.follow(c, next.id); }
      else if (aims.length && !Undertakings.followed(c, aims)) { Undertakings.follow(c, this.nearest(s, aims).id); }
      // Nor, the need said, does a player take the way it says is beyond them while nothing else is led (its four still
      // show it: only gold is the aim's step).
      // Nor, the aim's place shut to it (Shut: the press-door locked, nothing to open it), a way or a walk back to it.
      const led = AutoplayRun.situation(s, step, true, 'undertaking'), sit = between ? { ...led, led: (led.led ?? [])
        .filter(id => !this.beyond(s, id) && !(/^(go\(|travel:)/.test(id) && this.went(s, id))) } : led;
      const asked = help && (help.for ?? help.command);
      const move = this.rest(s, sit.offered) ?? (asked ? this.move(asked) : player.next(sit));
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
  // A way or a walk the need said goes nowhere for now: back in to a keeper beyond the company (Guarded), or on the
  // way toward the aim's place where its keeper is beyond the company or it is shut to the company (Shut).
  // A way to somewhere been already: with the aim's step said to be beyond the company for now, not walked again for
  // its own sake (the ossuary and the charnel passage, each led from the other, twenty times).
  static went(s: PlaySession, id: string): boolean {
    const to = id.startsWith('travel:') ? id.slice('travel:'.length) : AutoPlayer.destination(id);
    return s.campaign.world.test({ kind: 'call', name: 'been', args: [s.campaign.playerActor ?? 'party', to] });
  }
  static beyond(s: PlaySession, id: string): boolean {
    const c = s.campaign, to = id.startsWith('travel:') ? id.slice('travel:'.length)
      : /^go\(/.test(id) ? AutoPlayer.destination(id) : undefined;
    if (!to) { return false; }
    if (Guarded.beyond(c, to)) { return true; }
    const lead = AimLeading.of(c, ScreenModel.build(c)), aim = lead?.next[0], here = c.world.one('at', 'party') ?? '';
    const byId = EntityIndex.of(c.module.entities).byId;
    const place = aim && (byId.get(aim)?.space ? aim : c.world.one('at', aim));
    if (!place || !AimContinuity.closed(c, here, place)) { return false; }
    // To it, or to what it is within: not a way through on to somewhere else (the cellar, the way out from below).
    return to === place || (id.startsWith('travel:') && Spatial.ancestry(byId, place).some(e => e.id === to))
      || KnownWays.places(c, here, place, { barred: true }).slice(-2).includes(to);
  }
  // What the aim followed is led by where the company stands, and what is gold (--lead N, from act N).
  static lead(s: PlaySession): string {
    const c = s.campaign, screen = ScreenModel.build(c), g = Narrator.leaf(c, screen).glance;
    return `  lead ${JSON.stringify(AimLeading.of(c, screen))} gold ${JSON.stringify(g?.acts.filter(a => a.continues)
      .map(a => [a.choice, a.why]))}`;
  }
  // The aim a player would take up first: the nearest of those held, where what it is toward or by is reached soonest
  // (the book's order had sent the drove life to Reedbridge with the notice on the green unread).
  static nearest(s: PlaySession, aims: Objective[]): Objective {
    return aims.map(o => ({ o, m: this.far(s, o) })).sort((a, b) => a.m - b.m)[0]!.o;
  }
  static far(s: PlaySession, o: Objective): number {
    const c = s.campaign, here = c.world.one('at', c.playerActor ?? 'party'), t = Stakes.target(c, o);
    const to = t.routeTo ?? t.actionAt ?? (t.subject && c.world.one('at', t.subject));
    return !to ? Infinity : to === here ? 0 : Itineraries.plan(c, to)?.minutes ?? Infinity;
  }
  // Hurt to under half, a careful player rests where a rest is offered before going on (the walker rests only in the
  // dark, and a lone warrior hurt by the adit's beetles and roof had gone on into the spiders' gallery and died).
  static rest(s: PlaySession, offered: { id: string }[]): Move | undefined {
    const c = s.campaign, me = c.readout.creatures.find(x => c.tickState.current.partyIds.includes(x.id));
    const hurt = !!me && me.state.hp < me.base.maxHp / 2;
    const rest = hurt ? offered.find(o => /^(rest|camp|take_lodging|sleep)/.test(o.id)) : undefined;
    return rest ? { kind: 'command', id: rest.id } : undefined;
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
