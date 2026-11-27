import { describe, expect, it } from 'bun:test';
import { Arrivals } from '../support/arrivals';
import { PlayerFrame } from '../../src/presentation/player-frame';
import { PlayerView } from '../../src/presentation/player-view';

describe("the player's choice rows", () => {
  it('are immutable wherever the frame exposes them', async () => {
    const campaign = (await Arrivals.start()).campaign;
    const choices = PlayerView.choices(campaign), rows = PlayerFrame.of(campaign).rows;
    for (const list of [choices, rows]) {
      expect(Object.isFrozen(list)).toBe(true);
      expect(list.every(row => Object.isFrozen(row) && Object.isFrozen(row.choice))).toBe(true);
    }
  });
});
