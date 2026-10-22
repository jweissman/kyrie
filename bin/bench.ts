import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { Campaign, type CampaignSave } from '../src/campaign/campaign';

// Reproducible timings for representative engine workloads. Usage: bun bin/bench.ts [--json]
class Bench {
  static rows: [string, number][] = [];
  static async time<T>(label: string, work: () => Promise<T> | T): Promise<T> {
    const start = performance.now(), result = await work();
    this.rows.push([label, performance.now() - start]);
    return result;
  }
  static async run() {
    const campaign = 'test/fixtures/march/serewater-march.campaign.json';
    await this.time('load (cold)', () => PlaySession.start(campaign, 'bench', NodeBundleSource.shared));
    const s = await this.time('load (warm)', () => PlaySession.start(campaign, 'bench', NodeBundleSource.shared));
    const choices = await this.time('choices', () => PlayerView.choices(s.campaign));
    await this.time('observe', () => PlayerView.observe(s.campaign));
    await this.time('go causeway (6 ticks)', () => s.perform('go(march__causeway_path,march__causeway)'));
    await this.time('wait x1', () => s.perform('wait'));
    await this.time('wait x6', async () => { for (let i = 0; i < 6; i++) { await s.perform('wait'); } });
    await this.time('camp', () => s.perform('camp(march__causeway)'));
    const save = await this.time('save + restore', () => {
      const saved = JSON.stringify(s.campaign.save());
      Campaign.restore(JSON.parse(saved) as CampaignSave);
      return saved;
    });
    const world = s.campaign.state.world;
    return { choices: choices.length, relations: world.relations.length, measures: world.measures.length,
      schemas: s.campaign.module.actions.length, rules: s.campaign.module.rules?.length ?? 0,
      elapsed: s.campaign.state.elapsed, saveBytes: save.length };
  }
}
const summary = await Bench.run();
if (process.argv.includes('--json')) { console.log(JSON.stringify({ rows: Bench.rows, ...summary })); }
else {
  for (const [label, ms] of Bench.rows) { console.log(`${label.padEnd(24)} ${ms.toFixed(0).padStart(7)} ms`); }
  console.log(summary);
}
