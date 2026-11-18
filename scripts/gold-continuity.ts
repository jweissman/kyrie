#!/usr/bin/env bun
// Gold continuity over generated worlds (the owner's trust contracts, 18 November, B): a player who follows an aim and
// takes only its gold, every turn, as the runner offers it. Each turn says whether anything is gold (an act of the
// four bearing the undertaking, or one the glance's lead acts on), and where gold was taken and none is left after it,
// what was taken, where the company came to, the lead's source there, and what the aim names. A measure, then a gate.
//   bun scripts/gold-continuity.ts [world/origin/race/calling,...] [turns=40]
import { PlayTool } from '../src/cli/play-tool';
import { Runner, type Offered, type Said } from '../src/cli/runner';
import { AimLeading } from '../src/presentation/aim-lead';
import { ScreenModel } from '../src/ui/screen-model';

interface Lapse { world: string; turn: number; took: string; at: string; aim?: string; lead?: string }
export class GoldContinuity {
  static gold(s: Said): Offered | undefined {
    const all = [...s.offer.primary, ...s.offer.rest];
    // Gold first; what is only led on the step (a riddle's words at the speaking door: led, never gold, PB-16b) after.
    return s.offer.primary.find(o => o.aspects.includes('undertaking')) ?? all.find(o => o.aspects.includes('undertaking'))
      ?? all.find(o => s.led?.includes(o.id));
  }
  static said(x: Said | { error: string }): Said { if ('error' in x) { throw new Error(x.error); } return x; }
  // The first aim held taken up where none is followed, as a player would from the Notes.
  static async followed(r: Runner, s: Said): Promise<Said> {
    const first = s.aims?.[0];
    return s.aims?.some(a => a.followed) || !first ? s : this.said(await r.ask(JSON.stringify({ follow: first.id })));
  }
  static async walk(spec: string, turns: number): Promise<{ lapses: Lapse[]; taken: number; ended: string }> {
    const [world, origin, race, calling, past] = spec.split('/');
    const as = `${race || 'human'}/${calling || 'warrior'}/Wenna${past ? `/${past}` : ''}`;
    const args = ['--world', world!, '--as', as, ...origin ? ['--origin', origin] : []];
    const { journey } = await PlayTool.start(PlayTool.parse(args));
    const r = new Runner(journey.session), lapses: Lapse[] = [];
    let s = r.said(), taken = 0;
    // A loop: the same gold taken at the same place a third time (cold play 5: forecourt and kitchen, round and round).
    const seen = new Map<string, number>();
    s = await this.followed(r, s);
    for (let t = 0; t < turns; t++) {
      if (s.end) { return { lapses, taken, ended: 'the end' }; }
      s = await this.followed(r, s);
      const g = this.gold(s);
      if (!g && s.going?.kind === 'frontier') {
        if (process.env.GOLD_TRACE) { console.log(`  ⋯ ${[...s.offer.primary, ...s.offer.rest].map(o => o.label).join(' | ')}`); }
        return { lapses, taken, ended: `frontier at ${s.at}: ${s.going.said}` };
      }
      if (!g) { return { lapses, taken, ended: `no gold at ${s.at} (aim ${s.aims?.find(a => a.followed)?.text ?? 'none'})` }; }
      if (process.env.GOLD_TRACE) { console.log(`  · ${s.at}: ${g.label} [${s.going?.kind ?? "-"}]`); }
      const key = `${s.at}|${g.id}`, times = (seen.get(key) ?? 0) + 1;
      seen.set(key, times);
      if (times >= 3) {
        lapses.push({ world: spec, turn: t, took: `LOOP ${g.id} (${g.label})`, at: s.at ?? '?',
          aim: s.aims?.find(a => a.followed)?.text, lead: s.going ? `${s.going.kind}` : 'none' });
        return { lapses, taken, ended: `loop at ${s.at}` };
      }
      const next = await r.ask(JSON.stringify({ act: g.id }));
      if ('error' in next) { return { lapses, taken, ended: `refused ${g.id}: ${next.error}` }; }
      taken++;
      // A lapse: gold taken, an aim still followed, and no gold after it.
      // A frontier said (what bars the way, that nothing here bears on the aim) is the contract's fourth outcome.
      if (!this.gold(next) && !next.end && next.aims?.some(a => a.followed) && next.going?.kind !== 'frontier') {
        const c = journey.session.campaign, lead = AimLeading.of(c, ScreenModel.build(c));
        lapses.push({ world: spec, turn: t, took: `${g.id} (${g.label})`, at: next.at ?? '?',
          aim: next.aims?.find(a => a.followed)?.text, lead: lead ? `${lead.source} → ${lead.next.join(', ')}` : 'none' });
      }
      s = next;
    }
    return { lapses, taken, ended: `${turns} turns` };
  }
  static async main(argv: string[]): Promise<number> {
    const specs = (argv[0] ?? 'a1/order,a1/debt,b2/courier,c3/wanderer,iscoed,kite/order').split(',');
    const turns = Number(argv[1] ?? '40');
    let lapsed = 0;
    for (const spec of specs) {
      const w = await this.walk(spec, turns).catch(e => ({ lapses: [], taken: 0, ended: `not begun: ${e}` }));
      console.log(`${spec}: ${w.taken} gold taken, ${w.lapses.length} lapses; ended: ${w.ended}`);
      for (const l of w.lapses) { console.log(`  T${l.turn} took ${l.took} → at ${l.at}; aim: ${l.aim}; lead: ${l.lead}`); }
      lapsed += w.lapses.length;
    }
    return lapsed ? 1 : 0;
  }
}
if (import.meta.main) { process.exit(await GoldContinuity.main(process.argv.slice(2))); }
