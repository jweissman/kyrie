import type { Screen } from '../../src/ui/screen-types';

// Whether an aim is to hand in the town the company is in (its places hold what they lie in: see
// Undertakings.places), or told of further off: the page says the near ones as aims taken up, and the far ones
// quietly, as noted (Mission 20: a cold player had about ten "new aims" within minutes of talking to Tuck).
export class AimNear {
  static town(screen: Screen): Screen['path'][number] | undefined {
    return [...screen.path].reverse().find(p => p.kind === 'settlement');
  }
  // By the aim's id (an aim the company holds), or for one only said (a deadline), by its words.
  static near(screen: Screen, aim: string | { id: string }): boolean {
    const town = this.town(screen);
    const held = screen.aims?.find(a => typeof aim === 'string' ? a.text === aim : a.id === aim.id);
    return !town || !held || !!held.own || !!held.followed || !!held.places?.includes(town.id);
  }
}
