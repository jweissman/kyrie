import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { PlayerView } from '../src/presentation/player-view';

// The Patient Star's 4 and the Road's F5 and B3 (AUT-21): in the dark nothing was perceived, a grey shore with every
// light out told nothing, and nothing put a light out (a lantern smothered in a coat stayed lit). What is heard or felt
// (`as sound`, `as felt`) is perceived in the dark; a light can be put out, and the dark is the dark again.
describe('the dark', () => {
  it('hears what sounds and sees nothing, and a light put out leaves it dark again', async () => {
    const j = await Journey.start('test/fixtures/probes/dark-shore/probe.campaign.json');
    const said = () => PlayerView.observe(j.campaign).observations.map(o => o.text).join(' ');
    expect(said()).toContain('the sea breaks on stones');
    expect(said()).not.toContain('A grey shore of shingle');
    await j.play('a torch: Light');
    expect(said()).toContain('A grey shore of shingle');
    await j.play("Put out Ama's light");
    expect(j.holds('capable', 'party', 'light')).toBe(false);
    expect(said()).not.toContain('A grey shore of shingle');
  }, 30000);
});
