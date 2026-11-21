import type { Act } from './screen-types';
import { ChoiceIds } from './choice-ids';

// Someone who has heard a good deal is asked once, for news (the owner, 15 November: "I shouldn't open a topic to
// find 30 rumors beneath it. Just sample one and have a 'Heard any news?' question"). Hearsay is the shared ask:
// one act for each thing a person could be asked after, and Mistshaw's innkeeper had fourteen. The many stand as
// one, which tells one of them sampled, and the next when that is heard. A person with only a few keeps them, as an
// authored adventure's asks are.
export class NewsFold {
  static readonly most = 3;
  // What is told of the countries beyond this one (twenty and more at an inn) is one question too, "what news is
  // there?": the next of them not yet heard, in the order they are written, each heard known as a fact of the world
  // (knows(actor, the discovery), which takes its ask off the offer), so every client asks the same next one (MT-18:
  // the page's talk drawer had folded them by its own memory of what was asked, TalkFocus.beyond, and the engine's rows
  // and the page's menu had offered each by name).
  static readonly beyond = 'Ask what news there is of the lands beyond';
  static of(targets: Map<string, Act[]>, names: { get(id: string): string | undefined }) {
    for (const [who, acts] of targets) {
      const far = acts.filter(a => /_beyond_told_/.test(a.command ?? '') && !a.children);
      if (far.length >= 2) {
        acts.splice(0, acts.length, ...acts.filter(a => !far.includes(a)), { ...far[0]!, key: `${acts.length}:beyond`,
          label: this.beyond, alone: this.beyond });
      }
      const asks = acts.filter(a => a.does === 'ask' && a.command && !a.children);
      if (asks.length < this.most) { continue; }
      const pick = asks[[...who].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % asks.length]!;
      const label = `Ask ${(names.get(who) ?? who).split(', ')[0]} for news`;
      const kept = acts.filter(a => !asks.includes(a));
      targets.set(who, [...kept, { ...pick, key: ChoiceIds.key(kept, label), label,
        alone: label, about: 'They tell you what they have heard lately.' }]);
    }
  }
}
