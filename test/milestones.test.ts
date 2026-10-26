import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { Endings } from '../src/lang/endings';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';

// What Tessary Owes asked for two things a long authored adventure needs (its authoring-friction report): a company
// that grows by what it finds out and does, not only by what it kills; and a country placed beyond a march whose
// ending closes its own chapter while the world goes on.
describe('a milestone', () => {
  it('is worth its experience the first time it is achieved, and only then, said for what it was', async () => {
    const j = await Journey.start('test/fixtures/probes/milestone/probe.campaign.json', 'milestone');
    const xp = () => j.campaign.fighters.reduce((n, f) => n + f.experience, 0);
    expect(xp()).toBe(0);
    await j.play('Haul the bucket');
    const told = j.taken.map(t => `${t.page} ${t.told}`).join(' ');
    expect(told).toContain('120 experience: drew water from the old well');
    expect(j.holds('achieved', 'p__hauled')).toBe(true);
    expect(xp()).toBe(120);
    await j.play('Wait › A while', 'Wait › A while');
    expect(xp()).toBe(120);
  }, 60000);
});

describe('an ending in a chapter', () => {
  it('is told and reached, and the world it was installed into goes on', async () => {
    const j = await Journey.start('test/fixtures/probes/milestone/probe.campaign.json', 'chapter');
    await j.campaign.install({ id: 'c', bundle: 'test/fixtures/probes/chapter/module.json', chapter: true,
      imports: { party: 'p.party', yard_in: 'p.yard' } }, NodeBundleSource.shared, false, true);
    expect(j.campaign.installations.find(m => m.id === 'c')?.chapter).toBe(true);
    await j.play('To the shrine');
    expect(await j.play('Ring the bell')).toContain('that is the end of that story');
    expect(j.holds('reached', 'c__rang')).toBe(true);
    // The book is not closed on it: the world it came into goes on, and the page has no ending to close on.
    expect(j.campaign.running).toBe(true);
    expect(Endings.reached(j.campaign.world, j.campaign.installations)).toBeUndefined();
    await j.play('To the well-head', 'Haul the bucket');
    expect(j.holds('achieved', 'p__hauled')).toBe(true);
  }, 60000);
});
