import { buildSetting, Generator, Template } from 'deem';
import { Draw } from './land/draw';
import data from '../../data/generation/scenes/mathematical-traces.json';

// Ordinary mathematical remains, keyed by site, yield portable research rather than a wonder mark.
export class MathematicalTraces {
  private static readonly setting = buildSetting(data.tables, data.templates);
  static lines(seed: string, room: string, id: string): string[] {
    const runtime = Template.bootstrapDeem({ seed: Draw.seed(seed) }, this.setting);
    const value = Generator.gen('mathematicalTrace', { __setting: this.setting, __deemRuntime: runtime });
    if (Array.isArray(value)) { throw new Error('Expected a single generated Mathematical trace'); }
    const { chance, name, seen, read } = value;
    if (typeof chance !== 'number' || !Number.isInteger(chance) || chance < 1 || chance > 20
      || typeof name !== 'string' || typeof seen !== 'string' || typeof read !== 'string'
      || !name.trim() || !seen.trim() || !read.trim()) {
      throw new Error('Invalid generated Mathematical trace');
    }
    if (chance < 17) { return []; }
    const q = JSON.stringify, text = q(name);
    return [
      `  Thing ${id} ${text} at ${room} {`,
      '    Holds.',
      `    State faint closed ${q(seen)}.`,
      `    State copied ${q(read)}.`,
      '  }',
      `  Item ${id}_rubbing "a Mathematical rubbing" is mathematical_rubbing in ${id}.`,
      `  Entity ${id}_dc: difficulty "a Mathematical remainder".`,
      `  Initially Set toBeat(${id}_dc) to 30.`,
      `  Relation ${id}_failed(group).`,
      `  Relation ${id}_target(thing).`,
      `  Initially Assert ${id}_target(${id}).`,
      `  Action ${id}_read(actor: group, target: thing) ${q(`Resolve ${name}`)} {`,
      `    Requires able(actor) and at(actor, ${room}) and at(target, ${room}) and ${id}_target(target)`,
      '      and not benighted(actor) and state(target, faint)',
      `      and (capable(actor, mathematics) or tried(${id}, looking)) and not ${id}_failed(actor).`,
      `    Time 10 minutes. Resolve check(actor, mathematics, ${id}_dc).`,
      '    On success { Retract state(target, faint). Assert state(target, copied). }',
      `    On failure { Assert ${id}_failed(actor). }`,
      `    Result ${q(read)}.`,
      '    Otherwise "The line does not resolve. Its missing interval is not an invitation to complete it.".',
      '  }',
    ];
  }
}
