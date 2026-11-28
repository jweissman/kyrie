import { ParseCache } from '../../src/lang/index';
import { CompiledModules } from '../../src/campaign/compiled-modules';

// A spec worker starts many different worlds, and keeps little of one for the next: its caches are kept lean, so that
// the machine can run more of them at once (the lead's measure of 27 November: a spec of every seed peaked at 979 MB
// with the player's budgets, 12 MB of parsed text and 64 compiled modules, and at 691 MB with these, for 9% more time).
// A spec that measures what the player's caches keep (a cold set-out's parses, test/cold-start) asks for the player's.
export class LeanCaches {
  static readonly player = { parsed: 12 * 1024 * 1024, compiled: 64 };
  static readonly lean = { parsed: 4 * 1024 * 1024, compiled: 16 };
  static use(budgets: { parsed: number; compiled: number }): void {
    ParseCache.budget = budgets.parsed; CompiledModules.keptMost = budgets.compiled;
  }
}
LeanCaches.use(LeanCaches.lean);
