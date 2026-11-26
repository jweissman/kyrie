import type { Aspect, Glance, Likeness } from './glance-types';
import type { Screen } from '../ui/screen-types';
import { SceneModel, type Scene } from '../ui/scene';
import type { Choice } from '../ui/choice-list';
import { Attest, type Projected } from './attest';

// What each likeness here is to the company, said once by the engine for the page to draw as it is (M21's PL-32): the
// aspects of what the glance leads with about them, together; and where one of them is the followed aim's next step,
// the undertaking alone, so that its one indicator is gold. The page had aggregated every aspect into a ring through
// their tones, and Lindal, the sealed letter's next step, whose talk also teaches, had been drawn a pip that read blue.
// And a danger seen in them, which the page had added by its own reading (the owner's trust contracts, 18 November: an
// indicator only of the engine's witnesses): a subject the scene reckons a threat (SceneModel.threat). A debt owed
// them is a payoff the glance leads with already (Owed, OR-76).
// And what their talk's drawer draws: each reply's own witnesses (Attest.reply, the drawer's one reading of a reply),
// so that the likeness and the rows its drawer shows agree both ways (OR-201; AGENTS.md: marks derive from the rows
// their drawer shows). A likeness had been only what the glance led with, and someone with a reply that teaches, not
// led with, had been plain over a drawer of blue questions (the warrior's walk: the Guldríce agent, the surveyor's
// son, Kynes, Carlin, Holgar, every turn).
export class Likenesses {
  static of(acts: Glance['acts'], threats: readonly string[] = []): Record<string, Likeness> {
    const out: Record<string, Likeness> = {};
    for (const who of threats) { out[who] = { aspects: ['danger'] }; }
    for (const a of acts) {
      if (!a.subject) { continue; }
      const was = out[a.subject];
      if (was?.continues) { continue; }
      if (a.continues) { out[a.subject] = { aspects: ['undertaking'], continues: true }; continue; }
      const aspects = [...was?.aspects ?? [], ...a.aspects].filter((x, i, all): x is Aspect => all.indexOf(x) === i);
      out[a.subject] = { aspects };
    }
    return out;
  }
  // The glance with them: on every glance drawn, and again wherever its acts are changed (Glance.held).
  static with<T extends Pick<Glance, 'acts'>>(glance: T, screen: Screen): T & Pick<Glance, 'likenesses'> {
    const scene = SceneModel.build(screen), threats = scene.subjects.filter(SceneModel.threat).map(x => x.id);
    return { ...glance, likenesses: this.drawn(this.of(glance.acts, threats), glance, { scene, screen }) };
  }
  // Each person's likeness with the aspects of what their drawer draws added (see above); one whose likeness is the
  // followed aim's next step keeps the undertaking first, so its one indicator is gold (Indicator's precedence), what
  // else its drawer holds said beside it.
  private static drawn(out: Record<string, Likeness>, g: Projected, at: { scene: Scene; screen: Screen }):
    Record<string, Likeness> {
    for (const sub of at.scene.subjects.filter(x => x.kind === 'person' || x.kind === 'companion')) {
      const was = out[sub.id];
      const aspects = [...was?.aspects ?? [], ...this.replies(sub.choices)
        .flatMap(c => Attest.reply(g, c, at.screen.paying ?? []).flatMap(w => w.aspects))]
        .filter((x, i, all): x is Aspect => all.indexOf(x) === i);
      if (aspects.length) { out[sub.id] = { aspects, ...was?.continues ? { continues: true } : {} }; }
    }
    return out;
  }
  // The rows a drawer draws of a talk's replies, as the drawer reads them (Attending.talk's replies, TalkStage.leaves):
  // each of their choices but the turning to them and the taking of leave, or what it opens; never one asked again
  // (_again), which the drawer draws spent.
  private static replies(choices: Choice[]): Choice[] {
    return choices.filter(c => c.does !== 'talk_to' && c.does !== 'take_leave')
      .flatMap(c => c.children?.length && !c.command ? this.leaves(c.children) : [c])
      .filter(c => !/_again(\(|$)/.test(c.command ?? ''));
  }
  private static leaves(choices: Choice[]): Choice[] {
    return choices.flatMap(c => c.children?.length ? this.leaves(c.children) : [c]);
  }
}
