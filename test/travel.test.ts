import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { Itineraries } from '../src/ui/itinerary';
import { Travel } from '../src/session/travel';

// The way into adventure (Mission 16's Gate B): the first country's towns tell of the authored country beyond it,
// the notice is up where travellers are kept, and once it is known the way there is known too, over the country's
// roads; going there is one choice, made leg by leg as the page would make it.
describe('the way into Merrowdale', () => {
  it('is told in the town the protagonist comes to, and is one journey along known roads', async () => {
    const w = await WorldAssembler.assemble('wren', NodeBundleSource.shared, { origin: 'wanderer',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    expect(w.report.region.beyond!.north!.name).toBe('Merrowdale');
    const s = await PlaySession.start(w.path, 'wren', w.source);
    const c = s.campaign, names = () => PlayerView.choices(c).map(x => x.choice.name);
    // Every town's keeper of travellers can tell it, named for what it is about.
    const told = c.module.actions.filter(a => a.id.startsWith('region__edge_north_beyond_told_'));
    expect(told.length).toBe(w.report.region.settlements.length);
    await s.perform(PlayerView.choices(c).find(x => /bailey/.test(x.choice.name))!.choice.id);
    await s.perform(PlayerView.choices(c).find(x => /Wooden Wolf/.test(x.choice.name))!.choice.id);
    expect(names()).toContain('Read a notice from Merrowdale');
    expect(Itineraries.destinations(c)).toEqual([]);
    await s.perform(PlayerView.choices(c).find(x => x.choice.name === 'Ask Fargrim about the forty crowns in Merrowdale')!
      .choice.id);
    // Known, the march-stone is somewhere to set out for, by the country's roads.
    const [to] = Itineraries.destinations(c);
    expect([to?.name, to?.legs.map(l => l.way)]).toEqual(['the march-stone of Merrowdale',
      ['the door of the Wooden Wolf', 'the Karavor road', 'the Karavor road', 'the old road north']]);
    const done = await Travel.go({ campaign: c, perform: command => s.perform(command) }, to!.id);
    expect([done.arrived, done.stopped, done.legs.length]).toEqual([true, undefined, 4]);
    expect(c.world.one('at', c.playerActor!)).toBe('region__edge_north');
    // Each leg is an ordinary command in the transcript, so the journey replays as it was made.
    expect(s.transcript.steps.slice(-4).every(step => step.command.startsWith('go('))).toBe(true);
  }, 180000);
  it('reckons night as the dark hours, which stop a journey that runs into them', () => {
    expect([Travel.night(0), Travel.night(6 * 11), Travel.night(6 * 12), Travel.night(6 * 22)])
      .toEqual([false, false, true, false]);
  });
});
