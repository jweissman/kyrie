import type { Frontier } from '../world/frontier';
import type { Metrics } from './run';

// The world widening as the company crosses a march, counted.
export class Widening {
  constructor(private readonly frontier: Frontier, private readonly metrics?: Metrics) {}
  readonly expand = async (campaign: Parameters<Frontier['expand']>[0]) => {
    const drawn = await this.frontier.expand(campaign);
    if (drawn && this.metrics) { this.metrics.countries++; }
    return drawn;
  };
}
