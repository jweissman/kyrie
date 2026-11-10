import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import { Journey } from '../src/session/journey';
import { PlayerView } from '../src/presentation/player-view';

// A journey's time passes on the way, not at the far end. The company sets out at once; whoever is where it is going
// meets it as it arrives, for the journey's last watch; and a way that stops being open while the company is on it
// sends the company back where it set out.
class Ford {
  static readonly campaign = 'test/fixtures/ford-road/campaign.json';
  static start() { return PlaySession.start(this.campaign, 'ford', NodeBundleSource.shared); }
  static at(s: PlaySession) {
    return s.campaign.world.snapshot.relations.find(r => r.name === 'at' && r.args[0] === 'party')?.args[1];
  }
  static holds(s: PlaySession, name: string, ...args: string[]) {
    return s.campaign.world.test(ModuleWriter.call(name, ...args));
  }
  static said(event: { perceptions?: { text: string }[]; response?: string }) {
    return [...(event.perceptions ?? []).map(p => p.text), event.response ?? ''].join(' ');
  }
}

describe('journeys', () => {
  it('spends a journey on the way, and arrives for its last watch', async () => {
    const s = await Ford.start();
    await s.leg('go(world__road,world__ford)');
    expect([Ford.at(s), s.campaign.state.elapsed]).toEqual(['world__ford', 6]);
    // A rule watching the road saw the company on it.
    expect(Ford.holds(s, 'world__seenOnRoad', 'party')).toBe(true);
    expect(Ford.holds(s, 'enRoute', 'party', 'world__road')).toBe(false);
  });
  it('meets the company with whoever keeps the far end, and leaves it time to answer', async () => {
    const s = await Ford.start();
    const arrival = await s.leg('go(world__road,world__ford)');
    // The wolf warns as the company comes, and does not fall on it: an hour on the road is not an hour at the ford.
    expect(Ford.said(arrival)).toContain('hackles high');
    expect(arrival.combat).toEqual([]);
    const away = await s.leg('go(world__road,world__green)');
    expect([Ford.at(s), away.combat]).toEqual(['world__green', []]);
  });
  it('lets a savage creature fall on the company as it arrives', async () => {
    const s = await Ford.start();
    const arrival = await s.leg('go(world__lane,world__copse)');
    expect(arrival.combat.some(e => e.type === 'end')).toBe(true);
    expect(Ford.said(arrival.prelude ?? {})).toContain('out of the hazel');
  });
  it('gives a creature the place gave no words the plain words of its temperament', async () => {
    const s = await Ford.start();
    const arrival = await s.leg('go(world__brake,world__thicket)');
    expect(Ford.said(arrival)).toContain('An owlbear stands its ground and watches you.');
    expect(arrival.combat).toEqual([]);
    const stayed = await s.leg('wait_hour');
    expect(stayed.combat.some(e => e.type === 'end')).toBe(true);
    expect(Ford.said(stayed.prelude ?? {})).toContain('An owlbear comes at you.');
  });
  it('turns the company back when the way closes under it', async () => {
    const s = await Ford.start();
    await s.leg('go(world__road,world__ford)');
    const crossing = await s.leg('go(world__causeway,world__mill)');
    expect([Ford.at(s), s.campaign.state.elapsed, crossing.result]).toEqual(['world__ford', 9, 'failure']);
    expect(crossing.response).toBe('The way is no longer open. You turn back to the ford.');
  });
  // The Road the Star Came Down's B1: a twelve-hour climb with ice on its links, risked, always turned back, because
  // the way was judged by the ice the risk itself was breaking.
  it('keeps a company that risked what lies on a long way going, to the far end', async () => {
    const s = await PlaySession.start('test/fixtures/probes/long-risk/probe.campaign.json', 'risk', NodeBundleSource.shared);
    const climb = await s.leg(Journey.of(s).find('risk ice on the links')!.command);
    expect(climb.response ?? '').not.toContain('no longer open');
    expect([Ford.at(s), s.campaign.state.elapsed, climb.result]).toEqual(['p__ledge', 72, 'success']);
    expect(Ford.holds(s, 'state', 'p__ice', 'p__broken')).toBe(true);
  });
  // Fair Weather's 2 and 3 (FWR-02, FWR-03): the sea covering the sands while the company was half across them sent it
  // back onto the flooding sand; and a way whose wind always gusts, risked, is crossed and not turned back.
  it('keeps a way open under whoever is crossing it, and lets a way always dangerous be risked', async () => {
    const s = await PlaySession.start('test/fixtures/probes/crossing/probe.campaign.json', 'cross', NodeBundleSource.shared);
    const choice = (name: RegExp) => PlayerView.choices(s.campaign).find(c => name.test(c.choice.name))!.choice.id;
    const over = await s.leg(choice(/^Take the sands/));
    expect([Ford.at(s), over.result, Ford.holds(s, 'unopened', 'p__sands')]).toEqual(['p__holm', 'success', true]);
    const t = await PlaySession.start('test/fixtures/probes/crossing/probe.campaign.json', 'edge', NodeBundleSource.shared);
    const risk = PlayerView.choices(t.campaign).find(c => /^Risk the wind/.test(c.choice.name))!;
    const edge = await t.perform(risk.choice.id);
    expect([Ford.at(t), edge.result, Ford.holds(t, 'state', 'p__wind', 'p__gusting')]).toEqual(['p__pulpit', 'success', true]);
  });
});
