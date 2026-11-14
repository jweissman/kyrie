import { describe, expect, it } from 'bun:test';
import { Laboratory } from '../../scripts/laboratory';
import { PlayTool } from '../../src/cli/play-tool';
import { VoiceContext } from '../../src/narrative/voice-context';

// A paragon pin (doc/architecture/mission-21/paragon-pins.md), the remembered favour, in the laboratory: help someone,
// leave, come back later, and find the relationship and the opportunity changed. The rats seen to, Mik is grateful
// (bond: friend, so he is greeted as one); a day on, asked how the store keeps, he has a friend's price on what lights
// the way down. Before, he had stayed a stranger however much was done for him.
describe('a favour done for Mik', () => {
  it('is remembered: a friend after, and a friend\'s price a day on', async () => {
    const { journey: j } = await PlayTool.start(PlayTool.parse([Laboratory.file, '--as', 'human/warrior/Brann']));
    const bond = () => VoiceContext.bond(j.campaign, 'lab__low_merchant', 'party');
    expect(bond()).toBe('stranger');
    await j.play("Mik's salt-house", 'Ask Mik about the rats', 'landing at Lowmouth', 'old corn-store', 'corn-store cellar',
      ': light a', 'rat-runs', '^Attack', 'To the nest', '^Attack', 'rat-runs', 'corn-store cellar', 'old corn-store',
      'landing at Lowmouth', "Mik's salt-house", 'Tell Mik the rats under the corn-store are dead, nest and all');
    expect(bond()).toBe('friend');
    expect(j.offers('how the corn-store is keeping')).toBe(false);
    await j.play('landing at Lowmouth', '=+80', "Mik's salt-house");
    expect(await j.step('how the corn-store is keeping')).toMatch(/No charge/);
  }, 60000);
});
