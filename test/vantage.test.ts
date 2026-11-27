import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
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
    const told = (await s.leg(climb.choice.id)).perceptions?.map(p => p.text) ?? [];
    return { s, c, told };
  }
  // The climb as the page tells it: what happened, what the place says under it, and what is noted in the margin.
  static async page(s: PlaySession, name: string) {
    const c = s.campaign, before = PlayerView.observe(c);
    const climb = PlayerView.choices(c).find(x => x.choice.name === name)!;
    const event = await s.leg(climb.choice.id), feedback = ActionFeedbackView.read(c, event, before);
    const leaf = Narrator.leaf(c, ScreenModel.build(c), { event, feedback, said: name, moved: false });
    return { lines: leaf.exchange!.lines.map(l => l.text), notes: leaf.exchange!.notes, situation: leaf.situation };
  }
}

describe('somewhere high', () => {
  // A hex or two about where it stands, and no further (the owner, 26 November, OR-1253): each sighting not far off or
  // some way off, none at the edge of sight, and each known from then on.
  it('shows, climbed, what is in sight of it within a hex or two, each known after', async () => {
    const { c, told } = await High.climbed('larch');
    const seen = told.filter(t => /^To the /.test(t));
    expect(seen.every(t => /^To the [a-z-]+, (not far off|some way off): /.test(t))).toBe(true);
    const fact = c.module.entities.find(e => e.type === 'fact' && /_saw\d+$/.test(e.id));
    if (fact && seen.length) { expect(c.world.test(ModuleWriter.call('knows', c.playerActor!, fact.id))).toBe(true); }
  }, 120000);
  // The first town's shrine has a tower: the first vantage of all, a walk from where a company begins. One who knows
  // the lie of the country (a trader's wayfinding) knows a ruin seen from it for what it is.
  // Told as it was seen: the town below from the top, then each way once (not every sight said again as what was
  // learned, and the ruin again by its name), the ruin's account in the margin; and the tower is there to climb again
  // another day, when the company has gone from it and come back.
  it('shows from the first town\'s tower its own neighbourhood, told once, the way down after', async () => {
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared, { origin: 'debt',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'ranger' }] });
    const s = await PlaySession.start(w.path, 'kite', w.source);
    await GeneratedWorld.travel(s, 's1_shrine');
    const { lines, situation } = await High.page(s, 'Climb the tower and look out over Newmeet');
    expect(lines[0]).toStartWith('From the top of the tower Newmeet lies below you');
    expect(lines.filter(l => /^To the /.test(l)).every(l => !/, far off|through the glass/.test(l))).toBe(true);
    expect(lines.at(-1)).toBe('The way down is the stair you came up.');
    expect(situation.some(p => /^To the /.test(p))).toBe(false);
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
    expect(ScreenModel.build(c).knowledge.map(k => k.text)).toContain('The way to Palelake: to the edge of Birchwood by'
      + ' Newmeet, and on to the old bank, where the track to it starts, beside the track to a toll-house by the water.');
    await GeneratedWorld.travel(s, 'z1_heart');
    expect(ScreenModel.build(c).exits.filter(e => e.destination.id === 'region__w3').map(e => e.destination.name))
      .toEqual(['Palelake']);
  }, 120000);
  // Through a spyglass, nothing past a hex or two either (OR-1253): the climb shows the place's neighbourhood alone.
  it('shows nothing past a hex or two, even through a spyglass', async () => {
    const w = await WorldAssembler.assemble('pine', NodeBundleSource.shared, { standing: [] });
    const s = await PlaySession.start(w.path, 'pine', w.source), c = s.campaign;
    await GeneratedWorld.travel(s, 's1_shop');
    const buy = PlayerView.choices(c).find(x => x.choice.name === 'Buy a spyglass for Elen · 15 coin')!;
    await s.leg(buy.choice.id);
    await GeneratedWorld.travel(s, 's1_shrine');
    const climb = PlayerView.choices(c).find(x => /^Climb the tower/.test(x.choice.name))!;
    const { lines } = await High.page(s, climb.choice.name);
    expect(lines.filter(l => /, far off|through the glass/.test(l))).toEqual([]);
  }, 120000);
  it('sees nothing behind a ridge, and nothing far in haze', () => {
    // A hollow, a ridge, a town beyond: from the hollow, nothing; from the ridge's top, the town.
    const land = { width: 5, height: 1, heights: [0.25, 0.3, 0.6, 0.35, 0.4] } as unknown as Land;
    const town = [{ id: 'town', cell: 4 }];
    expect(Vantage.seen(land, 0, town, { kind: 'oak' })).toEqual([]);
    expect(Vantage.seen(land, 2, town, { kind: 'cairn' }).map(s => [s.id, s.bearing, s.far])).toEqual([['town', 'east', true]]);
    // Three hexes off is past what a climb shows (OR-1253).
    const flat = { width: 5, height: 1, heights: [0.3, 0.3, 0.3, 0.3, 0.3] } as unknown as Land;
    expect(Vantage.seen(flat, 0, [{ id: 'near', cell: 2 }, { id: 'far', cell: 3 }], { kind: 'tower' }).map(x => x.id))
      .toEqual(['near']);
  });
});
