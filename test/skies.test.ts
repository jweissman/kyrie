import { describe, expect, it } from 'bun:test';
import { Skies } from '../src/ui/skies';
import type { World } from '../src/lang/world';

// The running head's weather is the sky of the country the company is in: a placed country's own storm, not the first
// region's sunny morning (NAV-08); where a country has no sky of its own, the first region's.
class Fake {
  static world(at: string): World {
    const states = [{ name: 'state', args: ['region__sky', 'region__weather_sunny'] },
      { name: 'state', args: ['gaunt__sky', 'gaunt__weather_freezing'] }];
    return { related: (name: string) => name === 'state' ? states : [], one: () => at } as unknown as World;
  }
}

describe('the sky over the company', () => {
  it('is its own country\'s, else the first region\'s', () => {
    expect(Skies.over(Fake.world('gaunt__close_green'))).toBe('gaunt__weather_freezing');
    expect(Skies.over(Fake.world('region__s1_green'))).toBe('region__weather_sunny');
    expect(Skies.over(Fake.world('x0y1__road'))).toBe('region__weather_sunny');
  });
});
