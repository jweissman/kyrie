// Play kept as a regression test (brief X). A play by `kyrie play … --keep <name>` is kept as the command it was (its
// arguments) and where it came to: the place, the watch, and what the page told at its last step. A game saved from
// the browser, by `kyrie keep <transcript.json> <name>`: its transcript, and where its commands come to. Each is a file
// of test/fixtures/traces, and test/traces.test.ts plays each again and holds it to what was kept.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { PlaySession, type Transcript } from '../session/play-session';
import { DrawnWorld } from '../world/drawn-world';
import { NodeBundleSource } from '../campaign/node-bundle-source';
import { ModuleWriter } from '../lang/module-writer';

// Where a play came to.
export interface Came { at: string; watch: number; told: string }
// A play kept: the command (a play's arguments) or the transcript (a file beside it) it was, and where it came to.
export interface Kept extends Came { about: string; play?: string[]; transcript?: string }

export class Traces {
  static readonly dir = 'test/fixtures/traces';
  static readonly about = 'Kept by bin/kyrie play --keep, or bin/kyrie keep, and played again by test/traces.test.ts:'
    + ' what it came to must be what it comes to.';
  static async keep(name: string, kept: Omit<Kept, 'about'>, root = process.cwd()): Promise<string> {
    const path = join(this.dir, `${name}.json`);
    await mkdir(join(root, this.dir), { recursive: true });
    await writeFile(join(root, path), `${JSON.stringify({ about: this.about, ...kept }, null, 1)}\n`);
    return path;
  }
  // A transcript saved from the browser, kept beside where its commands come to. A generated world's is drawn again
  // from its seed, and is kept with its world's name, not where it was drawn on the machine that drew it.
  static async keepTranscript(file: string, name: string, root = process.cwd()): Promise<string> {
    const came = await this.transcript(file), copy = `${name}.transcript.json`;
    const t = JSON.parse(await readFile(file, 'utf8')) as Transcript;
    await mkdir(join(root, this.dir), { recursive: true });
    await writeFile(join(root, this.dir, copy), `${JSON.stringify(t.drawn ? { ...t, scenario: basename(t.scenario) } : t, null, 1)}\n`);
    return this.keep(name, { transcript: copy, ...came }, root);
  }
  // A transcript's commands played again, as `kyrie replay` plays them, to where they come.
  static async transcript(file: string): Promise<Came> {
    const t = JSON.parse(await readFile(file, 'utf8')) as Transcript;
    const s = t.drawn ? await DrawnWorld.start(t.seed, t.drawn, NodeBundleSource.shared)
      : await PlaySession.start(t.scenario, t.seed, NodeBundleSource.shared, t.party);
    await s.replay(t.steps);
    const c = s.campaign, last = c.history.at(-1);
    return { at: c.world.one('at', c.playerActor ?? 'party') ?? '', watch: c.world.number(ModuleWriter.call('watch', 'clock')),
      told: [...(last?.perceptions ?? []).map(p => p.text), last?.response ?? ''].join(' ').trim() };
  }
  static named(file: string): string { return basename(file, '.json'); }
}
