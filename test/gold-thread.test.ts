import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Undertakings } from '../src/presentation/undertakings';
import { ScreenModel } from '../src/ui/screen-model';
import { Narrator } from '../src/presentation/narrator';

// The thread of the gold, followed from the reason the company came (the owner's player report, 12 November: led
// out of a place and back to it, and nothing there to advance the aim). A company that follows its errand and takes
// only the gold sees it through, or comes to a danger the page leads with instead; never a place where the aim is held
// and nothing is gold, and never the same act at the same place three times over.
class Thread {
  static async walk(seed: string, origin: string, most = 30) {
    const s = await DrawnWorld.start(seed, { origin, party: [{ name: 'Ralf', raceId: 'human', classId: 'warrior' }] },
      NodeBundleSource.shared);
    const c = s.campaign, trail: string[] = [], seen = new Map<string, number>();
    Undertakings.follow(c, Undertakings.held(c).find(o => Undertakings.errand(c, o))!.id);
    for (let i = 0; i < most && c.running; i++) {
      const aim = Undertakings.followed(c)?.id;
      if (!aim) { return { end: 'done', trail }; }
      const screen = ScreenModel.build(c), acts = Narrator.leaf(c, screen).glance?.acts ?? [];
      const lead = acts.find(a => a.continues);
      if (!lead) {
        return { end: acts.some(a => ['danger', 'warned', 'dark'].includes(a.why)) ? 'danger' : 'lost', trail };
      }
      const key = `${aim}|${screen.place.id}|${lead.choice}`;
      seen.set(key, (seen.get(key) ?? 0) + 1);
      if (seen.get(key)! > 2) { return { end: 'circle', trail }; }
      trail.push(`${screen.place.id}: ${lead.label}`);
      await s.leg(lead.command?.startsWith('travel:') ? lead.command : lead.for ?? lead.command!);
    }
    return { end: 'going', trail };
  }
}
describe('the gold\'s thread', () => {
  it('sees a found thing taken up, where it was found: the dead man\'s box, a sister\'s pin', async () => {
    for (const origin of ['map', 'lost']) {
      const walked = await Thread.walk('kahitude', origin);
      expect([origin, walked.end]).toEqual([origin, 'done']);
      expect(walked.trail.at(-1)).toMatch(/box|pin/);
    }
  }, 240000);
  it('leads to the one who has the aim\'s next step, and to what they ask: the fever nursed', async () => {
    expect((await Thread.walk('kahitude', 'herbs')).end).toBe('done');
  }, 120000);
  it('goes on into the site the aim names, and does not ask the same door over and over', async () => {
    expect(['danger', 'done', 'going']).toContain((await Thread.walk('kahitude', 'order')).end);
    expect((await Thread.walk('a1', 'order')).end).not.toBe('circle');
  }, 240000);
  it('takes what would pay the debt, and leads home with it from inside the place it was found', async () => {
    const walked = await Thread.walk('a1', 'debt');
    expect(walked.trail.some(t => /_gate: Set out for/.test(t))).toBe(true);
  }, 180000);
});
