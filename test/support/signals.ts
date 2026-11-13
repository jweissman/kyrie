import type { Campaign } from '../../src/campaign/campaign';
import { ScreenModel } from '../../src/ui/screen-model';
import { Narrator } from '../../src/presentation/narrator';
import { SceneModel } from '../../src/ui/scene';
import { Attending } from '../../src/ui/attention';
import type { Choice } from '../../src/ui/choice-list';
import { TalkFocus } from '../../web/reader/talk-focus';
import { Emphasis } from '../../src/presentation/emphasis';

// What someone's likeness is drawn for is found again inside: a person drawn blue has a question to ask drawn blue and
// in view, one drawn rose the asking to come along (the owner, 12 November: blue pips with no blue question, a rose
// pip and the recruiting unmarked). Each aspect an opener is led with for, but for what it is about them (worth a
// look, a danger, the aim), names an act within it (Promoted.inside) that the talk draws so, above its fold.
// One check for every bed: a tiny world (test/small/signals.test.ts) and a generated town (test/signal-inside.test.ts).
export class Signals {
  // Each signal that does not resolve, said with why, and how many were checked where the company stands.
  static missed(c: Campaign): { checked: string[]; missed: string[] } {
    const screen = ScreenModel.build(c), g = Narrator.leaf(c, screen).glance;
    const scene = Attending.place(SceneModel.build(screen)), checked: string[] = [], missed: string[] = [];
    for (const a of g?.acts ?? []) {
      const x = scene.subjects.find(y => y.id === a.subject), opener = x?.choices.find(k => k.id === a.choice);
      if (!x || !opener?.children?.length) { continue; }
      const leaves = Attending.all(opener.children).filter(k => k.command);
      for (const aspect of a.aspects.filter(y => !['exploration', 'danger', 'undertaking'].includes(y))) {
        checked.push(`${a.label} ${aspect}`);
        const inside = a.inside?.find(i => i.aspects.includes(aspect));
        const leaf = inside && leaves.find(k => k.command === inside.command);
        const has = (k: Choice) => k.command === leaf?.command || !!k.children?.some(j => j.command === leaf?.command);
        const said = leaves.filter(k => !TalkFocus.services.has(k.does ?? ''));
        const shown = !leaf || TalkFocus.services.has(leaf.does ?? '') || x.kind !== 'person'
          || TalkFocus.of(said, { ...a.for ? { led: a.for } : {}, marked: a.inside?.map(i => i.command), asked: [] })
            .salient.some(has);
        if (!leaf || !shown || !Emphasis.within(g!.acts, leaf).includes(aspect)) {
          missed.push(`${a.label} ${aspect}: ${!leaf ? 'nothing inside' : !shown ? 'under the fold' : 'not drawn'}`);
        }
      }
    }
    return { checked, missed };
  }
}
