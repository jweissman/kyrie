import { ModuleWriter } from '../lang/module-writer';
import type { Change, Entity, Module } from '../lang/module';
import { World } from '../lang/world';

export interface DiscoveryBinding { actor: string; source: string; fact: string; place: string }
export interface DiscoveryDefinition {
  id: string; text: string; knownBy?: string[]; deniedBy?: string[];
  sources: { id: string; text: string; place: string; readers: string[];
    speakers?: string[]; destructible?: boolean }[];
}
export class Discovery {
  // Authoring expansion only: the result uses the existing world and information-transfer rules.
  static describe(definitions: DiscoveryDefinition[]): { entities: Entity[]; initial: Change[] } {
    const context = { entities: [] as Entity[], initial: [] as Change[], ids: new Set<string>() };
    if (!Array.isArray(definitions)) { throw new Error('Information definitions must be a list'); }
    for (const definition of definitions) {
      this.addEntity(context, definition, 'fact');
      if (!this.validKeys(definition, ['id', 'text', 'knownBy', 'deniedBy', 'sources'])) {
        throw new Error('Unknown discovery field');
      }
      const known = definition.knownBy ?? [], denied = definition.deniedBy ?? [];
      if (!this.actorList(known) || !this.actorList(denied) || known.some(a => denied.includes(a))
        || !Array.isArray(definition.sources) || !definition.sources.length) {
        throw new Error('Invalid discovery knowledge or sources');
      }
      this.assert(context, 'established', definition.id);
      known.forEach(a => this.assert(context, 'knows', a, definition.id));
      denied.forEach(a => this.assert(context, 'assumesFalse', a, definition.id));
      for (const source of definition.sources) {
        this.addEntity(context, source, 'source');
        if (!this.validKeys(source, ['id', 'text', 'place', 'readers', 'speakers', 'destructible'])) {
          throw new Error('Unknown discovery source field');
        }
        if (!this.validId(source.place) || !this.actorList(source.readers) || !source.readers.length
          || !this.actorList(source.speakers ?? [])
          || (source.destructible !== undefined && typeof source.destructible !== 'boolean')) {
          throw new Error('Invalid discovery source bindings');
        }
        this.assert(context, 'reveals', source.id, definition.id); this.assert(context, 'at', source.id, source.place);
        this.assert(context, 'intact', source.id); this.assert(context, 'noticeable', source.id);
        source.readers.forEach(a => this.assert(context, 'mayExamine', a, source.id));
        (source.speakers ?? []).forEach(a => this.assert(context, 'testimony', a, source.id));
        if (source.destructible) { this.assert(context, 'destructible', source.id); }
      }
    }
    return { entities: context.entities, initial: context.initial };
  }
  private static validKeys(value: object, keys: string[]): boolean {
    return Object.keys(value).every(k => keys.includes(k));
  }
  private static validId(value: unknown): value is string {
    return typeof value === 'string' && /^[A-Za-z][A-Za-z0-9_-]*$/.test(value);
  }
  private static actorList(value: unknown): value is string[] {
    return Array.isArray(value) && value.every(v => this.validId(v)) && new Set(value).size === value.length;
  }
  private static addEntity(context: { entities: Entity[]; ids: Set<string> },
    value: { id: string; text: string }, type: string) {
    if (!value || !this.validId(value.id) || typeof value.text !== 'string' || !value.text.trim()
      || context.ids.has(value.id)) { throw new Error('Invalid or duplicate discovery entity'); }
    context.ids.add(value.id); context.entities.push({ id: value.id, name: value.text, type });
  }
  private static assert(context: { initial: Change[] }, name: string, ...args: string[]) {
    context.initial.push({ kind: 'assert', call: ModuleWriter.call(name, ...args) });
  }
  static lower(bindings: DiscoveryBinding[]): Change[] {
    return bindings.flatMap(b => [
      ModuleWriter.call('reveals', b.source, b.fact), ModuleWriter.call('at', b.source, b.place),
      ModuleWriter.call('intact', b.source), ModuleWriter.call('noticeable', b.source),
      ModuleWriter.call('mayExamine', b.actor, b.source),
    ].map(call => ({ kind: 'assert' as const, call })));
  }
  static supported(module: Module): boolean {
    return module.relations.some(r => r.name === 'reveals' && r.types.join(',') === 'source,fact');
  }
  // Facts a module imports are established by their owner; installation validates them against the whole world.
  static validate(module: Module, world: World, imported: string[] = []) {
    if (!this.supported(module)) { return; }
    for (const source of module.entities.filter(e => e.type === 'source')) {
      const facts = world.snapshot.relations.filter(r => r.name === 'reveals' && r.args[0] === source.id);
      const locations = module.initial.filter(c => c.kind === 'assert' && c.call.name === 'at'
        && c.call.args[0] === source.id).map(c => c.call.args[1]);
      if (facts.length !== 1 || new Set(locations).size !== 1) {
        throw new Error('Each discovery source requires one fact and one initial location');
      }
      if (!imported.includes(facts[0]!.args[1]!) && !world.test(ModuleWriter.call('established', facts[0]!.args[1]!))) {
        throw new Error('A reliable discovery source must attest an established fact');
      }
    }
    for (const relation of world.snapshot.relations.filter(r => r.name === 'knows')) {
      if (!world.test(ModuleWriter.call('established', relation.args[1]!))
        || world.test(ModuleWriter.call('assumesFalse', ...relation.args))) {
        throw new Error('Invalid initial knowledge');
      }
    }
    if (module.actions.some(a => [...a.success, ...a.failure].some(c => c.call.name === 'established'))) {
      throw new Error('Established facts are immutable in the bounded discovery ruleset');
    }
  }
}
