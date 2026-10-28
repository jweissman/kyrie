import { CreatureFacts } from './creature-facts';

// What the engine writes rather than any rule or action of a module: the creatures' projection, where everyone is,
// what is known and kept, who has joined whom and who follows, the clock's dark, what was witnessed. A relation outside
// it that no rule or action writes is a constant of the world: lint grounds over it (ActionSchemas), and the world
// audit reads it as something no story can wait on. One list for both: "Let Saro hold on" (The Patient Star) waits on
// joinedAs, which the audit knew the engine writes and lint did not.
export class EngineWrites {
  // Each name here is one the engine asserts as play goes (test/engine-writes.test.ts reads the engine for them): a
  // fire exposing a place, a witness to an attack, a band routed, a company captured, what was told and read (the
  // architecture review's M1: exposedTo and witnessedAttack were missing, and defeated and ended, which nothing
  // writes, were listed).
  static readonly names: ReadonlySet<string> = new Set([...CreatureFacts.written, 'at', 'knows', 'established',
    'keeps', 'owns', 'state', 'cleared', 'travelsWith', 'joinedAs', 'following', 'cameHome',
    'grateful', 'willing', 'been', 'tried', 'distinct', 'within', 'dark', 'recorded', 'witnessed', 'exposedTo', 'witnessedAttack',
    'routed', 'captured', 'toldBy', 'readIn', 'itemKind']);
}
