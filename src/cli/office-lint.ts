import offices from '../../data/editorial/offices.json';
import type { Entity } from '../lang/module';
import type { CampaignLint } from './campaign-lint';
import type { BundleSource } from '../campaign/bundle-source';
import { WhySources } from './why-sources';
import { WhyWriter } from './why-writer';

interface Holder { person: Entity; office: string; as: string; town: string }

// The offices of a drawn world's towns, as its people are written (the owner, 19 November: "Porthalen has two
// reeves, Aldous Fenn and the drove's Annis Talfryn"): the town's own generated people and every module that places
// someone in it each say who holds what, and nothing holds them to one another. An office one person holds in a
// town (data/editorial/offices.json) is read from who they are: their title ("Reeve Annis Talfryn"), their role
// ("reeve of the wood-wardens") or their id (s2_reeve); two holders of one in one town is a warning, since it may
// be meant (a reeve of the wood-wardens is not the town's), and each is said with where it is written.
export class OfficeLint {
  static readonly one: string[] = Object.keys(offices.offices);
  static async run(lint: CampaignLint, source: BundleSource) {
    const sources = new WhySources(lint.path, source, lint.session.seed);
    const by = new Map<string, Holder[]>();
    for (const h of this.holders(lint)) {
      const key = `${h.town}|${h.office}`;
      by.set(key, [...by.get(key) ?? [], h]);
    }
    for (const [key, held] of [...by].filter(([, hs]) => hs.length > 1).sort((a, b) => a[0].localeCompare(b[0]))) {
      const [town, office] = key.split('|') as [string, string];
      const named = lint.entities.get(town)?.name ?? town;
      lint.add('warning', 'office', `${named} (${town}) has ${held.length} holding the office of ${office}, which `
        + `${(offices.offices as Record<string, string>)[office]}: `
        + `${(await Promise.all(held.map(h => this.told(sources, h)))).join('; ')}`);
    }
  }
  // Everyone in a town who holds one of its offices, by the first of their title, role or id that names it.
  static holders(lint: CampaignLint): Holder[] {
    return lint.module.entities.filter(e => e.type === 'group').flatMap(person => {
      const town = this.town(lint, person.id), found = town ? this.office(person) : undefined;
      return found && town ? [{ person, town, ...found }] : [];
    });
  }
  // The office someone holds, and what said so.
  static office(person: Entity): { office: string; as: string } | undefined {
    const [name = '', ...rest] = person.name.split(', '), role = rest.join(', ');
    const local = person.id.split('__').pop()!;
    for (const office of this.one) {
      const word = new RegExp(`^${office}\\b(?!['’])`, 'i');
      if (word.test(name)) { return { office, as: `titled "${name}"` }; }
      if (new RegExp(`^(?:(?:the|a|an)\\s+)?${office}\\b(?!['’])`, 'i').test(role)) {
        return { office, as: `"${role.split(/,| who /)[0]!.trim()}"` };
      }
      if (local === office || local.endsWith(`_${office}`)) { return { office, as: `by its id ${local}` }; }
    }
    return undefined;
  }
  // The settlement someone stands in, through the places that hold where they are.
  static town(lint: CampaignLint, id: string): string | undefined {
    for (let at = lint.world.one('at', id), n = 0; at && n < 8; n++) {
      if (lint.entities.get(at)?.space?.kind === 'settlement') { return at; }
      at = lint.entities.get(at)?.space?.parent;
    }
    return undefined;
  }
  // A holder with where they are written: the line that declares them (in data/, or the world's generated Kyr), and
  // for a generated line the generator's template that wrote it (see WhyWriter).
  private static async told(sources: WhySources, h: Holder): Promise<string> {
    const line = await sources.declared(h.person.id, 'Person'), name = h.person.name.split(', ')[0];
    const writer = line && !line.file.startsWith('data/') ? WhyWriter.of(line.text)[0] : undefined;
    return `${h.person.id} "${name}" (${h.as})${line ? `, ${line.file}:${line.line}` : ''}`
      + `${writer ? ` by ${writer}` : ''}`;
  }
}
