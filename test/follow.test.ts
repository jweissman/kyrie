import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { SceneModel } from '../src/ui/scene';

// One who follows the company goes where it goes. The Liberty of the Ice's Callow, in custody, was announced in every
// room over a day's walking (its friction 14); the Banns at Hessel's Rupert, asked to come and tell his mother,
// walked off to the King's Bath at two because his routine said so, and every one of its forty routines said "and not
// following" (its friction 5); and a chair that carried the company left whoever followed it behind, unless the
// adventure kept a rule of its own to bring them (its friction 6).
describe('one who follows the company', () => {
  it('is with it, not announced in each place it comes to', async () => {
    const j = await Journey.start('test/fixtures/probes/follow/probe.campaign.json', 'k');
    await j.play('Ask them to come with you', 'To the square');
    expect(j.at('p__rupert')).toBe('p__square');
    expect(j.taken.at(-1)!.page).not.toContain('Rupert');
    const rupert = SceneModel.build(j.screen()).subjects.find(s => s.name === 'Rupert');
    expect(rupert?.kind).toBe('companion');
    // What can be asked of him is asked where he is, beside the company, with no "Talk to" first.
    expect(rupert?.choices.map(c => c.label)).toEqual(expect.arrayContaining(['Let them make their own way',
      'Ask about his mother']));
  }, 60000);
  it('is not taken off by a rule that does not ask who follows whom', async () => {
    const j = await Journey.start('test/fixtures/probes/follow/probe.campaign.json', 'k');
    await j.play('Ask them to come with you', 'To the square', 'Ring the bath bell');
    expect(j.at('p__rupert')).toBe('p__square');
    // Left to his own way, his routine is his again.
    const alone = await Journey.start('test/fixtures/probes/follow/probe.campaign.json', 'k');
    await alone.play('To the square', 'Ring the bath bell');
    expect(alone.at('p__rupert')).toBe('p__baths');
  }, 60000);
  it('comes along when a rule carries the company off', async () => {
    const j = await Journey.start('test/fixtures/probes/follow/probe.campaign.json', 'k');
    await j.play('Ask them to come with you', 'To the square', 'Hail a chair');
    expect(j.at('party')).toBe('p__downs');
    expect(j.at('p__rupert')).toBe('p__downs');
  }, 60000);
});
