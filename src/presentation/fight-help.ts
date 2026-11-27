import type { Campaign } from '../campaign/campaign';
import type { Act, Screen, TargetRow } from '../ui/screen-types';
import { ObservationText } from '../lang/observation-text';
import { ModuleWriter } from '../lang/module-writer';
import { DangerSense } from './danger-sense';
import { CompanyRecall } from './company-recall';
import { Outmatched } from './outmatched';

// The help that can be had for a fight the company reckons it could lose, or is beyond it (DangerSense: grave or
// deadly), said with the reckoning wherever the fight is offered (CL-52: cold play 6's warrior was offered "Attack the
// keeper of the vault" with only a danger mark and died of it in four rounds). The owner's ruling 6 of 16 November
// (CB-03): the danger is kept, and the warning names the help that can be had, where the engine knows of it: a light
// where the company stands in the dark, someone who would go with it, the way back it came.
export class FightHelp {
  // A group the company could attack is weighed up before it does; not one that has let it be (the hobs at the gate,
  // parleyed with and asking it in, had been led with as a danger to attack, "easily won": OWN-57's play).
  static reckoning(campaign: Campaign, id: string, targets: Map<string, Act[]>): Pick<TargetRow, 'reckoning'> {
    if (!(targets.get(id) ?? []).some(a => a.label === 'Attack')) { return {}; }
    const world = campaign.world, company = campaign.playerActor;
    if (company && world.relates('tolerates') && world.test(ModuleWriter.call('tolerates', id, company))) { return {}; }
    const reckoning = DangerSense.reckon(campaign, id);
    return reckoning ? { reckoning } : {};
  }
  // The rows of those the company reckons it could lose to, with the help to be had for it.
  static on(campaign: Campaign, screen: Screen): TargetRow[] {
    const losing = screen.people.filter(p => p.reckoning && Outmatched.beyond.has(p.reckoning.danger));
    const help = losing.length ? this.said(campaign, screen) : undefined;
    return help ? screen.people.map(p => losing.includes(p) ? { ...p, reckoning: { ...p.reckoning!, help } } : p)
      : screen.people;
  }
  // What would help, in words; none where nothing is known to.
  static said(campaign: Campaign, screen: Screen): string | undefined {
    const voice = campaign.installation.presentation?.fightHelp;
    if (!voice) { return undefined; }
    // Someone who would go along, where the company knows to find them (OR-881).
    const world = campaign.world, help = Outmatched.helper(campaign), who = help?.who, where = help?.at;
    const back = CompanyRecall.of(campaign).back(screen, true).back;
    const place = back && screen.exits.find(e => e.id === back)?.destination.name;
    const ways = [...screen.dark ? [voice.light] : [],
      ...who && where ? [voice.hand.replace('{who}', ObservationText.label(world, who))
        .replace('{where}', ObservationText.label(world, where))] : [],
      ...place ? [voice.back.replace('{place}', place)] : []];
    return ways.length ? voice.said.replace('{ways}', this.or(ways)) : undefined;
  }
  private static or(ways: string[]): string {
    return ways.length > 1 ? `${ways.slice(0, -1).join(', ')} or ${ways.at(-1)!}` : ways[0]!;
  }
}
