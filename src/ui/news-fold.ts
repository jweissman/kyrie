import type { Act } from './screen-types';

// Someone who has heard a good deal is asked once, for news (the owner, 15 November: "I shouldn't open a topic to
// find 30 rumors beneath it. Just sample one and have a 'Heard any news?' question"). Hearsay is the shared ask:
// one act for each thing a person could be asked after, and Mistshaw's innkeeper had fourteen. The many stand as
// one, which tells one of them sampled, and the next when that is heard. A person with only a few keeps them, as an
// authored adventure's asks are.
export class NewsFold {
  static readonly most = 3;
  static of(targets: Map<string, Act[]>, names: { get(id: string): string | undefined }) {
    for (const [who, acts] of targets) {
      const asks = acts.filter(a => a.does === 'ask' && a.command && !a.children);
      if (asks.length < this.most) { continue; }
      const pick = asks[[...who].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % asks.length]!;
      const label = `Ask ${(names.get(who) ?? who).split(', ')[0]} for news`;
      targets.set(who, [...acts.filter(a => !asks.includes(a)), { ...pick, key: `${acts.length}:news`, label,
        alone: label, about: 'They tell you what they have heard lately.' }]);
    }
  }
}
