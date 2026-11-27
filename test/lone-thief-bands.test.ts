import { beforeAll, describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { FirstHourBands, type Banded } from '../scripts/first-hour-bands';
import { NoviceCountry } from '../scripts/novice-country';
import { NoviceMeeting } from '../scripts/novice-meeting';
import { NoviceViability } from '../scripts/novice-viability';

// A first-level thief alone against every band met away from a town (CB-32): Wren, a human thief with 8 hit points,
// set out in Iscoed, and each band its ways reach out of town (in a site or the wild; not one held in reserve, like a
// barrow's newcomers), fought ten seeded times by the game's own tactics: standing to the end, and carefully (running
// on her own turn once she is down to half, or when the page calls a fight that came at her grave or deadly:
// NoviceFights). Measured 24 November: 74 bands; standing she wins 302 of 740 (the beasts of the wild, mostly) and is
// beaten in 438, and of the 49 that stand and fight she wins six; carefully she gets away 224 times and is beaten 272.
// Fifty can kill her, and every one gives her a turn first (it warns, holds off or lets her be), shows itself on the
// way in, is heard next door, or is shut behind a barred way she must open. Over sixteen drawn countries (s1 to s16),
// one had not: s2's den, whose leader (a banshee) was left to its kind's temper and fell on whoever came into the den
// at once, while the pack it leads waited. It waits with them now (data/situations/den/extras.kyr).
const trials = 10, all = Number.MAX_SAFE_INTEGER;
const kills = (b: Banded) => b.fell * 10 >= b.trials * 3;
const warned = (b: Banded) => b.meeting !== 'at once' || b.signed || b.heard || b.shut;
const sum = (xs: Banded[], k: 'won' | 'fled' | 'beaten' | 'fell' | 'trials') => xs.reduce((n, b) => n + b[k], 0);
describe('a first-level thief alone against the bands away from a town', () => {
  let stand: Banded[] = [], careful: Banded[] = [];
  beforeAll(async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'human/thief/Wren']));
    const c = journey.session.campaign, wren = c.readout.creatures.find(x => x.id === c.readout.partyIds[0])!;
    // OR-1396: odd Constitution scores no longer round the modifier up.
    expect([wren.raceId, wren.classId, wren.base.level, wren.base.maxHp]).toEqual(['human', 'thief', 1, 7]);
    stand = FirstHourBands.bands(c, trials, { who: 'alone', reach: all });
    careful = FirstHourBands.bands(c, trials, { who: 'alone', reach: all, policy: 'careful' });
  }, 600000);

  it('meets every band the ways reach out of town, the same alike', () => {
    expect(stand.length).toBeGreaterThanOrEqual(70);
    expect(careful.map(b => b.band)).toEqual(stand.map(b => b.band));
    expect(stand.every(b => Number.isFinite(b.minutes))).toBe(true);
  });
  it('is given a turn, a sign, a sound or a barred way before every band that can kill her', () => {
    expect(stand.filter(kills).length).toBeGreaterThanOrEqual(40);
    expect(stand.filter(b => kills(b) && !warned(b)).map(b => b.name)).toEqual([]);
    expect(careful.filter(b => kills(b) && !warned(b)).map(b => b.name)).toEqual([]);
  });
  it('finds a den\'s leader waiting at the back with its pack, of whatever kind', async () => {
    const dens = stand.filter(b => /^den\d*__/.test(b.band));
    expect(dens.length).toBeGreaterThanOrEqual(4);
    expect(dens.map(b => [b.band, b.meeting])).toEqual(dens.map(b => [b.band, 'lets be']));
    const c = await NoviceViability.start('s2', 'thief', 'debt'), w = c.world;
    const leaders = NoviceCountry.read(c, 's2').bands.filter(b => /^den\d*__leader$/.test(b.id));
    expect(leaders.filter(b => w.one('temperament', b.id)?.endsWith('temper_savage')).length).toBeGreaterThan(0);
    const company = [c.readout.creatures.find(x => x.id === c.readout.partyIds[0])!];
    expect(leaders.map(b => [b.id, NoviceMeeting.read(c, b, company).meeting]))
      .toEqual(leaders.map(b => [b.id, 'lets be']));
  }, 60000);
  it('wins what the reckoning calls fair or slight', () => {
    const easy = stand.filter(b => b.said === 'fair' || b.said === 'slight');
    expect(easy.length).toBeGreaterThanOrEqual(8);
    expect(easy.filter(b => b.won * 10 < b.trials * 8).map(b => b.name)).toEqual([]);
  });
  it('loses most fights that stand, and running saves her in many', () => {
    const won = sum(stand, 'won') / sum(stand, 'trials');
    expect(won).toBeGreaterThanOrEqual(0.33);
    expect(won).toBeLessThanOrEqual(0.5);
    const fights = stand.filter(b => FirstHourBands.median(b.rounds) > 0);
    // Few of them hers for the taking: a fifth at most (10 of 49 had been the ceiling; 11 of 62 since the deep holds
    // more bands, OR-1230 to OR-1234).
    expect(fights.filter(b => b.won * 10 >= b.trials * 8).length).toBeLessThanOrEqual(fights.length / 5);
    expect(sum(careful, 'fled') / sum(careful, 'trials')).toBeGreaterThanOrEqual(0.2);
    expect(sum(careful, 'fell')).toBeLessThan(sum(stand, 'fell') * 0.75);
  });
});
