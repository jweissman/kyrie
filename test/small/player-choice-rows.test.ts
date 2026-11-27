import { describe, expect, it } from 'bun:test';
import { Arrivals } from '../support/arrivals';
import { PlayerFrame } from '../../src/presentation/player-frame';
import { PlayerView } from '../../src/presentation/player-view';
import { ChoiceWording } from '../../src/presentation/choice-wording';

describe("the player's choice rows", () => {
  it('are immutable wherever the frame exposes them', async () => {
    const campaign = (await Arrivals.start()).campaign;
    const choices = PlayerView.choices(campaign), again = PlayerView.choices(campaign);
    const rows = PlayerFrame.keptRows(campaign);
    expect(PlayerFrame.of(campaign).rows).toBe(rows);
    expect(PlayerFrame.keptRows(campaign)).toBe(rows);
    expect(choices).not.toBe(again);
    expect(Object.isFrozen(choices)).toBe(false);
    expect(Object.isFrozen(choices[0]!)).toBe(false);
    expect(Object.isFrozen(choices[0]!.choice)).toBe(false);
    expect(Object.isFrozen(rows)).toBe(true);
    expect(rows.every(row => Object.isFrozen(row) && Object.isFrozen(row.choice))).toBe(true);
  });
  it('remakes readout-dependent rows after an external revision changes', async () => {
    const campaign = (await Arrivals.start()).campaign, word = ChoiceWording.word;
    ChoiceWording.word = (c, action, at) => `${word.call(ChoiceWording, c, action, at)} [${c.readout.elapsed}]`;
    try {
      campaign.tickState.current.elapsed++;
      const before = PlayerFrame.keptRows(campaign);
      campaign.tickState.current.elapsed++;
      const after = PlayerFrame.keptRows(campaign);
      expect(after).not.toBe(before);
      expect(after.map(r => r.choice.name)).not.toEqual(before.map(r => r.choice.name));
    } finally { ChoiceWording.word = word; }
  });
});
