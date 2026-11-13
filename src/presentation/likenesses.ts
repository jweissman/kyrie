import type { Aspect, Glance, Likeness } from './glance-types';

// What each likeness here is to the company, said once by the engine for the page to draw as it is (M21's PL-32): the
// aspects of what the glance leads with about them, together; and where one of them is the followed aim's next step,
// the undertaking alone, so that its one indicator is gold. The page had aggregated every aspect into a ring through
// their tones, and Lindal, the sealed letter's next step, whose talk also teaches, had been drawn a pip that read blue.
// What is scene-level and not an opportunity (a debt owed them, a danger seen) the page adds as before.
export class Likenesses {
  static of(acts: Glance['acts']): Record<string, Likeness> {
    const out: Record<string, Likeness> = {};
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
  static with<T extends Pick<Glance, 'acts'>>(glance: T): T & Pick<Glance, 'likenesses'> {
    return { ...glance, likenesses: this.of(glance.acts) };
  }
}
