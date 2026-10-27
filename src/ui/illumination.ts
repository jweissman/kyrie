import type { Act } from './screen-types';
import { Content } from '../content';
import { Canon } from '../canon/canon';

// Which of a member's acts give the company light: a spell whose effect lays a condition that grants it (Light).
// Marked as the screen is built, so that the page can offer it in the dark without reading the catalogs (a mage in a
// dark room had Light prepared and could cast it only from the pack: the play-structure investigation's PT-06).
export class Illumination {
  static mark(acts: Act[]): Act[] { return acts.map(a => this.gives(a) ? { ...a, light: true } : a); }
  private static gives(a: Act): boolean {
    const command = a.command ?? a.children?.[0]?.command ?? '';
    const technique = /^field_spell\([^,]*,([^,)]*)/.exec(command)?.[1];
    const ability = technique ? Content.abilities.find(x => x.id === technique) : undefined;
    return !!ability?.effects.some(e => e.kind === 'apply'
      && !!Canon.conditions[Canon.resolve('conditions', e.status)]?.grants?.includes('light'));
  }
}
