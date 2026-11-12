import { describe, expect, it } from 'bun:test';
import { AutoplayRun } from '../src/autoplay/run';
import { AutoPlayer } from '../src/autoplay/player';
import { Draw } from '../src/autoplay/draw';
import { ScreenModel } from '../src/ui/screen-model';
import { Narrator } from '../src/presentation/narrator';
import { PlayerView } from '../src/presentation/player-view';
import { Itineraries } from '../src/ui/itinerary';
import { Undertakings } from '../src/presentation/undertakings';

// The gold is honest (the architecture risk review's R9, and its gate: a corpus of the cold rounds' false promises).
// A company that does only what the gold leads it to, from the debt's start, is led at each step by what the engine
// offers (every led act's command offered now, or a journey it plans), with the aim's gold on one act at most, and
// that one the aim's; and it is not led round in circles: the same place under the same aim, over and over, was the
// gold that led nowhere (round 7: past the buck rat to the drain, and back to a centipede just fled). Where there is
// no gold the walker goes by its own policy, and that is not judged here.
describe('a walk by the gold', () => {
  it('is led only to what can be done, one act at a time, and not round in circles', async () => {
    const spec = { seed: 'kahitude', origin: 'debt', policy: 'gold' as const, steps: 40,
      protagonist: { name: 'Ralf', raceId: 'human', classId: 'warrior' } };
    const metrics = AutoplayRun.empty(), s = await AutoplayRun.start(spec, metrics), c = s.campaign;
    // The debt followed, as a player chooses it with Follow this (nothing is followed for them: the owner, 12
    // November).
    Undertakings.follow(c, Undertakings.held(c).find(o => Undertakings.errand(c, o))!.id);
    const player = new AutoPlayer('gold', new Draw('kahitude:debt:gold')), led = new Map<string, number>();
    const broken: string[] = [];
    for (let step = 0; step < spec.steps && c.running; step++) {
      const screen = ScreenModel.build(c), acts = Narrator.leaf(c, screen).glance?.acts ?? [];
      const offered = new Set(PlayerView.choices(c).map(r => r.choice.id)), gold = acts.filter(a => a.continues);
      if (gold.length > 1) { broken.push(`${step}: gold on ${gold.length} acts at ${screen.place.id}`); }
      if (gold[0] && !gold[0].aspects.includes('undertaking')) { broken.push(`${step}: gold not the aim's: ${gold[0].label}`); }
      for (const a of acts.filter(x => x.command && !x.command.startsWith('travel:') && !offered.has(x.command))) {
        if (!a.for) { broken.push(`${step}: led "${a.label}" not offered (${a.command})`); }
      }
      for (const a of acts.filter(x => x.command?.startsWith('travel:'))) {
        if (!Itineraries.plan(c, a.command!.slice('travel:'.length))) { broken.push(`${step}: no way for "${a.label}"`); }
      }
      const aim = screen.aims?.find(a => a.followed)?.id ?? '', from = screen.place.id;
      // The gold taken whenever there is one (the walker's own care would back away first: this is the gold's test);
      // the walker's policy where there is none.
      const sit = AutoplayRun.situation(s, step, true, AutoPlayer.prefers.gold), lead = gold[0];
      const taken = lead?.command?.startsWith('travel:') ? { kind: 'travel' as const, to: lead.command.slice(7) }
        : lead ? { kind: 'command' as const, id: lead.for ?? lead.command ?? '' } : undefined;
      const move = taken && (taken.kind === 'travel' || offered.has(taken.id)) ? taken : player.next(sit);
      if (!move) { break; }
      await AutoplayRun.apply(s, move, player, metrics);
      // Each way the gold led, from where to where, under which aim.
      const to = c.world.one('at', 'party') ?? '';
      if (move === taken && to !== from) { led.set(`${aim}|${from}>${to}`, (led.get(`${aim}|${from}>${to}`) ?? 0) + 1); }
    }
    // Led there and straight back, and there again, under one aim: the gold that leads nowhere.
    // Or led to the same place under one aim again and again, the gold gone each time it came there (Seolforfyrd, its
    // hobs at the gate and no gold, before the parley was the aim's).
    const to = new Map<string, number>();
    for (const [k, n] of led) { const [aim, way] = k.split('|'), key = `${aim}|${way!.split('>')[1]}`; to.set(key, (to.get(key) ?? 0) + n); }
    const circles = [...[...led].filter(([k, n]) => {
      const [aim, way] = k.split('|'), [a, b] = way!.split('>');
      return n > 1 && (led.get(`${aim}|${b}>${a}`) ?? 0) > 1;
    }), ...[...to].filter(([, n]) => n > 2)].map(([k, n]) => `${k} ×${n}`);
    expect(broken).toEqual([]);
    expect(circles).toEqual([]);
  }, 300000);
});
