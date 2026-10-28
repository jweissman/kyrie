import { LocalObservations } from './local-observations';
import { ModuleWriter } from '../lang/module-writer';
import { ObservationText } from '../lang/observation-text';
import type { World } from '../lang/world';
import type { Happening } from './campaign-tick';

// Who is where the company stands, and where that is.
export interface Present { here?: string; who: ReadonlySet<string> }

// Someone who comes where the company stands is said to come, in their own words (`Arrives "…"`), as they come and
// before anything they do there: a band that warns had warned before the module could say how it came (the Liberty of
// the Ice's 22, four wolves put down on the sledge road). Read after the others act, and again after the rules, in
// each watch; the company coming to them is not their coming.
export class Arrivals {
  // Read only in a world where someone has words for coming (most have none, and are not looked at).
  static present(world: World, player: string | undefined): Present {
    const here = player && world.relates('arrival') && world.related('arrival').length ? world.one('at', player)
      : undefined;
    if (!here) { return { who: new Set() }; }
    return { here, who: new Set(world.related('at').filter(r => r.args[1] === here && r.args[0] !== player)
      .map(r => r.args[0]!)) };
  }
  static tell(world: World, player: string | undefined, before: Present, happenings: Happening[]): Present {
    const now = this.present(world, player);
    if (!now.here || now.here !== before.here) { return now; }
    for (const r of world.related('arrival')) {
      const [who, words] = r.args as [string, string];
      if (!now.who.has(who) || before.who.has(who) || !world.test(ModuleWriter.call('able', who))
        || !LocalObservations.noticed(world, who, player!)) { continue; }
      happenings.push({ id: `${who}__arrives`, text: ObservationText.render(`{${words}}`, world, true), kind: 'event' });
    }
    return now;
  }
}
