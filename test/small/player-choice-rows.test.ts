import { describe, expect, it } from 'bun:test';
import { Arrivals } from '../support/arrivals';
import { PlayerFrame } from '../../src/presentation/player-frame';
import { PlayerView } from '../../src/presentation/player-view';

describe("the player's choice rows", () => {
  it('are immutable wherever the frame exposes them', async () => {
    const campaign = (await Arrivals.start()).campaign;
    const choices = PlayerView.choices(campaign), again = PlayerView.choices(campaign);
    const rows = PlayerFrame.of(campaign).rows;
    expect(choices).not.toBe(again);
    expect(Object.isFrozen(choices)).toBe(false);
    expect(Object.isFrozen(choices[0]!)).toBe(false);
    expect(Object.isFrozen(choices[0]!.choice)).toBe(false);
    expect(Object.isFrozen(rows)).toBe(true);
    expect(rows.every(row => Object.isFrozen(row) && Object.isFrozen(row.choice))).toBe(true);
  });
});
