import type { Campaign } from '../campaign/campaign';
import type { Screen } from './screen-types';
import { ModuleWriter } from '../lang/module-writer';
import { ObservationText } from '../lang/observation-text';
import { Engagement } from './engagement';

// Who is warning the company off where it stands, and how long they will wait: the rest of this watch, however many
// small things are done in it (data/rules/inhabitants.kyr, temper_closes). It was spent silently, by reading and
// looking, until they came on (the play-structure investigation's PT-39; the register's CMB-13).
export class Patience {
  // also: the others warning it off there too (three dangers at one door), each a threat the company answers (OR-163).
  // With it, what the company is engaged in that is not a threat (see Engagement): both hold it where it stands.
  static of(campaign: Campaign, minutes = 0): Pick<Screen, 'engaged'> & { warned?: { by: string; left: number;
    id: string; also?: string[]; }; } {
    return { ...this.warning(campaign, minutes), ...Engagement.of(campaign) };
  }
  private static warning(campaign: Campaign, minutes: number): { warned?: { by: string; left: number; id: string;
    also?: string[]; }; } {
    const world = campaign.world, company = campaign.playerActor, here = company && world.one('at', company);
    // None to a company that has fallen: the barrow-king had given a dead warrior ten minutes (AB-04).
    if (!here || !world.relates('warned') || !campaign.running) { return {}; }
    const now = world.number(ModuleWriter.call('watch', 'clock'));
    const all = world.related('warned').map(r => r.args).filter(([g, c]) => c === company && world.one('at', g!) === here)
      .map(([g]) => g!).filter(g => this.standing(world, g, company) && this.closes(world, g, here)
        && world.number(ModuleWriter.call('patience', g)) > now);
    const by = all[0];
    if (!by) { return {}; }
    const watches = world.number(ModuleWriter.call('patience', by)) - now, also = all.slice(1);
    return { warned: { by: ObservationText.label(world, by), left: watches * 10 - minutes, id: by,
      ...also.length ? { also } : {} } };
  }
  // Only one who could still come on: a robbers' captain dead on the floor had gone on giving the company seven
  // minutes (round 5), as the rules' warning stands until it is spent (temper_closes asks able, not routed).
  // Nor one who now lets the company be (the old drain's centipede, kept to the cold side of: tolerates), as the
  // rules' warning closes only on one it does not tolerate (temper_closes), and no engagement stands (OR-163).
  // Nor one made peaceable (the gallery's eels, stranded at the ebb), who comes on at no one (temper_closes).
  private static standing(world: Campaign['world'], g: string, company: string): boolean {
    return this.holds(world, 'able', g) && !this.holds(world, 'routed', g) && !this.holds(world, 'peaceable', g)
      && !(world.relates('tolerates') && world.test(ModuleWriter.call('tolerates', g, company)));
  }
  // Nor a defensive one away from its lair, which comes on only there (temper_defends): the Patient Star's Delver,
  // drilling under the Tip's floor with no lair, had held the company from a word with the Masons over it.
  private static closes(world: Campaign['world'], g: string, here: string): boolean {
    const defensive = world.relates('temperament') && world.test(ModuleWriter.call('temperament', g, 'temper_defensive'));
    return !defensive || (world.relates('lair') && world.test(ModuleWriter.call('lair', g, here)));
  }
  private static holds(world: Campaign['world'], name: string, g: string): boolean {
    return world.relates(name) && world.test(ModuleWriter.call(name, g));
  }
  // What a choice that takes them past their patience says beside it.
  static note(by: string): string { return `${by.charAt(0).toUpperCase()}${by.slice(1)} will not wait for it`; }
}
