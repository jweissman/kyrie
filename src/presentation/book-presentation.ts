import { Identity } from './identity';
import { Emblems } from './emblems';
import { SpellSchools } from './spell-schools';
import type { BookPresentation } from '../shared/book-presentation';

export class BookPresentationForPlayer {
  static get value(): BookPresentation {
    return { game: Identity.spoken(), emblem: this.emblem };
  }
  private static emblem(id: string, className?: string): string {
    const spell = /^ability:(.+)$/.exec(id)?.[1];
    const of = /^(?:ancestry|class|trait):(.+)$/.exec(id)?.[1] ?? /^backgrounds-(.+)$/.exec(id)?.[1]?.replace(/^/, 'life_')
      ?? (spell && SpellSchools.emblem(spell));
    return of ? Emblems.svg(of, className) : '';
  }
}
