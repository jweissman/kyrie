import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { Itineraries } from '../src/ui/itinerary';
import { ModuleWriter } from '../src/lang/module-writer';
import { Vantage } from '../src/world/vantage';
import { ActionFeedbackView } from '../src/presentation/action-feedback';
import { Narrator } from '../src/presentation/narrator';
import { ScreenModel } from '../src/ui/screen-model';
import { GeneratedWorld } from './support/generated';
import type { Land } from '../src/world/land/terrain';

// From somewhere high (Mission 17's vantage points): climbed, a crag or a cairn shows what lies in sight of it over
// the land between, each place by where it lies and how far, as the company knows it then, and each is somewhere to set
// out toward after; the far ones are lost in haze. A place behind a ridge is not seen at all.
class High {
  static async climbed(seed: string) {
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared, { origin: 'wanderer',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'ranger' }] });
    const s = await PlaySession.start(w.path, seed, w.source), c = s.campaign;
    const view = c.module.entities.find(e => /_view$/.test(e.id) && !/_shrine_view$/.test(e.id))!;
    GeneratedWorld.put(s, view.id.replace(/^region__/, '').replace(/_view$/, ''));
    const climb = PlayerView.choices(c).find(x => /^Climb/.test(x.choice.name))!;
    const told = (await s.perform(climb.choice.id)).perceptions?.map(p => p.text) ?? [];
    return { s, c, told };
  }
  // The climb as the page tells it: what happened, what the place says under it, and what is noted in the margin.
  static async page(s: PlaySession, name: string) {
    const c = s.campaign, before = PlayerView.observe(c);
    const climb = PlayerView.choices(c).find(x => x.choice.name === name)!;
    const event = await s.perform(climb.choice.id), feedback = ActionFeedbackView.read(c, event, before);
    const leaf = Narrator.leaf(c, ScreenModel.build(c), { event, feedback, said: name, moved: false });
    return { lines: leaf.exchange!.lines.map(l => l.text), notes: leaf.exchange!.notes, situation: leaf.situation };
  }
}

describe('somewhere high', () => {
  it('shows, climbed, what is in sight of it, and each is somewhere to set out for after', async () => {
    const { c, told } = await High.climbed('larch');
    // (Thrume's: the Bowl of Ammerlin's until the Strewnfield became a province of the first country, Mission 18.)
    expect(told).toContain('To the north-east, not far off: the march-stone of Thrume.');
    expect(told).toContain('To the north-east, not far off: a half-fallen tower.');
    const going = Itineraries.destinations(c).map(d => d.name);
    expect(going).toEqual(expect.arrayContaining(['the march-stone of Thrume', 'a half-fallen tower']));
    const fact = c.module.entities.find(e => e.type === 'fact' && /_saw\d+$/.test(e.id))!;
    expect(c.world.test(ModuleWriter.call('knows', c.playerActor!, fact.id))).toBe(true);
  }, 120000);
  // The first town's shrine has a tower: the first vantage of all, a walk from where a company begins. One who knows
  // the lie of the country (a trader's wayfinding) knows a ruin seen from it for what it is.
  // Told as it was seen: the town below from the top, then each way once (not every sight said again as what was
  // learned, and the ruin again by its name), the ruin's account in the margin; and the tower is there to climb again
  // another day, when the company has gone from it and come back.
  it('shows from the first town\'s tower a ruin, which one who knows the country names, and the way to it', async () => {
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared, { origin: 'debt',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'ranger' }] });
    const s = await PlaySession.start(w.path, 'kite', w.source), c = s.campaign;
    const climb = 'Climb the tower and look out over Newmeet';
    await GeneratedWorld.travel(s, 's1_shrine');
    const { lines, notes, situation } = await High.page(s, climb);
    expect(lines[0]).toStartWith('From the top of the tower Newmeet lies below you');
    expect(lines.slice(1, 6)).toEqual(['To the north, not far off: the edge of Birchwood by Newmeet.',
      'To the north-west, not far off: a square doorway in a hillside in Birchwood.',
      'You know it by its look: that is Paliduslac.', 'It is your wayfinding that makes it out.',
      'The way to a square doorway in a hillside in Birchwood: to the edge of Birchwood by Newmeet, and on to the old bank,'
      + ' where the track to it starts.']);
    expect(lines.filter(l => /^To the /.test(l))).toHaveLength(6);
    expect(lines.at(-1)).toBe('The way down is the stair you came up.');
    expect(notes).toEqual(['Noted: Paliduslac: a square doorway in a hillside in Birchwood']);
    expect(situation.some(p => /^To the /.test(p))).toBe(false);
    // Seen with the way to it, it is somewhere to set out for all the way, not only toward the wood it stands in.
    const ruin = Itineraries.destinations(c).find(d => d.name === 'Paliduslac')!;
    expect([ruin.toward, ruin.legs.at(-1)?.to]).toEqual([undefined, 'region__w3']);
    await GeneratedWorld.travel(s, 's1_green');
    await GeneratedWorld.travel(s, 's1_shrine');
    const again = await High.page(s, climb);
    expect(again.lines.filter(l => /^To the /.test(l))).toContain('To the north-west, not far off: Paliduslac.');
    expect(again.lines.some(l => /by its look/.test(l))).toBe(false);
  }, 120000);
  // Once known by its name, a ruin is called by it everywhere after: the way to it in the journal, and, a step away
  // at the old bank where its track starts, the way there (not a stranger's look on one page and its name on the
  // next, and not gone from the ways a leg away: PT-22).
  it('calls a ruin named from up high by its name after, and offers it a step away', async () => {
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared, { origin: 'debt',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'ranger' }] });
    const s = await PlaySession.start(w.path, 'kite', w.source), c = s.campaign;
    await GeneratedWorld.travel(s, 's1_shrine');
    await High.page(s, 'Climb the tower and look out over Newmeet');
    expect(ScreenModel.build(c).knowledge.map(k => k.text)).toContain('The way to Paliduslac: to the edge of Birchwood by'
      + ' Newmeet, and on to the old bank, where the track to it starts.');
    await GeneratedWorld.travel(s, 'z1_heart');
    expect(ScreenModel.build(c).exits.filter(e => e.destination.id === 'region__w3').map(e => e.destination.name))
      .toEqual(['Paliduslac']);
  }, 120000);
  // Through a spyglass, bought from the chandler in the first town, what lies past the edge of sight is seen too, on a
  // clear day: the first town's tower shows a cave the eye alone does not.
  it('shows past the edge of sight through a spyglass', async () => {
    const w = await WorldAssembler.assemble('pine', NodeBundleSource.shared);
    const s = await PlaySession.start(w.path, 'pine', w.source), c = s.campaign;
    await GeneratedWorld.travel(s, 's1_shop');
    const buy = PlayerView.choices(c).find(x => x.choice.name === 'Buy a spyglass for Elen · 15 coin')!;
    await s.perform(buy.choice.id);
    await GeneratedWorld.travel(s, 's1_shrine');
    const climb = PlayerView.choices(c).find(x => /^Climb the tower/.test(x.choice.name))!;
    const { lines } = await High.page(s, climb.choice.name);
    expect(lines.filter(l => /through the glass/.test(l))).toEqual([
      'To the south, far off, through the glass: a cave in the hillside in Pinehurst.',
      'To the south, far off, through the glass: the footbridge over the Swiftwater.',
      'To the south-east, far off, through the glass: the foot of Bittermoor by Oldgreen.']);
    // Over the march-stone of Merrowdale, something of the country beyond: the Long Man, before anyone speaks of it.
    expect(lines).toContain('Beyond it, over the march: a long ridge laid straight across the head of a dale, too straight'
      + ' for a hill.');
    // On the map from then on, by their look: no ruin's name is glossed there before it is learned. Nor is a Common
    // name, which says what it means: only Wannstede's old Westron and Levankhafar's Khuzdul are.
    const land = ScreenModel.build(c).region!.land!, marks = land.marks.map(m => m.name);
    expect(marks).toEqual(expect.arrayContaining(['a broken keep', 'the march-stone of Merrowdale']));
    expect(Object.keys(land.glosses).map(id => id.replace(/^region__/, ''))).toEqual(['s3', 's4']);
    // A site seen through it is seen with the way to it, as one seen nearer is.
    expect(lines).toContain('The way to a cave in the hillside in Pinehurst: to the edge of Pinehurst by Levankhafar,'
      + ' where the track to it starts.');
  }, 120000);
  it('sees nothing behind a ridge, and nothing far in haze', () => {
    // A hollow, a ridge, a town beyond: from the hollow, nothing; from the ridge's top, the town.
    const land = { width: 5, height: 1, heights: [0.25, 0.3, 0.6, 0.35, 0.4] } as unknown as Land;
    const town = [{ id: 'town', cell: 4 }];
    expect(Vantage.seen(land, 0, town, { kind: 'oak' })).toEqual([]);
    expect(Vantage.seen(land, 2, town, { kind: 'cairn' }).map(s => [s.id, s.bearing, s.far])).toEqual([['town', 'east', false]]);
  });
});
