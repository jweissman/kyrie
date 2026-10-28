import type { World } from '../lang/world';

// The sky over the company: its own country's, a placed country's storm with it (NAV-08: the running head said the
// first region's sunny morning in a country under snow); else the first region's.
export class Skies {
  static over(world: World, actor = 'party'): string | undefined {
    const skies = world.related('state').filter(r => /(^|__)sky$/.test(r.args[0]!));
    const own = world.one('at', actor)?.split('__')[0];
    return (skies.find(r => r.args[0] === `${own}__sky`) ?? skies[0])?.args[1];
  }
}
