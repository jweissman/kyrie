import type { Operator } from './lang/module';
import type { InstalledModule } from './campaign/definition';

export class RandomStreams {
  private static ids = new WeakMap<Operator[], Map<string, Operator>>();
  static key(seed: string, domain: string, ...identity: (string | number)[]): string {
    return JSON.stringify([seed, domain, ...identity]);
  }
  // An installed module's entity ids are re-keyed by its seed, so renaming an installation does not change its draws.
  static identity(installations: InstalledModule[] | undefined, id: string): string {
    const owner = installations?.find(m => id.startsWith(`${m.id}__`));
    return owner ? `${owner.seed}:${id.slice(owner.id.length + 2)}` : id;
  }
  static action(installations: InstalledModule[] | undefined, action: Operator): string {
    return JSON.stringify([action.resolve?.name, ...(action.resolve?.args ?? [action.id])
      .map(id => this.identity(installations, id))]);
  }
  // The stream for a command's draws: its identity and how many earlier commands shared that identity.
  static command(seed: string, domain: string, context: { installations: InstalledModule[] | undefined;
    actions: Operator[]; history: { action: string }[] }, action: Operator): string {
    const { installations, actions, history } = context;
    let ids = this.ids.get(actions);
    if (ids?.size !== actions.length) { ids = new Map(actions.map(a => [a.id, a])); this.ids.set(actions, ids); }
    const key = this.action(installations, action), index = ids;
    const occurrence = history.filter(e => {
      const previous = index.get(e.action);
      return previous && this.action(installations, previous) === key;
    }).length;
    return this.key(seed, domain, key, occurrence);
  }
}
