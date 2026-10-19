import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';

// Developer export only: campaign execution and generation still belong to PlaySession/ModuleBundle.
export class CampaignDossier {
  static async write(manifest: string, seed: string, output: string) {
    const s = await PlaySession.start(manifest, seed, NodeBundleSource.shared), c = s.campaign;
    const catalog = ['canTrain', 'canCast', 'treatable', 'fieldUsable', 'persistentWard'];
    const dossier = { manifest, seed, construction: await Bun.file(manifest).json(),
      modules: c.installations, places: c.module.entities.filter(e => e.space),
      exits: c.module.entities.filter(e => e.exit), creatures: c.state.creatures,
      initial: { ...c.world.snapshot, relations: c.world.snapshot.relations.filter(r => !catalog.includes(r.name)) },
      capabilities: c.schemas.filter(a => a.resolve).map(a => ({ id: a.id, resolve: a.resolve })),
      note: 'Catalog-derived ability projections omitted; full canonical state is available in saves.',
    };
    await mkdir(output, { recursive: true });
    await writeFile(resolve(output, `${seed}.dossier.json`), JSON.stringify(dossier, null, 2));
    await writeFile(resolve(output, `${seed}.lowered.kyr`), ModuleWriter.write({ ...c.module, actions: c.schemas }));
  }
}
if (import.meta.main) {
  const [manifest, seed, output] = process.argv.slice(2);
  if (!manifest || !seed || !output) { throw new Error('Usage: campaign-dossier <campaign.json> <seed> <output-dir>'); }
  await CampaignDossier.write(manifest, seed, output);
}
