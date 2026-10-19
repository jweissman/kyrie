import bundled from './bundles.generated.json';
import { MemoryBundleSource } from '../src/campaign/memory-bundle-source';

export interface ScenarioEntry { manifest: string; title: string; seed: string; note: string }
// Build-time snapshot of the authored files; keys are the same repo-relative paths the CLI reads.
export class Scenarios {
  static readonly files: Record<string, string> = bundled;
  static readonly list: ScenarioEntry[] = [
    { manifest: 'data/greenhollow/campaign.json', title: 'Greenhollow Vale', seed: 'greenhollow',
      note: 'Typed town, rooms, cellar, archive, woodland ecology and two installed situations.' },
    { manifest: 'data/greenhollow/woodland.campaign.json', title: 'The Saltpine Reach', seed: 'saltpine',
      note: 'The same reusable site and situations in a woodland community, with independently generated inhabitants and constraints.' },
    { manifest: 'data/serewater/campaign.json', title: 'The Serewater March', seed: 'serewater',
      note: 'Reedwake preparation, three levels of Censer Hill, shared traps, equipment and repeat expeditions.' },
    { manifest: 'data/orra/play.campaign.json', title: 'Saint Orra — create a company', seed: 'orra',
      note: 'Conversation, preparation, two expeditions, recovery and lasting spell rewards.' },
    { manifest: 'data/orra/fellowship.campaign.json', title: 'Saint Orra — the Free Fellowship', seed: 'orra',
      note: 'Elf ranger, human fighter and dwarf cleric: investigation and a drowned ruin.' },
    { manifest: 'data/orra/company.campaign.json', title: 'Saint Orra — the hired company', seed: 'orra',
      note: 'Human thief, fighter and mage: no founding privilege, different magical resources.' },
    { manifest: 'data/blackvein/campaign.json', title: 'Bells Under Blackvein', seed: 'bells',
      note: 'Explore a mining town: a disputed claim, a missing miner, and water rising underground.' },
    { manifest: 'data/blackvein/upland.campaign.json', title: 'Blackvein — the early writ', seed: 'bells',
      note: 'Same region and rules; a different community mix and an earlier assertion of control.' },
    { manifest: 'data/sanctuary/campaign.json', title: 'The Open Hand Sanctuary (authoring reuse)', seed: 'oath',
      note: 'A founding charter, a closed refuge and a keeper who can reconsider.' },
    { manifest: 'data/bundles/crossing.campaign.json', title: 'A crossing before winter', seed: 'slice',
      note: 'Unpaid guard, a carrier, a grain deadline.' },
    { manifest: 'data/discovery/orchard.campaign.json', title: 'The Glass Orchard (discovery)', seed: 'glass',
      note: 'Evidence, private knowledge, and a caretaker who can be told.' },
    { manifest: 'data/bundles/two-sites.campaign.json', title: 'Crossing and wayside pantry', seed: 'sites',
      note: 'Two installed situations sharing one persistent world.' },
  ];
  static source(): MemoryBundleSource { return new MemoryBundleSource(Scenarios.files); }
}
