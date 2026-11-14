import type { Act, Screen } from './screen-types';

// What the company's light will not last through, said beside it (CO-12: a search burned out a torch and then a
// candle with no word before, though a search the light gives out on is not made). An act longer than the minutes
// the flame has left is marked a risk, and says why; it is not barred, for another light may be lit.
export class LightLeft {
  static warned(acts: Act[], flame: Screen['expedition']['flame']): Act[] {
    if (flame?.left === undefined) { return acts; }
    const left = flame.left, name = LightLeft.names[flame.kind];
    return acts.map(a => a.minutes !== undefined && a.minutes > left && !a.disabled
      ? { ...a, risk: true, about: `${a.about ? `${a.about} ` : ''}${name} has ${left} minutes left: it will give out first.` }
      : { ...a, ...a.children ? { children: LightLeft.warned(a.children, flame) } : {} });
  }
  private static readonly names: Record<NonNullable<Screen['expedition']['flame']>['kind'], string> = {
    lantern: 'The lantern', torch: 'The torch', candle: 'The candle', conjured: 'The conjured light' };
}
