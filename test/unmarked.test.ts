import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// Let One Remember's F6 (LOR-11): exits labelled by where they go gave a decoy away. A way unmarked(way) is said by its
// own name until the company has been where it goes, or the module says where it goes (the script over it read).
describe('an unmarked way', () => {
  it('is said by its own name, until it is known where it goes', async () => {
    const j = await Journey.start('test/fixtures/probes/unmarked/probe.campaign.json');
    const ways = () => j.choices().filter(c => /^(By|To) /.test(c.label)).map(c => c.label).sort();
    expect(ways()).toEqual(['By the left-hand passage', 'By the right-hand passage']);
    expect(j.taken.length ? '' : JSON.stringify(j.choices())).not.toContain('Kept Hall');
    await j.play('Make out what is cut');
    expect(ways()).toEqual(['By the right-hand passage', 'To the Kept Hall']);
    await j.play('By the right-hand passage', 'To the fork');
    expect(ways()).toEqual(['To the Aun pit', 'To the Kept Hall']);
  }, 60000);
});
