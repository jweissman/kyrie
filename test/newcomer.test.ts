import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { VisitedPlaces } from '../src/presentation/visited-places';
import { Itineraries } from '../src/ui/itinerary';
import { Travel } from '../src/session/travel';

// Mission 16's way in, by someone who knows nothing of the game and sees only the page. They read what can be read;
// else set out for any place newly offered to set out for, and again for one a journey stopped short of once they
// have done something else (three journeys that get nowhere and they give it up); else ask the first question not
// yet asked; else go somewhere not yet been, in the page's order; and with nothing new where they stand, set out for
// somewhere they know and have not come to, or failing that anywhere they know, or go back the way they came.
// Stopped by nightfall or weariness, they rest if they can. Nothing in it names a place, a person or an adventure.
// Over eight worlds of five origins it first found the lead in 8 to 17 commands, and stood at the march-stone in 13
// to 18 (the Mission 16 ledger). Once word of a place led somewhere (the M16 deepening), the same eight found it in 4
// to 31 and stood there in 6 to 35, having gone first where the rumours went: wren's newcomer went down the old
// workings, past the goblins, to the pump-room, before ever reading the notice. Two of them are kept here.
class Newcomer {
  readonly asked = new Set<string>(); readonly read = new Set<string>(); readonly tries = new Map<string, number>();
  // Every place they have been offered to set out for, and every one they have come to.
  readonly offered = new Set<string>(); readonly been = new Set<string>();
  commands = 0; since = 0; stopped?: { to: string; why: string }; lead?: number;
  constructor(readonly s: PlaySession) {}
  // One command, as the page offers it; whether the company now stands at the end of the country.
  async step(): Promise<boolean> {
    const c = this.s.campaign, offered = PlayerView.choices(c).map(x => x.choice);
    const known = Itineraries.destinations(c).filter(d => (this.tries.get(d.id) ?? 0) < 3);
    const ready = known.filter(d => !this.offered.has(d.id) || (d.id === this.stopped?.to && this.since > 0));
    for (const d of known) { this.offered.add(d.id); }
    const edge = ready.find(d => /^region__edge_/.test(d.id));
    if (edge) { this.lead ??= this.commands; }
    this.commands += 1;
    const pick = this.rest(offered) ?? this.reading(offered) ?? (edge ?? ready[0] ? undefined : this.next(offered));
    const to = pick ? undefined : edge ?? ready[0] ?? known.find(d => !this.been.has(d.id)) ?? known[0];
    // Nowhere further to set out for: back the way they came.
    const back = pick ?? (to ? undefined : offered.find(o => /^go\(/.test(o.id)));
    if (to) {
      this.since = 0;
      const done = await Travel.go({ campaign: c, perform: command => this.s.perform(command) }, to.id);
      // A journey that got nowhere is a try spent, and so is one that stops again where no way on is known (the
      // brothers' errand to the nearest of the makers' works, past the edge of wild country whose way the letter
      // tells); one stopped on the way only wants taking up again.
      if (!done.legs.length || /^You know no way on/.test(done.stopped ?? '')) {
        this.tries.set(to.id, (this.tries.get(to.id) ?? 0) + 1);
      }
      this.stopped = done.arrived ? undefined : { to: to.id, why: done.stopped ?? '' };
      if (done.arrived) { this.been.add(to.id); }
      return done.arrived && /^region__edge_/.test(to.id);
    }
    if (!back) { throw new Error(`Nothing new to do at ${c.world.one('at', c.playerActor!)}`); }
    this.since += 1;
    await this.s.perform(back.id);
    return false;
  }
  // Stopped by the dark or by weariness: a night's rest where one is offered, or else waiting for the light.
  private rest(offered: { id: string; name: string }[]) {
    if (!/^(Night has come on|You are weary)/.test(this.stopped?.why ?? '') || this.since > 0) { return undefined; }
    return offered.find(o => /^Rest and recover/.test(o.name)) ?? offered.find(o => /^Make camp/.test(o.name))
      ?? offered.find(o => /^Wait until first light/.test(o.name));
  }
  private reading(offered: { id: string; name: string }[]) {
    const read = offered.find(o => /^Read /.test(o.name) && !this.read.has(o.name));
    if (read) { this.read.add(read.name); }
    return read;
  }
  private next(offered: { id: string; name: string }[]) {
    const visited = VisitedPlaces.of(this.s.campaign, this.s.campaign.playerActor!);
    const ask = offered.find(o => /^Ask /.test(o.name) && !/^Ask .* again /.test(o.name) && !this.asked.has(o.name));
    const go = offered.find(o => /^go\(/.test(o.id) && !visited.has(o.id.replace(/\)$/, '').split(',').at(-1)!));
    if (ask) { this.asked.add(ask.name); }
    return ask ?? go;
  }
}

describe('a newcomer who sees only the page', () => {
  for (const [seed, origin] of [['thorn', 'order'], ['mere', 'kin']] as const) {
    it(`finds the way to an adventure in ${seed}, and stands at its march-stone soon after`, async () => {
      const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared, { origin,
        party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
      const newcomer = new Newcomer(await PlaySession.start(w.path, seed, w.source));
      let there = false;
      while (!there && newcomer.commands < 45) { there = await newcomer.step(); }
      expect([there, newcomer.lead! <= 20, newcomer.commands <= 40]).toEqual([true, true, true]);
    }, 180000);
  }
});
