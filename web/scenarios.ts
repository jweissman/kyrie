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
  static readonly list: ScenarioEntry[] = [];
  static source(): MemoryBundleSource { return new MemoryBundleSource(Scenarios.files); }
}
