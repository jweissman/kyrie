import { Journey } from '../../src/session/journey';
import { DangerSense } from '../../src/presentation/danger-sense';
import type { PlaySession } from '../../src/session/play-session';
import type { Fighter } from '../../src/model';

// The careful company of the five expeditions (OR-1860): what a player who reads the page does with what it says of a
// danger, by the same reckoning the page shows (DangerSense, the fight's mark), never by what the world holds unseen.
// The reference seeds had lost a company on every life by lingering where it was told it could die: on s0's fourth
// trip the mouther was said coming along the passage, then stood in the fissure, reckoned more than the company could
// take, and the company went on into the great cave, where it followed, and gathered coins under it (it fell on them
// as they did); on s4's first, the cave spiders were seen waiting in the air shaft and the coins there gathered under
// them; on s7's first, the long passage's dead were heard from the forecourt (a breath let out, feet that drag) and
// walked in on, though the page offered to draw them out and meet them ready.
// - A band here that could end a life and has not let the company be, which came to it where it stood or is coming at
//   it (it says so: "comes at you"), is not stayed beside: the company steps back toward the way out and keeps out of
//   that room on this trip; met so a second time (it followed, or another), it goes home.
// - One that warns the company off (it will not have it there long, or is seen lying in wait) is left at once, by the
//   way on or back, and nothing done there that takes the time it gives (gathering coins under the spiders).
// - One that does neither (a keeper at its post, a band that keeps to itself) is let be, as before: never fought.
// - What is heard in a way is drawn out to be met at the threshold, before the way is gone into.
// - A fight going badly is broken off: anyone down to a third, or anyone down to half while the foes keep more than
//   half their strength.
// - One of the company fallen, the rest go home.
export type Away = 'back' | 'leave' | 'home' | undefined;
export class QuantityCaution {
  // What the company does about the bands here that could end its life (by the attacks the page offers on them, never
  // fought: beyond): step back (one came, or is coming at it), go home (the second such), leave by any way (one warns
  // it off), or nothing. arrival: the room the company is in and who was there as it came in.
  static away(s: PlaySession, beyond: string[], at: { shunned: Set<string>; met: { n: number };
    arrival: { room: string; bands: Set<string> } }): Away {
    const here = s.campaign.world.one('at', 'party') ?? '';
    const bands = beyond.map(id => this.band(id)).filter(b => !this.holds(s, 'tolerates', b));
    if (at.arrival.room !== here) { at.arrival = { room: here, bands: new Set(bands) }; }
    if (bands.some(b => this.holds(s, 'assails', b) || !at.arrival.bands.has(b))) {
      at.shunned.add(here);
      return ++at.met.n > 1 ? 'home' : 'back';
    }
    if (bands.some(b => this.holds(s, 'warned', b))) { at.shunned.add(here); return 'leave'; }
    return undefined;
  }
  // What a band holds toward the company (it lets it be, comes at it, warns it off), as the page says it.
  private static holds(s: PlaySession, name: string, band: string): boolean {
    return s.campaign.world.test({ kind: 'call', name, args: [band, 'party'] });
  }
  static band(attack: string): string { return /^attack\(([^,)]+)/.exec(attack)?.[1] ?? ''; }
  static mortal(s: PlaySession, group: string): boolean {
    const r = DangerSense.reckon(s.campaign, group);
    return !!r && (r.mortal === true || r.danger === 'grave' || r.danger === 'deadly');
  }
  // The first leg back toward the way out (the stair the company came down), as the page offers it.
  static back(s: PlaySession, ids: string[], out: string): string | undefined {
    const here = s.campaign.world.one('at', 'party') ?? '';
    try {
      const [leg] = Journey.way(s.campaign.world, here, out);
      const id = leg ? `go(${leg[0]},${leg[1]})` : undefined;
      return id && ids.includes(id) ? id : undefined;
    } catch { return undefined; }
  }
  // A way into a room where something is heard (the page offers to draw it out, and wait for it here): what is there
  // drawn out to the threshold first, once, and met ready; any other act as it is.
  static ahead(ids: string[], tried: Set<string>, act: string | undefined): string | undefined {
    const to = act?.startsWith('go(') ? /,([^,)]+)\)$/.exec(act)?.[1] : undefined, draw = `draw_out(${to})`;
    return to && ids.includes(draw) && !tried.has(draw) ? draw : act;
  }
  // Whether a fight is broken off: anyone of the company down to a third; or down to half, the foes still more than
  // half their strength.
  static flees(fighters: readonly Pick<Fighter, 'team' | 'hp' | 'maxHp'>[]): boolean {
    const ours = fighters.filter(f => f.team === 'fighters' && f.hp > 0), foes = fighters.filter(f => f.team !== 'fighters');
    const strength = foes.reduce((t, f) => t + Math.max(0, f.hp), 0), whole = foes.reduce((t, f) => t + f.maxHp, 0);
    return ours.some(f => f.hp < f.maxHp / 3) || (ours.some(f => f.hp <= f.maxHp / 2) && strength > whole / 2);
  }
  // Whoever of the company stands now, by id.
  static standing(s: PlaySession): Set<string> {
    const c = s.campaign;
    return new Set(c.readout.creatures.filter(k => c.readout.partyIds.includes(k.id) && k.state.hp > 0).map(k => k.id));
  }
  // Whether any who stood when the company went down has fallen since.
  static fallen(s: PlaySession, stood: Set<string>): boolean {
    const now = this.standing(s);
    return [...stood].some(id => !now.has(id));
  }
}
