import { CreatureFacts } from './creature-facts';

// What the engine writes rather than any rule or action of a module: the creatures' projection, where everyone is,
// what is known and kept, who has joined whom and who follows, the clock's dark, what was witnessed. A relation outside
// it that no rule or action writes is a constant of the world: lint grounds over it (ActionSchemas), and the world
// audit reads it as something no story can wait on. One list for both: "Let Saro hold on" (The Patient Star) waits on
// joinedAs, which the audit knew the engine writes and lint did not.
export class EngineWrites {
  static readonly names: ReadonlySet<string> = new Set([...CreatureFacts.written, 'at', 'knows', 'established',
    'keeps', 'owns', 'state', 'defeated', 'ended', 'cleared', 'travelsWith', 'joinedAs', 'following', 'cameHome',
    'grateful', 'willing', 'been', 'tried', 'distinct', 'dark', 'recorded', 'witnessed']);
}
