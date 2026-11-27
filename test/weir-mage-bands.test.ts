import { beforeAll, describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { FirstHourBands, type Banded } from '../scripts/first-hour-bands';

// The weir life's mage against every band her first hour can bring her (CB-31; test/weir-mage-odds does the
// corn-store's rats alone). Ilse, an elf scholar of the divining school with 4 hit points, begins on Gatesend's green;
// in reach of it (FirstHourBands.reach, by the country's ways) are the town's undertown and the old workings under it
// (4 to 61 minutes), the woods' beasts and the customs-men on the road, and the Long Ridge and the king-howe (180 to
// 241). Each fought ten seeded times to the end by the game's own tactics, from where she and they stand, alone and
// with Gesk, the lizardfolk warrior she can hire in the guest-hall, whole (scripts/first-hour-bands.ts, with the
// towns').
// Measured 24 November, 43 bands. Alone, nearly every one can kill her, and every one that can gives her a turn first
// (it warns, holds off or lets her be), shows itself on the way in, or is heard next door. One did not: the drowned
// crew in the king-howe's sump, zombies that fell on whoever came in, their authored warning never said. They lie in
// wait now (data/situations/bound-howe): keen eyes see them rise, and their wet track up the drift gives them away to
// a lit company. With Gesk the undertown's rats, dead and spiders are won, and the howe's worst are still beyond them.
const trials = 10, kills = (b: Banded) => b.fell * 10 >= b.trials * 3;
const warned = (b: Banded) => b.meeting !== 'at once' || b.signed || b.heard;
describe('the weir life\'s mage against every band of her first hour', () => {
  let alone: Banded[] = [], hired: Banded[] = [];
  beforeAll(async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'elf/mage/Ilse/scholar']));
    const c = journey.session.campaign, ilse = c.readout.creatures.find(x => x.id === c.readout.partyIds[0])!;
    // OR-1396: negative Constitution applies to the first hit die.
    expect([ilse.raceId, ilse.classId, ilse.base.maxHp, !!ilse.traits?.includes('diviner')]).toEqual(['elf', 'mage', 2, true]);
    alone = FirstHourBands.bands(c, trials, { who: 'alone', towns: true });
    hired = FirstHourBands.bands(c, trials, { towns: true });
  }, 600000);

  it('reckons the undertown, the road and the howe, alike alone and with Gesk', () => {
    expect(alone.length).toBeGreaterThanOrEqual(40);
    expect(hired.map(b => b.band)).toEqual(alone.map(b => b.band));
    const near = alone.filter(b => b.minutes <= 61).map(b => b.name);
    expect(near).toContain('the rats under the corn-store');
    expect(near.length).toBeGreaterThanOrEqual(20);
    expect(alone.some(b => b.name === 'the drowned crew')).toBe(true);
  });
  it('gives her a turn, a sign on the way in or a sound next door before every band that can kill her', () => {
    expect(alone.filter(kills).length).toBeGreaterThanOrEqual(30);
    expect(alone.filter(b => kills(b) && !warned(b)).map(b => b.name)).toEqual([]);
    expect(hired.filter(b => kills(b) && !warned(b)).map(b => b.name)).toEqual([]);
    const drowned = alone.find(b => b.name === 'the drowned crew')!;
    expect([drowned.meeting, drowned.said]).toEqual(['warns', 'deadly']);
  });
  it('wins what the reckoning calls fair or slight', () => {
    // Ten, where there had been more than ten: a fight whose reckoned fights felled her is at least hard now, and
    // asked (OR-322), and at four hit points many can. Read 24 November: the rats under the corn-store and in the
    // cellar, the bats twice, the blasting charge twice, a badger, two rabbits and a monkey.
    const easy = [...alone, ...hired].filter(b => b.said === 'fair' || b.said === 'slight');
    // OR-1396: six bands remain easy for the more fragile mage; their truth contract is unchanged.
    expect(easy.length).toBeGreaterThanOrEqual(6);
    expect(easy.filter(b => b.mortal)).toEqual([]);
    expect(easy.filter(b => b.won * 10 < b.trials * 8).map(b => b.name)).toEqual([]);
  });
  it('wins the undertown with Gesk that she loses alone, and is still beyond the howe\'s worst', () => {
    const won = (xs: Banded[]) => xs.filter(b => b.won * 10 >= b.trials * 8).length;
    const under = (xs: Banded[]) => xs.filter(b => b.minutes <= 61);
    expect(won(under(alone))).toBeLessThanOrEqual(2);
    expect(won(under(hired))).toBeGreaterThanOrEqual(15);
    for (const n of ['Wulfric Reed-Walker', 'the king\'s sworn', 'the household of the king']) {
      expect([n, hired.find(b => b.name === n)?.said]).toEqual([n, 'deadly']);
    }
  });
});
