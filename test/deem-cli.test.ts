import { describe, expect, it } from 'bun:test';
import { runGeneration, type DeemValue } from 'deem';
import { Canon } from '../src/canon/canon';
import { Content } from '../src/content';
import { GenerationSetting } from '../src/generation-setting';

// Deem's public CLI reads Kyr's setting folder as it is checked in, without a Kyr runtime. What it draws for a
// creature is who it is drawn as (its people or kind, for a crowd) and its six qualities; its body is the catalog's,
// made from its one record (the owner, 5 November: Deem's own creature grammar, a second way to make a body, is
// retired).
class Cli {
  static run(type: string, seed = 'public-cli'): Record<string, DeemValue> {
    return runGeneration({ seed, settingDir: process.cwd(), type }).output as Record<string, DeemValue>;
  }
}

describe('Deem public CLI entry point', () => {
  it('runs the checked-in setting without a Kyr runtime: qualities, and who a creature is drawn as', () => {
    const qualities = Cli.run('attributes');
    expect(Object.values(qualities).every(v => typeof v === 'number' && v >= 3 && v <= 18)).toBe(true);
    for (const seed of ['a', 'b', 'c']) {
      const raceId = String(Cli.run('population', seed).raceId);
      expect([raceId, !!Canon.ancestries[raceId] || Canon.isSpecies(raceId)]).toEqual([raceId, true]);
    }
  });
  it('holds no way to make a creature\'s body but the catalog\'s', () => {
    const templates = Object.keys(GenerationSetting.templates);
    expect(templates.filter(t => ['creature', 'dragon', 'animal', 'humanoid', 'construct'].includes(t))).toEqual([]);
    expect(Object.keys(GenerationSetting.tables).filter(t => /^creature(?!Population)|^dragon/.test(t))).toEqual([]);
    const wisp = new Content('drawn').createCreature('w', { raceId: 'wisp' });
    expect(wisp.base.maxHp).toBeGreaterThan(0);
  });
});
