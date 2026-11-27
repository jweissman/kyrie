import { Installed } from './installed';
import type { Change, VerbResolver, World } from '../lang';

// What an ability's effects mean for the world they land in, through the rules domain a setting installs (the world
// shadow: doc/design/research-abilities-and-the-world-2026-11-26.md §3.1, §3.4; OR-1100): the kernel's element a kind
// of harm lets loose where it lands. The kernel owns the elements and what they do to things (data/rules/elements.kyr);
// the domain owns its kinds of harm. From the campaign's installation in scope (src/ports/installed.ts), never a
// process-wide current domain; one that installs no shadow lets nothing loose.
export interface EffectDomain {
  element(damageType: string): string | undefined;
  // What an ability's effects would write to the world, lowered to Kyr's changes before it is used (OR-1101): a thing
  // put to an element's try, a capability its condition grants the company. Read by the forecast (Outcome), so that a
  // spell's row is marked for what it would do, as any act's is by its success.
  lower?(ability: string, at: { world: World; actor: string; target: string }): Change[];
  verb?: VerbResolver;
}
export class EffectShadows {
  static element(damageType: string): string | undefined {
    return Installed.current().effects?.element(damageType);
  }
  static lower(ability: string, at: { world: World; actor: string; target: string }): Change[] {
    return Installed.current().effects?.lower?.(ability, at) ?? [];
  }
  static verb(): VerbResolver | undefined { return Installed.current().effects?.verb; }
}
