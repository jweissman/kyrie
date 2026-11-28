import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Tiny } from './support/tiny';
import { PlayTool } from '../src/cli/play-tool';

// BRIEF §5D's last proof: a non-Westernesse scenario coexists with a Westernesse campaign in one process. The allotment
// society (test/fixtures/boundary/allotment.kyr, on the kernel alone) and a life in the reference country (s0), begun
// and played in turn in one process: neither's world, receipts or canon reaches the other, and each plays as it would
// alone (campaign isolation, AGENTS.md's standing rulings).
const kyr = readFileSync(join(import.meta.dir, 'fixtures/boundary/allotment.kyr'), 'utf8');
const canon = /^(imbar|dun_ri)$|^plane_(fire|water|air|earth)/;

const society = () => Tiny.start(kyr, { own: true, currency: 'pound', night: 'none', horizon: [],
  party: [{ name: 'Robin Ashe', raceId: 'human', classId: 'commoner', outfit: 'own' }] });
const westernesse = async () =>
  (await PlayTool.start(PlayTool.parse(['--world', 's0', '--as', 'human/warrior/Wenna']))).journey;

describe('a scenario of its own beside a Westernesse life, in one process', () => {
  it('keeps each to itself: each, played among the other, is the game it is alone', async () => {
    const alone = await society();
    await alone.play('To the plots', 'Talk to Stan Mullery', 'Ask Stan Mullery about plot 14', 'Take your leave');
    const westAlone = await westernesse();
    await westAlone.play('To the landing at Oakhythe', 'To Finnan\'s house');

    const allotment = await society(), west = await westernesse();
    await allotment.play('To the plots');
    await west.play('To the landing at Oakhythe');
    await allotment.play('Talk to Stan Mullery', 'Ask Stan Mullery about plot 14');
    await west.play('To Finnan\'s house');
    await allotment.play('Take your leave');

    expect(allotment.journey.session.canonical()).toBe(alone.journey.session.canonical());
    expect(west.session.canonical()).toBe(westAlone.session.canonical());
    expect(allotment.journey.session.receipts.length).toBe(alone.journey.session.receipts.length);
    // The society holds nothing of the canon's, and the Westernesse life keeps its own.
    expect(allotment.campaign.module.entities.map(e => e.id).filter(id => canon.test(id))).toEqual([]);
    expect(allotment.campaign.installed).toEqual(['t']);
    expect(west.campaign.module.entities.some(e => canon.test(e.id))).toBe(true);
  }, 90000);
});
