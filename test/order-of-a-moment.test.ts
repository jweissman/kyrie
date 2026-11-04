import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';

class Moment {
  static choose(s: PlaySession, label: string) {
    return s.perform(PlayerView.choices(s.campaign).find(c => c.choice.name === label)!.choice.id);
  }
  static measure(s: PlaySession, name: string): number {
    return s.campaign.world.number(ModuleWriter.call(`p__${name}`, 'party'));
  }
}

// The order of a moment, as the guide states it (Quittance's friction 22, QTC-22): an action's changes are made and
// its Result told as it is begun, so a rule on them fires in the first watch of its three hours; talk takes no time;
// and a measure that keeps the watch it rose in rises once a watch, however many words are said in it.
describe('the order of a moment', () => {
  it('makes a timed action\'s changes as it begins, takes no time for talk, and rises a stamped measure once a watch',
    async () => {
      const source = new OverlayBundleSource(NodeBundleSource.shared, {
        'om/site.kyr': `Module om "Order" { Place field "Field" is wilderness.
          Place yard "the yard" is room within field at 0, 0. Company party "You" of 1 at yard.
          Relation sawn(group). Measure heat(group). Measure heatAt(group). Measure said(group).
          Person tom "Tom" at yard { Peaceable. }
          Topic weather with tom "Ask Tom about the weather" when true { Says "'Wet,' says Tom.". }
          Action saw(actor: group, site: place) "Saw the log" { Requires at(actor, site) and not sawn(actor).
            Time 3 hours. On success { Assert sawn(actor). } Result "You begin at {watch(clock) as time}.". }
          Rule seen when sawn(party) once says "The log is sawn at {watch(clock) as time}." { }
          Rule warms when heatAt(party) < watch(clock) { Increase heat(party) by 1. Set heatAt(party) to watch(clock). }
          Rule counts when true { Increase said(party) by 1. } }`,
        'om/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'],
          exports: { party: 'party' } }),
        'om.campaign.json': JSON.stringify({ version: 1, name: 'om', modules: [{ id: 'p', bundle: 'om/module.json' }],
          party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }) });
      const s = await PlaySession.start(source.resolve('om.campaign.json'), 'om', source);
      const [heat, said] = [Moment.measure(s, 'heat'), Moment.measure(s, 'said')];
      const talk = await Moment.choose(s, 'Ask Tom about the weather');
      await Moment.choose(s, 'Ask Tom about the weather');
      expect([talk.elapsed, Moment.measure(s, 'heat') - heat, Moment.measure(s, 'said') - said]).toEqual([0, 0, 2]);
      const sawing = await Moment.choose(s, 'Saw the log');
      expect([sawing.elapsed, sawing.response, sawing.perceptions?.map(p => p.text)])
        .toEqual([18, 'You begin at 8:00 a.m.', ['The log is sawn at 8:10 a.m.']]);
      expect(Moment.measure(s, 'heat') - heat).toBe(18);
    }, 60000);
});
