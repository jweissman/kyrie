import type { Screen } from '../ui/screen-types';
import type { Glance } from './glance-types';
import type { Exchange } from './narrator';
import { Typography } from './typography';

// A danger the glance has just named is not named again by what it does as the company comes: "The rats under the
// corn-store are here, each a brown rat of the barns … / The rats under the corn-store stand their ground and watch
// you." (cold play 5, CL-37's 19). The glance's line introduces it; what follows of it in the telling of the arrival
// is said of it as "They" or "It". Someone of a people keeps their name (their pronoun is theirs to say).
export class Introduced {
  // What the glance leaves unsaid (a warning's wait the page holds) stays as it is, to be left out by its words.
  static said<T extends { exchange?: Exchange; glanced?: { unsaid?: string[] } }>(leaf: T, glance: Glance,
    screen: Pick<Screen, 'people'>): T {
    const life = glance.life, row = life?.danger ? screen.people.find(p => p.id === life.subject) : undefined;
    if (!life || !row || row.kind === 'person' || !leaf.exchange) { return leaf; }
    const name = row.name.split(', ')[0]!, label = Typography.curl(`${name.charAt(0).toUpperCase()}${name.slice(1)} `);
    if (!life.text.startsWith(label)) { return leaf; }
    const they = row.many ? 'They ' : 'It ', unsaid = new Set(leaf.glanced?.unsaid ?? []);
    const lines = leaf.exchange.lines.map(l => l.kind === 'event' && l.text.startsWith(label) && !unsaid.has(l.text)
      ? { ...l, text: `${they}${l.text.slice(label.length)}` } : l);
    return { ...leaf, exchange: { ...leaf.exchange, lines } };
  }
}
