import { describe, expect, it } from 'bun:test';
import { Origins, type OriginManifest } from '../src/world/origins';
import order from '../data/origins/order/origin.json';

// The brothers' letter says the one they send reads the old script, and the writing they are sent to copy needs it
// (round 5: an explorer chosen in the scribe's place came to the king's door and was told "Needs lore"). One sent who
// is not the order's scribe carries the brothers' glossary of the old script.
describe('the brothers\' errand', () => {
  const manifest = order as OriginManifest;
  const gear = (backgroundId?: string, chosen = true) =>
    Origins.member(manifest, { name: 'Harrier', raceId: 'birdfolk', classId: 'ranger',
      ...backgroundId ? { backgroundId } : {} }, chosen).gear ?? [];
  it('sends one who is not its scribe with the glossary', () => {
    expect(gear('explorer')).toContain('old_glossary');
  });
  it('sends its scribe, or one whose trade it makes, without it', () => {
    expect(gear('scribe')).not.toContain('old_glossary');
    expect(gear(undefined)).not.toContain('old_glossary');
    expect(Origins.member(manifest, { name: 'Harrier' }, false).backgroundId).toBe('scribe');
  });
});
