import type { Entity, Module } from '../lang/module';
import type { RoleContract } from './role-requirements';
import type { InstalledModule } from './definition';

// What a module offers the modules composed with it, by the part each export plays (the maturity track's step 3, the
// platform maturity study's §8.1 B): a fact it keeps, an outcome it comes to, a participant (someone, a company, a
// house), a place (or a way between places), or a capability (a thing to be had and used). A parent then reads what
// a child is by its manifest, not its Kyr. A role is optional: the string form ("held": "held") stays valid, and the
// role is inferred from the entity it names (see infer); a role declared is held to that entity at the load. And a
// kind's vocabulary (KX-03): a relation or a measure the module declares, exported by its name and imported by a
// consumer's manifest as an entity is, the consumer's own declaration of it bound to the installed one, so that a
// thing of a kind one module defines (kx-1's lodestar chip, its tunedTo and leanings) is the same to every module
// that lays one: an explicit, typed edge between the two modules, never a name shared by all.
export type ExportRole = 'fact' | 'outcome' | 'participant' | 'place' | 'capability' | 'relation' | 'measure';
export type ExportEntry = string | { entity: string; role?: ExportRole };
export interface ExportReading { name: string; local: string; type: string; inferred: ExportRole | undefined;
  declared?: ExportRole }

export class ModuleExports {
  static readonly roles: readonly ExportRole[] = ['fact', 'outcome', 'participant', 'place', 'capability', 'relation',
    'measure'];
  // The entity types each role names. An outcome is a fact too: one read as where the module comes out.
  private static readonly types: Record<ExportRole, readonly string[]> = {
    fact: ['fact'], outcome: ['fact', 'condition', 'ending', 'milestone'], participant: ['group', 'identity'],
    place: ['place', 'passage'], capability: ['thing', 'item', 'good', 'capability'], relation: ['relation'],
    measure: ['measure'] };
  static valid(exports: unknown): boolean {
    return exports === undefined || (typeof exports === 'object' && exports !== null && !Array.isArray(exports)
      && Object.entries(exports).every(([k, v]) => /^[A-Za-z][A-Za-z0-9_-]*$/.test(k) && this.entry(v)));
  }
  private static entry(v: unknown): boolean {
    if (typeof v === 'string') { return true; }
    if (typeof v !== 'object' || v === null || Array.isArray(v)) { return false; }
    const { entity, role, ...rest } = v as Record<string, unknown>;
    return typeof entity === 'string' && !Object.keys(rest).length
      && (role === undefined || this.roles.includes(role as ExportRole));
  }
  // Each export's local entity, whichever form it is written in.
  static locals(exports: Record<string, ExportEntry> | undefined): Record<string, string> {
    return Object.fromEntries(Object.entries(exports ?? {}).map(([k, v]) => [k, typeof v === 'string' ? v : v.entity]));
  }
  static declared(exports: Record<string, ExportEntry> | undefined): Record<string, ExportRole> {
    return Object.fromEntries(Object.entries(exports ?? {}).flatMap(([k, v]) =>
      typeof v === 'object' && v.role ? [[k, v.role]] : []));
  }
  // The role the entity plays, read from what it is and how the module reads it; a type no role names, none. A fact
  // is an outcome where it is where the module comes out: not established at the outset, and read in play by nothing
  // (no act's condition, no rule but a milestone's or an ending's, nothing seen), only by its goal, its objectives,
  // its milestones and outcomes, if at all: the gate's `shut`, known when the sea-gate is wound shut.
  static infer(entity: Entity, module: Module): ExportRole | undefined {
    const role = this.roles.find(r => r !== 'outcome' && this.types[r].includes(entity.type))
      ?? (this.types.outcome.includes(entity.type) ? 'outcome' : undefined);
    if (role !== 'fact') { return role; }
    const id = entity.id, reads = this.reads.bind(this);
    const played = module.actions.some(a => reads(a.requires, id) || reads(a.told, id))
      || (module.rules ?? []).some(r => !this.marks(r.effects) && reads(r.when, id))
      || (module.observations ?? []).some(o => reads(o.when, id));
    return played || reads(module.initial, id) ? 'fact' : 'outcome';
  }
  private static reads(x: unknown, id: string): boolean { return (JSON.stringify(x) ?? '').includes(JSON.stringify(id)); }
  // A milestone's rule, or an ending's: what it reads, it reads as where the module comes out.
  private static marks(effects: unknown): boolean {
    return /"name":"(achieved|reached)"/.test(JSON.stringify(effects) ?? '');
  }
  // Every export of a loaded module read: its entity's type, the role inferred, the role declared.
  static read(exports: Record<string, ExportEntry> | undefined, ids: Record<string, string>,
    module: Module): ExportReading[] {
    const declared = this.declared(exports), locals = this.locals(exports);
    return Object.entries(locals).map(([name, local]) => {
      const entity = module.entities.find(e => e.id === (ids[name] ?? local)), said = declared[name];
      const word = entity ? undefined : this.vocabulary(ids[name] ?? local, module);
      return { name, local, type: entity?.type ?? word ?? 'unknown',
        inferred: entity ? this.infer(entity, module) : word, ...said ? { declared: said } : {} };
    });
  }
  // A relation or a measure the module declares by that name (its own, or as installed), or none.
  static vocabulary(name: string, module: Pick<Module, 'relations' | 'measures'>): 'relation' | 'measure' | undefined {
    return module.relations.some(r => r.name === name) ? 'relation'
      : module.measures.some(m => m.name === name) ? 'measure' : undefined;
  }
  // A role declared that its entity cannot play, said with the module, the export and the entity.
  static admits(role: ExportRole, type: string): boolean { return this.types[role].includes(type); }
  static check(module: string, readings: ExportReading[]): void {
    for (const r of readings) {
      if (r.declared && !this.admits(r.declared, r.type)) {
        throw new Error(`Module ${module} exports ${r.name} as ${r.declared}, but ${r.local} is a ${r.type}`
          + ` (its role: ${r.inferred ?? 'none'})`);
      }
    }
  }
  // A parent's import bound to a child's export with a declared role: the import's role in the parent's `roles` (an
  // entity type) must be one the child's role names.
  static bound(module: string, roles: Record<string, RoleContract> | undefined,
    imports: Record<string, string> | undefined, installed: readonly InstalledModule[] | undefined): void {
    for (const [name, reference] of Object.entries(imports ?? {})) {
      const [owner, exported] = reference.split('.'), wanted = roles?.[name]?.type;
      const role = installed?.find(m => m.id === owner)?.exported?.[exported ?? ''];
      if (role && wanted && !this.admits(role, wanted)) {
        throw new Error(`Module ${module} imports ${name} as ${wanted} from ${reference}, but ${owner} exports `
          + `${exported} as ${role}`);
      }
    }
  }
}
