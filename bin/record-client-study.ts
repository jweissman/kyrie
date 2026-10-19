import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import { mkdir } from 'node:fs/promises';

// Author evidence for the bounded client fixture; no runtime construction or narration is duplicated here.
export class ClientStudyRecord {
  static async run() {
    const out = 'doc/playtests/lantern-road'; await mkdir(out, { recursive: true });
    const s = await PlaySession.start('data/client-study/campaign.json', 'censer', NodeBundleSource.shared);
    await Bun.write(`${out}/fixture.dossier.json`, JSON.stringify({
      status: 'Implemented interface fixture, not the proposed complete Serewater region',
      seed: s.seed, manifest: s.scenario,
      packageSources: ['data/client-study/campaign.json', 'data/client-study/module.json',
        'data/client-study/journey.kyr', 'data/client-study/templates.json', 'data/orra/tables.json',
        'data/default/templates/deem.templates.json'],
      provenanceLimit: 'Package-level source index; not a complete per-expression generation trace',
      world: s.campaign.world.snapshot, entities: s.campaign.module.entities,
      creatures: s.campaign.state.creatures, actors: s.campaign.actors,
    }, null, 2));
    await Bun.write(`${out}/fixture.lowered.kyr`,
      ModuleWriter.write({ ...s.campaign.module, actions: s.campaign.schemas }));
    const path = `${out}/journey.browser`;
    if (await Bun.file(`${path}.save.json`).exists()) {
      const checkpoint = await Bun.file(`${path}.save.json`).json();
      const expected = PlaySession.resume(checkpoint).canonical();
      const child = Bun.spawn(['bun', 'bin/kyrie.ts', 'replay', `${path}.replay.json`],
        { stdout: 'pipe', stderr: 'pipe' });
      const [actual, error, code] = await Promise.all([new Response(child.stdout).text(),
        new Response(child.stderr).text(), child.exited]);
      if (code || expected.trim() !== actual.trim()) { throw new Error(`Browser/CLI mismatch: ${error}`); }
      console.log('Actual client browser checkpoint matches CLI replay.');
    }
    console.log(`Wrote fixture dossier and lowered source to ${out}.`);
  }
}
if (import.meta.main) { await ClientStudyRecord.run(); }
