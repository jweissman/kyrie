import type { Change, Effect } from './lang';

export class Lesson {
  static change(effect: Extract<Effect, { kind: 'learn' }>, member: string): Extract<Change, { kind: 'assert' }> {
    const change = effect.lowering ?? { kind: 'assert' as const,
      call: { kind: 'call' as const, name: 'learned', args: [effect.target, effect.ability] } };
    if (change.call.name !== 'learned' || change.call.args.length !== 2
      || change.call.args[0] !== effect.target || change.call.args[1] !== effect.ability) {
      throw new Error('A lesson must assert its target and ability in learned');
    }
    return { ...change, call: { ...change.call, args: [member, change.call.args[1]!] } };
  }
}
