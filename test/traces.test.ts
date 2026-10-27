import { describe, expect, it } from 'bun:test';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PlayTool } from '../src/cli/play-tool';
import { Traces, type Kept } from '../src/cli/traces';

// Play kept as regression tests (brief X): each trace of test/fixtures/traces, kept by `kyrie play … --keep <name>`
// or `kyrie keep <transcript.json> <name>`, played again, and held to where it came to when it was kept.
describe('kept traces', () => {
  const kept = readdirSync(Traces.dir).filter(f => f.endsWith('.json') && !f.endsWith('.transcript.json'));
  for (const file of kept) {
    it(`come to what they came to: ${Traces.named(file)}`, async () => {
      const k = JSON.parse(readFileSync(join(Traces.dir, file), 'utf8')) as Kept;
      const came = k.play ? await PlayTool.again(k.play) : await Traces.transcript(join(Traces.dir, k.transcript!));
      expect(came).toEqual({ at: k.at, watch: k.watch, told: k.told });
    }, 120000);
  }
});
