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
  static short(aim: string, room = AimSaid.room): string {
    const title = AimSaid.title(aim);
    if (title.length <= room) { return title; }
    const joints = [...title.matchAll(/ (?:between|with|by|from|to|and|for|at|in|on|under|over|past|toward) /g)]
      .map(m => m.index!).filter(i => i >= 12 && i <= room);
    return joints.length ? title.slice(0, joints.at(-1)) : title;
  }
  static readonly room = 40;
}
