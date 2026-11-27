import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../../../src/cli/play-tool';
import { Runner, type Said } from '../../../src/cli/runner';
import { RunnerFight } from '../../../src/cli/runner-fight';
import { ModuleWriter } from '../../../src/lang/module-writer';
import { ScreenModel } from '../../../src/ui/screen-model';
import { AsMeant } from '../../support/as-meant';
import { GoldenWalk } from '../../support/golden-walk';
import { TalkWay } from '../../support/talk-way';

// Feature pins: see test/features/choice/consequence.pin.test.ts. World › The opening dungeon, unmistakable (OR-311;
// the owner's playtest of 23-24 November: "the loop: notice the dungeon, prepare, recruit, explore, face danger,
// discover, return"). Porthalen, Iscoed's first town, and the dungeon under it: come down from the opening's adit to
// the green, the company finds the dungeon told where it stands, on the well-post's notice, with its ways down in the
// town itself; light and a ration to be had a few steps off, at the salter's; someone on the green who would come
// along for what the company has; then down under the corn-store, the rats and the old buck fought with the one
// recruited beside it, the nest searched, and back up to be paid. Every act by the rows the runner offers, found by
// their words (test/features/world/the-loop-under-porthalen.pin.test.ts walks the descent further, alone).
type Row = { id: string; label: string; opens?: Row[] };
const flat = (rs: Row[]): Row[] => rs.flatMap(r => [r, ...flat(r.opens ?? [])]);
const rows = (s: Said): Row[] => flat([...s.offer?.primary ?? [], ...s.offer?.rest ?? [],
  ...Object.values(s.offer?.lenses ?? {}).flat()] as Row[]);
describe('World › The opening dungeon, unmistakable', () => {
  it('is noticed from the first town, prepared for, recruited for, explored, fought, searched and returned from', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(GoldenWalk.args()));
    const r = new Runner(journey.session), c = journey.session.campaign;
    for (const line of GoldenWalk.lines().slice(0, GoldenWalk.opened())) { await AsMeant.ask(r, line); }
    let s = r.said('look'), fights = 0;
    const holds = (name: string, ...args: string[]) => c.world.test(ModuleWriter.call(name, ...args));
    const play = async (steps: string[]) => {
      for (const step of steps) {
        // Found as the page's player finds it, a talk open (TalkWay, OR-1451).
        const way = step === 'through' ? undefined : await TalkWay.find(r, s, x => new RegExp(step, 'i').test(x.label));
        if (way) { s = way.said; }
        const found = way?.o;
        if (step !== 'through') { expect([step, found?.label]).toEqual([step, expect.any(String)]); }
        const said = await AsMeant.ask(r, JSON.stringify({ act: found?.id ?? RunnerFight.through }));
        expect([step, 'error' in said ? said.error : '']).toEqual([step, '']);
        s = said as Said;
        expect([step, !!s.end || rows(s).length > 0]).toEqual([step, true]);
        if (step === 'through') { fights++; }
      }
    };
    // Notice: on the green, the first page of the town, the notice is there to read, and it tells of the troubles
    // under the town; the ways down are in the town (the corn-store a few steps off).
    expect(c.world.one('at', 'party')).toBe('region__s1_green');
    await play(['^Read the notice on the well-post']);
    expect(s.scene.lines.join(' ')).toMatch(/corn-store/);
    // Recruit: whoever is on the green would come along, for what the company has.
    const hand = c.module.entities.find(e => e.id === 'region__s1_u_hand')!;
    await play([`^${hand.name.split(', ')[0]}: where his drove went`,
      `^Ask ${hand.name.split(', ')[0]} to join the company`]);
    expect(c.readout.partyIds.length).toBe(2);
    // Prepare: light and a ration, at the salter's; then explore, face danger, discover and return.
    await play(["^To Holgar's salt-house", '^Holgar: the rats in the corn-store', '^Buy a torch for',
      '^Buy one ration from Holgar', '^To the old corn-store', '^Light a torch', '^Down to the corn-store cellar',
      '^To the rat-runs', '^Attack the rats', 'through', '^Down to the nest', '^Attack the old buck rat', 'through',
      'light a candle', '^Search here', '^Out to the landing at Porthalen', "^To Holgar's salt-house",
      '^Tell Holgar the rats under the corn-store are dead']);
    expect(fights).toBe(2);
    expect(holds('region__s1_u_paid', 'region__s1_u_rats_job')).toBe(true);
    expect(ScreenModel.build(c).party.every(m => m.hp > 0)).toBe(true);
    expect(c.readout.partyIds.length).toBe(2);
  }, 300000);
});
