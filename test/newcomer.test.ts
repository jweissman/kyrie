import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { VisitedPlaces } from '../src/presentation/visited-places';
import { Itineraries } from '../src/ui/itinerary';
import { Travel } from '../src/session/travel';

// Mission 16's way in, by someone who knows nothing of the game and sees only the page. They set out for any place
// newly offered to set out for, and again when a journey is stopped; else read what can be read; else ask the first
// question not yet asked; else go somewhere not yet been, in the page's order. Nothing in it names a place, a person
// or an adventure. Over eight worlds of five origins it found the lead in 8 to 17 commands, and stood at the
// march-stone in 13 to 18 (the Mission 16 ledger); two of them are kept here.
class Newcomer {
  readonly asked = new Set<string>(); readonly read = new Set<string>(); readonly tries = new Map<string, number>();
  commands = 0; since = 1; lead?: number;
  constructor(readonly s: PlaySession) {}
  // One command, as the page offers it; whether the company now stands at the end of the country.
  async step(): Promise<boolean> {
    const c = this.s.campaign, offered = PlayerView.choices(c).map(x => x.choice);
    const ready = Itineraries.destinations(c)
      .filter(d => (this.tries.get(d.id) ?? 0) < 3 && (!this.tries.has(d.id) || this.since > 0));
    const edge = ready.find(d => /^region__edge_/.test(d.id)), to = edge ?? ready[0];
    if (edge) { this.lead ??= this.commands; }
    this.commands += 1;
    if (to) {
      this.tries.set(to.id, (this.tries.get(to.id) ?? 0) + 1); this.since = 0;
      const done = await Travel.go({ campaign: c, perform: command => this.s.perform(command) }, to.id);
      return done.arrived && to === edge;
    }
    const pick = this.next(offered);
    if (!pick) { throw new Error(`Nothing new to do at ${c.world.one('at', c.playerActor!)}`); }
    this.since += 1;
    await this.s.perform(pick.id);
    return false;
  }
  private next(offered: { id: string; name: string }[]) {
    const visited = VisitedPlaces.of(this.s.campaign, this.s.campaign.playerActor!);
    const read = offered.find(o => /^Read /.test(o.name) && !this.read.has(o.name));
    const ask = offered.find(o => /^Ask /.test(o.name) && !this.asked.has(o.name));
    const go = offered.find(o => /^go\(/.test(o.id) && !visited.has(o.id.replace(/\)$/, '').split(',').at(-1)!));
    if (read) { this.read.add(read.name); } else if (ask) { this.asked.add(ask.name); }
    return read ?? ask ?? go;
  }
}

describe('a newcomer who sees only the page', () => {
  for (const [seed, origin] of [['thorn', 'order'], ['mere', 'kin']] as const) {
    it(`finds the way to an adventure in ${seed}, and stands at its march-stone soon after`, async () => {
      const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared, { origin,
        party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
      const newcomer = new Newcomer(await PlaySession.start(w.path, seed, w.source));
      let there = false;
      while (!there && newcomer.commands < 30) { there = await newcomer.step(); }
      expect([there, newcomer.lead! <= 20, newcomer.commands <= 25]).toEqual([true, true, true]);
    }, 180000);
  }
});
