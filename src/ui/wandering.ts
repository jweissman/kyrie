import { Goers, type World } from '../lang/index';
import type { Act } from './screen-types';

// What may find the company while an act takes its time, said beside it before it is chosen (OR-1857: "Lever the small
// stones out of the wall, one by one" took the best part of an hour in the barrow's hall of the bones, and the banshees
// of the long gallery came on the company at its end, though its row had said nothing). By the module's own rules
// (Goers): the longer the act, the likelier. Said once the chance comes to a third, as likely once two in three; as
// the company would reckon it, of those who go about where it is, never of who they are: what it has not met it does
// not know. Not barred, nor asked: an hour's work in the deep is a risk a player takes knowingly.
export class Wandering {
  static readonly may = 1 / 3;
  static readonly likely = 2 / 3;
  static warned(acts: Act[], world: World, place: string | undefined): Act[] {
    if (!place) { return acts; }
    return acts.map(a => {
      const said = a.minutes !== undefined && !a.disabled ? this.said(world, place, a.minutes) : undefined;
      return said ? { ...a, roused: said, about: `${a.about ? `${a.about} ` : ''}${said}` }
        : { ...a, ...a.children ? { children: Wandering.warned(a.children, world, place) } : {} };
    });
  }
  private static said(world: World, place: string, minutes: number): string | undefined {
    const p = Goers.chance(world, place, minutes);
    if (p < this.may) { return undefined; }
    const part = Goers.part(world, place) ?? 'these parts', span = this.spoken(minutes);
    return p >= this.likely ? `Those who go about ${part} will likely find you here in ${span}.`
      : `Those who go about ${part} may find you here in ${span}.`;
  }
  // A length of time as it is said: "an hour", "40 minutes", "3 hours and 50 minutes".
  private static spoken(minutes: number): string {
    const h = Math.floor(minutes / 60), m = minutes % 60, hours = h === 1 ? 'an hour' : `${h} hours`;
    return !h ? `${m} minutes` : m ? `${hours} and ${m} minutes` : hours;
  }
}
