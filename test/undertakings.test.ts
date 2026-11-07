import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { Glance } from '../src/presentation/glance';
import { Undertakings } from '../src/presentation/undertakings';

// The aim followed is the engine's, by id (Mission 19, journal and intentions; the handoff's first repair): the
// player's choice, or the company's own errand, and nothing else (the owner's play of 7 November: the aim followed had
// gone over by itself to an abbey heard of from an innkeeper). A job taken up is the player's to follow; followed, it
// is followed on into its next stage; given back, nothing is. "Your aim" on the page is that aim's, and no other's: in
// the handoff's journey the page led toward the boundary stones while the company did the rats.
describe('the aim followed', () => {
  it('is none for one with no errand until the player follows one, and then that one\'s', async () => {
    const { journey: j } = await PlayTool.start(PlayTool.parse(['--world', 'a1', '--as', 'human/warrior/Aud']));
    const followed = () => j.screen().aims?.find(a => a.followed);
    // The wanderer comes with no errand of their own, and nothing is followed for them.
    expect(j.screen().aims?.length).toBeGreaterThan(0);
    expect(followed()).toBeUndefined();
    for (const step of ['To the landing at Lowmouth', 'Read the notice']) { await j.step(step); }
    // Three jobs heard of at once: none of them is followed for the player.
    expect(followed()).toBeUndefined();
    for (const step of ['To Mik\'s salt-house', 'Talk to Mik', 'Ask Mik about the rats', 'Take your leave']) {
      await j.step(step);
    }
    // Nor the one taken up, until the player follows it.
    expect(followed()).toBeUndefined();
    const rats = j.screen().aims!.find(a => /Clear the rats out of the corn-store cellar/.test(a.text))!;
    Undertakings.follow(j.campaign, rats.id);
    expect([Undertakings.followed(j.campaign)?.id, Undertakings.chosen(j.campaign)]).toEqual([rats.id, true]);
    // Leads that say "your aim" are the rats': none of the other jobs' people, who are "another aim".
    const leads = Glance.of(j.campaign, j.screen(), undefined, { kept: [], known: true, changed: [] }).acts;
    expect(leads.filter(a => a.note === 'your aim' || a.note === 'toward your aim').map(a => a.label).join(' | '))
      .toMatch(/landing|corn-store/i);
    // Given back, nothing is followed: the wanderer has no errand to fall back on.
    Undertakings.follow(j.campaign);
    expect([Undertakings.followed(j.campaign), Undertakings.chosen(j.campaign)]).toEqual([undefined, false]);
  }, 120000);
});
