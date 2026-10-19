import { ModuleParser } from './module-parser';
import type { Call } from './module';
import { World } from './world';

// Authored text may reference numeric measures, `{quantity(party, gold)}`, and entities by id, `{guest}`. An entity
// reference renders the entity's current name, so portable text can name whatever its roles were bound to.
// Deliberately not a narration language: no conditionals or code.
export class ObservationText {
  private static readonly pattern = /\{([^{}]+)\}/g;
  private static bare(reference: string): boolean { return /^[A-Za-z][A-Za-z0-9_-]*$/.test(reference.trim()); }
  static references(text: string): Call[] {
    return [...text.matchAll(this.pattern)].filter(m => !this.bare(m[1]!)).map(match => {
      const value = ModuleParser.predicate(match[1]!);
      if (value.kind !== 'call') { throw new Error('Observation interpolation requires a measure reference'); }
      return value;
    });
  }
  static names(text: string): string[] {
    return [...text.matchAll(this.pattern)].filter(m => this.bare(m[1]!)).map(m => m[1]!.trim());
  }
  static map(text: string, transform: (call: Call) => string, name?: (id: string) => string): string {
    return text.replace(this.pattern, (_, reference: string) => this.bare(reference) ?
      name ? name(reference.trim()) : `{${reference.trim()}}` : transform(ModuleParser.predicate(reference) as Call));
  }
  static scope(text: string, transform: (call: Call) => Call, id?: (value: string) => string): string {
    return this.map(text, call => `{${World.format(transform(call))}}`, value => `{${id ? id(value) : value}}`);
  }
  static label(world: World, id: string): string {
    const entity = world.module.entities.find(e => e.id === id);
    if (!entity) { return id; }
    const name = entity.type === 'group' ? entity.name.split(', ')[0]! : entity.name;
    return name.includes('{') ? this.map(name, call => World.format(call), ref => this.label(world, ref)) : name;
  }
  static render(text: string, world: World, capitalize = true): string {
    const rendered = this.map(text, call => String(world.number(call)), id => this.label(world, id));
    return capitalize ? this.sentences(rendered) : rendered;
  }
  // Names are lower-case nouns ("the rising river"); a sentence that starts with one is capitalized.
  static sentences(text: string): string {
    return text.replace(/(^|[.!?]['"’”]?\s+|^['"‘“])([a-z])/g,
      (_, lead: string, letter: string) => lead + letter.toUpperCase());
  }
}
