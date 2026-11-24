import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { Campaign } from '../../src/campaign/campaign';
import { NodeBundleSource } from '../../src/campaign/node-bundle-source';
import { Consequence } from '../../src/lang/consequence';
import '../../src/canon/setting-install';

// The acts and topics of every authored adventure that change nothing anything else asks after (AU-56, see
// Consequence), each as "work: why id" (an act's id, or a topic's marked "topic"), for test/small/inert-acts.
export class InertCensus {
  static readonly dir = 'data/campaigns';
  static async all(): Promise<Record<string, string[]>> {
    const out: Record<string, string[]> = {};
    for (const f of readdirSync(this.dir).filter(n => n.endsWith('.campaign.json')).sort()) {
      const c = await Campaign.load(join(this.dir, f), 'campaign', NodeBundleSource.shared);
      out[f.replace('.campaign.json', '')] = Consequence.census(c.module)
        .map(x => `${x.topic ? 'topic' : 'act'} ${x.why} ${x.id}`).sort();
    }
    return out;
  }
}
