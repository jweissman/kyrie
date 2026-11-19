import { Attest } from '../../src/presentation/attest';
import { Doable } from '../../src/presentation/doable';
import { Emphasis } from '../../src/presentation/emphasis';
import type { Aspect, Glance } from '../../src/presentation/glance-types';
import { Attending } from '../../src/ui/attention';
import type { Choice } from '../../src/ui/choice-list';
import { SceneModel } from '../../src/ui/scene';
import type { Screen } from '../../src/ui/screen-types';

// What a container promises is borne by something inside it (the opportunity architecture, AT-07 §5 step 1; AT-05,
// AT-06): an opener led with is drawn in the aspects of its reasons, and each of them must be the witness of an act
// within it, or the player opens it and finds nothing of what it said. Likewise a likeness and the rows of its
// subject. And every row any client draws has words, and something it does, opens, or says it cannot (I3).
export class SupportCheck {
  // The aspects a container is drawn in: gold only for the step itself; a companion's icon besides.
  private static drawn(as: readonly Aspect[], gilded: boolean): Aspect[] {
    const out = [...Emphasis.drawn(as, gilded), ...as.includes('companionship') ? ['companionship' as const] : []];
    return out.filter((a, i) => out.indexOf(a) === i);
  }
  private static tree(screen: Screen): Map<string, Choice> {
    const scene = Attending.place(SceneModel.build(screen)), tree = new Map<string, Choice>();
    for (const c of Attending.all([...scene.subjects.flatMap(s => s.choices), ...scene.near, ...scene.far,
      ...scene.you])) { tree.set(c.id, c); }
    return tree;
  }
  private static borne(g: Glance, choices: Choice[]): Set<Aspect> {
    return new Set(Attending.all(choices).flatMap(k => Attest.within(g, k)).flatMap(w => w.aspects));
  }
  // P1: each led opener's drawn aspects, borne by a descendant's witness.
  static openers(g: Glance, screen: Screen): string[] {
    const tree = this.tree(screen), out: string[] = [];
    for (const a of [...g.acts, ...Object.values(g.lenses ?? {}).flatMap(l => l.promoted)]) {
      const c = tree.get(a.choice);
      if (!c || c.command || !c.children?.length) { continue; }
      const borne = this.borne(g, c.children);
      const missing = this.drawn(a.aspects, !!a.continues).filter(x => !borne.has(x));
      if (missing.length) { out.push(`${a.choice} (${a.why}): ${missing.join(', ')}`); }
    }
    return [...new Set(out)];
  }
  // P2: a likeness's aspects (danger aside, which is the subject's own), borne by a row of that subject.
  static likenesses(g: Glance, screen: Screen): string[] {
    const scene = SceneModel.build(screen);
    return Object.entries(g.likenesses ?? {}).flatMap(([who, l]) => {
      const borne = this.borne(g, scene.subjects.find(x => x.id === who)?.choices ?? []);
      const missing = this.drawn(l.aspects, !!l.continues).filter(x => x !== 'danger' && !borne.has(x));
      return missing.length ? [`${who}: ${missing.join(', ')}`] : [];
    });
  }
  // P3: every row of every client: words, and a command, rows to open, or why it cannot be done (Doable.made refuses
  // any other, so this holds by construction).
  static rows(g: Glance, screen: Screen): string[] {
    return Doable.flat(Doable.of(g, screen)).flatMap(r => [
      ...r.label.trim() ? [] : [`${r.id}: no words`],
      ...r.does || r.opens?.length || r.shut ? [] : [`${r.id}: does nothing, opens nothing, says nothing`]]);
  }
}
