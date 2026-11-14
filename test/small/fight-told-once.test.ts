import { describe, expect, it } from 'bun:test';
import { Atlas } from '../support/atlas';
import { Runner } from '../../src/cli/runner';
import { RunnerFight } from '../../src/cli/runner-fight';

// A fight is told once (BP-02, attention): its turns as they come, then its last blows and how it ended. The runner,
// which the terminal's agents and the walkers play through, had told the whole fight again on its outcome, "Rat 1"
// become "the first rat", the damage and the experience beside it; the page's host had not (EngineHost.unfought).
const fought = async (pressOn: boolean) => {
  const r = new Runner((await Atlas.start('danger', 'green')).session), said: string[] = [];
  let out = await r.ask(JSON.stringify({ act: 'attack(t__rats)' }));
  while (!('error' in out)) {
    said.push(...out.scene.lines);
    if (out.moment !== 'fight') { break; }
    out = await r.ask(JSON.stringify({ act: pressOn ? RunnerFight.through : out.offer.primary[0]!.id }));
  }
  return said.join('\n');
};
describe('a fight told through the runner', () => {
  for (const pressOn of [false, true]) {
    it(`tells each fall once, in the fight's own names${pressOn ? ', pressed on to the end' : ''}`, async () => {
      const said = await fought(pressOn);
      expect(said.match(/\bRat 1 falls\b/g)).toHaveLength(1);
      expect(said.match(/\bRat 2 falls\b/g)).toHaveLength(1);
      expect(said).not.toMatch(/the (first|second) rat|slashing damage|gains \d+ experience/);
      expect(said.match(/The fight is won\./g)).toHaveLength(1);
    });
  }
});
