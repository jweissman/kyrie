import type { Campaign } from '../campaign/campaign';
import { ModuleWriter } from '../lang/module-writer';
import { ObservationText } from '../lang/observation-text';

// Who is warning the company off where it stands, and how long they will wait: the rest of this watch, however many
// small things are done in it (data/rules/inhabitants.kyr, temper_closes). It was spent silently, by reading and
// looking, until they came on (the play-structure investigation's PT-39; the register's CMB-13).
export class Patience {
  static of(campaign: Campaign, minutes = 0): { warned?: { by: string; left: number; id: string } } {
    const world = campaign.world, company = campaign.playerActor, here = company && world.one('at', company);
    if (!here || !world.relates('warned')) { return {}; }
    const by = world.related('warned').map(r => r.args).filter(([g, c]) => c === company && world.one('at', g!) === here)
      .map(([g]) => g!).find(g => world.number(ModuleWriter.call('patience', g)) > world.number(ModuleWriter.call('watch',
        'clock')));
    if (!by) { return {}; }
    const watches = world.number(ModuleWriter.call('patience', by)) - world.number(ModuleWriter.call('watch', 'clock'));
    return { warned: { by: ObservationText.label(world, by), left: watches * 10 - minutes, id: by } };
  }
  // What a choice that takes them past their patience says beside it.
  static note(by: string): string { return `${by.charAt(0).toUpperCase()}${by.slice(1)} will not wait for it`; }
}
