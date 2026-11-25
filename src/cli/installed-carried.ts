import { AsyncLocalStorage } from 'node:async_hooks';
import { Installed, type InstalledDomain } from '../ports/installed';

// Where Node or Bun runs the engine (the terminal, the tools and scripts, the specs: bunfig.toml preloads this), an
// installation is carried along each asynchronous operation through its awaits, so two campaigns under two
// installations may be under way at once, each asking its own (src/ports/installed.ts). The page's worker has no such
// carrier and plays one campaign.
Installed.carriedBy(new AsyncLocalStorage<InstalledDomain>());
