import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Layers } from '../../scripts/layers';

// The layers held (MT-16): Kyr the language, the runtime, a generic player that knows no setting, the setting's
// modules, each importing only from those beneath it. Today's wrong-way imports are the baseline; a new one fails
// here, and so does one gone that the baseline still lists, so that the count only falls, each time on purpose
// (`bun scripts/layers.ts --write` after removing one, the edge named in the commit).
describe('the layers', () => {
  const kept = JSON.parse(readFileSync(join(Layers.root, Layers.baseline), 'utf8')) as { edges: string[] };
  const now = Layers.edges();
  it('gain no import that goes the wrong way', () => {
    expect(now.filter(e => !kept.edges.includes(e))).toEqual([]);
  });
  it('keep no edge in the baseline that is gone', () => {
    expect(kept.edges.filter(e => !now.includes(e))).toEqual([]);
  });
  it('place each unit by its folder, and allow only downward', () => {
    expect(['src/lang/module.ts', 'src/campaign/campaign.ts', 'src/shared/voice-words.ts', 'src/ui/glance.ts',
      'src/world/countries.ts', 'src/client/drawn-world.ts', 'web/reader/reader-app.tsx'].map(p => Layers.of(p)))
      .toEqual(['lang', 'runtime', 'runtime', 'player', 'setting', 'client', 'client']);
    const pairs = [['player', 'runtime'], ['player', 'setting'], ['lang', 'runtime'], ['setting', 'runtime'],
      ['client', 'setting']] as const;
    expect(pairs.map(([a, b]) => Layers.allowed(a, b))).toEqual([true, false, false, true, true]);
  });
});
