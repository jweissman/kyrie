import { describe, expect, it } from 'bun:test';
import { ActivationCensus } from '../scripts/activation-census';

describe('content-activation census', () => {
  it('counts executable spells offered by installed calling plans as reachable', () => {
    const unnamed = ActivationCensus.unnamedAbilities();
    expect(unnamed).not.toEqual(expect.arrayContaining([
      'divine_favor', 'calm_emotions', 'remove_fear', 'resist_fire', 'protection_from_evil',
      'hold_animal', 'hold_person', 'acid_splash', 'disrupt_undead', 'shocking_grasp',
      'hornet_swarm', 'rejuvenate',
    ]));
  });
});
