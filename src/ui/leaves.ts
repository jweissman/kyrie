import type { Why } from '../presentation/glance-types';
import { Aspects } from '../presentation/aspects';
import { Attending } from './attention';
import type { Choice } from './choice-list';
import type { Reading } from './affordances';
import type { Candidate } from './promotion';
import type { SceneSubject } from './scene';

// The act within an opener that each of its reasons is for (Candidate.leaves; the opportunity architecture, AT-07
// §4 I2): a reason that lights an opener names the act inside that bears it, so that what the opener is drawn as is
// found again on a row under it (AT-05, AT-06: the cart in the ditch and the corn-store padlock lit worth a look,
// every act inside them plain). These are the reasons Affordances had left with no act of their own.
export class Leaves {
  // The place's own act, not done yet (not a topic: what is asked of someone is theirs).
  static owned(choices: Choice[], r: Reading): Choice | undefined {
    return choices.find(c => c.command && (c.own || r.authored.has(c.command)) && !r.speakers.has(c.command)
      && !r.done.has(c.command));
  }
  static own(choices: Choice[], r: Reading): Candidate['leaves'] {
    const c = this.owned(choices, r);
    return c?.command ? { own: c.command } : {};
  }
  // A sign seen in them is had by looking closer, or by what is led with them (making much of the grey dog), or by
  // the first thing to do with them, where the opener has no command of its own.
  static sign(s: SceneSubject, at: { opener?: string; looked?: Choice; leaves: Choice[]; r: Reading }):
    Candidate['leaves'] {
    const by = at.looked?.command ?? at.opener ?? at.leaves[0]?.command;
    return at.r.signs.has(s.id) && by ? { sign: by } : {};
  }
  // A look at a way barred is an opener of the tries at it: what it is led for (a way not taken, the first try) is had
  // by the first of them that can be done safely. Never a guess that cannot be undone or a risk: at Mistlake's speaking
  // door, its safe tries spent, the aim's way on had been laid on "Press the word “Shadow”", which lost its grave mark
  // to the look's and was drawn as the aim's (test/speaking-door-business). Nor a try done already: at Redkeep's
  // speaking door the gold had stayed on "Push and pull at it", pushed, and pushed again (the gold-follower's walk
  // stopped there, 24 November): its safe tries spent, the look at it is the step and nothing inside it is gold.
  static tries(c: Choice, whys: Why[], r: Pick<Reading, 'done'>): { leaves?: Candidate['leaves'] } {
    const first = c.command ? undefined : Attending.all(c.children ?? [])
      .find(k => k.command && !k.disabled && !k.grave && !k.risk && !r.done.has(k.command))?.command;
    return first ? { leaves: Object.fromEntries(whys.filter(w => Aspects.by[w]).map(w => [w, first])) } : {};
  }
}
