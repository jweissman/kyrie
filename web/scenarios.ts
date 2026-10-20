import bundled from './bundles.generated.json';
import { MemoryBundleSource } from '../src/campaign/memory-bundle-source';

export interface ScenarioEntry { manifest: string; title: string; seed: string; note: string }
// Build-time snapshot of the authored files; keys are the same repo-relative paths the CLI reads.
export class Scenarios {
  static readonly files: Record<string, string> = bundled;
  static readonly list: ScenarioEntry[] = [
    { manifest: 'data/campaigns/silkholme.campaign.json', title: 'Silkholme', seed: 'silk',
      note: 'Spiders under the ridge: a shepherd losing ewes, a silk-gatherer who lives by them.' },
    { manifest: 'data/campaigns/serewater-march.campaign.json', title: 'The Serewater March', seed: 'serewater',
      note: 'Reedwake, Censer Hill and its ossuary: a rescue, a salvage permit, and the keepers of the dead.' },
    { manifest: 'data/campaigns/skellfold.campaign.json', title: 'Skellfold', seed: 'serewater',
      note: 'The same two situations in a slate quarry under the fell.' },
    { manifest: 'data/campaigns/red-crag.campaign.json', title: 'The Red Crag', seed: 'thrale',
      note: 'A dragon above a highland village.' },
  ];
  static source(): MemoryBundleSource { return new MemoryBundleSource(Scenarios.files); }
}
