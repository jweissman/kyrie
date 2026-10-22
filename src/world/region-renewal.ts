import { Draw } from './land/draw';
import { RegionEcology } from './region-ecology';
import type { PlanSection, WorkPlan } from './history/work-plans';
import type { Region, Site } from './region-writer';

// A region goes on after a company has been through it. A work left empty (whatever lived in it dead, or nothing
// there but the company) stays empty only a while: some days later the beasts of its kind of country move in, as
// they would anywhere a den stands free. The settlement nearest notices (the flocks brought in, nobody on that road
// after dark), the innkeeper talks of it, and whoever clears it again is thanked for it, once. A work is taken again
// only once: after that it is left to the weather.
export class RegionRenewal {
  // What every region declares once: whether a work stands empty, how many nights until something takes it, and
  // where what has not yet come is meanwhile.
  static lines(): string[] {
    return ['  Relation emptied(place). Measure nightsEmpty(place). Relation cleared(place).',
      '  Place elsewhere "somewhere else" is room.'];
  }
  static work(region: Region, site: Site,
    at: { plan: WorkPlan; sections: PlanSection[]; values: Record<string, string> }): string[] {
    const { plan, sections, values } = at;
    if (!plan.lair || plan.great) { return []; }
    const habitat = RegionEcology.habitat(region, site), beast = RegionEcology.den(region, habitat);
    if (!beast) { return []; }
    const q = JSON.stringify, w = site.id, lair = `${w}_${plan.lair}`, comers = `${w}_newcomers`;
    const draw = new Draw(`${region.name}:${w}:renewal`), nights = 4 + Math.floor(draw.next() * 6);
    const thanks = 10 * (2 + plan.danger + beast.count), they = beast.label.replace(/^the /, '');
    // Empty when whoever the work held is dead (not the peaceable, who live there); when it held no one, once the
    // company has been in its den.
    const held = [...sections.map(s => s.lines.join('\n')).join('\n').matchAll(/Person \{w\}_(\w+)[^{]*\{([^}]*)\}/g)]
      .filter(m => !/Peaceable/.test(m[2]!)).map(m => `${w}_${m[1]!}`);
    const empty = held.length ? held.map(p => `not able(${p})`).join(' and ') : `at(party, ${lair})`;
    return [`  Person ${comers} ${q(beast.label)} at elsewhere {`,
      `    Role ${q(`${beast.role}, moved into ${site.name} while it stood empty`)}. Species ${beast.species}. Numbers ${beast.count}. Level ${plan.danger + 1}. Temperament territorial. Lair ${lair}.`, '  }',
      `  Initially Set nightsEmpty(${w}) to ${nights}.`,
      `  Rule ${w}_emptied when ${empty} and not emptied(${w}) { Assert emptied(${w}). }`,
      `  Rule ${w}_quiet when emptied(${w}) and untilLight(clock) == 1 and nightsEmpty(${w}) > 0 { Decrease nightsEmpty(${w}) by 1. }`,
      `  Rule ${w}_taken when emptied(${w}) and nightsEmpty(${w}) == 0 and at(${comers}, elsewhere) { Assert at(${comers}, ${lair}). }`,
      `  Observe ${w}_taken_sign at ${values.town}_green when at(${comers}, ${lair}) and able(${comers}) ${q(`The flocks have been brought in close to the houses, and the gate on the road toward ${site.name} is shut before dark.`)}.`,
      `  Topic ${w}_news with ${values.keeper} ${q(`Ask {${values.keeper}} what is out at ${site.name} now`)} when at(${comers}, ${lair}) and able(${comers}) once {`,
      `    Says ${q(`'${beast.label.replace(/^t/, 'T')}, that's what,' says {${values.keeper}}. 'Moved into ${site.name} while it stood empty, and nobody goes out that way now. Somebody cleared it out once. Somebody had better do it again.'`)}.`, '  }',
      `  Topic ${w}_thanks with ${values.keeper} ${q(`Tell {${values.keeper}} the ${they} at ${site.name} ${beast.count > 1 ? 'are' : 'is'} dealt with`)} when at(${comers}, ${lair}) and not able(${comers}) and not cleared(${w}) once {`,
      `    Says ${q(`{${values.keeper}} looks at you a long moment, then goes to the back and comes out with a purse. 'From the shepherds. They said to keep it for whoever did it. ${thanks} coin.'`)}.`,
      `    On discuss { Assert cleared(${w}). Increase quantity(actor, gold) by ${thanks}. }`, '  }'];
  }
}
