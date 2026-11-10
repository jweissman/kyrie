import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ScreenModel } from '../src/ui/screen-model';
import { LandModel } from '../src/ui/land-model';
import { Travel } from '../src/session/travel';
import type { Knowing as Known, RegionChart } from '../src/ui/screen-types';
import { HexLand } from '../web/reader/hex-land';
import { BoardField } from '../web/reader/board-field';
import { GeneratedWorld } from './support/generated';

type Land = NonNullable<RegionChart['land']>;
interface Shown { region: RegionChart; land: Land; states: Record<string, Known> }
// What the map shows of a place follows what the company has done (the owner's corrections of 2026-10-29, OWN-23,
// OWN-24, OWN-26), played in kite with a stranger come to Newmeet who has no wayfinding (a noble's daughter with a
// sword): what she has only heard of is a mark and no more; a site just past the land she knows is a question; the
// way to a tower told her by the innkeeper is known with it; what she sees from the shrine's tower is shown for what
// it is; and the ruin she goes to is known whole. Nothing known is forgotten on the way, and the board and the flat
// map say the same of every town and place at every step.
class Knowing {
  static async start(): Promise<PlaySession> {
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared, { origin: 'wanderer',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior', backgroundId: 'noble' }] });
    return PlaySession.start(w.path, 'kite', w.source);
  }
  // The land as the page has it now, and how much each map says is known of each town and place, by its id: the
  // board's and the flat map's the same, both being the land's own.
  static of(s: PlaySession): Shown {
    const region = ScreenModel.build(s.campaign).region!;
    const board = Object.fromEntries(BoardField.land(region).marks.map(m => [m.id, m.state]));
    const flat = Object.fromEntries(HexLand.draw(region).marks.map(m => [m.id, m.state]));
    expect(board).toEqual(flat);
    return { region, land: region.land!, states: board };
  }
  static readonly rank: Known[] = ['unknown', 'heard', 'seen', 'visited'];
  // What was known is known still: every hex, and every town and place as well as before or better; something not
  // made out is still there, or has become what stands on its hex.
  static kept(before: Shown, after: Shown): void {
    expect(after.land.known).toEqual(expect.arrayContaining(before.land.known));
    for (const m of before.land.marks.filter(x => x.state === 'unknown')) {
      expect(after.land.marks.some(x => x.cell === m.cell)).toBe(true);
    }
    const worse = Object.entries(before.states).filter(([id, was]) => was !== 'unknown'
      && Knowing.rank.indexOf(after.states[id] ?? 'unknown') < Knowing.rank.indexOf(was));
    expect(worse).toEqual([]);
  }
  // A hex and the six about it.
  static about(land: Land, cell: number): number[] {
    return [cell, ...HexLand.neighbours(cell, land.width, land.height)];
  }
  static async take(s: PlaySession, name: RegExp): Promise<void> {
    await s.leg(PlayerView.choices(s.campaign).find(c => name.test(c.choice.name))!.choice.id);
  }
  // Each place not made out: its hex, with no name or id of its own; seen by its shape where it is a site of a kind
  // (a tower, a barrow: the owner, 4 November, not a "?"), and a question only where it is not.
  static unmade(land: Land): number[] {
    const marks = land.marks.filter(m => m.state === 'unknown');
    for (const m of marks) {
      const kind = HexLand.kinds.has(m.kind) ? m.kind : 'unknown';
      expect(m).toMatchObject({ id: `unmade:${m.cell}`,
        name: kind === 'unknown' ? LandModel.unmade.name : expect.stringMatching(/^an? [a-z]+, not yet made out$/) });
      expect([HexLand.sign(m), BoardField.kind(m)]).toEqual([kind, kind]);
      expect(Knowing.about(land, m.cell).some(c => land.known.includes(c))).toBe(true);
    }
    return marks.map(m => m.cell);
  }
}

describe('what the map knows of a place', () => {
  it('shows a place heard of as a mark, a site past the known land as a question, and keeps what is learned', async () => {
    const s = await Knowing.start(), start = Knowing.of(s), W = start.land.width;
    // Not on the map before it is heard of: the march-stones the roads run out to, at the far ends of the country (the
    // owner, 3 November: the world map started mostly revealed). Only the towns down the roads from where one has been.
    expect(start.land.marks.filter(m => /__(edge_[a-z]+|gate_\w+)$/.test(m.id))).toEqual([]);
    // The towns along the roads are names over the unknown, the roads to them drawn only as far as the land is known.
    const far = start.region.areas.filter(a => start.land.towns[a.id] === 'heard');
    expect(far.length).toBeGreaterThan(1);
    expect(far.filter(a => start.land.known.includes(a.y * W + a.x))).toEqual([]);
    expect(start.states).toMatchObject(Object.fromEntries(far.map(a => [a.id, 'heard'])));
    // Sites just past the land known, not made out, a lone tower's among them.
    const questions = Knowing.unmade(start.land);
    expect(start.land.marks.some(m => m.id === 'region__w9')).toBe(false);
    // The innkeeper tells of the light in the lone tower, and the way to it: a mark by the name it was told by, still
    // only heard of, but where the question was, on its hex, and the land the way goes over known with it.
    await GeneratedWorld.travel(s, s.campaign.world.one('at', 'region__s1_innkeeper')!.replace(/^region__/, ''));
    await Knowing.take(s, /^Ask \S+ about the green light in a lone tower$/);
    const told = Knowing.of(s), tower = told.land.marks.find(m => m.id === 'region__w9')!;
    Knowing.kept(start, told);
    // Heard of as what it is (a tower), not as a mark that says nothing (the owner, 4 November), and by its name, which
    // the word of it says, so that every rumour of it is plainly of one place (the owner, 7 November).
    const named = s.campaign.module.entities.find(e => e.id === 'region__w9')!.name;
    expect(tower).toMatchObject({ name: named, state: 'heard', kind: 'tower' });
    expect(named).not.toBe('a lone tower');
    // (Further off than the one ring known about a town at first, it was no question mark before it was told of.)
    // Hearing of it marks it, and reveals none of the land: only where the company has been, or stood beside, is
    // known (the owner, 4 November).
    expect([questions.includes(tower.cell), told.land.known.includes(tower.cell)]).toEqual([false, false]);
    expect(told.land.known.length).toBe(start.land.known.length);
    Knowing.unmade(told.land);
    // From the top of the shrine's tower, a ruin in the wood is seen: by its look, its name not yet said, on its own
    // hex, with the sign of what it is.
    await GeneratedWorld.travel(s, 's1_shrine');
    await Knowing.take(s, /^Climb the tower/);
    const high = Knowing.of(s), ruin = high.land.marks.find(m => m.id === 'region__w3')!;
    Knowing.kept(told, high);
    // Its sign is what the world made it (a cave), not a guess from its name (which had read "ruin").
    expect(ruin).toMatchObject({ name: 'a square doorway in a hillside in Birchwood', state: 'seen', kind: 'cave' });
    expect([questions.includes(ruin.cell), high.land.known.includes(ruin.cell), HexLand.sign(ruin)])
      .toEqual([true, true, 'cave']);
    // Set out for it by the way the page plans, and come to it: known whole, by the name cut over its door, the land
    // about it with it.
    const done = await Travel.go({ campaign: s.campaign, perform: (c: string) => s.leg(c) }, ruin.id);
    expect(done.arrived).toBe(true);
    const been = Knowing.of(s);
    Knowing.kept(high, been);
    expect(been.land.marks.find(m => m.id === ruin.id)).toMatchObject({ name: 'Paliduslac', state: 'visited' });
    expect(been.land.known).toEqual(expect.arrayContaining(Knowing.about(been.land, ruin.cell)));
  }, 300000);
});
