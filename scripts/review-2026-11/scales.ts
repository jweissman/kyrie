// The architecture review of November 2026: the three starts its probes measure, one way for all of them. tiny: one
// Kyr module on the shared rules (as Tiny.start); scenario: Low Water alone; full: Westernesse drawn from a seed (a1
// unless another is given), as DrawnWorld.start draws it for the page and the terminal.
import { PlaySession } from '../../src/session/play-session';
import { NodeBundleSource } from '../../src/campaign/node-bundle-source';
import { DrawnWorld } from '../../src/world/drawn-world';
import { SingleModule } from '../../src/campaign/single-module';

export class ReviewScales {
  static readonly tiny = 'Place yard "the yard" is room at 0, 0 outdoors. Company party "You" of 1 at yard.';
  static async start(scale: string, seed = 'a1'): Promise<PlaySession> {
    if (scale === 'tiny') {
      const { source, campaign } = SingleModule.source(ReviewScales.tiny);
      return PlaySession.start(campaign, 'tiny', source);
    }
    if (scale === 'scenario') {
      return PlaySession.start('data/campaigns/low-water.campaign.json', 'lw', NodeBundleSource.shared);
    }
    return DrawnWorld.start(seed, { origin: 'debt', party: [{ name: 'Mira', raceId: 'human', classId: 'warrior' }] },
      NodeBundleSource.shared);
  }
  // The wait the company can take now, by its id.
  static wait(session: PlaySession): string {
    return session.campaign.offered().find(a => a.schema === 'wait')?.id ?? 'wait(party)';
  }
}
