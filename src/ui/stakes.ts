import type { Campaign } from '../campaign/campaign';
import { ModuleWriter } from '../lang/module-writer';
import { ObservationText } from '../lang/observation-text';

// Whom and what the company has a stake in, met first wherever they are: its own family, and whoever and wherever an
// aim it holds now turns on, as the aim's condition or its words name them (Garret held in the vault; the bridge the
// father went out by). In a gate-yard of a chandler, a herb-wife, a whaler and the protagonist's brother, the brother
// had been fourth of four alike, and the bridge one of twelve ways (Mission 17, the place by salience).
export class Stakes {
  static of(campaign: Campaign): Set<string> {
    const w = campaign.world, ids = new Set<string>();
    for (const name of ['kinship', 'kin'].filter(n => w.relates(n))) {
      for (const r of w.related(name)) { ids.add(name === 'kin' ? r.args[1]! : r.args[0]!); }
    }
    for (const o of campaign.module.objectives ?? []) {
      if (!w.test(o.when)) { continue; }
      ModuleWriter.conditionCalls(o.when, call => { call.args.forEach(a => ids.add(a)); return call; });
      ObservationText.map(o.text, call => { call.args.forEach(a => ids.add(a)); return ''; }, id => { ids.add(id); return ''; });
    }
    return ids;
  }
}
