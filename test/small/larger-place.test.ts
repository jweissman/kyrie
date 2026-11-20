import { describe, expect, it } from 'bun:test';
import { NodeBundleSource } from '../../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../../src/campaign/overlay-bundle-source';
import { PlaySession } from '../../src/session/play-session';
import { Journey } from '../../src/session/journey';
import { Narrator } from '../../src/presentation/narrator';
import { ScreenModel } from '../../src/ui/screen-model';
import { ActionFeedbackView } from '../../src/presentation/action-feedback';
import { PlayerView } from '../../src/presentation/player-view';
import { Undertakings } from '../../src/presentation/undertakings';
import { SeenThrough } from '../../src/ui/seen-through';

// After the town's jobs, the larger place (T24-18, review A: every notice job a small dungeon, and after each the
// game moved on to the next notice): once two jobs are seen through, a site something known leads to is offered
// before another of the town's jobs; with one seen through, the job still comes first; and with no aim held and
// nothing known in words to lead anywhere, the nearest site on the map (one marked on it by a fact of no words).
// SeenThrough counts installations resolved with experience, so the jobs are modules of their own here, beside a host
// of the town, the tower and the road between.
type Told = 'light' | 'mark';
const host = (told: Told, notice = true) => `
  Place town "Hythe" is settlement.
  Place yard "the yard" is room within town at 0, 0 outdoors.
  Place land "the downs" is wilderness at 0, 0.
  Place tower "the lone tower" is site within land at 3, 0.
  Place foot "the foot of the tower" is room within tower at 0, 0 outdoors.
  Passage track "the long track" is path between yard and foot.
  Company party "You" of 1 at yard.
  Entity green_light: fact "A green light burns at night in the lone tower.".
  Initially Assert established(green_light). Initially Assert leadsTo(green_light, foot).
  Entity marked: fact "". Initially Assert established(marked). Initially Assert leadsTo(marked, tower).
  Initially Assert knows(party, ${told === 'light' ? 'green_light' : 'marked'}).
  ${notice ? 'Objective notice when true "The miller at Hythe wants his sluice cleared.".' : ''}
  Goal false.`;
const job = (id: string, said: string) => `Module ${id} "${said}" {
  Entity party: group "Your company". Place yard "The yard" is room.
  Relation done(group).
  Action finish(actor: group, site: place) "${said}" {
    Requires able(actor) and company(actor) and at(actor, site) and at(actor, yard) and not done(actor).
    On success { Assert done(actor). }
  }
  Objective aim when not done(party) "${said}, in the yard.".
  Goal done(party).
}`;
class Town {
  static async start(told: Told, jobs = ['first', 'second'], notice = true): Promise<Journey> {
    const dir = `larger/${told}${jobs.length}${notice ? 'n' : ''}`;
    const module = (source: string, extra = {}) => JSON.stringify({ version: 1, source, rules: ['world'],
      globals: ['party'], imports: ['party', 'yard'], roles: { party: { type: 'group' }, yard: { type: 'place' } }, ...extra });
    const files: Record<string, string> = {
      [`${dir}/host.kyr`]: `Module host "Hythe and its tower" {\n${host(told, notice)}\n}`,
      [`${dir}/host.json`]: JSON.stringify({ version: 1, source: 'host.kyr', rules: ['world'], globals: ['party'],
        exports: { party: 'party', yard: 'yard' } }),
      [`${dir}/larger.campaign.json`]: JSON.stringify({ version: 1, name: 'The larger place', modules: [
        { id: 'host', bundle: 'host.json' },
        ...jobs.map(j => ({ id: j, bundle: `${j}.json`, imports: { party: 'host.party', yard: 'host.yard' } }))],
      party: [{ name: 'Mira', raceId: 'human', classId: 'warrior' }] }) };
    for (const j of jobs) {
      files[`${dir}/${j}.kyr`] = job(j, `Do the ${j} job`);
      files[`${dir}/${j}.json`] = module(`${j}.kyr`, { experience: 100 });
    }
    const source = new OverlayBundleSource(NodeBundleSource.shared, files);
    const session = await PlaySession.start(source.resolve(`${dir}/larger.campaign.json`), 'larger', source);
    return Journey.of(session, true);
  }
  // A job followed and done, and what the page then offers to pull next (see Succession).
  static async done(j: Journey, id: string) {
    Undertakings.follow(j.campaign, `${id}__aim`);
    const c = j.campaign, before = PlayerView.observe(c), event = await j.session.leg(`${id}__finish(party,host__yard)`);
    const screen = ScreenModel.build(c);
    return Narrator.leaf(c, screen, { event, feedback: ActionFeedbackView.read(c, event, before),
      said: 'finish', moved: false }).glance?.next;
  }
}

describe('what pulls after the town\'s jobs', () => {
  it('offers the next job after one is seen through, and the larger place, known, after two', async () => {
    const j = await Town.start('light');
    const after = await Town.done(j, 'first');
    expect([after?.kind, !!after?.aim, after?.command]).toEqual(['lead', true, undefined]);
    expect(SeenThrough.of(j.campaign).length).toBe(1);
    const next = await Town.done(j, 'second');
    expect(SeenThrough.of(j.campaign).length).toBe(2);
    expect(next).toMatchObject({ kind: 'lead', text: 'A green light burns at night in the lone tower.',
      command: 'travel:host__foot' });
  });
  it('leads with a job still held while only one is seen through', async () => {
    const j = await Town.start('light', ['first']);
    expect(await Town.done(j, 'first')).toMatchObject({ kind: 'lead', aim: 'host__notice' });
  });
  it('offers the nearest site on the map, where no aim is held and nothing known in words leads anywhere', async () => {
    const j = await Town.start('mark', ['first'], false);
    expect(await Town.done(j, 'first')).toMatchObject({ kind: 'lead', text: 'the lone tower',
      command: 'travel:host__tower' });
  });
});
