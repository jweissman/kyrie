import { DeclaredReads } from '../../src/lang/declared-reads';

// Every read of a relation no module declares fails the spec that makes it (MT-25): preloaded for every run of the
// specs (bunfig.toml). The small and quick lanes read none (21 November); a spec that means to read another module's
// relation reads it as such (DeclaredReads.optional), and one that counts the reads (test/small/declared-reads) sets
// its own hook for the reading (DeclaredReads.during).
DeclaredReads.told = (name: string) => { throw new Error(`Undeclared relation read: ${name} (MT-25; DeclaredReads.optional)`); };
