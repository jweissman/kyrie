import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { Travel } from '../src/session/travel';
import { Itineraries, type Leg } from '../src/ui/itinerary';
import { ScreenModel } from '../src/ui/screen-model';
import { PlaySession, type SessionCheckpoint } from '../src/session/play-session';
import { TravelCensus } from '../scripts/travel-census';

// Travel continuity (the owner's trust contracts, 18 November, E and G): a journey is a sequence of real steps. Each
// leg travelled moves the company from where it was to where the leg goes, spends the leg's time, has the company know
// the land from where it now stands (and nothing it has not come near), and is a point where the journey can be
// stopped by the world as it now is: not by a roll made when it set out, nor one put off to its end. And what comes
// on the way that asks nothing of the player (a pedlar's wave far off) is told with the leg, and the journey goes on.
class Walked {
  // a1 begun once, and each case from that beginning again (PlaySession.resume).
  private static begun?: Promise<SessionCheckpoint>;
  static async start(): Promise<PlaySession> {
    this.begun ??= PlayTool.start(PlayTool.parse(['--world', 'a1', '--as', 'human/warrior/Wenna']))
      .then(x => x.journey.session.checkpoint());
    return PlaySession.resume(structuredClone(await this.begun));
  }
  // A stretch of open country six to eight hexes off, chosen on the map (see TravelCensus.open).
  static far(s: PlaySession): string {
    const c = s.campaign;
    return TravelCensus.open(c, ScreenModel.build(c), 1)[0]!.id;
  }
  static land(s: PlaySession) { return ScreenModel.build(s.campaign).region!.land!; }
  static hexes(width: number, a: number, b: number): number {
    return TravelCensus.span({ width, here: a }, { width, here: b });
  }
}

describe('a journey travelled', () => {
  it('moves, spends its time and knows the land from each leg, as each leg is made', async () => {
    const s = await Walked.start(), c = s.campaign, to = Walked.far(s), plan = Itineraries.plan(c, to)!;
    const broken: string[] = [];
    let n = 0;
    const done = await Travel.go({ campaign: c, perform: async (command: string) => {
      const leg: Leg = plan.legs[n++]!, was = c.world.one('at', c.playerActor!), from = c.readout.elapsed;
      const before = Walked.land(s), event = await s.perform(command), after = Walked.land(s);
      const here = c.world.one('at', c.playerActor!), spent = (c.readout.elapsed - from) * 10;
      if (here === was || here !== leg.to) { broken.push(`leg ${n}: at ${here}, not ${leg.to}`); }
      if (spent < leg.minutes - 10 || spent <= 0) { broken.push(`leg ${n}: ${spent} minutes of ${leg.minutes}`); }
      // Known from where it stands: the cell come to and those about it, and nothing it knew forgotten.
      const about = [after.here!, ...Array.from({ length: after.width * after.height }, (_, i) => i)
        .filter(x => Walked.hexes(after.width, x, after.here!) === 1 && after.cover[x] !== undefined)];
      if (!after.known.includes(after.here!)) { broken.push(`leg ${n}: the cell come to, ${after.here}, unknown`); }
      if (!about.some(x => !before.known.includes(x)) && !before.known.includes(after.here!)) {
        broken.push(`leg ${n}: nothing learned of the land come to`);
      }
      if (before.known.some(x => !after.known.includes(x))) { broken.push(`leg ${n}: land forgotten`); }
      return event;
    } }, to);
    expect(broken).toEqual([]);
    expect(done.legs.length).toBeGreaterThanOrEqual(5);
  }, 60000);
  // The counterexample a roll made up front, or one put off to the journey's end, would fail: a hurt that comes on the
  // third leg stops the journey there, not before it and not legs later.
  it('is stopped by what the world has come to at the leg it comes on', async () => {
    const s = await Walked.start(), c = s.campaign, to = Walked.far(s);
    let n = 0;
    const done = await Travel.go({ campaign: c, perform: async (command: string) => {
      const event = await s.perform(command);
      if (++n === 3) { c.readout.creatures.find(x => c.readout.partyIds.includes(x.id))!.state.hp -= 1; }
      return event;
    } }, to);
    expect([done.legs.length, done.stopped]).toEqual([3, 'Someone was hurt on the way']);
  }, 60000);
  // A pedlar seen far off on the sheep-track, with nothing to be had of them but news, is told with the leg it was
  // seen on and the journey goes on: it had stopped this one at the fourth leg, to be set out on again. Its
  // counterexample is the same leg with something there that asks the player (Travel.weighty): it would stop.
  // Cloudreach's march-stone by its name: laid since AR-21 by no second road it only touched (as quick across the
  // country), it is ten hexes off, past the census's six to eight.
  it('goes on past what asks nothing of the player, and tells it with the leg', async () => {
    const s = await Walked.start(), c = s.campaign;
    const screen = Itineraries.charted(c, ScreenModel.build(c)),
      stone = [...screen.destinations ?? [], ...screen.roads ?? [],
      ...screen.mapped ?? []].find(d => /Cloudreach/.test(d.name))!;
    const done = await Travel.go({ campaign: c, perform: (command: string) => s.perform(command) }, stone.id);
    const met = done.legs.find(l => /pedlar/.test(l.passed ?? ''));
    expect(met).toBeDefined();
    expect(done.arrived).toBe(true);
    expect(done.stopped).toBeUndefined();
  }, 60000);
  // Open (TC row): a road is one place, and coming onto it anywhere has the map know the whole of it and the land
  // beside it: on a1 the second leg, onto the road between Lowmouth and Mistshaw at its junction, made known hexes
  // three beyond where the company turned off it into the open country (26, 27, 47, 66, 67). Passes the day the map
  // knows no more than the company has come near.
  it.failing('knows nothing new far from where each leg comes', async () => {
    const s = await Walked.start(), c = s.campaign, far: string[] = [];
    await Travel.go({ campaign: c, perform: async (command: string) => {
      const before = Walked.land(s), event = await s.perform(command), after = Walked.land(s);
      far.push(...after.known.filter(x => !before.known.includes(x) && Walked.hexes(after.width, x, after.here!) > 3)
        .map(x => `${command}: ${x}`));
      return event;
    } }, Walked.far(s));
    expect(far).toEqual([]);
  }, 60000);
  // Open (TC row): a road leg goes all its hexes at once, the company on the way and at none of them, so nothing on
  // the road between its ends can meet it and the land along it is known only once it has come (iscoed's road to the
  // Tolleth gate: seven hexes, one leg of 230 minutes). Passes the day every leg is a hex.
  it.failing('goes one hex a leg, by road as across country', async () => {
    const s = (await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'human/warrior/Wenna']))).journey.session;
    const c = s.campaign, road = TravelCensus.far(c, 1)[0]!, spans: number[] = [];
    await Travel.go({ campaign: c, perform: async (command: string) => {
      const before = Walked.land(s), event = await s.perform(command), after = Walked.land(s);
      spans.push(Walked.hexes(after.width, before.here!, after.here!));
      return event;
    } }, road.id);
    expect(Math.max(...spans)).toBeLessThanOrEqual(1);
  }, 60000);
});
