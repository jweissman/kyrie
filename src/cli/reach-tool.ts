// `kyrie reach`: what of an adventure a curious player comes upon in ordinary play, against what was written (see
// Curious): rooms, people, what can be asked of them, what can be done, what is seen, and what is sold.
//   bin/kyrie reach <campaign.json> [--seed s] [--steps n] [--detail]
//   bin/kyrie reach --all [--steps n]     every campaign, a line each
import { readdir } from 'node:fs/promises';
import { Journey } from '../session/journey';
import { Curious, type Reach } from '../autoplay/curious';
import type { Module } from '../lang/module';

export interface Written { rooms: string[]; people: string[]; topics: string[]; acts: string[]; observations: string[] }
export class ReachTool {
  static readonly usage = 'usage: kyrie reach <campaign.json> [--seed s] [--steps n] [--detail] | --all [--steps n]';
  // What the campaign's own modules wrote (not the rules every world shares).
  static written(m: Module, installed: string[]): Written {
    const own = this.own.bind(this, installed);
    return {
      rooms: m.entities.filter(e => e.type === 'place' && e.space?.kind === 'room' && own(e.id)).map(e => e.id),
      people: m.entities.filter(e => e.type === 'group' && own(e.id)).map(e => e.id),
      topics: m.actions.filter(a => a.speaker && own(a.id)).map(a => a.id),
      acts: m.actions.filter(a => !a.speaker && own(a.id)).map(a => a.id),
      observations: (m.observations ?? []).filter(o => own(o.id)).map(o => o.id) };
  }
  private static own(installed: string[], id: string): boolean { return installed.some(i => id.startsWith(`${i}__`)); }
  private static short(id: string): string { return id.replace(/^\w+__/, ''); }
  // Of what was written, what was not reached.
  private static missing(got: Iterable<string>, of: string[]): string {
    const had = new Set(got);
    return of.filter(x => !had.has(x)).map(x => this.short(x)).join(' ') || '-';
  }
  private static flag(args: string[], name: string): string | undefined {
    const i = args.indexOf(`--${name}`);
    return i < 0 ? undefined : args[i + 1];
  }
  // Played again from the start, up to three times more, past whatever closed the book before its end.
  static async run(campaign: string, seed: string, steps: number) {
    const avoid = new Set<string>();
    let j = await Journey.start(campaign, seed), curious = new Curious(j, avoid);
    const reach = await curious.play(steps);
    for (let tries = 0; tries < 3 && curious.closer && !/^(wait|rest|sleep)/.test(curious.closer); tries++) {
      avoid.add(curious.closer); reach.ended = undefined;
      j = await Journey.start(campaign, seed); curious = new Curious(j, avoid, reach);
      await curious.play(steps);
    }
    return { j, reach, written: this.written(j.campaign.world.module, j.campaign.installed) };
  }
  static ratio(got: Iterable<string>, of: string[]): string {
    const had = new Set(got), n = of.filter(x => had.has(x)).length;
    return `${n}/${of.length}`;
  }
  static line(name: string, r: Reach, w: Written): string {
    const wares = new Set([...r.trade.values()].flat());
    return [name.padEnd(28), `rooms ${this.ratio(r.rooms, w.rooms)}`, `people ${this.ratio(r.people.keys(), w.people)}`,
      `topics ${this.ratio(r.topicsOffered, w.topics)}`, `acts ${this.ratio(r.actsOffered, w.acts)}`,
      `seen ${this.ratio(r.observed, w.observations)}`, `mute ${[...r.mute].filter(m => !r.spoken.has(m)).length}`,
      `sellers ${r.trade.size} wares ${wares.size}`, `idle ${r.idle}/${r.steps}`, r.closed.length ? `closed ${r.closed.length}x` : '',
      r.ended === 'steps' ? '' : `(${r.ended?.slice(0, 60)})`].join('  ');
  }
  // Who traded, each with what they sold (or only bought).
  private static traders(m: Map<string, string[]>): string {
    return [...m].map(([who, what]) => `${this.short(who)} (${what.join(', ')})`).join('; ');
  }
  static detail(r: Reach, w: Written, print: (line: string) => void) {
    const short = this.short.bind(this), missing = this.missing.bind(this);
    print(`  ended: ${r.ended}`);
    for (const c of r.closed) { print(`  closed the book: ${c}`); }
    print(`  first met someone ${r.firstMet ?? 'never'}; first had something to ask ${r.firstAsked ?? 'never'}`);
    print(`  unvisited rooms: ${missing(r.rooms, w.rooms)}`);
    print(`  unmet people: ${missing(r.people.keys(), w.people)}`);
    print(`  never had anything to say: ${[...r.mute].filter(m => !r.spoken.has(m)).map(short).join(' ') || '-'}`);
    print(`  topics never offered: ${missing(r.topicsOffered, w.topics)}`);
    print(`  sold: ${this.traders(r.trade) || 'nothing'}`);
    if (r.buyers.size) { print(`  only bought: ${this.traders(r.buyers)}`); }
    const busiest = [...r.crowd].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([p, n]) => `${short(p)} ${n}`);
    const empty = [...r.crowd].filter(([, n]) => n === 0).length;
    print(`  busiest: ${busiest.join(', ')}; rooms never seen with anyone in them: ${empty}/${r.crowd.size}`);
  }
  static async main(args: string[], print: (line: string) => void = console.log): Promise<number> {
    const steps = Number(this.flag(args, 'steps') ?? 900), seed = this.flag(args, 'seed') ?? 'reach';
    const all = args.includes('--all'), campaign = args.find(a => a.endsWith('.campaign.json'));
    if (!all && !campaign) { print(this.usage); return 1; }
    const campaigns = all ? (await readdir('data/campaigns')).filter(f => f.endsWith('.campaign.json'))
      .map(f => `data/campaigns/${f}`) : [campaign!];
    for (const c of campaigns) {
      try {
        const { reach, written } = await this.run(c, seed, steps);
        print(this.line(c.replace(/^.*\/|\.campaign\.json$/g, ''), reach, written));
        if (!all || args.includes('--detail')) { this.detail(reach, written, print); }
      } catch (e) { print(`! ${c}: ${(e as Error).message}`); }
    }
    return 0;
  }
}
