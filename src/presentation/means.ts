import type { Campaign } from '../campaign/campaign';
import type { Screen } from '../ui/screen-types';
import { Canon } from '../canon/canon';
import { SkillReading } from './skill-reading';

// What a barred way on needs (a skill, or a kind of thing), and where the world says it is to be had: someone who sells
// the thing, or a thing that gives the skill (a coil of rope for a climb). Read from what the world holds, the needs a
// passage is written with and the skill a change waits on; never a source made up to answer it. Where none is, the
// barred way's opener is a gap in what the country supplies (EX-01's unreachable aim content: Ironkeep's breach
// needs climbing or rope, Tinhold's fall digging or a shovel, and nothing had led to either).
export interface Lead { way: string; needs: string[]; from: { seller: string; at?: string; kind: string }[] }
export class Means {
  // For each barred way on (see Threshold), what it needs and who has it.
  static leads(campaign: Campaign, screen: Screen, barred: Set<string>): Lead[] {
    const w = campaign.world, here = screen.place.id, wanting = SkillReading.read(campaign).wanting;
    return screen.exits.filter(e => barred.has(e.id)).map(e => {
      const passage = w.related('connects').find(r => r.args[1] === here && r.args[2] === e.destination.id)?.args[0];
      const acts = new Set(e.acts.filter(a => a.disabled).map(a => a.targets?.[0] ?? ''));
      const written = passage ? w.related('needs').filter(r => r.args[0] === passage).map(r => r.args[1]!) : [];
      const needs = [...new Set([...written, ...wanting.filter(x => acts.has(x.action.id)).map(x => x.skill)])];
      return { way: e.id, needs, from: this.sources(campaign, needs) };
    }).filter(l => l.needs.length);
  }
  // Who sells a kind it needs, or a kind that gives a skill it needs (a kind of the catalog kept on a shelf, or a
  // good of the module's own, sold).
  static sources(campaign: Campaign, needs: string[]): Lead['from'] {
    const w = campaign.world, kinds = new Set([...needs, ...Object.entries(Canon.items)
      .filter(([, i]) => needs.some(n => i.grants?.skill === n || i.aids?.includes(n))).map(([k]) => k)]);
    const sold = [...campaign.module.initial.flatMap(c => c.kind === 'set' && c.call.name === 'shelf'
      && kinds.has(c.call.args[1]!) ? [[c.call.args[0]!, c.call.args[1]!] as const] : []),
    ...w.relates('sells') ? w.related('sells').filter(r => kinds.has(r.args[1]!))
      .map(r => [r.args[0]!, r.args[1]!] as const) : []];
    return [...new Map(sold.map(([seller, kind]) => {
      const at = w.one('at', seller);
      return [seller, { seller, kind, ...at ? { at } : {} }];
    })).values()];
  }
}
