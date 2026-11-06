import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// What Tessary Owes, what the company is for (doc/imbar/adventures/what-tessary-owes.md): the shipped thief, Ivo, alone,
// played by the labels a player sees. Nothing is given, put or asserted.
const home = 'data/campaigns/what-tessary-owes.campaign.json';
const t = (id: string) => `tessary__${id}`;
const toQuay = ['To the Landgate', 'To the Withies', 'To the Watersteps', 'To the head of the Swatch', '=156',
  'To the foot of the Swatch', 'To the Weed', 'To the Drowned Forum', 'To the Street of Scales', 'To the ebb-runners'];

describe('What Tessary Owes, the thief on the quay', () => {
  it('lets the shipped thief read the ebb-runners\' board and pass without five coin, a lie, or a fight', async () => {
    const j = await Journey.start(home, 'chalk');
    await j.play(...toQuay);
    expect(j.at('party')).toBe(t('landing'));
    expect(j.offers('Chalk the quay')).toBe(true);
    expect(j.offers('Pay Bettany')).toBe(true);
    const before = j.measure('quantity', 'party', 'gold');
    await j.play('Chalk the quay');
    expect(j.holds(t('chalkedSign'), 'party')).toBe(true);
    expect(j.holds('tolerates', t('slake'), 'party')).toBe(true);
    expect(j.holds('tolerates', t('runners'), 'party')).toBe(true);
    expect(j.holds(t('hiredBySault'), 'party')).toBe(false);
    expect(j.measure('quantity', 'party', 'gold')).toBe(before);
    expect(j.offers('Pay Bettany')).toBe(false);
    expect(j.page).toMatch(/you learned it from nobody/);
    expect(j.page).toMatch(/A tally, in cant/);
    // The sign lets a company pass, not rob: the lockbox, picked in plain sight, is still Slake's quarrel.
    await j.play('Pick the lockbox');
    expect(j.holds('hostile', t('slake'), 'party')).toBe(true);
  }, 300000);
  it('is not offered to a company without a thief, which pays Bettany or is beaten', async () => {
    const j = await Journey.start(home, 'chalk-without', {
      party: [{ name: 'Brann', raceId: 'human', classId: 'warrior' }] });
    await j.play(...toQuay);
    expect(j.offers('Chalk the quay')).toBe(false);
    expect(j.offers('Pay Bettany')).toBe(true);
    expect(j.page).not.toMatch(/A tally, in cant/);
  }, 300000);
  it('has the thief hear the strongbox, the queue, the stilts and the quay, once each', async () => {
    const j = await Journey.start(home, 'ears');
    await j.play('To the Landgate', 'To the Withies');
    expect(j.holds(t('heardStilts'), 'party')).toBe(true);
    await j.play('>seals_hall');
    expect(j.holds(t('heardQueue'), 'party')).toBe(true);
    await j.play('>sault_office');
    expect(j.holds(t('heardStrongbox'), 'party')).toBe(true);
    expect(j.page.match(/Iron outside, oak inside/g)?.length).toBe(1);
  }, 300000);
});

describe('What Tessary Owes, off the road', () => {
  it('smells the Row and reads the lintel of the Drum', async () => {
    const j = await Journey.start(home, 'row');
    await j.play('To the Landgate', 'To Scriveners');
    expect(j.page).toMatch(/three hundred nibs, all going/);
    await j.play('To the Landgate', 'To the Withies');
    await j.play('>drum_taproom');
    expect(j.page).toMatch(/HELD\. QUIT\./);
  }, 300000);
});
