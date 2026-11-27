import { describe, expect, it } from 'bun:test';

// Kyr's entry loads first, alone (platform-separation.md, stage 1): a client of the language imports it before any of
// the runtime, as a package's client would. The module parser's actions are the other parsers', which import it; read
// as it loaded they were half-made, and the entry loaded first threw (c006d2d13, met by CI's seventh shard). Played in
// a process of its own, as the push lane shares one module cache across its files.
describe("Kyr's entry, loaded first", () => {
  it('parses a module with nothing of the runtime loaded before it', () => {
    const run = Bun.spawnSync(['bun', '-e', `const { ModuleParser } = await import('${process.cwd()}/src/lang');
      console.log(ModuleParser.parse('Module m "M" { }').id);`]);
    expect([run.exitCode, run.stdout.toString().trim()]).toEqual([0, 'm']);
  });
});
