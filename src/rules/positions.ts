import { Content } from '../content';
import { Formations } from './formations';
import { Targeting } from '../targeting';
import type { Area, ArenaAbility, Effect } from '../lang/parse';
import type { Fighter, Team } from '../model';

// Where each side's fighters stand: the press, where the two sides' fronts meet hand to hand, mixed together; or a
// side's rear, behind its own front (named by the side). The three lie in a line, the company's rear, the press, the
// other side's rear.
export type Zone = 'press' | Team;

// Positions in a fight, kept abstract: every fighter stands in one of three places, set by its side's formation (see
// Formations.rear): who fights hand to hand stands in the press, who fights from a distance or stands back by calling
// stands in its side's rear; a side with nobody left in front fights from where it stands, in the press. An area
// (data/catalog/vocabulary.json combat.areas, or an ability's own `area`) is let loose where it is aimed, at a place
// one of its foes stands in, and catches whoever stands where it reaches, friend or foe, but never the one who lets it
// loose (who shapes it about themselves: one reading a scroll of fireball in the press had burned to death): a burst
// everyone in the place it bursts in; a cone every place from its source out to where it is aimed (the press it is
// breathed through, the source's own rank-mates beside it spared). A fireball dropped into the press
// burns the company's own front with the foe's, one thrown over it into their rear catches only those there; a dragon
// in the press breathing on the company's rear catches all the company, and its own kind beside it. Simple, and the
// same wherever an area is used: a spell, a breath, a thing carried that casts one.
export class Positions {
  static readonly line: readonly Zone[] = ['fighters', 'press', 'goblins'];
  static zone(f: Fighter, fighters: readonly Fighter[]): Zone {
    if (!Formations.rear(f)) { return 'press'; }
    return fighters.some(o => o.team === f.team && o.hp > 0 && !Formations.rear(o)) ? f.team : 'press';
  }
  // Its shape, if it is an area: its own (see CanonRuntime.ability), or that of the area it casts (a scroll of
  // fireball).
  static area(ability: Pick<ArenaAbility, 'id' | 'effects' | 'area'>): Area | undefined {
    if (ability.area) { return ability.area; }
    const cast = ability.effects.find(e => e.kind === 'cast');
    const inner = cast?.kind === 'cast' && cast.ability !== ability.id
      ? Content.abilities.find(a => a.id === cast.ability) : undefined;
    return inner ? this.area(inner) : undefined;
  }
  // A place in words, as one who stands on a side sees it.
  static where(zone: Zone, viewer: Fighter): string {
    return zone === 'press' ? 'the press' : zone === viewer.team ? 'your own rear' : 'their rear';
  }
  // Whether an effect falls on whoever the area catches, rather than on whom it names (the one it aims at, itself).
  static spread(effect: Effect): boolean { return ['enemies', 'random enemies', 'all'].includes(effect.target); }
  // The places an area aimed from one place at another covers.
  static covered(area: Area, from: Zone, aim: Zone): Zone[] {
    if (area === 'burst' || from === aim) { return [aim]; }
    const [a, b] = [this.line.indexOf(from), this.line.indexOf(aim)], step = Math.sign(b - a);
    const path: Zone[] = [];
    for (let i = a; i !== b + step; i += step) { path.push(this.line[i]!); }
    return path.filter(z => z !== from || from === 'press');
  }
  // Whoever an area aimed at one standing somewhere catches, in the fight's order: friend or foe.
  static caught(actor: Fighter, aim: string, area: Area, fighters: readonly Fighter[]): Fighter[] {
    const at = fighters.find(f => f.id === aim);
    if (!at) { return []; }
    const zones = this.covered(area, this.zone(actor, fighters), this.zone(at, fighters));
    return fighters.filter(f => f.hp > 0 && f.id !== actor.id && zones.includes(this.zone(f, fighters)));
  }
  // Where an ability that names nobody is aimed: an area at each place a foe it can see stands in, by the first foe
  // there; anything else at its user.
  static aims(actor: Fighter, fighters: readonly Fighter[], ability: Pick<ArenaAbility, 'id' | 'effects' | 'area'>):
    Fighter[] {
    if (!this.area(ability)) { return [actor]; }
    const foes = Targeting.candidates('enemy', actor, [...fighters]), seen = new Set<Zone>();
    return foes.filter(f => {
      const z = this.zone(f, fighters);
      return !seen.has(z) && !!seen.add(z);
    });
  }
}
