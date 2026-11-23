import type { Screen } from './screen-types';
import { Fits } from './fits';
import { Scenery } from './scenery';

// Whether the painting a scene shows keeps to the world's sky (BRIEF §3.4: "Do not depict a sunny day when the world
// is in a storm"), judged from what each painting was seen to show (data/paintings/seen.json: its light and weather),
// not from its words, so that it witnesses the fit rules (src/ui/fits.ts) rather than repeating them:
// - weather, out of doors: a clear or sunlit painting in rain, storm, snow or fog; one of rain, storm or fog on a
//   dry day;
// - the hour: a sunlit or daylit painting (or a dawn) by evening or night, under a roof or not; one of dusk, moon or
//   night by day;
// - untold: a painting whose light was never recorded, so that nothing can vouch for it;
// - blank: no painting at all (the page's dim ground), a binding or a painting wanting.
// A grey day's painting at night out of doors is not a breach: the page dims it (SceneSurface, "at-night"), and its
// weather is the world's; it is counted as dimmed, the paintings still wanted.
export type Fault = 'blank' | 'untold' | 'weather' | 'hour';
export interface Judged { painting?: string; fault?: Fault; dimmed?: boolean; why?: string }
export class PaintedSky {
  static readonly wet = /rain|storm|snow|sleet|fog|mist|drizzle|squall|gale/;
  static readonly dry = /fair|sunny|hot|dusty|humid|windy|cold|freezing|cloudy/;
  static readonly sunny = /sunlit|bright day|\bsunny\b/;
  static readonly daylit = /sunlit|bright day|daylight|dawn/;
  static readonly nightly = /night|moonlit|dusk/;
  static readonly grey = /overcast|stormy/;
  // The scene as the page draws it (Scenery.seen), judged.
  static judge(screen: Screen): Judged {
    return this.of(screen, Scenery.seen(screen));
  }
  static of(screen: Screen, painting: string | undefined): Judged {
    if (!painting) { return { fault: 'blank', why: 'no painting' }; }
    const p = Fits.looked(painting) ?? {}, light = p.light ?? '';
    if (!light) { return { painting, fault: 'untold', why: 'its light never recorded' }; }
    const out = !Scenery.roofed(screen), hour = screen.expedition.daylight;
    const against = this.against(out ? screen.weather ?? '' : '', hour, light, p.weather ?? '');
    if (against) { return { painting, fault: against[0], why: against[1] }; }
    const dimmed = out && hour === 'night' && this.grey.test(light) && !this.nightly.test(light);
    return dimmed ? { painting, dimmed } : { painting };
  }
  // What a painting of this light and weather shows against this sky and hour, if anything.
  private static against(sky: string, hour: string, light: string, weather: string): [Fault, string] | undefined {
    if (this.wet.test(sky) && (weather === 'clear' || this.sunny.test(light))) {
      return ['weather', `${light}${weather ? `, ${weather}` : ''} in ${sky} weather`];
    }
    if (this.dry.test(sky) && /rain|storm|fog/.test(weather)) { return ['weather', `${weather} on a ${sky} day`]; }
    if (hour !== 'day' && this.daylit.test(light)) { return ['hour', `${light} by ${hour}`]; }
    if (hour === 'day' && this.nightly.test(light) && !this.daylit.test(light)) { return ['hour', `${light} by day`]; }
    return undefined;
  }
}
