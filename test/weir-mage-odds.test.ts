import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { Runner, type Said } from '../src/cli/runner';
import { Beside } from '../src/campaign/beside';
import type { Campaign } from '../src/campaign/campaign';
import { Gauntlet } from './support/gauntlet';

// The weir life's mage, her odds measured (Sprint 3, S3-R4; CB-03). The board's "a first-level abjurer alone wins
// 90.5 % of 200" was a census of made human abjurers against three rats, and the pin beside it a generic human mage:
// neither is the route's. The route's mage is Ilse, an elf scholar of the divining school (4 hit points, Light and
// Second Sight ready), and her first fight on the route is the corn-store's two rats at Gatesend. Fought there 200
// times, the same seeds each time, in the light, by the game's own tactics, from where she and they stand at the
// start: alone she wins 176 (88 %), her spells cast where they fell surer than her staff (OR-208: she had swung it,
// spell and blow scoring alike before the slot, and won 110, 55 %); with Gesk, the lizardfolk warrior hired in
// Gatesend's guest-hall for 6 of her 7 coin, all 200 (test/weir-hire walks to him). The figures are pinned within a
// few points, so that a change to her, to the rats or to the rules that moves them is seen.
const rats = 'region__s4_u_rats', trials = 200;
const said = (x: Said | { error: string }): Said => { if ('error' in x) { throw new Error(x.error); } return x; };
class Odds {
  static won(c: Campaign): number {
    const read = c.readout, ours = read.partyIds.map(id => read.creatures.find(x => x.id === id)!);
    const foes = Beside.members(c.world, read.inhabitants, rats).map(id => read.creatures.find(x => x.id === id)!);
    return Array.from({ length: trials }, (_, i) => Gauntlet.fought(Gauntlet.between(c.catalog, ours, foes, `weir-${i}`)))
      .filter(f => f.won).length / trials;
  }
}
describe('the weir life\'s mage against the corn-store\'s rats', () => {
  it('wins about half alone and every time with the hire at Gatesend', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'elf/mage/Ilse/scholar']));
    const r = new Runner(journey.session), c = journey.session.campaign;
    const ilse = c.readout.creatures.find(x => x.id === c.readout.partyIds[0])!;
    expect([ilse.raceId, ilse.classId, ilse.base.maxHp, !!ilse.traits?.includes('diviner')]).toEqual(['elf', 'mage', 4, true]);
    expect(Beside.members(c.world, c.readout.inhabitants, rats)).toHaveLength(2);
    const alone = Odds.won(c);
    expect(alone).toBeGreaterThanOrEqual(0.8);
    expect(alone).toBeLessThanOrEqual(0.95);
    for (const id of ['go(region__s4_inn_door,region__s4_taproom)', 'region__s4_traveller_brings',
      'recruit(region__s4_traveller)']) { said(await r.ask(JSON.stringify({ act: id }))); }
    expect(c.readout.partyIds).toHaveLength(2);
    expect(Odds.won(c)).toBeGreaterThanOrEqual(0.95);
  }, 60000);
});
