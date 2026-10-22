import { ModuleParser } from './module-parser';
import type { Call, Entity } from './module';
import { ModuleWriter } from './module-writer';
import { World } from './world';

// Authored text may reference numeric measures, `{quantity(party, gold)}`, and entities by id, `{guest}`. An entity
// reference renders the entity's current name, so portable text can name whatever its roles were bound to. A rule's
// text may name what its condition bound, `{?beast}`, so one shared rule can speak of each creature it is about.
// Deliberately not a narration language: no conditionals or code.
export class ObservationText {
  private static readonly pattern = /\{([^{}]+)\}/g;
  private static bare(reference: string): boolean { return /^\??[A-Za-z][A-Za-z0-9_-]*$/.test(reference.trim()); }
  static variables(text: string): string[] {
    return [...text.matchAll(this.pattern)].map(m => m[1]!.trim()).filter(r => /^\?[A-Za-z][A-Za-z0-9_-]*$/.test(r));
  }
  static references(text: string): Call[] {
    return [...text.matchAll(this.pattern)].filter(m => !this.bare(m[1]!)).map(match => {
      const value = ModuleParser.predicate(match[1]!);
      if (value.kind !== 'call') { throw new Error('Observation interpolation requires a measure reference'); }
      return value;
    });
  }
  static names(text: string): string[] {
    return [...text.matchAll(this.pattern)].filter(m => this.bare(m[1]!)).map(m => m[1]!.trim()).filter(n => !n.startsWith('?'));
  }
  static map(text: string, transform: (call: Call) => string, name?: (id: string) => string): string {
    return text.replace(this.pattern, (_, reference: string) => this.bare(reference) ?
      name ? name(reference.trim()) : `{${reference.trim()}}` : transform(ModuleParser.predicate(reference) as Call));
  }
  static scope(text: string, transform: (call: Call) => Call, id?: (value: string) => string): string {
    return this.map(text, call => `{${World.format(transform(call))}}`, value => `{${id ? id(value) : value}}`);
  }
  // An entity's name, which may itself name others, or what the rule speaking of it bound ("{?g} stands its ground").
  static label(world: World, id: string, binding: Record<string, string> = {}): string {
    const entity = world.module.entities.find(e => e.id === id);
    if (!entity) { return id; }
    const name = entity.type === 'group' ? entity.name.split(', ')[0]! : this.known(world, entity);
    return name.includes('{') ? this.map(name, call => World.format(call),
      ref => this.label(world, binding[ref] ?? ref, binding)) : name;
  }
  // A place's name if the company knows the fact that names it, else what it looks like to a stranger. A world with
  // no company (an author's check) knows every name.
  static known(world: World, entity: Entity): string {
    if (!entity.alias) { return entity.name; }
    const company = world.snapshot.relations.find(r => r.name === 'company')?.args[0];
    return !company || world.test(ModuleWriter.call('knows', company, entity.alias.until)) ? entity.name
      : entity.alias.name;
  }
  // The entities as the company would name them: aliases until known, and names with references rendered.
  static presented(world: World): Map<string, Entity> {
    return new Map(world.module.entities.map(e => [e.id, e.alias || (e.type !== 'group' && e.name.includes('{'))
      ? { ...e, name: this.label(world, e.id) } : e]));
  }
  static render(text: string, world: World, capitalize = true, binding: Record<string, string> = {}): string {
    const rendered = this.map(text, call => String(world.number(call)),
      id => this.label(world, binding[id] ?? id, binding));
    return capitalize ? this.sentences(rendered) : rendered;
  }
  // Names are lower-case nouns ("the rising river"); a sentence that starts with one is capitalized.
  static sentences(text: string): string {
    return text.replace(/(^|[.!?]['"’”]?\s+|^['"‘“])([a-z])/g,
      (_, lead: string, letter: string) => lead + letter.toUpperCase());
  }
}
