import type { Campaign } from '../campaign/campaign';
import { ModuleWriter } from '../lang/module-writer';
import { DangerSense } from './danger-sense';

// What stands between the company and where its aim goes, met there already: a keeper that warned it off, still at
// its post, that the company reckons beyond it (DangerSense: grave or deadly). The World agent's walk of the first
// quarter hour (iscoed, the debt, a warrior): at the sealed vault the keeper warned; the company drew back to the
// undercroft; and the aim's gold led straight back down the stair, and back, and back, never saying the keeper stood
// between. Now the way back in is no step of the aim's (AimContinuity), and the need says why, as a barred way's does
// (Threshold): in the vault itself, engaged, the answer to the keeper is what is offered, the attack among it.
export class Guarded {
  // The keeper beyond a way, by name, where the company has been there, it warns, and it is beyond the company.
  static beyond(campaign: Campaign, place: string): string | undefined {
    const w = campaign.world, party = campaign.playerActor;
    if (!party || !w.test(ModuleWriter.call('been', party, place))) { return undefined; }
    const keepers = [...new Set(w.related('warning').map(r => r.args[0]!))]
      .filter(g => w.one('at', g) === place && w.test(ModuleWriter.call('able', g)));
    // Only where nothing but a fight answers it: one the author gave another answer (the man with the black candle,
    // talked round or his candle put out by the rite) is still the aim's way in, to be answered there (OR-163).
    const keeper = keepers.find(g => !Guarded.answered(campaign, g) && DangerSense.beyond(campaign, g));
    // By its name alone ("the keeper of the vault"), not the role said after it.
    return keeper && (campaign.module.entities.find(e => e.id === keeper)?.name ?? keeper).split(', ')[0];
  }
  // Whether an act of the author's names it, in what it asks or does (as Engaged knows an act that answers a threat).
  private static answered(campaign: Campaign, g: string): boolean {
    return [...campaign.schemaList, ...campaign.module.actions].some(o => JSON.stringify([o.requires, o.success,
      o.failure]).includes(`"${g}"`));
  }
  // Said as a need, of the way: "The stair under the lettered flag: the keeper of the vault is beyond it, and beyond
  // the company as it is; more hands, or more seasoning, first."
  static said(way: string, keeper: string): string {
    return `${Guarded.upper(way)}: ${keeper} is beyond it, and beyond the company as it is; ${Guarded.tail}`;
  }
  private static readonly tail = 'more hands, or more seasoning, first.';
  private static upper(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1); }
}
