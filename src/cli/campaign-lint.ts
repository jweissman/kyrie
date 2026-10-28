import { ActionSchemas } from '../campaign/action-schemas';
import { PlaySession } from '../session/play-session';
import { ItemCatalog } from '../item-catalog';
import { Canon } from '../canon/canon';
import { Spatial } from '../spatial';
import { Effects } from '../effects';
import { parseAbility } from '../lang/parse';
import type { Entity, Module, Predicate } from '../lang/module';
import type { World } from '../lang/world';
import type { Finding } from './kyr-lint';

// One campaign's findings, gathered by named checks over its loaded world.
export class CampaignLint {
  static readonly implementationWords = new RegExp('\\b(flags?|teleports?|persists?|persistent|generated|canonical'
    + '|the engine|remains available|does not reset|state flag)\\b', 'i');
  readonly findings: Finding[] = [];
  readonly entities: Map<string, Entity>;
  constructor(readonly path: string, readonly session: PlaySession) {
    this.entities = new Map(session.campaign.module.entities.map(e => [e.id, e]));
  }
  get module(): Module { return this.session.campaign.module; }
  get world(): World { return this.session.campaign.world; }
  add(level: Finding['level'], check: string, message: string) {
    this.findings.push({ level, check, where: this.path, message });
  }
  relations(name: string) { return this.world.snapshot.relations.filter(r => r.name === name); }
  identity() {
    for (const c of this.session.campaign.save().definition?.conflicts ?? []) { this.add('error', 'identity', c); }
  }
  // A name a module has that the shared rules have too is the module's own within it: worth knowing, not an error.
  shadows() {
    for (const s of this.session.campaign.save().definition?.shadows ?? []) { this.add('warning', 'shadow', s); }
  }
  // A rule anchored at a place is heard there, but happens wherever the company is, whenever its condition holds: two
  // authors met it apart (a purse lifted at Pellam's fair from a company a mile off on the road; a chair at Hessel run
  // and crashed while the company crossed the river). One that changes something of the company's own (its coin, where
  // it is, what it knows), and whose condition asks nothing of where it is, is advice to look at it: it may be meant
  // (a hand broken at a court the company stayed away from). A rule anchored within an area waits for the company.
  anchors() {
    const company = this.session.campaign.playerActor;
    if (!company) { return; }
    for (const r of this.module.rules ?? []) {
      if (!r.place || !['at', 'beside'].includes(r.anchor ?? '')) { continue; }
      const reaches = r.effects.some(c => c.call.args[0] === company);
      if (!reaches || CampaignLint.asksWhere(r.when, company, r.place)) { continue; }
      this.add('advice', 'anchor', `${r.id} is heard at ${r.place}, but what it does to the company happens wherever`
        + ` the company is: put at(${company}, ${r.place}) in its condition, or anchor it within an area`);
    }
  }
  // Whether a condition asks where the company is (at(party, …)), or anything of the place itself.
  private static asksWhere(p: unknown, company: string, place: string): boolean {
    if (!p || typeof p !== 'object') { return false; }
    const c = p as { kind?: string; name?: string; args?: string[] };
    const where = ['at', 'together'].includes(c.name ?? '') && c.args?.includes(company);
    if (c.kind === 'call' && (where || c.args?.includes(place))) { return true; }
    return Object.values(p).some(v => CampaignLint.asksWhere(v, company, place));
  }
  // What a company keeps is in nobody's hands: what it carries is in its members' packs, so a heart filed with the
  // company by `Assert keeps(actor, heart)` was carried by no one, and everything that needed it was withheld (Low
  // Water's friction 3). One kept by whoever else does it (`distinct(actor, party)`) is theirs, as it should be.
  keeps() {
    const company = this.session.campaign.playerActor;
    if (!company) { return; }
    const others = JSON.stringify({ kind: 'call', name: 'distinct', args: ['actor', company] });
    const lists = [...this.module.actions.map(a => ({ id: a.schema ?? a.id, effects: [...a.success, ...a.failure],
      theirs: JSON.stringify(a.requires ?? {}).includes(others) })),
    ...(this.module.rules ?? []).map(r => ({ id: r.id, effects: r.effects, theirs: false }))];
    for (const { id, effects, theirs } of lists) {
      const kept = effects.find(c => c.kind === 'assert' && c.call.name === 'keeps'
        && (c.call.args[0] === company || (c.call.args[0] === 'actor' && !theirs)));
      if (kept) {
        this.add('warning', 'keeps', `${id} files ${kept.call.args[1]} with ${kept.call.args[0]}, where no one carries`
          + ` it: Give ${kept.call.args[1]} to ${kept.call.args[0]}`);
      }
    }
  }
  // A hazard's effect is checked as it will be struck with: a condition that is no condition, or a damage type that
  // is none ("fyre"), is an error here, not when it strikes.
  hazards() {
    const abilities = Object.keys(Canon.abilities);
    for (const h of this.module.entities.filter(e => e.type === 'hazard' && e.effect)) {
      try { for (const e of parseAbility(h.id, h.name, h.effect!).effects) { Effects.validate(e, abilities); } }
      catch (error) { this.add('error', 'hazard', `${h.id}: ${error instanceof Error ? error.message : String(error)}`); }
    }
  }
  // A name in braces names something: an entity, or what an action is done with or a rule is about. One that names
  // nothing ("Let {winchh} run out") reaches the player as the bare word.
  placeholders() {
    for (const a of this.module.actions) {
      const bound = new Set((a.parameters ?? []).map(p => p.name));
      for (const text of [a.name, a.description, a.report, a.otherwise]) { this.named(text, a.id, bound); }
    }
    for (const o of this.module.observations ?? []) { this.named(o.text, o.id, new Set()); }
    for (const r of this.module.rules ?? []) { this.named(r.say, r.id, new Set()); }
    for (const e of this.module.entities.filter(x => x.type === 'fact')) { this.named(e.name, e.id, new Set()); }
  }
  private named(text: string | undefined, where: string, bound: Set<string>) {
    for (const [, ref] of (text ?? '').matchAll(/\{([A-Za-z_?][\w?]*)\}/g)) {
      if (!ref!.startsWith('?') && !bound.has(ref!) && !this.entities.has(ref!)) {
        this.add('error', 'placeholder', `${where}: {${ref}} names nothing`);
      }
    }
  }
  containment() {
    for (const p of this.module.entities.filter(e => e.type === 'place' && !e.space)) {
      this.add('warning', 'containment', `${p.id} has no place in the containment tree`);
    }
  }
  private oneWay(way: string, a: string, b: string): boolean {
    return !this.relations('connects').some(r => r.args[0] === way && r.args[1] === b && r.args[2] === a);
  }
  // The first ending whose condition holds is the one reached: a later one that asks all an earlier one asks, and
  // more, can never be (Low Water's 21: seventeen endings ordered by hand, nothing saying one was shadowed).
  // A fact of a module's own that something writes and nothing reads, in a condition, a value or a text: an unfinished
  // thread, said as advice (the Road's licensed, warmed, grieved and warnedChimed were found by hand: its friction's
  // "lint that understands rules").
  writeOnly() {
    const read = new Set<string>(), written = new Set<string>();
    // What the campaign reads of it too: its outcomes, and the goals and pressures of those who act in it.
    CampaignLint.walk([this.module, this.session.campaign.tickState.definition], read, written);
    for (const name of [...written].filter(n => n.includes('__') && !read.has(n)).sort()) {
      this.add('advice', 'write-only', `${name} is written and never read: a thread not yet taken up?`);
    }
  }
  private static walk(node: unknown, read: Set<string>, written: Set<string>) {
    if (typeof node === 'string') {
      for (const m of node.matchAll(/\{[^{}]*?\b(\w+__\w+)\(/g)) { read.add(m[1]!); }
      return;
    }
    if (!node || typeof node !== 'object') { return; }
    const n = node as { kind?: string; name?: string; call?: { name: string }; value?: unknown };
    if (n.kind && ['assert', 'retract', 'set', 'increase', 'decrease'].includes(n.kind) && n.call) {
      written.add(n.call.name);
      if (n.value) { this.walk(n.value, read, written); }
      return;
    }
    if (n.kind === 'call' && n.name) { read.add(n.name); }
    for (const v of Array.isArray(node) ? node : Object.values(node)) { this.walk(v, read, written); }
  }
  endings() {
    const ends = (this.module.rules ?? []).filter(r => r.effects.some(e => e.kind === 'assert' && e.call.name === 'reached'))
      .map(r => ({ id: r.id, asks: this.conjuncts(r.when.kind === 'and' ? r.when.left : r.when) }));
    ends.forEach((late, i) => {
      const early = ends.slice(0, i).find(e => [...e.asks].every(a => late.asks.has(a)));
      if (early) { this.add('warning', 'ending', `${late.id} is never reached: ${early.id} comes first, and holds whenever it does`); }
    });
  }
  private conjuncts(p: Predicate): Set<string> {
    return p.kind === 'and' ? new Set([...this.conjuncts(p.left), ...this.conjuncts(p.right)]) : new Set([JSON.stringify(p)]);
  }
  private needs(way: string): string {
    return this.relations('needs').filter(r => r.args[0] === way).map(r => r.args[1]).join(',');
  }
  passages() {
    const seen = new Map<string, string>(), kinds = new Set<string>();
    for (const c of this.relations('connects')) {
      const [way, a, b] = c.args as [string, string, string];
      for (const end of [a, b]) {
        if (this.entities.get(end)?.type !== 'place') { this.add('error', 'passage', `${way} ends at ${end}, which is not a place`); }
      }
      // A way that goes one way only is not its own return (Low Water's 17: the way back from the still water was
      // reported as a duplicate of the way down to it).
      const key = this.oneWay(way, a, b) ? `${a}>${b}` : [a, b].sort().join('|');
      // Two ways between the same places are alternatives only if they ask for different things (a rope, a lock).
      if (seen.has(key) && seen.get(key) !== way && this.needs(way) === this.needs(seen.get(key)!)) {
        this.add('warning', 'passage', `${way} duplicates ${seen.get(key)} between ${a} and ${b}`);
      }
      seen.set(key, way);
      // A way is joined both ways round, and said of once.
      if (!kinds.has(way)) { kinds.add(way); this.passageKind(way, a, b); }
    }
  }
  // A passage kind promises something about its ends: stairs change level, roads stay outdoors. A climb from one
  // area to another (a ladder from the quay to a loft) changes level whatever the levels are called (Liberty of the
  // Ice friction 17: such a climb could not be a ladder).
  passageKind(way: string, a: string, b: string) {
    const kind = this.relations('passageKind').find(r => r.args[0] === way)?.args[1] ?? '';
    if (['way_stair', 'way_ladder', 'way_shaft', 'way_incline'].includes(kind) && this.level(a) === this.level(b)
      && this.area(a) === this.area(b)) {
      this.add('warning', 'passage', `${way} is a ${kind.slice(4)} but does not change level`);
    }
    if (['way_road', 'way_path', 'way_track', 'way_ford'].includes(kind) && (this.indoors(a) || this.indoors(b))) {
      this.add('warning', 'passage', `${way} is a ${kind.slice(4)} but ends indoors`);
    }
  }
  level(id: string) { return Spatial.ancestry(this.entities, id).find(e => e.space?.kind === 'level')?.id; }
  area(id: string) {
    return Spatial.ancestry(this.entities, id).slice(1)
      .find(e => ['building', 'site', 'settlement', 'wilderness'].includes(e.space?.kind ?? ''))?.id;
  }
  indoors(id: string) { return this.world.test({ kind: 'call', name: 'indoors', args: [id] }); }
  traversal() {
    const legacy = ['route', 'gate', 'hazardPassage', 'climbingPassage', 'informedPassage', 'footway'];
    const count = this.world.snapshot.relations.filter(r => legacy.includes(r.name)).length;
    if (count) { this.add('warning', 'traversal', `${count} legacy directed traversal facts (migrate to Passage)`); }
  }
  geography() {
    const connects = this.relations('connects');
    if (!connects.length) { return; }
    const company = this.session.campaign.playerActor;
    const start = this.relations('at').find(r => r.args[0] === company)?.args[1];
    // A room the company is put in by a rule or an action is reached by it (Thrume's F7: an iron door dropped the
    // company into the oubliette by a rule, and a one-way drop was written only so that the lint would see the way).
    const moved = [...(this.module.rules ?? []).flatMap(r => r.effects), ...this.module.actions.flatMap(a => a.success)]
      .filter(c => c.kind === 'assert' && c.call.name === 'at' && [company, 'actor'].includes(c.call.args[0]))
      .map(c => c.call.args[1]!);
    const reached = new Set([...start ? [start] : [], ...moved]);
    for (let grew = true; grew;) {
      grew = false;
      for (const [, from, to] of connects.map(c => c.args)) {
        if (reached.has(from!) && !reached.has(to!)) { reached.add(to!); grew = true; }
      }
    }
    // A room with no way in or out at all is off-stage by design: where the dead sleep, where a power's agents set out.
    const joined = new Set(connects.flatMap(c => [c.args[1]!, c.args[2]!]));
    for (const p of this.module.entities.filter(e => e.type === 'place' && e.space?.kind === 'room' && !reached.has(e.id)
      && joined.has(e.id))) {
      this.add('warning', 'geography', `${p.id} cannot be reached from where the company starts`);
    }
  }
  applicability() {
    // Campaigns ground actions on demand; lint asks once, statically, which schemas have no target at all.
    const failed = new Map<string, string>();
    const grounded = ActionSchemas.targeted(this.module, this.session.campaign.actors, failed);
    for (const [id, why] of failed) { this.add('error', 'applicability', `action ${id} cannot be grounded: ${why}`); }
    for (const schema of this.session.campaign.schemas.filter(x => x.id.includes('__'))) {
      if (!grounded.has(schema.id)) {
        this.add('warning', 'applicability', `action ${schema.id} has no possible target in this world`);
      }
    }
  }
  // A choice names what tells it apart from another: an action over any item of a kind (a flask of lamp oil) that
  // leaves the item out of its label offers two choices of one name once two such items are carried.
  labels() {
    for (const schema of this.session.campaign.schemas) {
      const shown = ActionSchemas.placeholders(schema.name), text = JSON.stringify(schema.requires ?? {});
      for (const p of (schema.parameters ?? []).filter(x => x.type === 'item' && !shown.includes(x.name))) {
        if (text.includes(`"name":"itemKind","args":["${p.name}"`)) {
          this.add('error', 'label', `action ${schema.id} takes any ${p.name} of a kind, but "${schema.name}" does not name it`);
        }
      }
    }
  }
  items() {
    for (const e of this.module.entities.filter(x => x.type === 'item')) {
      const kind = this.relations('itemKind').find(r => r.args[0] === e.id)?.args[1];
      if (kind && !ItemCatalog.definitions[kind]) {
        this.add('error', 'item-identity', `${e.id} is of kind ${kind}, missing from the item catalog`);
      }
    }
  }
  // Category errors in who the people are, and use of quarantined or renamed content. A species takes no calling;
  // a person of an ancestry takes a class that ancestry allows.
  domain() {
    for (const c of this.session.campaign.state.creatures) {
      const where = c.id;
      if (Canon.isSpecies(c.raceId)) {
        if (c.classId !== undefined) { this.add('error', 'category', `${where}: species ${c.raceId} cannot take the class ${c.classId}`); }
      } else if (Canon.isAncestry(c.raceId)) {
        if (!c.classId) { this.add('error', 'category', `${where}: a ${c.raceId} needs a class`); }
        else if (Canon.isSpecies(c.classId)) { this.add('error', 'category', `${where}: ${c.classId} is a species, not a class`); }
        else if (!Canon.ancestries[c.raceId]!.classes.includes(c.classId)) {
          this.add('error', 'category', `${where}: a ${c.raceId} cannot be a ${c.classId}`);
        }
      } else { this.add('error', 'category', `${where}: ${c.raceId} is neither an ancestry nor a species`); }
    }
  }
  // A role that names its person again ("Lady Wenlock, a Lady Wenlock": Hessel friction 10) is said once on the page;
  // the lint says it so the role can say who they are instead.
  roles() {
    for (const e of this.module.entities.filter(x => x.type === 'group' && x.name.includes(', '))) {
      const [name, ...rest] = e.name.split(', '), role = rest.join(', ');
      if (name && role.toLowerCase().includes(name.toLowerCase())) {
        this.add('warning', 'role', `${e.id}: the role "${role}" names ${name} again; say who they are instead`);
      }
    }
  }
  // A role is what someone is wherever they are: a clerk "at a high desk, doing sums" was standing barefoot in the
  // Minster porch (A Winter in Carth's 13). One that puts them somewhere, on someone moved by a rule, an action or a
  // pursuit of their own, is advice to say where it is true (`Role "…" when at(clerk, counting_house)`); what they
  // are (an innkeeper, a cutter going home) is true wherever they go.
  static readonly placing = /\b(at|in|on|by|beside|behind|under|over|inside|outside)\s+(a|an|the|his|her|their|its)\b/i;
  movers() {
    const moved = new Map<string, string>();
    const lists = [...this.module.actions.map(a => [a.schema ?? a.id, [...a.success, ...a.failure]] as const),
      ...(this.module.rules ?? []).map(r => [r.id, r.effects] as const)];
    for (const [id, effects] of lists) {
      for (const c of effects.filter(x => x.kind === 'assert' && x.call.name === 'at')) { moved.set(c.call.args[0]!, id); }
    }
    for (const p of (this.module.pursuits ?? []).filter(x => JSON.stringify(x.target).includes('"name":"at"'))) {
      moved.set(p.actor, p.id);
    }
    for (const e of this.module.entities.filter(x => x.type === 'group' && x.name.includes(', ') && !x.roles)) {
      const by = moved.get(e.id);
      if (by && CampaignLint.placing.test(e.name.split(', ').slice(1).join(', '))) {
        this.add('advice', 'role', `${e.id} is "${e.name.split(', ').slice(1).join(', ')}" wherever they are, and ${by}`
          + ` moves them: say where it is true (Role "…" when at(${e.id}, …))`);
      }
    }
  }
  prose() {
    const texts = new Map<string, string>([
      ...(this.module.observations ?? []).map(o => [o.id, o.text] as [string, string]),
      ...(this.module.rules ?? []).filter(r => r.say).map(r => [r.id, r.say!] as [string, string]),
      ...this.module.actions.filter(a => a.report).map(a => [a.schema ?? a.id, a.report!] as [string, string])]);
    for (const [id, text] of texts) {
      const word = CampaignLint.implementationWords.exec(text);
      if (word) { this.add('warning', 'prose', `${id} explains the implementation ("${word[0]}")`); }
    }
  }
}
