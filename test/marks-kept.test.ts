import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Journey } from '../src/session/journey';
import { Attending } from '../src/ui/attention';
import { SceneModel } from '../src/ui/scene';
import { TalkFocus } from '../web/reader/talk-focus';
import { Glanced } from './support/glanced';

// A mark keeps its promise (the owner's play of 10 November): a likeness marked green as having something for the
// company had nothing in its talk that answered it, and one search for a sister stood in the notes as two quests for
// one place, neither saying what the other was to it.
describe('a mark on the page', () => {
  it('marked green as having something for you, leads its talk with the reply that pays, marked', async () => {
    const j = Journey.of(await DrawnWorld.start('kite', { origin: 'kin',
      party: [{ name: 'Ralf', raceId: 'human', classId: 'warrior' }] }, NodeBundleSource.shared));
    await j.play('Put your shoulder');
    const screen = Glanced.of(j.session).screen, wagoner = screen.people.find(p => /wagoner/i.test(p.name))!;
    expect(wagoner.owed).toBe(true);
    const talk = Attending.talk(SceneModel.build(screen), wagoner.id)!;
    const first = TalkFocus.of(talk.replies, { asked: [], paying: screen.paying }).salient[0]!;
    expect(TalkFocus.pays(first, screen.paying)).toBe(true);
  }, 120000);
  it('tells one search for one place, with what is known of the place under it', async () => {
    const j = Journey.of(await DrawnWorld.start('kahitude', { origin: 'lost',
      party: [{ name: 'Ralf', raceId: 'human', classId: 'warrior' }] }, NodeBundleSource.shared));
    const aims = Glanced.of(j.session).screen.aims ?? [];
    const sister = aims.find(a => /sister/.test(a.text))!;
    expect(aims.filter(a => /the silver ford/.test(a.text)).map(a => a.id)).toEqual([sister.id]);
    expect(sister.about?.join(' ')).toMatch(/strongroom/);
  }, 120000);
});
