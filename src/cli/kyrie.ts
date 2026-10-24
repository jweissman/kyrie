// The Kyrie command line (bin/kyrie): play a campaign in the terminal, and the authoring and checking tools.
import { readFile } from 'node:fs/promises';
import { Content } from '../content';
import { Campaign } from '../campaign/campaign';
import { NodeBundleSource } from '../campaign/node-bundle-source';
import { Canon } from '../canon/canon';
import { batch } from '../arena';
import { PlaySession, type Transcript } from '../session/play-session';
import { ModuleParser } from '../lang/module-parser';
import { KyrLint } from './kyr-lint';
import { Preview } from './preview';
import { WorldTool } from './world';
import { VoiceTool } from './voice';
import { HandbookTool } from './handbook';
import { OrsinoRegistryTool } from './orsino-registry';
import { Playtext } from './playtext';
import { Terminal } from './terminal';
import { Frontier } from '../world/frontier';
import { DrawnWorld } from '../world/drawn-world';

export class KyrieCli {
  static readonly usage = [
    'Play:      bin/kyrie campaign <campaign.json> [seed] | resume <save.json> | replay <transcript.json>',
    'Author:    bin/kyrie lint [campaign.json] [--inventory] | compile <module.kyr> | preview <campaign.json> [--port 8080]',
    '           bin/kyrie world <seed> [--terrain forest|marsh|mountain|frost] [--json] | playtext <seed> [steps]',
    '           bin/kyrie voice show|moments|coverage|review|orsino | handbook [--html <dir>]',
    'Check:     bin/kyrie test [bun test arguments] | validate | orsino check|report|generate|catalog|world|inventory',
    'Look up:   bin/kyrie ancestries | species | classes | abilities | batch [count]'].join('\n');
  static async main(args: string[]): Promise<number> {
    const [mode = 'help', path = '', argument] = args, rest = args.slice(1);
    switch (mode) {
      case 'lint': return KyrLint.main(rest);
      case 'compile': return this.compile(path);
      case 'test': return this.test(rest);
      case 'preview': await Preview.main(rest); return 0;
      case 'world': await WorldTool.main(rest); return 0;
      case 'voice': return VoiceTool.main(rest);
      case 'handbook': return HandbookTool.main(rest);
      case 'orsino': return OrsinoRegistryTool.main(rest);
      case 'playtext': await Playtext.main(rest); return 0;
      case 'campaign': await Terminal.play(await Campaign.load(path, argument ?? 'campaign', NodeBundleSource.shared)); return 0;
      case 'replay': return this.replay(path);
      case 'resume': await Terminal.play(Campaign.restore(JSON.parse(await readFile(path, 'utf8')))); return 0;
      default: return this.lookUp(mode, path, argument);
    }
  }
  // A Kyr module as the engine reads it: the parsed module, as JSON, or the first error with its place.
  private static async compile(path: string): Promise<number> {
    if (!path) { console.error('usage: bin/kyrie compile <module.kyr>'); return 1; }
    try { console.log(JSON.stringify(ModuleParser.parse(await readFile(path, 'utf8')), null, 1)); return 0; }
    catch (error) { console.error(`${path}: ${error instanceof Error ? error.message : String(error)}`); return 1; }
  }
  // The suite, as bun runs it, with whatever arguments are given (a file, a pattern, --changed).
  private static test(args: string[]): number {
    const run = Bun.spawnSync(['bun', 'test', ...args.length ? args : ['--parallel']],
      { stdio: ['inherit', 'inherit', 'inherit'] });
    return run.exitCode ?? 1;
  }
  // A transcript played again from its start, and the game it comes to; a generated world is drawn again first, from
  // its seed and what it was drawn for.
  private static async replay(path: string): Promise<number> {
    const t = JSON.parse(await readFile(path, 'utf8')) as Transcript;
    if (Frontier.generated(t.scenario) && !t.drawn) {
      console.error(`${path}: a generated world's transcript from before what it was drawn for was kept`);
      return 1;
    }
    const session = t.drawn ? await DrawnWorld.start(t.seed, t.drawn, NodeBundleSource.shared)
      : await PlaySession.start(t.scenario, t.seed, NodeBundleSource.shared, t.party);
    // The terminal draws it where it stands; the browser named it by itself.
    if (session.scenario !== t.scenario && !session.scenario.endsWith(`/${t.scenario}`)) {
      console.error(`${path}: drawn again, the world is ${session.scenario}, not ${t.scenario}`);
      return 1;
    }
    await session.replay(t.steps);
    console.log(session.canonical());
    return 0;
  }
  private static lookUp(mode: string, path: string, argument?: string): number {
    switch (mode) {
      case 'ancestries': console.table(Canon.ancestries, ['name', 'classes']); return 0;
      case 'species': console.table(Object.fromEntries(Object.keys(Canon.species).map(id => [id, Canon.creature(id)])),
        ['name', 'type', 'variantOf']); return 0;
      case 'classes': console.table(Canon.classes, ['name', 'hitDie', 'specializations']); return 0;
      case 'abilities':
        Object.entries(Canon.abilities)
          .forEach(([id, a]) => console.log(`${id}: ${a.name} (${a.kind})\n  ${a.effect ?? a.description ?? ''}`));
        return 0;
      case 'validate': Content.validate(); console.log(`${Content.abilities.length} abilities; canonical catalogs valid.`); return 0;
      case 'batch': console.log(JSON.stringify(batch(Number(argument ?? path ?? 1000), 'arena'), null, 2)); return 0;
      default: console.log(this.usage); return mode === 'help' ? 0 : 1;
    }
  }
}

if (import.meta.main) { process.exitCode = await KyrieCli.main(process.argv.slice(2)); }
