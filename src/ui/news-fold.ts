import type { Act } from './screen-types';
import { ChoiceIds } from './choice-ids';
import type { World } from '../lang/world';

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
  // Folded wherever they stand among what is said to someone, under their Talk as at its top (int-mat5's CI: at
  // Brockminster the innkeeper's twenty-five were under his Talk, unfolded, and stood before every other question).
  // It tells first the land the company has reason to ask about (the owner's ruling, 20 November: CL-67's fold kept),
  // a notice of it read or its name heard (anything the company knows of that land: knows(party, <land>_…), the
  // notice's discovery among it), and says so, in that land's own words ("Ask Ulric about the Trial of the Wheel at
  // Pentrice") where it is the one; else the next not yet heard, in the order written.
  private static lands(acts: Act[], known?: Set<string>): void {
    const far = acts.filter(a => /_beyond_told_/.test(a.command ?? '') && !a.children);
    if (far.length >= 2) {
      const reasons = far.filter(a => NewsFold.reason(a.command!, known)), next = reasons[0] ?? far[0]!;
      const label = reasons.length === 1 ? next.label : this.beyond;
      acts.splice(0, acts.length, ...acts.filter(a => !far.includes(a)), { ...next, key: `${acts.length}:beyond`,
        label, folds: true, alone: reasons.length === 1 ? next.alone ?? next.label : this.beyond });
    }
    for (const a of acts) { if (a.children) { NewsFold.lands(a.children, known); } }
  }
  // Whether the company knows anything of the land a telling is of (<land>_beyond_told_<town>: <land>_notice read).
  private static reason(command: string, known?: Set<string>): boolean {
    const land = command.replace(/_beyond_told_.*$/, '_');
    return !!known && [...known].some(k => k.startsWith(land));
  }
  // What the company knows (knows(party, …)), for the lands it has reason to ask about first.
  static known(world?: World): Set<string> | undefined {
    return world?.relates('knows') ? new Set(world.related('knows').filter(f => f.args[0] === 'party')
      .map(f => f.args[1]!)) : undefined;
  }
  // The one telling of the lands beyond someone has left to give, wherever it stands among what is said to them (their
  // Talk's own or at its top), and the list it stands in.
  private static far(acts: Act[]): { act: Act; in: Act[] } | undefined {
    const here = acts.find(a => /_beyond_told_/.test(a.command ?? '') && !a.children);
    return here ? { act: here, in: acts }
      : acts.flatMap(a => a.children ? [NewsFold.far(a.children)] : []).find(x => !!x);
  }
  // Word of a placed story, spread to the towns about it (ScenarioWord, KitWord: ask(informant, word…)).
  static hearsay(command: string): boolean { return /^ask\([^,]+,word\w*__/.test(command); }
  // known: what the company knows, for the lands it has reason to ask about first.
  // What someone has heard of far places is one question in all (CL-67: at the Stone Horn the word of this country and
  // the news of the lands beyond had stood as two, and the word as six where a client read the offer's rows): the word
  // of this country first, a thing sampled from it, then the lands beyond; but a land the company has reason to ask
  // about before either, in its own words.
  static of(targets: Map<string, Act[]>, names: { get(id: string): string | undefined }, known?: Set<string>) {
    for (const [who, acts] of targets) {
      NewsFold.lands(acts, known);
      const all = acts.filter(a => a.does === 'ask' && a.command && !a.children), far = NewsFold.far(acts);
      // Hearsay is asked for as news, however little of it someone has: its matter, by name, is what the company has
      // not yet heard of (the owner's playtest, 25 November: the first town's character "knows too much", asking a
      // priest at once about "the silk from the sink at a cave in the hillside west of Oakhythe").
      const asks = all.length >= this.most || (all.length && far) ? all : all.filter(a => NewsFold.hearsay(a.command!));
      if (!asks.length) { continue; }
      const reason = !!far && NewsFold.reason(far.act.command!, known), own = reason && far.act.label !== this.beyond;
      const pick = reason ? far.act : asks.length
        ? asks[[...who].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % asks.length]! : far!.act;
      const label = own ? far.act.label : `Ask ${(names.get(who) ?? who).split(', ')[0]} for news`;
      if (far) { far.in.splice(far.in.indexOf(far.act), 1); }
      const kept = acts.filter(a => !asks.includes(a));
      targets.set(who, [...kept, { ...pick, key: ChoiceIds.key(kept, label), label, folds: true,
        alone: own ? far.act.alone ?? label : label, about: 'They tell you what they have heard lately.' }]);
    }
  }
}
