// The language's values a generator declares its Kyr as (ModuleSource: AX-04, doc/architecture/mission-22/
// generated-ir.md), and the parser's types and calls they are made of, through one door: the country's writers import
// them here rather than each reaching into the language (test/small/lang-entry), and not through Kyr's entry, which
// the generators' folder may not import without closing a cycle (test/small/cycles).
export { ModuleSource, type FileSource } from '../lang/module-source';
export { ModuleWriter } from '../lang/module-writer';
export type { Change, Entity, Observation, Predicate } from '../lang/module';
