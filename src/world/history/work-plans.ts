import { Draw } from '../land/draw';
import type { Cover } from '../land/land-cover';

// One part of a plan: Kyr lines, how likely it is to be chosen among the others of its group, and the value its
// work must have for it to be chosen at all ("if twin": only for a tower with a twin).
export interface PlanSection {
  group: string; option: string; weight: number; lines: string[]; when?: string; unless?: string;
}
// A plan for one kind of work: what it is, where it can stand, what it looks like from outside, what its makers
// called it, how dangerous it is, and its Kyr: the base, and in each other group (what later peoples made of it,
// what lives there now) a choice of sections.
export interface WorkPlan {
  id: string; about: string; art: string; kind: string; ground: Cover[]; near?: string; seen: string;
  // What its makers named works of its kind: a noun to go with the art's own words ("pool"), or a pair ("deep/pool").
  names: string[]; danger: number; sections: PlanSection[];
  // The greatest of its makers' works in a region (@great): hidden from the folk, found by knowing the makers' story.
  great?: boolean;
  // The room of it (@lair) where whatever moves in when it stands empty makes its den (see RegionRenewal).
  lair?: string;
}

// Works are written as Kyr templates (data/generation/works/*.kyrt): a few header lines, then sections. The base
// section is always written; of every other group one section is chosen, by weight, for each work. Placeholders in
// braces ({w}, {name}, {land}…) are filled for the work they are written for.
//
//   # cistern: a water-wardens' cistern under a hill, where the springs were held.
//   @art water
//   @kind cave
//   @ground fell heath wood
//   @near river
//   @seen a square doorway in a hillside
//   @names water/keep, deep/pool
//   @danger 1
//   --- base
//     Place {w}_stair "the long stair" is room within {w}_site at 1, 0.
//   --- present frogs 2
//     Person {w}_frogs "frogs as big as dogs" at {w}_hall { Species frog. Numbers 3. }
//   --- present empty 1
export class WorkPlans {
  static parse(text: string): WorkPlan {
    const plan: Partial<WorkPlan> = { sections: [], names: [], ground: [], danger: 1 };
    let section: PlanSection | undefined;
    for (const line of text.split('\n')) {
      const head = /^#\s*([\w-]+):\s*(.*)$/.exec(line), field = /^@(\w+)\s+(.*)$/.exec(line);
      const start = /^---\s+(\w+)(?:\s+([\w-]+))?(?:\s+(\d+))?(?:\s+(if|unless)\s+(\w+))?\s*$/.exec(line);
      if (head && !section) { plan.id = head[1]; plan.about = head[2]; }
      else if (field && !section) { this.field(plan, field[1]!, field[2]!.trim()); }
      else if (start) {
        section = { group: start[1]!, option: start[2] ?? start[1]!, weight: Number(start[3] ?? 1), lines: [],
          ...start[4] === 'if' ? { when: start[5] } : start[4] === 'unless' ? { unless: start[5] } : {} };
        plan.sections!.push(section);
      } else if (section && line.trim() && !line.trim().startsWith('//')) { section.lines.push(line); }
    }
    if (!plan.id || !plan.art || !plan.kind || !plan.seen) { throw new Error(`Incomplete work plan ${plan.id ?? text.slice(0, 40)}`); }
    return plan as WorkPlan;
  }
  private static field(plan: Partial<WorkPlan>, name: string, value: string) {
    switch (name) {
      case 'art': plan.art = value; break;
      case 'kind': plan.kind = value; break;
      case 'ground': plan.ground = value.split(/\s+/) as Cover[]; break;
      case 'near': plan.near = value; break;
      case 'seen': plan.seen = value; break;
      case 'danger': plan.danger = Number(value); break;
      case 'great': plan.great = value === 'yes'; break;
      case 'lair': plan.lair = value; break;
      case 'names': plan.names = value.split(',').map(p => p.trim()); break;
      default: throw new Error(`Unknown work plan field @${name}`);
    }
  }
  // The sections a work is built from: the base and the outside, and one chosen of each other group, of the
  // sections whose conditions its values meet.
  static choose(plan: WorkPlan, key: string, values: Record<string, string> = {}): PlanSection[] {
    const draw = new Draw(key), groups = [...new Set(plan.sections.map(s => s.group))];
    return groups.flatMap(group => {
      const options = plan.sections.filter(s => s.group === group && (!s.when || values[s.when])
        && (!s.unless || !values[s.unless]));
      if (['base', 'outside'].includes(group) || !options.length) { return options; }
      return [draw.weighted(options.map(o => [o, o.weight] as const))];
    });
  }
  // A section's lines with the work's values in place of its placeholders. Braces around anything else are Kyr's
  // own references, left as they are: "{{w}_hall}" is written "{w3_hall}", the hall's name when it is read.
  static fill(lines: string[], values: Record<string, string>): string[] {
    return lines.map(line => line.replace(/\{([a-z]+)\}/g, (whole, name: string) => values[name] ?? whole));
  }
}
