// Kyr's public surface (the platform's first package, kyr-lang: platform-separation.md, stage 1): what code outside
// the language may import, one entry, so that the language's own files can move and change behind it. Everything the
// rest of Kyrie used of src/lang on 24 November, but the parse store (node's file system: the runtime's adapter, so
// that this surface is the same in a browser and a process). New code imports from here; deep imports into
// src/lang/ only fall (test/small/lang-entry).
export * from './action-parts';
export * from './bringing';
export * from './candidates';
export * from './chapters';
export * from './computed-relations';
export * from './consequence';
export * from './declaration-parses';
export * from './declaration-shapes';
export * from './declared-reads';
export * from './diagnostics';
export * from './discovery';
export * from './earned';
export * from './ending-order';
export * from './endings';
export * from './engine-owned';
export * from './entity-index';
export * from './grammars';
export * from './item-names';
export * from './kept-parses';
export * from './kept-predicates';
export * from './kept-reading';
export * from './milestones';
export * from './module';
export * from './module-compiler';
export * from './module-parser';
export * from './module-source';
export * from './module-writer';
export * from './observation-text';
export * from './parse';
export * from './parse-cache';
export * from './query-index';
export * from './reads';
export * from './routes';
export * from './semantic-record';
export * from './situations';
export * from './spatial';
export * from './statement-parser';
export * from './superseded';
export * from './templated-predicates';
export * from './text-hash';
export * from './vocabulary';
export * from './world';
export * from './world-constructs';
export * from './world-memo';
export * from './world-reads';
