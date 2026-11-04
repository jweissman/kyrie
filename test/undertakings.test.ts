import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { Glance } from '../src/presentation/glance';
import { Undertakings } from '../src/presentation/undertakings';

// The aim followed is the engine's, by id (Mission 19, journal and intentions; the handoff's first repair): until
// chosen, the company's own errand; a job taken up alone is followed as it comes, and on into its next stage; a job
// seen through gives the follow back to the errand. "Your aim" on the page is that aim's, and no other's: in the
// handoff's journey the page led toward the boundary stones while the company did the rats.
describe('the aim followed', () => {
  it('follows the first town\'s job from its asking to its end, and the errand after', async () => {
    const { journey: j } = await PlayTool.start(PlayTool.parse(['--world', 'a1', '--as', 'human/warrior/Aud']));
    const followed = () => j.screen().aims?.find(a => a.followed);
    // The wanderer comes with no errand of their own: the first aim the country holds (the boundary stones).
    const errand = followed();
    expect(errand?.text).toMatch(/boundary stones/);
    for (const step of ['To the landing at Lowmouth', 'Read the notice']) { await j.step(step); }
    // Three jobs heard of at once: none of them is followed for the player.
    expect(followed()?.id).toBe(errand!.id);
    for (const step of ['To Mik\'s salt-house', 'Talk to Mik', 'Ask Mik about the rats', 'Take your leave']) {
      await j.step(step);
    }
    expect(followed()?.text).toMatch(/Clear the rats out of the corn-store cellar, under the old corn-store/);
    expect(j.screen().objectives[0]).toBe(followed()!.text);
    // Leads that say "your aim" are the rats': none of the other jobs' people, who are "another aim".
    const leads = Glance.of(j.campaign, j.screen(), undefined, { kept: [], known: true, changed: [] }).acts;
    expect(leads.filter(a => a.note === 'your aim' || a.note === 'toward your aim').map(a => a.label).join(' | '))
      .toMatch(/landing|corn-store/i);
    // The player's own choice holds until that aim is done.
    const other = j.screen().aims!.find(a => !a.followed)!;
    Undertakings.follow(j.campaign, other.id);
    expect([Undertakings.followed(j.campaign)?.id, Undertakings.chosen(j.campaign)]).toEqual([other.id, true]);
    // Given back, the game follows for the player again.
    Undertakings.follow(j.campaign);
    expect(Undertakings.chosen(j.campaign)).toBe(false);
  }, 120000);
});
