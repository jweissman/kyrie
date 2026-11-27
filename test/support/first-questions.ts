import { PlayTool } from '../../src/cli/play-tool';
import type { PlaySession } from '../../src/session/play-session';
import { Attending } from '../../src/ui/attention';
import { SceneModel } from '../../src/ui/scene';
import { ScreenModel } from '../../src/ui/screen-model';
import { TalkFocus } from '../../src/ui/talk-focus';
import { StockOpenings } from '../../src/world/stock-openings';
import { Journey } from '../../src/session/journey';

// The questions a new life is offered by the first people it meets, before it has learnt anything (OR-423, the owner:
// "the player knows too much": the first innkeeper met had offered some seventeen questions about things the
// character had never heard of). A fresh life in a seed's world, begun as creation begins one (its country's
// opening), and everyone in the opening's rooms and the first town, each spoken with where they stand, the company
// put there and nothing done: what can be said to them, as the conversation holds it (TalkFocus.simple), not what is
// had of them for coin or work, nor a fight's.
// grounds: each question's words, and how the company knows enough to ask it where its row says (TopicGrounds).
export interface Asked { who: string; name: string; place: string; questions: string[]; grounds: [string, string?][] }
export class FirstQuestions {
  static readonly trade = /^(buy|haggle|attack|talk_round|face_down)/;
  static async life(seed: string): Promise<PlaySession> {
    const opening = StockOpenings.chosen(seed);
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', seed, '--as', 'human/warrior/Wenna',
      ...opening ? ['--opening', opening] : []]));
    return journey.session;
  }
  // Every peaceable person of the town the life begins by (its places region__s<n>_…), and of its opening's rooms.
  static census(s: PlaySession): Asked[] {
    const c = s.campaign, start = ScreenModel.build(c).place.id;
    const town = /^(region__s\d+)_/.exec(start)?.[1] ?? 'region__s1';
    const people = c.world.related('at').filter(r => r.args[1]!.startsWith(`${town}_`))
      .map(r => ({ who: r.args[0]!, place: r.args[1]! }));
    const places = [...new Set(people.map(p => p.place))], out: Asked[] = [];
    for (const place of places) {
      for (const a of this.at(s, place)) { if (!out.some(o => o.who === a.who)) { out.push(a); } }
    }
    return out;
  }
  // Everyone peaceable at a place (its id in full), the company put there and nothing done, and what can be said to
  // each; the world as it was after.
  static at(s: PlaySession, place: string): Asked[] {
    const c = s.campaign, before = c.world;
    Journey.of(s).put('party', place);
    const scene = SceneModel.build(ScreenModel.build(c));
    // The world put back after: the company was never there, and has been nowhere it was put (OR-370 opens a job to
    // one who has been to its place, and the census had walked the company through the pit on its way to the taproom).
    c.commitWorld(before); c.refreshProjection();
    return scene.subjects.filter(x => x.kind === 'person' && !x.danger).map(subject => {
      const said = TalkFocus.simple(Attending.talk(scene, subject.id)?.replies ?? [])
        .filter(q => !TalkFocus.services.has(q.does ?? '') && !this.trade.test(q.does ?? ''));
      return { who: subject.id, name: subject.name, place, questions: said.map(q => q.label),
        grounds: said.map(q => [q.label, q.note] as [string, string?]) };
    });
  }
}
