import text from '../../data/generation/town/woods.kyrt' with { type: 'text' };
import { KyrTemplates } from './kyr-template';
import type { Settlement } from './region-writer';

// The old woods beside the reference game's settlement (the owner, 25 November: "Have you been into the old woods?";
// doc/design/direction-2026-11-25-reference-game.md §3; register OR-611): entered at once from the town's heart, with
// several places of their own, some known and some found by tracks, by asking or by searching, every way among them
// taking time; and under the fallen stones, seen from the old ride, the way down into the deep place the town would
// otherwise have had under its vault (see RegionUndertown.catacombs), in plain sight between them (OR-1501). What the
// woods are is the author's, in data/generation/town/woods.kyrt; this fills in the town, the deep place and its makers.
export class RegionWoods {
  static readonly template = KyrTemplates.parse(text);
  static lines(s: Settlement, at: { w: string; site: string; old: string; sky?: string[] }): string[] {
    const q = JSON.stringify, t = s.id, w = at.w;
    const values = { t, town: s.name, w, site: at.site, old: at.old, dealer: `${t}_innkeeper`,
      wet: this.weather(at.sky, ['rainy', 'stormy']), windy: this.weather(at.sky, ['windy', 'stormy', 'rainy']) };
    return [...this.template.sections.flatMap(x => KyrTemplates.fill(x.lines, values)),
      // What a site placed in the country has from being placed (see RegionSites): that it is named, and found.
      // A discovery, so that a life can begin knowing it (ReferenceOrigins: a dead man's map, a sister's letter).
      `  Discovery ${w}_named ${q(`Under the fallen stones in the old woods above ${s.name} a stair goes down, into ${at.site}.`)}.`,
      `  Entity ${w}_found: fact ${q(`The way down into ${at.site} is between the fallen stones under the beeches, in the old woods.`)}.`,
      `  Place ${w} "the stair under the fallen stones" is room within ${t} at 1, 7 underground 4 down.`,
      `  Initially Assert unlit(${w}).`,
      // The one sight of awe, the first time the company comes out on the stair, with nothing to fight there.
      `  Relation ${w}_beheld(group).`,
      `  Rule ${w}_awe heard at ${w} when at(party, ${w}) and not ${w}_beheld(party) says ${q(`The steps come out on a ledge, and your light goes out into nothing. Below you is a hall that could hold the whole of ${s.name}, its pillars going down further than the light does, and far down water lies still. Nobody in ${s.name} knows it is here.`)} { Assert ${w}_beheld(party). }`];
  }
  // A condition on the weathers named that the country's sky has (RegionWeather.kinds), or one that never holds where
  // it has none of them (a country with no calendar has no sky).
  static weather(sky: string[] | undefined, kinds: string[]): string {
    const had = kinds.filter(k => sky?.includes(k));
    return had.length ? `(${had.map(k => `state(sky, weather_${k})`).join(' or ')})` : 'false';
  }
}
