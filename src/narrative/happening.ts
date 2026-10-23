import type { CampaignEvent } from '../campaign/campaign-types';

// Something that happened in the world, as the simulation knows it, before anyone has said a word about it: who
// joined, who turned on the company, what a dog did when it was patted. Read from what a command changed; told by the
// voice tables (data/voice), which the narrator chooses among.
export interface Happening {
  kind: string; actor?: string; target?: string;
  // What it was about or with: the fact learned, the thing owned, the place reached.
  object?: string;
  // What brought it about, when the world knows: the command the company gave.
  cause?: string;
}

export class Happenings {
  // Which change to the world is which happening: an assertion (+) or retraction (-) of a relation, and the roles of
  // its arguments. Only a change about the company (its id in the role named company) is told.
  static readonly readings: { sign: '+' | '-'; relation: string; kind: string; roles: string[] }[] = [
    { sign: '+', relation: 'travelsWith', kind: 'join', roles: ['actor', 'company'] },
    { sign: '-', relation: 'travelsWith', kind: 'part', roles: ['actor', 'company'] },
    { sign: '+', relation: 'following', kind: 'follow', roles: ['actor', 'company'] },
    { sign: '-', relation: 'following', kind: 'part', roles: ['actor', 'company'] },
    { sign: '+', relation: 'greeted', kind: 'greet', roles: ['actor', 'company'] },
    { sign: '+', relation: 'petted', kind: 'pet', roles: ['actor', 'company'] },
    { sign: '+', relation: 'hostile', kind: 'turn', roles: ['actor', 'company'] },
    { sign: '+', relation: 'grateful', kind: 'thank', roles: ['actor', 'company'] },
    { sign: '+', relation: 'objected', kind: 'object', roles: ['actor', 'object'] },
    { sign: '+', relation: 'refusesService', kind: 'refuse', roles: ['actor', 'company'] },
    // Spoken to, and taken leave of (going away from someone mid-word is not a farewell; see Telling).
    { sign: '+', relation: 'addressed', kind: 'address', roles: ['actor', 'company'] },
    { sign: '-', relation: 'addressed', kind: 'farewell', roles: ['actor', 'company'] },
  ];
  static read(event: CampaignEvent, company: string, petted: Set<string>): Happening[] {
    const out: Happening[] = [];
    for (const change of event.changes) {
      const m = /^([+-]) (\w+)\(([^)]*)\)$/.exec(change);
      if (!m) { continue; }
      const [, sign, relation, list] = m, args = list!.split(', ');
      for (const r of this.readings.filter(x => x.sign === sign && x.relation === relation)) {
        const roles = Object.fromEntries(r.roles.map((role, i) => [role, args[i]!]));
        if (roles.company && roles.company !== company) { continue; }
        out.push({ kind: r.kind, actor: roles.actor, ...roles.object ? { object: roles.object } : {},
          cause: event.action });
      }
    }
    // Patting a dog that has been patted before is still patting it: the world says nothing new, the dog does.
    const pat = /^pet\(([^)]*)\)$/.exec(event.action)?.[1]?.split(',');
    if (pat && petted.has(pat[1]!) && !out.some(h => h.kind === 'pet')) {
      out.push({ kind: 'pet', actor: pat[1]!, cause: event.action });
    }
    // Following and travelling with are one joining: someone led along and then taken on is told once.
    return out.filter((h, i) => !(h.kind === 'follow' && out.some((o, j) => j !== i && o.kind === 'join' && o.actor === h.actor)))
      .map(h => h.kind === 'follow' ? { ...h, kind: 'join' } : h)
      .filter((h, i, all) => all.findIndex(o => o.kind === h.kind && o.actor === h.actor) === i);
  }
}
