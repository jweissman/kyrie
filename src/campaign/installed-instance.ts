import type { Instance, Module, WorldState } from '../lang/module';
import type { World } from '../lang/world';
import type { CampaignDefinition } from './definition';

// A campaign with an installation joined to it: the joined module, its world as it is (live), and that world's
// facts listed and copied only for whoever reads them so (a campaign begun from it). An installation into a campaign
// in play reads the world itself, so installing costs what it brings, not every fact the world holds.
export class InstalledInstance implements Instance {
  constructor(readonly module: Module, readonly live: World, readonly campaign: CampaignDefinition,
    readonly budget: number) {}
  get world(): WorldState { return this.live.snapshot; }
}
