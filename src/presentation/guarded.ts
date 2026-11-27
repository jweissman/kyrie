import type { Campaign } from '../campaign/campaign';
import type { Operator } from '../lang/index';
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
    const keeper = Guarded.keeper(campaign, place);
    return keeper && Guarded.named(campaign, keeper);
  }
  // The keeper itself, by id (see beyond).
  static keeper(campaign: Campaign, place: string): string | undefined {
    const w = campaign.world, party = campaign.playerActor;
    if (!party || !w.test(ModuleWriter.call('been', party, place))) { return undefined; }
    const keepers = [...new Set(w.related('warning').map(r => r.args[0]!))]
      .filter(g => w.one('at', g) === place && w.test(ModuleWriter.call('able', g)));
    // Only where nothing but a fight answers it: one the author gave another answer (the man with the black candle,
    // talked round or his candle put out by the rite) is still the aim's way in, to be answered there (OR-163).
    return keepers.find(g => !Guarded.answered(campaign, g) && DangerSense.beyond(campaign, g))
      ?? Guarded.felling(campaign, place);
  }
  // By its name alone ("the keeper of the vault"), not the role said after it.
  static named(campaign: Campaign, keeper: string): string {
    return (campaign.module.entities.find(e => e.id === keeper)?.name ?? keeper).split(', ')[0]!;
  }
  // Or any band met there whose fights would fell the one who plays as the company stands (OR-412): the page leads
  // into none, and the aim's way back in to it had been led again at once, the weir route's buck rat to and fro.
  private static felling(campaign: Campaign, place: string): string | undefined {
    const w = campaign.world, party = campaign.playerActor;
    return Object.keys(campaign.readout.inhabitants).find(g => g !== party && w.one('at', g) === place
      && w.test(ModuleWriter.call('able', g)) && !(w.relates('peaceable') && w.test(ModuleWriter.call('peaceable', g)))
      && !!DangerSense.reckon(campaign, g)?.mortal);
  }
  // Whether an act of the author's names it, in what it asks or does (as Engaged knows an act that answers a threat),
  // and the company knows what that act asks it to know: the keeper of the vault's rite of the door, read in the book
  // of the dead, is no answer to one who has not read it (it had made the keeper answered for every company, and the
  // way back in to it the aim's again: the gold walk to and fro between the vault and the undercroft).
  private static answered(campaign: Campaign, g: string): boolean {
    return [...campaign.schemaList, ...campaign.module.actions].some(o => Guarded.words(o).includes(`"${g}"`)
      && Guarded.knowing(campaign, o.requires));
  }
  // What an act asks and does, as words to find a name in: written once for each act (every act of the world had been
  // written out again for every keeper asked of, each glance).
  private static readonly written = new WeakMap<Operator, string>();
  private static words(o: Operator): string {
    let words = this.written.get(o);
    if (words === undefined) { words = JSON.stringify([o.requires, o.success, o.failure]); this.written.set(o, words); }
    return words;
  }
  private static knowing(campaign: Campaign, requires: unknown): boolean {
    const party = campaign.playerActor ?? 'party';
    return Guarded.asked(requires).every(f => campaign.world.test(ModuleWriter.call('knows', party, f)));
  }
  // The facts a condition asks to be known, by name (not what it asks not to be known).
  private static asked(p: unknown): string[] {
    if (!p || typeof p !== 'object' || (p as { kind?: string }).kind === 'not') { return []; }
    const n = p as { kind?: string; name?: string; args?: string[] };
    const own = n.kind === 'call' && n.name === 'knows' && n.args?.[1] && !n.args[1].startsWith('?') ? [n.args[1]] : [];
    return [...own, ...Object.values(p).flatMap(v => Guarded.asked(v))];
  }
  // Said as a need, of the way: "The stair under the lettered flag: the keeper of the vault is beyond it, and beyond
  // the company as it is; more hands, or more seasoning, first."
  static said(way: string, keeper: string): string {
    return `${Guarded.upper(way)}: ${keeper} is beyond it, and beyond the company as it is; ${Guarded.tail}`;
  }
  private static readonly tail = 'more hands, or more seasoning, first.';
  private static upper(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1); }
}
