import type { Campaign } from '../campaign/campaign';

// What a creature is called when its fight is told after it, as the company knew it: one of a band by its place in
// the band ("the second of the spirits"), a band of one by the band ("the curious ooze"), anyone else by their own
// name. Never by its number in the fight ("Spirit 2").
export class BandNames {
  static readonly ordinals = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth'];
  static of(campaign: Campaign): Map<string, string> {
    const party = new Set(campaign.readout.partyIds);
    type Actors = { tickState?: { definition: { actors: { id: string; members: string[] }[] } } };
    const actors = (campaign as unknown as Actors).tickState?.definition.actors ?? [];
    return new Map(campaign.readout.creatures.map(c => {
      const band = !party.has(c.id) && actors.find(a => a.members.includes(c.id));
      const label = band && campaign.module.entities.find(e => e.id === band.id)?.name.split(', ')[0];
      if (!band || !label || !/^(the|a|an) /i.test(label)) { return [c.id, c.name ?? c.id]; }
      if (band.members.length === 1) { return [c.id, label]; }
      const nth = this.ordinals[band.members.indexOf(c.id)] ?? 'last';
      return [c.id, `the ${nth} of ${label.replace(/^(a|an) /i, 'the ')}`];
    }));
  }
}
