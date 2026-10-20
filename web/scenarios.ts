import bundled from './bundles.generated.json';
import { MemoryBundleSource } from '../src/campaign/memory-bundle-source';

export interface ScenarioEntry {
  manifest: string; title: string; seed: string; note: string; detail: string; recommended?: boolean;
}
// Build-time snapshot of the authored files; keys are the same repo-relative paths the CLI reads.
export class Scenarios {
  static readonly files: Record<string, string> = bundled;
  static readonly list: ScenarioEntry[] = [
    { manifest: 'data/campaigns/serewater-march.campaign.json', title: 'The Serewater March', seed: 'serewater',
      note: 'Reedwake on the river, the derelict foundry on Censer Hill and its ossuary: a missing surveyor, a salvage permit, and the keepers of the dead.',
      detail: 'A river town and a three-level dungeon · several expeditions', recommended: true },
    { manifest: 'data/campaigns/silkholme.campaign.json', title: 'Silkholme', seed: 'silk',
      note: 'Spiders under the chalk ridge: a shepherd losing ewes, and a silk-gatherer who lives by them.',
      detail: 'One short expedition · an hour of play' },
    { manifest: 'data/campaigns/skellfold.campaign.json', title: 'Skellfold', seed: 'serewater',
      note: 'The same rescue and salvage quarrel, set in a slate quarry under the fell.',
      detail: 'A quarry hamlet · one expedition' },
    { manifest: 'data/campaigns/red-crag.campaign.json', title: 'The Red Crag', seed: 'thrale',
      note: 'A red dragon has taken the crag above a highland village.',
      detail: 'A village and a dragon · dangerous' },
  ];
  static source(): MemoryBundleSource { return new MemoryBundleSource(Scenarios.files); }
}
