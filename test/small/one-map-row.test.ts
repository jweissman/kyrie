import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { PlayerView } from '../../src/presentation/player-view';
import { ScreenModel } from '../../src/ui/screen-model';
import { Narrator } from '../../src/presentation/narrator';
import { Doable, type Row } from '../../src/presentation/doable';

// One row opens the map, never two (the owner's playtest, 25 November, OR-804: the first town's landing offered "Open
// the map", a way into the next hex led as a filler of the four, beside "Open the world map"). The aim's way across in
// its gold where the aim leads there; else the map's own row. Out in the fen about Hythe, its way on into the near fen
// leaving the hex.
const fen = `
  Place region "the Reedlands" is region.
  Place t0 "the near fen" is wilderness within region at 0, 0.
  Place t1 "the fen about Hythe" is wilderness within region at 1, 0.
  Place hythe "Hythe" is settlement within region at 1, 0.
  Place green "the green" is room within hythe at 0, 0 outdoors.
  Place barrow "Lacrimerecs" is site within region at 0, 0.
  Place mouth "a door of stone in a long mound" is room within barrow at 0, 0 outdoors.
  Entity heard: fact "a long mound out in the near fen".
  Initially Assert established(heard). Initially Assert leadsTo(heard, barrow).
  Initially Assert knows(party, heard).
  Passage green_out "the town's end" is path between green and t1.
  Passage t1_t0 "the fen" is path between t1 and t0.
  Passage t0_mouth "the mound's foot" is path between t0 and mouth.
  Company party "You" of 1 at green.
  Relation looked(entity). Objective mound when not looked(barrow) toward barrow "Look into the long mound.".
  Goal false.`;
const chart = { width: 2, height: 1, cover: '..', rivers: [], roads: {}, parts: {},
  places: { t0: 0, t1: 1, hythe: 1, barrow: 0 } };
const maps = (rows: Row[]) => Doable.flat(rows).filter(r => /^view:map(:|$)/.test(r.does ?? ''));
const rows = async (aim?: string, earned = true) => {
  // On the earned stage (OR-1245): the map is hidden until it is earned.
  const t = await Tiny.start(fen, { chart, earned }), c = t.campaign;
  await t.session.leg(PlayerView.choices(c).find(r => r.choice.id.includes('green_out'))!.choice.id);
  if (aim) { await t.session.leg(`follow:${aim}`); }
  const s = ScreenModel.build(c);
  return Doable.of(Narrator.leaf(c, s).glance!, s);
};

describe('the map', () => {
  // Hidden while compactification holds (the owner, 26 November; OR-1242): no row opens it, and the aim's gold across
  // the hex leads nowhere rather than to the map, until the map is earned (nothing earns it yet).
  it('is opened by no row before it is earned, the aim\'s way across included', async () => {
    expect(maps(await rows(undefined, false))).toEqual([]);
    expect(maps(await rows('t__mound', false))).toEqual([]);
  });
  it('is opened by one row, its own, where no aim leads across', async () => {
    expect(maps(await rows()).map(r => r.does)).toEqual(['view:map']);
  });
  it('is opened by the aim\'s way across alone, in its gold, where the aim leads there', async () => {
    const led = maps(await rows('t__mound'));
    expect(led.map(r => r.does)).toEqual(['view:map:t__barrow']);
    expect(led[0]!.witnesses.some(w => w.aspects.includes('undertaking'))).toBe(true);
  });
});
