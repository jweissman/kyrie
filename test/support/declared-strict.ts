import { DeclaredReads } from '../../src/lang/declared-reads';

// Every read of a relation no module declares fails the spec that makes it (MT-25): a preload for a whole run,
//   bun test --preload ./test/support/declared-strict.ts
// not on by default until a full run on CI has found and declared (or made optional) every hit the openings probed
// here did not reach (a1's kin road and iscoed's opening read none once `mounted` was read only where declared).
DeclaredReads.told = (name: string) => { throw new Error(`Undeclared relation read: ${name} (MT-25; DeclaredReads.optional)`); };
