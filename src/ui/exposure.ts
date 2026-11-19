import type { World } from '../lang/world';
import { ObservationText } from '../lang/observation-text';
import { ModuleWriter } from '../lang/module-writer';
import { Waylaid } from './waylaid';

// Where a night in the open costs something (the cold on a pass, after dark): the place, and what comes there. It is
// said on the camp before it is made, and, once it is dark, on the way there: a mage of four hit points lost one to a
// night on a pass, unwarned (the play-structure investigation's PT-41), and the autoplay laboratory's mage at two
// walked onto one after dark and died of it.
export class Exposure {
  // And where a band lies in wait after dark (see Waylaid).
  static of(world: World): { exposed?: Map<string, string>; waylaid?: Map<string, string>; night?: boolean } {
    const waylaid = Waylaid.of(world), cold = world.relates('unsheltered');
    if (!cold && !waylaid.size) { return {}; }
    return {
      ...cold ? { exposed: new Map(world.related('unsheltered').map(r => [r.args[0]!, ObservationText.label(world, r.args[1]!)])) } : {},
      ...waylaid.size ? { waylaid } : {},
      ...world.relates('dark') && world.test(ModuleWriter.call('dark')) ? { night: true } : {} };
  }
  // What a camp at a site, or a way onto a place, risks: the cold, and a band lying in wait there after dark.
  static risked(at: { exposed?: Map<string, string>; waylaid?: Map<string, string>; night?: boolean }, camp: boolean,
    site: string, onto: string): string | undefined {
    const lying = camp ? at.waylaid?.get(site) : undefined, cold = camp ? at.exposed?.get(site) : undefined;
    const ahead = at.night ? at.waylaid?.get(onto) : undefined, bitter = at.night ? at.exposed?.get(onto) : undefined;
    const said = [cold && this.grave(cold), lying && Waylaid.camp(lying), bitter && this.going(bitter),
      ahead && Waylaid.going(ahead)].filter(Boolean);
    return said.length ? said.join(' ') : undefined;
  }
  static going(hazard: string): string {
    return `${hazard.charAt(0).toUpperCase()}${hazard.slice(1)} is down already, and there is no shelter there.`;
  }
  static grave(hazard: string): string {
    return `${hazard.charAt(0).toUpperCase()}${hazard.slice(1)} comes down after dark, and there is no shelter here.`;
  }
}
