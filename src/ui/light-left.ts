import type { Act, Screen } from './screen-types';

// What the company's light will not last through, said beside it (CO-12: a search burned out a torch and then a
// candle with no word before, though a search the light gives out on is not made). An act longer than the minutes
// the flame has left says so, and is asked before; it is not barred, for another light may be lit. Said as the light
// giving out, never as a trap: "Search here" in the rats' nest had been marked danger and trap, "It could go wrong",
// and what came was the torch guttering (cold play 3, CL-16).
export class LightLeft {
  static warned(acts: Act[], flame: Screen['expedition']['flame']): Act[] {
    if (flame?.left === undefined) { return acts; }
    const left = flame.left, name = LightLeft.names[flame.kind];
    return acts.map(a => a.minutes !== undefined && a.minutes > left && !a.disabled
      ? { ...a, gutters: LightLeft.said(name, left), about: `${a.about ? `${a.about} ` : ''}${LightLeft.said(name, left)}` }
      : { ...a, ...a.children ? { children: LightLeft.warned(a.children, flame) } : {} });
  }
  private static said(name: string, left: number): string { return `${name} has ${left} minutes left: it will give out first.`; }
  private static readonly names: Record<NonNullable<Screen['expedition']['flame']>['kind'], string> = {
    lantern: 'The lantern', torch: 'The torch', candle: 'The candle', conjured: 'The conjured light' };
}
