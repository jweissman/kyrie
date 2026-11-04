import { describe, expect, it } from 'bun:test';
import { Creation } from '../web/engine/creation';
import { TradeStep } from '../web/reader/creation/trade-step';

// The product-design review's PD-02: a mage's former trade was chosen from thirty scholarly trades at once,
// academician to polymath, that gave the same. A kind's trades that differ in what they give are shown, with one of
// those alike; the rest are folded.
describe('the trades of a kind of life, at creation', () => {
  it('shows those that differ in what they give, and folds the alike but one', () => {
    const catalog = Creation.catalog(), open = catalog.backgrounds.filter(b => !b.calling || b.calling === 'mage');
    const learning = open.filter(b => b.kind === 'learning');
    const most = TradeStep.most(learning.map(b => b.text));
    const shown = TradeStep.distinct(learning, most), folded = TradeStep.alike(learning, most);
    expect(learning.length).toBeGreaterThan(15);
    expect(shown.length).toBeLessThanOrEqual(8);
    expect(shown.length + folded.length).toBe(learning.length);
    expect(shown.filter(b => b.text === most).length).toBe(1);
  });
});
