import { ModuleParser } from './module-parser';
import type { Call, Entity } from './module';
import { ModuleWriter } from './module-writer';
import { World } from './world';
import { Reads } from './reads';
import { KyrText } from './kyr-text';

// Authored text may reference numeric measures, `{quantity(party, gold)}`, and entities by id, `{guest}`. An entity
// reference renders the entity's current name, so portable text can name whatever its roles were bound to. A rule's
// text may name what its condition bound, `{?beast}`, so one shared rule can speak of each creature it is about.
// Deliberately not a narration language: no conditionals or code.
export class ObservationText {
  private static readonly pattern = /\{([^{}]+)\}/g;
  // A measure said in words where the author asks it ("{lost(garth) in words}": "one", not "1"); a reading stays a
  // figure ("The dial reads {dial(clock)}.").
  private static readonly worded = /\s+in words\s*$/;
  private static bare(reference: string): boolean { return /^\??[A-Za-z][A-Za-z0-9_-]*$/.test(reference.trim()); }
  static variables(text: string): string[] {
    return [...text.matchAll(this.pattern)].map(m => m[1]!.trim()).filter(r => /^\?[A-Za-z][A-Za-z0-9_-]*$/.test(r));
  }
  static references(text: string): Call[] {
    return [...text.matchAll(this.pattern)].filter(m => !this.bare(m[1]!)).map(match => {
      const value = ModuleParser.predicate(match[1]!.replace(this.worded, ''));
      if (value.kind !== 'call') { throw new Error('Observation interpolation requires a measure reference'); }
      return value;
    });
  }
  static names(text: string): string[] {
    return [...text.matchAll(this.pattern)].filter(m => this.bare(m[1]!)).map(m => m[1]!.trim()).filter(n => !n.startsWith('?'));
  }
  static map(text: string, transform: (call: Call, words: boolean) => string, name?: (id: string) => string): string {
    return text.replace(this.pattern, (_, reference: string) => this.bare(reference) ?
      name ? name(reference.trim()) : `{${reference.trim()}}`
      : transform(ModuleParser.predicate(reference.replace(this.worded, '')) as Call, this.worded.test(reference)));
  }
  static scope(text: string, transform: (call: Call) => Call, id?: (value: string) => string): string {
    return this.map(text, (call, words) => `{${World.format(transform(call))}${words ? ' in words' : ''}}`,
      value => `{${id ? id(value) : value}}`);
  }
  // A module's entities by id, indexed once per entity list (rebuilt if the list grows).
  private static readonly indexes = new WeakMap<Entity[], { size: number; byId: Map<string, Entity> }>();
  static entity(world: World, id: string): Entity | undefined {
    const entities = world.module.entities;
    let index = this.indexes.get(entities);
    if (!index || index.size !== entities.length) {
      index = { size: entities.length, byId: new Map(entities.map(e => [e.id, e])) };
      this.indexes.set(entities, index);
    }
    return index.byId.get(id);
  }
  // An entity's name, which may itself name others, or what the rule speaking of it bound ("{?g} stands its ground").
  static label(world: World, id: string, binding: Record<string, string> = {}): string {
    const entity = this.entity(world, id);
    if (!entity) { return id; }
    const name = entity.type === 'group' ? entity.name.split(', ')[0]! : this.known(world, entity);
    return name.includes('{') ? this.map(name, call => World.format(call),
      ref => this.label(world, binding[ref] ?? ref, binding)) : name;
  }
  // A place's name if the company knows the fact that names it, else what it looks like to a stranger. A world with
  // no company (an author's check) knows every name.
  static known(world: World, entity: Entity): string {
    if (!entity.alias) { return entity.name; }
    const company = world.related('company')[0]?.args[0];
    return !company || world.test(ModuleWriter.call('knows', company, entity.alias.until)) ? entity.name
      : entity.alias.name;
  }
  // The entities as the company would name them: aliases until known, and names with references rendered. What a
  // world presents turns only on its entities, the company and what it knows (see `known`), so a world presents what
  // an earlier one of its line did while neither of those has been written (not worked out again for every world).
  // Who someone is now turns too on what their roles read (a goose let out is no longer in her crate).
  private static readonly presentations = new WeakMap<readonly Entity[],
    { size: number; naming: string[]; stamped: number[]; presented: Map<string, Entity> }>();
  private static readonly naming = ['company', 'knows'];
  static presented(world: World): Map<string, Entity> {
    const entities = world.module.entities, kept = this.presentations.get(entities);
    const naming = kept?.size === entities.length ? kept.naming : [...this.naming,
      ...Reads.names(world.module, entities.flatMap(e => e.roles?.map(r => r.when) ?? []))];
    if (kept?.size === entities.length && world.agrees(naming, kept.stamped)) { return kept.presented; }
    const presented = new Map(entities.map(e => [e.id, this.present(world, e)]));
    this.presentations.set(entities, { size: entities.length, naming, stamped: world.stamped(naming), presented });
    return presented;
  }
  private static present(world: World, e: Entity): Entity {
    const role = e.roles?.find(r => world.test(r.when)), now = role ? { ...e, name: role.name } : e;
    return now.alias || (now.type !== 'group' && now.name.includes('{')) ? { ...now, name: this.label(world, e.id) } : now;
  }
  // A measure in it is read with what its rule bound ("{gold(?g)}" was read of nobody, and said 0: the architecture
  // review's A17), and in words where it says so: "I've lost one to them so far", not 1 (play 9).
  static render(text: string, world: World, capitalize = true, binding: Record<string, string> = {}): string {
    const rendered = this.map(text, (call, words) => this.count(world.number(call, binding), words),
      id => this.label(world, binding[id] ?? id, binding));
    const told = rendered.replaceAll(KyrText.brace[0], '{').replaceAll(KyrText.brace[1], '}');
    return capitalize ? this.sentences(told) : told;
  }
  static readonly counts = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
    'eleven', 'twelve'];
  private static count(n: number, words: boolean): string {
    return words && Number.isInteger(n) && n > 0 && n < this.counts.length ? this.counts[n]! : String(n);
  }
  // Names are lower-case nouns ("the rising river"); a sentence that starts with one is capitalized. A quotation
  // that ends in a question or a cry goes on into who said it ("'Murkstede?' says Hob"); one that ends in a full stop
  // ends its sentence.
  static sentences(text: string): string {
    return text.replace(/(^|[.!?]\s+|\.['"’”]\s+|^['"‘“])([a-z])/g,
      (_, lead: string, letter: string) => lead + letter.toUpperCase());
  }
}
