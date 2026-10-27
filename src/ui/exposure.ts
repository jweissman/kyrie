import type { World } from '../lang/world';
import { ObservationText } from '../lang/observation-text';
import { ModuleWriter } from '../lang/module-writer';

// Where a night in the open costs something (the cold on a pass, after dark): the place, and what comes there. It is
// said on the camp before it is made, and, once it is dark, on the way there: a mage of four hit points lost one to a
// night on a pass, unwarned (the play-structure investigation's PT-41), and the autoplay laboratory's mage at two
// walked onto one after dark and died of it.
export class Exposure {
  static of(world: World): { exposed?: Map<string, string>; night?: boolean } {
    if (!world.relates('unsheltered')) { return {}; }
    return { exposed: new Map(world.related('unsheltered').map(r => [r.args[0]!, ObservationText.label(world, r.args[1]!)])),
      ...world.relates('dark') && world.test(ModuleWriter.call('dark')) ? { night: true } : {} };
  }
  static going(hazard: string): string {
    return `${hazard.charAt(0).toUpperCase()}${hazard.slice(1)} is down already, and there is no shelter there.`;
  }
  static grave(hazard: string): string {
    return `${hazard.charAt(0).toUpperCase()}${hazard.slice(1)} comes down after dark, and there is no shelter here.`;
  }
}
