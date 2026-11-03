// `kyrie play`: a campaign played from the terminal by the labels a player sees, as its journeys are (see Journey,
// whose steps these are). Steps come from a JSON file (a list, or named phases played in the order written) and then
// from the command line; each is printed with what the page told of it. --probe asks the world afterwards: a fact
// ("knows party season__hour_names") is yes or no, a measure ("#dose season__member_party_1") is its number.
// --world plays a generated world drawn from its seed instead, for one protagonist (--as race/calling/name) with an
// origin in it (--origin, a wanderer unless it says). `play scene` and `play character` play an adventure to one of
// its scenes or people first, in a context its author named (see PlayParts).
//   bin/kyrie play <campaign.json> [--seed s] [--steps steps.json] [--probe "..."]... [--choices] [step ...]
//   bin/kyrie play --world <seed> [--origin debt] [--as elf/ranger/Aud] [step ...]
//   bin/kyrie play scene|character <id> --in <adventure> [--context <name>] [step ...]
// --keep <name> keeps the play as a regression test (see Traces): the command it was, and where it came to.
import { readFile } from 'node:fs/promises';
import { Journey } from '../session/journey';
import { DrawnWorld } from '../world/drawn-world';
import { NodeBundleSource } from '../campaign/node-bundle-source';
import { PlayParts } from './play-parts';
import { Traces, type Came } from './traces';

export class PlayTool {
  static readonly usage = 'usage: kyrie play <campaign.json> [--as race/calling/Name[/background]] | --world <seed> [--origin o] [--as race/calling/Name]'
    + ' | scene|character <id> --in <adventure> [--context name] [--seed s] [--steps steps.json] [--probe "..."]'
    + ' [--choices] [--keep name] [step ...]';
  static parse(args: string[]) {
    const flags = new Map<string, string[]>(), rest: string[] = [];
    for (let i = 0; i < args.length; i++) {
      const a = args[i]!, flag = /^--(seed|steps|probe|world|origin|as|in|context|keep)$/.exec(a);
      if (flag) { flags.set(flag[1]!, [...flags.get(flag[1]!) ?? [], args[++i] ?? '']); }
      else if (a === '--choices') { flags.set('choices', ['yes']); }
      else { rest.push(a); }
    }
    const world = flags.get('world')?.[0], into = flags.get('in')?.[0];
    const part = into && ['scene', 'character'].includes(rest[0] ?? '') ? { kind: rest[0]!, id: rest[1] ?? '', into,
      context: flags.get('context')?.[0] } : undefined;
    return { campaign: world || part ? undefined : rest[0], steps: world ? rest : rest.slice(part ? 2 : 1), world, part,
      origin: flags.get('origin')?.[0] ?? 'wanderer', as: flags.get('as')?.[0],
      seed: flags.get('seed')?.[0] ?? 'journey', file: flags.get('steps')?.[0], probes: flags.get('probe') ?? [],
      choices: flags.has('choices'), keep: flags.get('keep')?.[0] };
  }
  // The game the options name (a campaign, or a generated world drawn for one protagonist), and the steps that lead
  // into what is to be played (to a scene, or into talk with someone).
  static async start(o: ReturnType<typeof PlayTool.parse>): Promise<{ journey: Journey; lead: string[] }> {
    if (o.part) { return PlayParts.start(o.part.kind, o.part.id, o.part.into, o.part.context); }
    const [raceId = 'human', classId = 'ranger', name = 'Aud', backgroundId] =
      (o.as ?? '').split('/').map(x => x.trim() || undefined);
    // A campaign played as someone of the player's choosing (race/calling/Name[/background]), not its own company.
    if (!o.world) {
      const party = o.as ? { party: [{ name, raceId, classId, ...backgroundId ? { backgroundId } : {} }] } : {};
      return { journey: await Journey.start(o.campaign!, o.seed, party), lead: [] };
    }
    const drawn = { party: [{ name, raceId, classId }], origin: o.origin };
    return { journey: Journey.of(await DrawnWorld.start(o.world, drawn, NodeBundleSource.shared)), lead: [] };
  }
  // A kept play's command played again, to where it comes (see Traces).
  static async again(args: string[]): Promise<Came> {
    const o = this.parse(args), { journey: j, lead } = await this.start(o);
    for (const step of [...lead, ...await this.steps(o.file), ...o.steps]) { await j.step(step); }
    return this.came(j);
  }
  private static came(j: Journey): Came {
    return { at: j.at(j.campaign.playerActor ?? 'party') ?? '', watch: j.watch(), told: j.taken.at(-1)?.page ?? '' };
  }
  static async steps(file: string | undefined): Promise<string[]> {
    if (!file) { return []; }
    const read = JSON.parse(await readFile(file, 'utf8')) as string[] | Record<string, string[]>;
    return Array.isArray(read) ? read : Object.values(read).flat();
  }
  static probe(j: Journey, probe: string): string {
    const [name, ...args] = probe.trim().split(/\s+/);
    if (!name) { return ''; }
    // @relation lists what holds of it, for a relation of any arity.
    if (name.startsWith('@')) {
      const held = j.campaign.world.related(name.slice(1)).filter(f => args.every((a, i) => f.args[i] === a));
      return `${probe}: ${held.map(f => `(${f.args.join(', ')})`).join(' ') || 'none'}`;
    }
    return name.startsWith('#') ? `${probe}: ${j.measure(name.slice(1), ...args)}` : `${probe}: ${j.holds(name, ...args) ? 'yes' : 'no'}`;
  }
  static async main(args: string[], print: (line: string) => void = console.log): Promise<number> {
    const o = this.parse(args);
    if (!o.campaign && !o.world && !o.part) { print(this.usage); return 1; }
    let started: Awaited<ReturnType<typeof PlayTool.start>>;
    try { started = await this.start(o); } catch (e) { print(`! ${(e as Error).message}`); return 1; }
    const j = started.journey, steps = [...started.lead, ...await this.steps(o.file), ...o.steps];
    let failed = 0;
    for (const step of steps) {
      const before = j.taken.length;
      try { await j.step(step); } catch (e) { print(`! ${(e as Error).message}`); failed = 1; break; }
      for (const t of j.taken.slice(before)) {
        if (t.grave) { print(`! asked first: ${t.grave}`); }
        print(`[${t.label}] ${t.page}`);
      }
    }
    print(`-- watch ${j.watch()}, at ${j.at(j.campaign.playerActor ?? 'party') ?? 'nowhere'}`);
    for (const p of o.probes) { print(this.probe(j, p)); }
    // A scene or someone played into shows what can be done there, or asked.
    if (o.choices || o.part) { for (const c of j.choices()) { print(`  ${c.full}`); } }
    if (o.keep && !failed) {
      const play = args.filter((a, i) => a !== '--keep' && args[i - 1] !== '--keep');
      print(`kept as ${await Traces.keep(o.keep, { play, ...this.came(j) })}: bun test test/traces.test.ts plays it again`);
    }
    return failed;
  }
}
