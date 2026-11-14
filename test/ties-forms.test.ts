import { ModuleWriter } from '../src/lang/module-writer';
import { describe, expect, it } from 'bun:test';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import type { Journey } from '../src/session/journey';
import { Kept } from './support/kept';
import { Placed } from './support/placed';
import { WorldAssembler } from '../src/world/world-assembler';

// The three shapes of a tie (data/generation/town/ties.kyrt) differ in dramatic form, not in text: kin runs on a clock
// (a day it is too late), debt has a rival who also goes, custom is a standing obligation the town enforces on someone
// if it is ignored. Each spec drives the public labels the page offers; where it walks, it walks by `>room` (the
// journey's own path-finding, not a teleport). Nothing is given as a fact or placed.
const warrior = [{ name: 'Ralf', raceId: 'human', classId: 'warrior' }];
const ranger = [{ name: 'Wren', raceId: 'human', classId: 'ranger' }];
// Each seed's country is drawn once in the file for each company, and resumed for each case after (see Kept.drawn), and
// its source read once (LC-04: the cases drew thorn, ember and kahitude three times each, and read each source again).
const start = async (seed: string, party = warrior) => (await Kept.drawn(seed, { origin: 'debt', party })).journey;
const sources = new Map<string, Promise<string>>();
const sourceOf = (seed: string) => {
  if (!sources.has(seed)) { sources.set(seed, WorldAssembler.assemble(seed, NodeBundleSource.shared, {})
    .then(w => [...(w.source as unknown as { files: Map<string, string> }).files.values()].join('\n'))); }
  return sources.get(seed)!;
};
const siteOf = (text: string, t: string) => new RegExp(`${t}_tie_(?:token|cairn)[^\\n]* at (w\\d+)`).exec(text)?.[1];
const shapes = async (seed: string) => {
  const text = await sourceOf(seed);
  return [...text.matchAll(/(?:Person|Thing) (s\d+)_tie_(nan|heir|cairn)/g)].map(m => ({ t: m[1]!,
    form: ({ nan: 'kin', heir: 'debt', cairn: 'custom' } as Record<string, string>)[m[2]!]!, site: siteOf(text, m[1]!) }));
};
const asks = { kin: ['innkeeper', 'why the lamp is kept'], debt: ['merchant', 'what they have lent'],
  custom: ['priest', 'about the bread'] } as const;
// Where the asker stands, as the world has it now.
const at = (j: Journey, t: string, role: string) => j.campaign.world.one('at', `region__${t}_${role}`);
const found = async (seed: string, form: string, nth = 0) => (await shapes(seed)).filter(x => x.form === form)[nth]!;
const holds = (j: Journey, rel: string, t: string) => Placed.holds(j, `region__${t}_${rel}`, 'party');
const offered = (j: Journey) => j.choices().map(c => c.full).join(' | ');

describe('the three forms of a tie', () => {
  it('draws each form in more than one seed, each with its own third party', async () => {
    const drawn: Record<string, string[]> = { kin: [], debt: [], custom: [] };
    for (const seed of ['thorn', 'e1', 'a1', 'ember']) {
      for (const x of await shapes(seed)) { drawn[x.form]!.push(`${seed}:${x.t}`); }
    }
    for (const form of Object.keys(drawn)) { expect(drawn[form]!.length).toBeGreaterThanOrEqual(3); }
  }, 300000);

  // The wait: a company that asks and then does nothing finds the town changed, in each form, in three seeds each.
  for (const [form, seed, wait, seen] of [
    ['kin', 'thorn', 160, /cloth is tied round the lamp/], ['kin', 'e1', 160, /cloth is tied round the lamp/],
    ['kin', 'marrow', 160, /cloth is tied round the lamp/],
    ['debt', 'thorn', 320, /stall is shuttered|weighed against the other measure/], ['debt', 'ember', 320, /stall is shuttered|weighed against the other measure/],
    ['debt', 'kahitude', 320, /stall is shuttered|weighed against the other measure/],
    ['custom', 'kahitude', 230, /loaf tied to his wrist|bell at the shrine is rung/], ['custom', 'a1', 230, /loaf tied to his wrist|bell at the shrine is rung/],
    ['custom', 'ember', 230, /loaf tied to his wrist|bell at the shrine is rung/]] as const) {
    it(`${form}: if nothing is done the town changes (${seed})`, async () => {
      const s = await found(seed, form), [role, ask] = asks[form], j = await start(seed);
      // (Walking through a town can already teach the place's name, in which case the ask is not offered: it is `?`.)
      await j.play(`>${at(j, s.t, role)}`, `?${ask}`);
      // What the way there stirred up is not the tie's: a toll run past on a road the standing scenarios now cross had
      // the lord's riders take the company in the middle of the wait.
      const c = j.campaign;
      c.commitWorld(c.world.apply(c.world.related('hostile').filter(r => r.args[1] === c.playerActor)
        .map(r => ({ kind: 'retract' as const, call: ModuleWriter.call('hostile', ...r.args) }))));
      expect(holds(j, 'tie_lost', s.t)).toBe(false);
      // Told only as the wait ends (==): what the town shows is read on the green after it, and in what the wait told.
      const told = await j.play(`==+${wait}`);
      expect(holds(j, 'tie_lost', s.t)).toBe(true);
      expect(holds(j, 'tie_done', s.t)).toBe(false);
      await j.play(`?>${s.t}_green`);
      expect(told + j.page).toMatch(seen);
      if (form === 'kin') { expect(offered(j)).not.toMatch(/old woman/); }
    }, 900000);
  }

  it('kin: brought in time the mother holds the pouch, and is told the tracks if a ranger read them (thorn)', async () => {
    const s = await found('thorn', 'kin'), j = await start('thorn');
    await j.play(`>${at(j, s.t, 'innkeeper')}`, '?why the lamp is kept', `>${s.t}_green`);
    expect(offered(j)).toMatch(/old woman/);
    await j.play(`>${s.site}`, 'pouch: Take');
    await j.play(`>${s.t}_green`, 'Put the pouch in the old woman');
    expect(holds(j, 'tie_done', s.t)).toBe(true);
    expect(holds(j, 'tie_lost', s.t)).toBe(false);
    expect(holds(j, 'tie_nan_first', s.t)).toBe(true);
    const r = await start('thorn', ranger);
    await r.play(`>${at(r, s.t, 'innkeeper')}`, '?why the lamp is kept', `>${s.site}`);
    expect(r.page).toMatch(/heel-prints/);
    await r.play(`>${s.t}_green`, 'rose and walked away');
    expect(holds(r, 'tie_hope', s.t)).toBe(true);
  }, 900000);

  it('debt: the rival may beat the company to it, and the measure is bought back (ember)', async () => {
    const s = await found('ember', 'debt'), j = await start('ember');
    await j.play(`>${at(j, s.t, 'merchant')}`, '?what they have lent', `>${s.t}_green`);
    expect(offered(j)).toMatch(/surveyor's son/);
    await j.play(`>${s.site}`, 'measure: Take');
    await j.play(`>${at(j, s.t, 'merchant')}`, 'Give .* back the measure from');
    expect(holds(j, 'tie_done', s.t)).toBe(true);
    expect(holds(j, 'tie_gone', s.t)).toBe(false);
    const late = await start('ember');
    await late.play(`>${at(late, s.t, 'merchant')}`, '?what they have lent', '=day 2 9:00');
    expect(holds(late, 'tie_back', s.t)).toBe(true);
    expect(Placed.holds(late, 'at', `region__${s.t}_tie_token`, `region__${s.site}`)).toBe(false);
    await late.play(`>${s.site}`);
    expect(late.page).toMatch(/turned over/);
    await late.play(`>${s.t}_green`, 'Buy the measure from the surveyor', `>${at(late, s.t, 'merchant')}`, 'Give .* back the measure');
    expect(holds(late, 'tie_done', s.t)).toBe(true);
  }, 900000);

  it('custom: mending the cairn lets the blamed boy go, after the town has found him (kahitude)', async () => {
    const s = await found('kahitude', 'custom'), j = await start('kahitude');
    await j.play(`>${at(j, s.t, 'priest')}`, '?about the bread', '=+230', `>${s.t}_green`);
    expect(j.page).toMatch(/loaf tied to his wrist/);
    await j.play(`>${s.site}`, 'Build the cairn up again', `>${at(j, s.t, 'priest')}`, 'the cairn at');
    expect(holds(j, 'tie_done', s.t)).toBe(true);
    expect(holds(j, 'tie_lost', s.t)).toBe(true);
    await j.play(`>${s.t}_green`);
    expect(j.page).toMatch(/clay-bird/);
  }, 900000);
});
