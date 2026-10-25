import bundled from './bundles.generated.json';
import { MemoryBundleSource } from '../src/campaign/memory-bundle-source';

export interface ScenarioEntry {
  manifest: string; title: string; seed: string; note: string; detail: string; recommended?: boolean;
}
// Build-time snapshot of the authored files; keys are the same repo-relative paths the CLI reads.
export class Scenarios {
  static readonly files: Record<string, string> = bundled;
  // The authored campaigns the game offers. The old corpus (the Serewater March, the Varrow and the rest) was
  // retired in Mission 8; what of it the tests still use lives in test/fixtures/march.
  static readonly list: ScenarioEntry[] = [
    { manifest: 'data/campaigns/the-long-man.campaign.json', title: 'The Long Man', seed: 'merrow',
      note: 'A long straight ridge lies across the head of Merrowdale, and the village under it says a giant king is buried there. Something tall walks its crest at night, and the steward has posted forty crowns to have it laid.',
      detail: 'A dale, a wall, a lake and three days before the storm', recommended: true },
    // An independent adventure, played as it was written (doc/adventures/thrume).
    { manifest: 'data/campaigns/thrume.campaign.json', title: 'Thrume', seed: 'saltgrave',
      note: 'In the salt town under the fells, people pay to sleep, and some of them do not come home. The giants of Thrume have come down off the mountain for the first time in living memory, and the Margravine of Ebb will pay a barony for the thane\'s head.',
      detail: 'A salt town, a giants\' hold, a mountain that is a body, and ten days before the host of Harle crosses the Ebb' },
    { manifest: 'data/campaigns/the-house-that-grows.campaign.json', title: 'The House That Grows', seed: 'noon',
      note: 'You are in your second year learning the Watch, and Kezu of Cobble Ring is your teacher. Two nights ago she sat up with a room of glass that fell into Haddo\'s barley, and at dawn she shut her eyes on purpose and let its small door open.',
      detail: 'A crater-ring town, a room of glass that grows where nobody watches it, and the city overhead' },
  ];
  static source(): MemoryBundleSource { return new MemoryBundleSource(Scenarios.files); }
}
