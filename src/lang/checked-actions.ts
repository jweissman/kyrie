import type { Operator, Signature } from './module';

// An action checked once, and not again where nothing it was checked by has changed (AX-04's validator split; the
// architecture's start profile, 21 November: each module installed checked the shared rules' acts again, the same
// objects every time, joined uncopied, and a compiled module's own at every load of it). What its check looked up is
// kept with it: each entity's type it named, each kind, each function by name and the list it came from (the
// module's predicates, relations, measures, the runtime's capabilities), with what each was. Met again in a check by
// the same compiler's rule (joined or not, the same capabilities), it is passed where every one of those answers the
// same, and checked whole where any does not. Only a check passed is kept: a refusal is always the whole check, and
// says what it said. The definitions are read, never written (test/small/frozen-modules).
export class CheckedActions {
  private static readonly kept = new WeakMap<Operator,
    { joined: boolean; capabilities: Signature[]; noted: string[] }>();
  // Whether the action was checked before by this rule, and every lookup it made answers as it did (answer: the
  // lookup's note as the module now answers it).
  static holds(action: Operator, at: { joined: boolean; capabilities: Signature[] }, answer: (note: string) => string)
    : boolean {
    const was = this.kept.get(action);
    return !!was && was.joined === at.joined && was.capabilities === at.capabilities
      && was.noted.every(n => answer(n) === n);
  }
  static keep(action: Operator, at: { joined: boolean; capabilities: Signature[] }, noted: string[]) {
    if (noted.includes(CheckedActions.unknown)) { return; }
    this.kept.set(action, { ...at, noted });
  }
  // A lookup in a list of functions it cannot name: the check is not kept.
  static readonly unknown = '?';
}
