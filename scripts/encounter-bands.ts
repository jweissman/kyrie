import { readdirSync } from 'node:fs';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import type { Campaign } from '../src/campaign/campaign';
import { PlaySession } from '../src/session/play-session';
import { WorldAssembler } from '../src/world/world-assembler';
import { ForecastTool } from '../src/cli/forecast-tool';
import { NoviceCountry } from './novice-country';
import type { EncounterAudit, Row } from './encounter-audit';

// The bands the audit reads from the game itself: those of generated countries (deep sites, wild bands, placed
// troubles) and of the authored adventures and scenarios, as a campaign begun afresh holds them.
export class EncounterBands {
  static async rows(mode: string, run: { args: string[]; trials: number; only: string[] },
    audit: typeof EncounterAudit): Promise<Row[]> {
    const { args, trials, only } = run, rows: Row[] = [];
    if (mode === 'sites' || mode === 'scenarios') {
      const given = audit.option(args, 'seeds', mode === 'sites' ? '6' : 'a1,b2,kite,ash,wren,mere,thorn,cov2');
      const seeds = /^\d+$/.test(given) ? Array.from({ length: Number(given) }, (_, i) => `s${i + 1}`) : given.split(',');
      for (const seed of seeds) {
        const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared,
          { origin: 'debt', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
        const campaign = (await PlaySession.start(w.path, seed, w.source)).campaign;
        const country = NoviceCountry.read(campaign, seed);
        for (const b of country.bands) {
          const foes = this.creatures(campaign, b.members);
          if (!foes.length) { continue; }
          if (mode === 'scenarios' && b.installation === 'region') { continue; }
          rows.push(audit.row(`${seed}:${b.site ?? b.installation}`,
            { label: `${b.name} @${b.where}`, creatures: foes }, trials));
        }
      }
      return rows;
    }
    const dir = 'data/campaigns', files = readdirSync(dir).filter(f => f.endsWith('.campaign.json'));
    for (const f of files) {
      const id = f.replace(/\.campaign\.json$/, '');
      if (only.length && !only.includes(id)) { continue; }
      try {
        const path = `${dir}/${f}`;
        const campaign = (await PlaySession.start(path, 'audit', NodeBundleSource.shared)).campaign;
        for (const band of ForecastTool.bands(campaign)) {
          const foes = this.creatures(campaign, campaign.readout.inhabitants[band] ?? []);
          if (!foes.length) { continue; }
          const name = campaign.module.entities.find(e => e.id === band)?.name ?? band;
          rows.push(audit.row(id, { label: `${name} (${band})`, creatures: foes }, trials));
        }
      } catch (e) { console.error(id, String(e).slice(0, 100)); }
    }
    return rows;
  }
  private static creatures(campaign: Campaign, ids: string[]) {
    return ids.map(id => campaign.readout.creatures.find(c => c.id === id))
      .filter(c => !!c && c.state.hp > 0) as never[];
  }
}
