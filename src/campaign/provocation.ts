import type { Operator } from '../lang/module';

// The one an action's success sets on whoever does it (a challenge to single combat sets the knight on the one who
// calls it out): the fight the action begins by the company's own choice, if it begins one.
export class Provocation {
  static of(action: Operator): string | undefined {
    const actor = action.bindings?.actor;
    return action.success.find(c => c.kind === 'assert' && c.call.name === 'assails' && c.call.args[1] === actor)
      ?.call.args[0];
  }
}
