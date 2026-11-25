import { describe, expect, it } from 'bun:test';
import { ModuleWriter } from '../src/lang/module-writer';
import { KyrTemplates } from '../src/world/kyr-template';
import { RegionTies } from '../src/world/region-ties';
import type { Journey } from '../src/session/journey';
import { Kept } from './support/kept';
import { TieAlone, type TieForm } from './support/tie-alone';

// The three shapes of a tie (data/generation/town/ties.kyrt) differ in dramatic form, not in text: kin runs on a clock
// (a day it is too late), debt has a rival who also goes, custom is a standing obligation the town enforces on someone
// if it is ignored. Each form is played alone (TieAlone: the template's base and the one shape, filled for one town
// and its site on a host of a few lines), by the labels the page offers, the company asking what the matter is first
// (OR-423); it had drawn six countries for it, four to six minutes. One short walk stays on a drawn country: the kin
// wait at thorn, its asker found where the country put them.
const warrior = [{ name: 'Ralf', raceId: 'human', classId: 'warrior' }];
const ranger = [{ name: 'Wren', raceId: 'human', classId: 'ranger' }];
const asks = { kin: ['s1_taproom', 'Mag Hollin', 'why the lamp is kept'], debt: ['s1_green', 'Wat Cotter', 'what they have lent'],
  custom: ['s1_shrine', 'Father Ned', 'about the bread'] } as const;
const holds = (j: Journey, rel: string) => j.holds(`s1_${rel}`, 'party');
const offered = (j: Journey) => j.choices().map(c => c.full).join(' | ');
// The asker's question, after what the matter is in the town: neither may be passed over.
const ask = async (j: Journey, form: TieForm) => {
  const [room, who, question] = asks[form];
  j.put('party', room);
  await j.play(`Ask ${who} what the matter is`, question);
  expect(holds(j, 'tie_asked')).toBe(true);
};
const start = async (form: TieForm, party = warrior) => (await TieAlone.start(form, party)).journey;

describe('the three forms of a tie', () => {
  it('draws each form over a country\'s towns, each with a third party of its own beside the asker', () => {
    const drawn: Record<string, number> = { kin: 0, debt: 0, custom: 0 };
    for (let i = 0; i < 40; i++) {
      const shape = KyrTemplates.choose(RegionTies.template, `country${i % 5}:s${i}:tie`, TieAlone.values)
        .find(s => s.group === 'shape')!;
      drawn[shape.option]!++;
    }
    for (const form of Object.keys(drawn)) { expect(drawn[form]!).toBeGreaterThanOrEqual(6); }
    for (const [form, third] of [['kin', 'nan'], ['debt', 'heir'], ['custom', 'boy']] as const) {
      const lines = RegionTies.template.sections.find(s => s.option === form)!.lines.join('\n');
      expect(lines).toMatch(new RegExp(`Person \\{t\\}_tie_${third} .* at \\{t\\}_green`));
      expect([...lines.matchAll(/Person \{t\}_tie_(\w+)/g)].map(m => m[1])).toEqual([third]);
    }
  });

  // The wait: a company that asks and then does nothing finds the town changed, in each form.
  for (const [form, wait, seen] of [['kin', 160, /cloth is tied round the lamp/],
    ['debt', 320, /stall (is|stays) shuttered|weighed against the other measure/],
    ['custom', 230, /loaf tied to his wrist|bell at the shrine is rung/]] as const) {
    it(`${form}: if nothing is done the town changes`, async () => {
      const j = await start(form);
      await ask(j, form);
      expect(holds(j, 'tie_lost')).toBe(false);
      // Told only as the wait ends (==): what the town shows is read on the green after it, and in what the wait told.
      const told = await j.play(`==+${wait}`);
      expect(holds(j, 'tie_lost')).toBe(true);
      expect(holds(j, 'tie_done')).toBe(false);
      j.put('party', 's1_green');
      expect(told + j.seen()).toMatch(seen);
      if (form === 'kin') { expect(offered(j)).not.toMatch(/old woman/); }
    });
  }

  it('kin: brought in time the mother holds the pouch, and is told the tracks if a ranger read them', async () => {
    const j = await start('kin');
    await ask(j, 'kin');
    j.put('party', 's1_green');
    expect(offered(j)).toMatch(/old woman/);
    j.put('party', 'w1');
    await j.play('pouch: Take');
    j.put('party', 's1_green');
    await j.play('Put the pouch in the old woman');
    expect(holds(j, 'tie_done')).toBe(true);
    expect(holds(j, 'tie_lost')).toBe(false);
    expect(holds(j, 'tie_nan_first')).toBe(true);
    const r = await start('kin', ranger);
    await ask(r, 'kin');
    // Walked to, as a ranger comes to it: what the tracks say is read on arrival, and known after.
    r.put('party', 's1_green');
    await r.play('>w1');
    expect(r.page).toMatch(/heel-prints/);
    await r.play('>s1_green', 'rose and walked away');
    expect(holds(r, 'tie_hope')).toBe(true);
  });

  it('debt: the rival may beat the company to it, and the measure is bought back', async () => {
    const j = await start('debt');
    await ask(j, 'debt');
    expect(offered(j)).toMatch(/surveyor's son/);
    j.put('party', 'w1');
    await j.play('measure: Take');
    j.put('party', 's1_green');
    await j.play('Give Wat Cotter back the measure from');
    expect(holds(j, 'tie_done')).toBe(true);
    expect(holds(j, 'tie_gone')).toBe(false);
    const late = await start('debt');
    late.coin(30);
    await ask(late, 'debt');
    await late.play('=day 2 9:00');
    expect(holds(late, 'tie_back')).toBe(true);
    expect(late.campaign.world.test(ModuleWriter.call('at', 't__s1_tie_token', 't__w1'))).toBe(false);
    late.put('party', 'w1');
    expect(late.seen()).toMatch(/turned over/);
    late.put('party', 's1_green');
    await late.play('Buy the measure from the surveyor', 'Give Wat Cotter back the measure');
    expect(holds(late, 'tie_done')).toBe(true);
  });

  it('custom: mending the cairn lets the blamed boy go, after the town has found him', async () => {
    const j = await start('custom');
    await ask(j, 'custom');
    await j.play('=+230');
    j.put('party', 's1_green');
    expect(j.seen()).toMatch(/loaf tied to his wrist/);
    j.put('party', 'w1');
    await j.play('Build the cairn up again');
    j.put('party', 's1_shrine');
    await j.play('the cairn at');
    expect(holds(j, 'tie_done')).toBe(true);
    expect(holds(j, 'tie_lost')).toBe(true);
    j.put('party', 's1_green');
    expect(j.seen()).toMatch(/clay-bird/);
  });
});

// The one walk on a drawn country: thorn's kin tie, its innkeeper found where the country put them, and the town
// changed on its green when the company has asked and done nothing (the form's clock, as a generated town keeps it).
describe('a tie in a drawn country', () => {
  it('kin: if nothing is done the town changes (thorn)', async () => {
    const j = (await Kept.drawn('thorn', { origin: 'debt', party: warrior })).journey;
    const nan = j.campaign.world.module.entities.find(e => /^region__s\d+_tie_nan$/.test(e.id))!.id;
    const t = /^region__(s\d+)_tie_nan$/.exec(nan)![1]!;
    await j.play(`>${j.campaign.world.one('at', `region__${t}_innkeeper`)}`, '?what the matter is', 'why the lamp is kept');
    expect(j.holds(`region__${t}_tie_asked`, 'party')).toBe(true);
    // What the way there stirred up is not the tie's: a toll run past on a road had the lord's riders take the company
    // in the middle of the wait.
    const c = j.campaign;
    c.commitWorld(c.world.apply(c.world.related('hostile').filter(r => r.args[1] === c.playerActor)
      .map(r => ({ kind: 'retract' as const, call: ModuleWriter.call('hostile', ...r.args) }))));
    const told = await j.play('==+160');
    expect(j.holds(`region__${t}_tie_lost`, 'party')).toBe(true);
    await j.play(`?>${t}_green`);
    expect(told + j.page).toMatch(/cloth is tied round the lamp/);
  }, 120000);
});
