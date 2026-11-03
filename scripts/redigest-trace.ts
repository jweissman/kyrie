// A kept transcript's digests written again, after a change that alters what every world is underneath (a new shared
// rule, a new fact kept) while play comes to the same place, watch and words: its commands are played again without
// their digests, each step's digest is taken as it comes, and the trace's own record of where it came to is checked
// and said, so a change in where play goes is seen, not written over.
//   bun scripts/redigest-trace.ts wren-tower-climbed
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { PlaySession, type Transcript } from '../src/session/play-session';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Traces, type Kept } from '../src/cli/traces';

class Redigest {
  static async run(name: string) {
    const kept = JSON.parse(await readFile(join(Traces.dir, `${name}.json`), 'utf8')) as Kept;
    const file = join(Traces.dir, kept.transcript ?? `${name}.transcript.json`);
    const t = JSON.parse(await readFile(file, 'utf8')) as Transcript;
    const s = t.drawn ? await DrawnWorld.start(t.seed, t.drawn, NodeBundleSource.shared)
      : await PlaySession.start(t.scenario, t.seed, NodeBundleSource.shared, t.party);
    await s.replay(t.steps.map(({ digest: _digest, ...step }) => step));
    const steps = t.steps.map((step, i) => ({ ...step, digest: s.transcript.steps[i]!.digest }));
    await writeFile(file, `${JSON.stringify({ ...t, steps }, null, 1)}\n`);
    const came = await Traces.transcript(file);
    const same = came.at === kept.at && came.watch === kept.watch && came.told === kept.told;
    console.log(same ? 'rewrote digests; it comes where it came' : `rewrote digests, but it comes elsewhere now: ${
      JSON.stringify(came)}`);
  }
}
await Redigest.run(process.argv[2] ?? 'wren-tower-climbed');
