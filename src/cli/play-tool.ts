// `kyrie play`: a campaign played from the terminal by the labels a player sees, as its journeys are (see Journey,
// whose steps these are). Steps come from a JSON file (a list, or named phases played in the order written) and then
// from the command line; each is printed with what the page told of it. --probe asks the world afterwards: a fact
// ("knows party season__hour_names") is yes or no, a measure ("#dose season__member_party_1") is its number.
//   bin/kyrie play <campaign.json> [--seed s] [--steps steps.json] [--probe "..."]... [--choices] [step ...]
import { readFile } from 'node:fs/promises';
import { Journey } from '../session/journey';

export class PlayTool {
  static parse(args: string[]) {
    const flags = new Map<string, string[]>(), rest: string[] = [];
    for (let i = 0; i < args.length; i++) {
      const a = args[i]!, flag = /^--(seed|steps|probe)$/.exec(a);
      if (flag) { flags.set(flag[1]!, [...flags.get(flag[1]!) ?? [], args[++i] ?? '']); }
      else if (a === '--choices') { flags.set('choices', ['yes']); }
      else { rest.push(a); }
    }
    return { campaign: rest[0], steps: rest.slice(1), seed: flags.get('seed')?.[0] ?? 'journey',
      file: flags.get('steps')?.[0], probes: flags.get('probe') ?? [], choices: flags.has('choices') };
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
    if (!o.campaign) { print('usage: kyrie play <campaign.json> [--seed s] [--steps steps.json] [--probe "..."] [step ...]'); return 1; }
    const j = await Journey.start(o.campaign, o.seed), steps = [...await this.steps(o.file), ...o.steps];
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
