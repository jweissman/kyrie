import type { Screen } from '../ui/screen-types';

// The aim as a client says it at rest, one rule for the page and the terminal: the aim followed, said as followed;
// with none followed, the company's own errand (or the first aim held), offered to follow by its title, and never
// followed for the player (the owner, 12 November: gold comes only with Follow this); else what the glance says of
// it. Not before anything is done if it is the followed one (the opening has just told it).
export interface Said { text: string; followed: boolean; offered?: string }
export class AimSaid {
  static of(screen: Screen, glanced?: string): Said | undefined {
    const followed = screen.elapsed ? screen.aims?.find(a => a.followed)?.text : undefined;
    const held = screen.aims?.some(a => a.followed);
    const offered = held ? undefined : screen.aims?.find(a => a.own) ?? screen.aims?.[0];
    if (followed) { return { text: followed, followed: true }; }
    if (offered) { return { text: this.title(offered.text), followed: false, offered: offered.id }; }
    return glanced ? { text: glanced, followed: false } : undefined;
  }
  // An aim by its first clause, as a title: what the aim is, before what it says of it.
  static title(aim: string): string {
    return /^[^,;:.!?]+/.exec(aim)?.[0]?.trim() ?? aim;
  }
  // An aim as a row's words: its title, cut where a clause joins before the row would cut it mid-word (M22's second
  // review, OR-45: "Follow: Your father went out by the road between Mistshaw and …").
  // An aim that says what to do and, last, for whom or what ("Look along the road between Mistshaw and Millholm for
  // your father") is said by those two, its way between left to the aim itself ("Look for your father"): cut at the
  // first joint it had read as following a road (the owner, 17 November, OR-72).
  static short(aim: string, room = AimSaid.room): string {
    const title = AimSaid.title(aim);
    if (title.length <= room) { return title; }
    const sought = / for ((?:your|his|her|their|the|a|an) [^,;]+)$/.exec(title);
    // Only where it begins with what to do: an aim that says how things stand ("The toll-boy is in the lockup for a
    // toll he says he paid") had read "The for a toll he says he paid" (the atlas census, AT-01).
    const verb = title.split(' ')[0]!, told = AimSaid.stating.test(verb);
    if (sought && !told && `${verb} for ${sought[1]}`.length <= room) { return `${verb} for ${sought[1]}`; }
    const joints = [...title.matchAll(AimSaid.joints)]
      .map(m => m.index!).filter(i => i >= 12 && i <= room);
    return joints.length ? title.slice(0, joints.at(-1)) : title;
  }
  static readonly room = 40;
  static readonly stating = /^(?:the|a|an|your|his|her|their|our|my|this|that|these|those|someone|something)$/i;
  // Where a clause joins: a preposition, or a question's word ("Ask at the customs-house how many head …").
  static readonly joints =
    / (?:between|with|by|from|to|and|for|at|in|on|under|over|past|toward|how|what|who|where|whether|why) /g;
}
