import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ScreenModel } from '../src/ui/screen-model';
import { Narrator } from '../src/presentation/narrator';
import { SceneModel } from '../src/ui/scene';
import { Attending } from '../src/ui/attention';
import type { Choice } from '../src/ui/choice-list';
import type { PlaySession } from '../src/session/play-session';
import { TalkFocus } from '../web/reader/talk-focus';
import { Emphasis } from '../web/reader/emphasis';
import { GeneratedWorld } from './support/generated';

// What someone's likeness is drawn for is found again inside: a person drawn blue has a question to ask drawn blue and
// in view, one drawn rose the asking to come along (the owner, 12 November: blue pips with no blue question, a rose
// pip and the recruiting unmarked). Each aspect an opener is led with for, but for what it is about them (worth a
// look, a danger, the aim), names an act within it (Promoted.inside) that the talk draws so, above its fold.
describe('a signal and what it is for', () => {
  let checked = 0;
  const missed = (s: PlaySession): string[] => {
    const c = s.campaign, screen = ScreenModel.build(c), g = Narrator.leaf(c, screen).glance;
    const scene = Attending.place(SceneModel.build(screen)), out: string[] = [];
    for (const a of g?.acts ?? []) {
      const x = scene.subjects.find(y => y.id === a.subject), opener = x?.choices.find(k => k.id === a.choice);
      if (!x || !opener?.children?.length) { continue; }
      const leaves = Attending.all(opener.children).filter(k => k.command);
      for (const aspect of a.aspects.filter(y => !['exploration', 'danger', 'undertaking'].includes(y))) {
        checked++;
        const inside = a.inside?.find(i => i.aspects.includes(aspect));
        const leaf = inside && leaves.find(k => k.command === inside.command);
        const has = (k: Choice) => k.command === leaf?.command || !!k.children?.some(j => j.command === leaf?.command);
        const said = leaves.filter(k => !TalkFocus.services.has(k.does ?? ''));
        const shown = !leaf || TalkFocus.services.has(leaf.does ?? '') || x.kind !== 'person'
          || TalkFocus.of(said, { ...a.for ? { led: a.for } : {}, marked: a.inside?.map(i => i.command), asked: [] })
            .salient.some(has);
        if (!leaf || !shown || !Emphasis.within(g!.acts, leaf).includes(aspect)) {
          out.push(`${a.label} ${aspect}: ${!leaf ? 'nothing inside' : !shown ? 'under the fold' : 'not drawn'}`);
        }
      }
    }
    return out;
  };
  for (const origin of ['debt', 'kin']) {
    it(`holds about the first town, come to by the ${origin} origin`, async () => {
      const s = await DrawnWorld.start('kahitude', { origin, party: [{ name: 'X', raceId: 'human', classId: 'warrior' }] },
        NodeBundleSource.shared);
      // The town's places, a way at a time from where the company starts, eight of them.
      const found: string[] = [], seen = [s.campaign.world.one('at', 'party')!];
      for (let i = 0; i < seen.length && i < 8; i++) {
        await GeneratedWorld.travel(s, seen[i]!);
        found.push(...missed(s));
        const screen = ScreenModel.build(s.campaign);
        if (screen.place.kind === 'region' || screen.place.underground) { continue; }
        seen.push(...screen.exits.filter(e => e.local && !e.blocked && !seen.includes(e.destination.id))
          .map(e => e.destination.id));
      }
      expect(seen.length).toBeGreaterThan(4);
      expect(found).toEqual([]);
      expect(checked).toBeGreaterThan(0);
    }, 240000);
  }
});
