import type { Operator } from './planner';

// Whether a rest's shelter still holds when the rest ends: a rough rest anywhere, a rest at a site that is restful and
// not closed. An action that is no rest is always safe. `holds` asks the world a relation of the site (Campaign.shelter
// supplies it), so that this reading imports nothing of the language.
export class Shelter {
  static rest(action: Operator): boolean { const name = action.resolve?.name; return name === 'recover' || name === 'rough'; }
  static safe(action: Operator, holds: (relation: string, site: string) => boolean): boolean {
    const site = action.bindings?.site;
    return !Shelter.rest(action) || (!!site && (action.schema !== 'rest' || holds('restful', site)) && !holds('closed', site));
  }
}
