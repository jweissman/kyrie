import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Re-runs the public Deem commands recorded in doc/generation and rewrites their outputs.
// Usage: bun bin/record-cli-examples.ts
class Recorder {
  static fixture(script: string): string {
    const dir = mkdtempSync(join(tmpdir(), 'kyr-cli-examples-'));
    const prepared = Bun.spawnSync(['bun', 'run', script, 'prepare', dir]);
    if (prepared.exitCode !== 0) { throw new Error(`${script} prepare failed: ${prepared.stderr.toString()}`); }
    return dir;
  }
  static run(command: string, fixture: string): unknown {
    const result = Bun.spawnSync(['bash', '-c', command], { env: { ...process.env, fixture } });
    if (result.exitCode !== 0) { throw new Error(`${command}: ${result.stderr.toString()}`); }
    return JSON.parse(result.stdout.toString());
  }
  static async rewrite<T>(path: string, script: string, update: (entry: T, fixture: string) => T) {
    const fixture = this.fixture(script);
    try {
      const entries = await Bun.file(path).json() as T[];
      await Bun.write(path, `${JSON.stringify(entries.map(e => update(e, fixture)), null, 2)}\n`);
    } finally { rmSync(fixture, { recursive: true, force: true }); }
  }
}
await Recorder.rewrite<{ command: string; output: unknown }>('doc/generation/public-cli-examples.json',
  'bin/prove-creature-choices.ts', (e, fixture) => ({ ...e, output: Recorder.run(e.command, fixture) }));
await Recorder.rewrite<{ commandLine: string; definition: unknown }>('doc/generation/authoring-cli-outputs.json',
  'bin/prove-creature-composition.ts', (e, fixture) => ({ ...e, definition: Recorder.run(e.commandLine, fixture) }));
