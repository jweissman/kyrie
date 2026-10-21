import type { Call, Change, Module, NumberValue, Operator, Person, Predicate, Value } from './module';
import { World } from './world';

export class ModuleWriter {
  static value(value: Value): string {
    if (value.kind === 'call') { return World.format(value); }
    return value.kind === 'number' ? String(value.value) : `(${value.expression})`;
  }
  static predicate(predicate: Predicate): string {
    switch (predicate.kind) {
      case 'call': return World.format(predicate);
      case 'boolean': return String(predicate.value);
      case 'not': return `not (${ModuleWriter.predicate(predicate.value)})`;
      case 'and': case 'or':
        return `(${ModuleWriter.predicate(predicate.left)}) ${predicate.kind} (${ModuleWriter.predicate(predicate.right)})`;
      case 'compare': return `${ModuleWriter.value(predicate.left)} ${predicate.operator} ${ModuleWriter.value(predicate.right)}`;
    }
  }
  static change(change: Change): string {
    const call = World.format(change.call);
    switch (change.kind) {
      case 'assert': return `Assert ${call}.`;
      case 'retract': return `Retract ${call}.`;
      case 'set': return `Set ${call} to ${ModuleWriter.value(change.value)}.`;
      case 'increase': return `Increase ${call} by ${ModuleWriter.value(change.value)}.`;
      case 'decrease': return `Decrease ${call} by ${ModuleWriter.value(change.value)}.`;
    }
  }
  static write(module: Module): string {
    const lines = [`Module ${module.id} ${JSON.stringify(module.name)} {`,
      `  Description ${JSON.stringify(module.description)}.`];
    for (const kind of module.kinds) { lines.push(`  Kind ${kind}.`); }
    for (const relation of module.relations) {
      lines.push(`  Relation ${relation.name}(${relation.types.join(', ')})${relation.exclusive ? ' exclusive' : ''}.`);
    }
    for (const measure of module.measures) { lines.push(`  Measure ${measure.name}(${measure.types.join(', ')}).`); }
    for (const query of module.queries) {
      const parameters = query.parameters.map(p => `${p.name}: ${p.type}`).join(', ');
      lines.push(`  Query ${query.name}(${parameters}) means ${ModuleWriter.predicate(query.body)}.`);
    }
    if (module.company) {
      const c = module.company;
      lines.push(`  Company ${c.id} ${JSON.stringify(c.name)} of ${c.size} at ${c.place}.`);
    }
    for (const p of module.people ?? []) { lines.push(`  Person ${p.id} ${JSON.stringify(p.name)} at ${p.place} { ${ModuleWriter.person(p)} }`); }
    const declared = new Set([...(module.people ?? []).map(p => p.id), module.company?.id]);
    for (const entity of module.entities.filter(e => !declared.has(e.id))) { lines.push(ModuleWriter.entity(entity)); }
    for (const p of module.pursuits ?? []) {
      lines.push(`  Pursuit ${p.id} for ${p.actor}${p.label ? ` ${JSON.stringify(p.label)}` : ''} priority ${p.priority} when ${ModuleWriter.predicate(p.when)} seeks ${ModuleWriter.predicate(p.target)}.`);
    }
    for (const rule of module.rules ?? []) {
      const anchor = rule.place ? ` ${rule.anchor ?? 'at'} ${rule.place}` : '';
      lines.push(`  Rule ${rule.id}${anchor} when ${ModuleWriter.predicate(rule.when)}${rule.say ? ` says ${JSON.stringify(rule.say)}` : ''} {`);
      rule.effects.forEach(c => lines.push(`    ${ModuleWriter.change(c)}`));
      lines.push('  }');
    }
    for (const o of module.observations ?? []) {
      lines.push(`  Observe ${o.id} ${o.anchor ?? 'at'} ${o.place} when ${ModuleWriter.predicate(o.when)} ${JSON.stringify(o.text)}.`);
    }
    for (const o of module.objectives ?? []) {
      lines.push(`  Objective ${o.id} when ${ModuleWriter.predicate(o.when)} ${JSON.stringify(o.text)}.`);
    }
    for (const change of module.initial.filter(c => !(c.kind === 'assert' && c.call.name === 'doorHere'
      && module.entities.some(e => e.exit?.door === c.call.args[0]
        && [e.exit!.origin, e.exit!.destination].includes(c.call.args[1]!)))
      && !(c.kind === 'assert' && c.call.name === 'at'
      && module.people?.some(p => p.id === c.call.args[0] && p.place === c.call.args[1])))) { lines.push(`  Initially ${ModuleWriter.change(change)}`); }
    lines.push(`  Budget ${ModuleWriter.value(module.budget)}.`, `  Goal ${ModuleWriter.predicate(module.goal)}.`);
    for (const action of module.actions.filter(a => !a.movement && !a.searchPlace)) {
      lines.push('', ...ModuleWriter.action(action));
    }
    return `${lines.join('\n')}\n}\n`;
  }
  // A place, an exit, a hazard or a plain entity, as its own declaration.
  private static entity(entity: Module['entities'][number]): string {
    if (entity.space) {
      const grid = entity.space.grid ? ` at ${entity.space.grid[0]}, ${entity.space.grid[1]}` : '';
      return `  Place ${entity.id} ${JSON.stringify(entity.name)} is ${entity.space.kind}${entity.space.parent ? ` within ${entity.space.parent}` : ''}${grid}.`;
    }
    if (entity.exit) {
      const e = entity.exit;
      return `  Exit ${entity.id} ${JSON.stringify(entity.name)} from ${e.origin} to ${e.destination} by ${e.mode}${e.door ? ` through ${e.door}` : ''}${e.knowledge ? ` known by ${e.knowledge}` : ''}.`;
    }
    if (entity.type === 'hazard' && entity.effect) {
      return `  Hazard ${entity.id} ${JSON.stringify(entity.name)} means ${JSON.stringify(entity.effect)}.`;
    }
    return `  Entity ${entity.id}: ${entity.type} ${JSON.stringify(entity.name)}${entity.creatureId ? ` bound to ${entity.creatureId}` : ''}.`;
  }
  private static action(action: Operator): string[] {
    const parameters = action.parameters ? `(${action.parameters.map(p => `${p.name}: ${p.type}`).join(', ')})` : '';
    const lines = [`  Action ${action.id}${parameters} ${JSON.stringify(action.name)} {`,
      `    Description ${JSON.stringify(action.description)}.`,
      `    Requires ${ModuleWriter.predicate(action.requires)}.`,
      `    Cost ${action.cost}. Time ${action.duration ? World.format(action.duration) : action.time}.`];
    if (action.report) { lines.push(`    Result ${JSON.stringify(action.report)}.`); }
    if (action.seen) { lines.push(`    Seen ${JSON.stringify(action.seen)}.`); }
    if (action.speaker) { lines.push(`    Speaker ${action.speaker}.`); }
    if (action.resolve) { lines.push(`    Resolve ${World.format(action.resolve)}.`); }
    lines.push('    On success {', ...action.success.map(change => `      ${ModuleWriter.change(change)}`), '    }');
    if (action.failure.length) {
      lines.push('    On failure {', ...action.failure.map(change => `      ${ModuleWriter.change(change)}`), '    }');
    }
    lines.push('  }');
    return lines;
  }
  // Only authored identity is written back, so a reparse cannot turn a default into an authored value.
  static person(p: Person): string {
    const authored = new Set(p.authored ?? []);
    // A species person has a kind and no class; every person of an ancestry has one (commoner by default).
    const species = authored.has('raceId') && p.classId === undefined;
    return [p.role ? `Role ${JSON.stringify(p.role)}.` : '', species ? `Species ${p.raceId}.` : '',
      p.creature ? `Creature ${Object.entries(p.creature).map(([k, v]) => `${k} ${v}`).join(', ')}.` : '',
      p.count && p.count !== 1 ? `Numbers ${p.count}.` : '',
      p.names?.length ? `Called ${p.names.map(n => JSON.stringify(n)).join(', ')}.` : '',
      !species && authored.has('raceId') ? `Ancestry ${p.raceId}.` : '',
      !species && authored.has('classId') ? `Calling ${p.classId}.` : '', authored.has('level') ? `Level ${p.level}.` : '',
      ...(p.traits ?? []).map(t => `Trait ${t}.`), ...(p.gear ?? []).map(g => `Carries ${g}.`),
      p.professionId ? `Profession ${p.professionId}.` : '', p.backgroundId ? `Background ${p.backgroundId}.` : '',
      p.actions.length ? `Uses ${p.actions.join(', ')}.` : '', p.horizon ? `Plans ${p.horizon} steps.` : '']
      .filter(Boolean).join(' ');
  }
  static call(name: string, ...args: string[]): Call { return { kind: 'call', name, args }; }
  static number(value: number): NumberValue { return { kind: 'number', value }; }
}
