import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// AUT-20, from the Road's F10, Thrume's F2 and The House That Grows' 13: people who go about errands of their own were
// moved by rules (a teleport, or a flag and an announcement); a Peaceable person was thought never to pursue; and a
// peaceable hound of a kind that warns had warned anyway. Someone who goes by the ways and has somewhere to be walks
// there a way at a time, taking each way's time, and can be met on the way; a peaceable one confronts nobody.
describe('one on an errand of their own', () => {
  it('walks there a way at a time, and is seen going', async () => {
    const j = await Journey.start('test/fixtures/probes/errand/probe.campaign.json');
    const where: string[] = [];
    for (let i = 0; i < 8; i++) { await j.play('Wait › A while'); where.push(j.at('p__webb')!); }
    expect([...new Set(where)]).toEqual(['p__yard', 'p__lane', 'p__keld']);
    expect(j.page).toContain('Webb takes the yard gate toward the lane to Keld.');
  }, 30000);
  it('is not warned off by a peaceable hound, whatever its kind', async () => {
    const j = await Journey.start('test/fixtures/probes/errand/probe.campaign.json');
    await j.play('Wait › A while', 'Wait › A while');
    expect(j.holds('warned', 'p__bolt', 'party')).toBe(false);
    expect(j.page).not.toMatch(/Bolt stands its ground|will not have you here/);
  }, 30000);
});
