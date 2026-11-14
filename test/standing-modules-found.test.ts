import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Journey } from '../src/session/journey';
import { ScreenModel } from '../src/ui/screen-model';
import { Placed } from './support/placed';
import { MapPlay } from './support/map-play';
import { Kept } from './support/kept';

// The three standing deep modules (the Numbered House, the Bound Howe, the Silent Lord) in a country that holds all
// three. A blind playtest (seed kahitude, ~100 steps) never found the House or the howe: they were told only in the
// town nearest each, which a company starting in the first town has no reason to visit. Each is now told in the first
// town (s1, the largest), and each is set out for from the map by the page's own card. The first day says nothing of
// any of them (the first hour is not buried), and no module is told by the same mouth as another.
const seeds = ['kahitude', 'a1', 'b2', 'thorn', 'c3', 'd4', 'kite'];
// Each seed is drawn once in the file, and its first three days played once: the map's cards are pressed by the company
// the first town has told, resumed from where the first case left it (see Kept), where each case had drawn the
// country and waited the two days again. What is read after the wait is what the company knows and what the page leads
// with, not what each hour said: the wait is told only as it ends (==).
const start = (seed: string) => Kept.drawn(seed, { origin: 'debt',
  party: [{ name: 'Mira', raceId: 'human', classId: 'warrior' }] });
const told = async (seed: string): Promise<Journey> => {
  const k = await start(seed);
  await k.play('>s1_taproom', '>s1_green');
  return k.play('==day 3 09:00', '>s1_taproom', '>s1_green');
};
const facts = { house: 'arcology__rumour', howe: 'howe__ridge_told', keep: 'keep__levy_called' };
const known = (j: Journey) => Object.fromEntries(Object.entries(facts).map(([k, f]) => [k, Placed.holds(j, 'knows', 'party', f)]));

describe('the three deep modules are found from the first town', () => {
  for (const seed of seeds) {
    it(`says nothing of them on the first day, then tells all three by the third, in ${seed}`, async () => {
      const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared, {});
      const bound = (s: string) => w.report.placements.find(x => x.scenario === s)!.bindings;
      expect(bound('silent-lord').home).toBe('s1');
      expect(bound('arcology').first).toBe('s1');
      expect(bound('bound-howe').first).toBe('s1');
      const k = await start(seed);
      // Day 1: only what the region itself says; the near town (when it is the first town) may tell its own.
      const first = known(await k.play('>s1_taproom', '>s1_green'));
      if (bound('arcology').town !== 's1') { expect(first.house).toBe(false); }
      if (bound('bound-howe').town !== 's1') { expect(first.howe).toBe(false); }
      expect(first.keep).toBe(false);
      const j = await k.play('==day 3 09:00', '>s1_taproom', '>s1_green');
      expect(known(j)).toEqual({ house: true, howe: true, keep: true });
      const aims = ScreenModel.build(j.campaign).objectives.join(' ');
      expect(aims).toMatch(/bends round a hill with nothing in it/);
      expect(aims).toMatch(/salvage crew is digging/);
      expect(aims).toMatch(/crier in the castellan's colours/);
    }, 400000);

    it(`is walked to from the first town by the map’s own card, each in turn, in ${seed}`, async () => {
      const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared, {});
      const site = (s: string, role: string) => `region__${w.report.placements.find(x => x.scenario === s)!.bindings[role]}`;
      const j = await told(seed);
      expect(known(j)).toEqual({ house: true, howe: true, keep: true });
      for (const [scenario, role] of [['arcology', 'works'], ['bound-howe', 'howe'], ['silent-lord', 'keep']] as const) {
        const f = MapPlay.fork(j, seed, 'debt');
        const to = site(scenario, role);
        expect(await MapPlay.press(f, to)).toEqual({ to, arrived: true });
        expect(MapPlay.at(f)).toBe(to);
      }
    }, 600000);
  }
});
