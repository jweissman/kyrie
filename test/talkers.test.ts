import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// Someone to talk to is a person of an ancestry, or a beast with something written to be asked of it (a Topic); an
// action spoken by a beast does not make it one: "Run the black dog down", spoken by Admiral, had offered "Talk to
// Admiral" (Fair Weather's friction 14).
describe('who can be talked to', () => {
  it('is whoever has a topic, not whoever an action is spoken by', async () => {
    const j = await Journey.start('test/fixtures/probes/talkers/probe.campaign.json', 'k');
    expect(j.holds('talks', 'p__admiral')).toBe(false);
    expect(j.offers('Talk to Admiral')).toBe(false);
    expect(j.offers('Run the black dog down')).toBe(true);
    expect(j.holds('talks', 'p__croaker')).toBe(true);
    expect(j.offers('Talk to Croaker')).toBe(true);
  }, 60000);
});
