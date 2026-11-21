import { describe, expect, it } from 'bun:test';
import { FirstQuarter } from '../scripts/first-quarter';
import { AutoplayRun } from '../src/autoplay/run';
import { Undertakings } from '../src/presentation/undertakings';
import { Narrator } from '../src/presentation/narrator';
import { ScreenModel } from '../src/ui/screen-model';
import type { Quarter } from '../scripts/first-quarter';

// Gold that leads where nothing is gold (OR-171), on the first quarter hour's walk (iscoed, a warrior, the kin life):
// the reeve's receipt read, its aim (hold it up against the Hall's seal, in the muniment room) went to Porthalen
// Hall, and the forecourt led into the great hall and the great hall back out to the forecourt, fifty times. Inside a
// site, toward a room no known way reaches, a way on into it is the step, never one back (Glance.toward). The library
// found, the press-door to the muniments locked, and nothing in the company to open it (the old key, lockwork, a
// crowbar), the aim's place is shut to it: no step, and the need says so (Shut), as a keeper beyond the company is
// (Guarded, OR-167), from anywhere on the way. And the lettered flag's aim, its ring to be found in the ossuary, had
// been gold on into the crypt, and from the crypt back (OR-168): where what an aim waits on lies here, no way out is
// its step.
const fro = (q: Quarter) => q.steps.map(x => x.place)
  .filter((p, i, all) => i > 1 && p === all[i - 2] && p !== all[i - 1]).length;
const spec = { seed: 'iscoed', origin: 'kin', policy: 'gold' as const, steps: 1,
  protagonist: { name: 'Wenna', raceId: 'human', classId: 'warrior' } };
describe('Porthalen Hall, by the gold', () => {
  it('goes on into the Hall to the press-door, and is told it is shut, not walked to and fro', async () => {
    const q = await FirstQuarter.walk('iscoed', 'kin', 'warrior', 40);
    const places = q.steps.map(x => x.place);
    expect(places).toContain('the library');
    expect(q.steps.map(x => x.command)).toContain('push(region__s1_manor_press)');
    expect(fro(q)).toBeLessThanOrEqual(3);
    expect(q.fights).toBeGreaterThanOrEqual(1);
    // Walked again to the press-door and back to the forecourt: the aim's place is shut, said as a need, and nothing
    // gold.
    const s = await AutoplayRun.start(spec, AutoplayRun.empty()), c = s.campaign;
    const upto = q.steps.findIndex(x => x.command === 'push(region__s1_manor_press)');
    for (const x of q.steps.slice(0, upto + 1)) { await s.leg(x.command); }
    for (const back of ['go(region__s1_manor_libdoor,region__s1_manor_hall)',
      'go(region__s1_manor_door,region__s1_manor_front)']) { await s.leg(back); }
    Undertakings.follow(c, 'region__s1_rooke_aim_seal');
    const screen = ScreenModel.build(c), g = Narrator.leaf(c, screen).glance!;
    expect(screen.place.name).toBe('the forecourt of Porthalen Hall');
    expect(g.acts.filter(a => a.continues)).toEqual([]);
    expect(g.continuance).toMatchObject({ kind: 'frontier', need: true });
    expect(g.need ?? []).toContain('The muniment-press door bars the way: it wants the old press key, lockwork or a '
      + 'crowbar, and the company has none of them; Sabine, the tinker, Martin\'s daughter, sells a crowbar.');
  }, 600000);
  it('looks for the lettered flag\'s ring in the ossuary, not on into the crypt, and is not walked to and fro below', async () => {
    const q = await FirstQuarter.walk('iscoed', 'debt', 'warrior', { steps: 70, asked: [
      'region__s1_u_notice_read(party,region__s1_green)', 'go(region__s1_shop_door,region__s1_shop)',
      'region__s1_u_rats_job_ask'] });
    expect(q.steps.map(x => x.command)).toContain('region__s1_u_flag_pressed(party,region__s1_u_undercroft)');
    expect(fro(q)).toBeLessThanOrEqual(4);
    const s = await AutoplayRun.start({ ...spec, origin: 'debt' }, AutoplayRun.empty()), c = s.campaign;
    for (const a of ['region__s1_u_notice_read(party,region__s1_green)', 'go(region__s1_shop_door,region__s1_shop)',
      'region__s1_u_rats_job_ask']) { await s.leg(a); }
    const at = q.steps.findIndex(x => x.command === 'region__s1_u_raiser_who');
    for (const x of q.steps.slice(0, at + 1)) { await s.leg(x.command); }
    Undertakings.follow(c, 'region__s1_u_floor_sought');
    const screen = ScreenModel.build(c), g = Narrator.leaf(c, screen).glance!;
    expect(screen.place.name).toBe('the ossuary');
    expect(g.acts.filter(a => a.continues).map(a => a.choice)).not.toContain('exit:region__s1_u_crypt');
  }, 600000);
});
