// `kyrie play`: a campaign played from the terminal by the labels a player sees, as its journeys are (see Journey,
// whose steps these are). Steps come from a JSON file (a list, or named phases played in the order written) and then
// from the command line; each is printed with what the page told of it. --probe asks the world afterwards: a fact
// ("knows party season__hour_names") is yes or no, a measure ("#dose season__member_party_1") is its number.
// --world plays a generated world drawn from its seed instead, for one protagonist (--as race/calling/name) with an
// origin in it (--origin, a wanderer unless it says).
//   bin/kyrie play <campaign.json> [--seed s] [--steps steps.json] [--probe "..."]... [--choices] [step ...]
//   bin/kyrie play --world <seed> [--origin debt] [--as elf/ranger/Aud] [step ...]
import { readFile } from 'node:fs/promises';
import { Journey } from '../session/journey';
import { DrawnWorld } from '../world/drawn-world';
import { NodeBundleSource } from '../campaign/node-bundle-source';

export class PlayTool {
  static readonly usage = 'usage: kyrie play <campaign.json> | --world <seed> [--origin o] [--as race/calling/Name]'
    + ' [--seed s] [--steps steps.json] [--probe "..."] [--choices] [step ...]';
  static parse(args: string[]) {
    const flags = new Map<string, string[]>(), rest: string[] = [];
    for (let i = 0; i < args.length; i++) {
      const a = args[i]!, flag = /^--(seed|steps|probe|world|origin|as)$/.exec(a);
      if (flag) { flags.set(flag[1]!, [...flags.get(flag[1]!) ?? [], args[++i] ?? '']); }
      else if (a === '--choices') { flags.set('choices', ['yes']); }
      else { rest.push(a); }
    }
    const world = flags.get('world')?.[0];
    return { campaign: world ? undefined : rest[0], steps: world ? rest : rest.slice(1), world,
      origin: flags.get('origin')?.[0] ?? 'wanderer', as: flags.get('as')?.[0],
      seed: flags.get('seed')?.[0] ?? 'journey', file: flags.get('steps')?.[0], probes: flags.get('probe') ?? [],
      choices: flags.has('choices') };
  }
  // The game the options name: a campaign, or a generated world drawn for one protagonist.
  static async start(o: ReturnType<typeof PlayTool.parse>): Promise<Journey> {
    if (!o.world) { return Journey.start(o.campaign!, o.seed); }
    const [raceId = 'human', classId = 'ranger', name = 'Aud'] = (o.as ?? '').split('/').map(x => x.trim() || undefined);
    const drawn = { party: [{ name, raceId, classId }], origin: o.origin };
    return Journey.of(await DrawnWorld.start(o.world, drawn, NodeBundleSource.shared));
  }
  static async steps(file: string | undefined): Promise<string[]> {
    if (!file) { return []; }
    const read = JSON.parse(await readFile(file, 'utf8')) as string[] | Record<string, string[]>;
    return Array.isArray(read) ? read : Object.values(read).flat();
  }
  static probe(j: Journey, probe: string): string {
    const [name, ...args] = probe.trim().split(/\s+/);
    if (!name) { return ''; }
    return name.startsWith('#') ? `${probe}: ${j.measure(name.slice(1), ...args)}` : `${probe}: ${j.holds(name, ...args) ? 'yes' : 'no'}`;
  }
  static async main(args: string[], print: (line: string) => void = console.log): Promise<number> {
    const o = this.parse(args);
    if (!o.campaign && !o.world) { print(this.usage); return 1; }
    const j = await this.start(o), steps = [...await this.steps(o.file), ...o.steps];
    let failed = 0;
    for (const step of steps) {
      const before = j.taken.length;
      try { await j.step(step); } catch (e) { print(`! ${(e as Error).message}`); failed = 1; break; }
      for (const t of j.taken.slice(before)) { print(`[${t.label}] ${t.page}`); }
    }
    print(`-- watch ${j.watch()}, at ${j.at(j.campaign.playerActor ?? 'party') ?? 'nowhere'}`);
    for (const p of o.probes) { print(this.probe(j, p)); }
    if (o.choices) { for (const c of j.choices()) { print(`  ${c.full}`); } }
    return failed;
  }
}
