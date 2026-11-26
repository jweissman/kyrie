import type { Campaign } from '../campaign/campaign';
import type { CombatScreen, Screen } from '../ui/screen-types';
import { Portraits } from '../ui/portraits';

// The company's faces, one per member in every frame of a life (OR-1070; AGENTS.md, one projection): whoever has
// joined is on the scene, by the face their member row has (Portraits.member) or, with none, their people's emblem;
// and in a fight each of the company's own is drawn by that same face. The setting-independent check every walk runs
// at every turn: each breach said, by whom and where it was drawn otherwise.
export class CompanyFaces {
  static of(campaign: Campaign, screen: Screen, combat?: CombatScreen): string[] {
    const out: string[] = [], actor = campaign.playerActor;
    const read = campaign.readout, world = campaign.world;
    const joined = actor && world.relates('travelsWith')
      ? world.related('travelsWith').filter(r => r.args[1] === actor).map(r => r.args[0]!) : [];
    for (const id of joined) {
      const creature = read.inhabitants[id]?.[0] ?? `${id}_person`, m = screen.party.find(x => x.id === creature);
      if (!m) { continue; }
      const row = screen.people.find(p => p.member === m.id), face = Portraits.member(m)?.src;
      if (!row) { out.push(`${m.name}: of the company, and not on the scene`); continue; }
      if (row.portrait?.src !== (face && (m.portrait?.src ?? m.face?.medium))) {
        out.push(`${m.name}: on the scene by ${row.portrait?.src ?? row.emblem ?? 'nothing'}, on their page by ${face ?? 'none'}`);
      }
    }
    for (const ally of combat?.allies ?? []) {
      const m = screen.party.find(x => x.id === ally.id);
      if (m && ally.face?.src !== Portraits.member(m)?.src) {
        out.push(`${m.name}: in the fight by ${ally.face?.src ?? 'none'}, on their page by ${Portraits.member(m)?.src ?? 'none'}`);
      }
    }
    return out;
  }
}
