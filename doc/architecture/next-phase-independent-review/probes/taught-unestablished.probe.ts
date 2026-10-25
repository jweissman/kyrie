import { WorldAssembler } from '../../../../src/world/world-assembler';
import { NodeBundleSource } from '../../../../src/campaign/node-bundle-source';
import { PlaySession } from '../../../../src/session/play-session';
import { ModuleWriter } from '../../../../src/lang/module-writer';

for (const seed of ['a1', 'thorn', 'wren']) {
  const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared);
  const s = await PlaySession.start(w.path, seed, w.source);
  const m = s.campaign.module, wd = s.campaign.world;
  const taught = new Set((m.observations ?? []).filter(o => o.teaches).map(o => o.teaches!));
  const bad = [...taught].filter(f => !wd.test(ModuleWriter.call('established', f)));
  console.log(seed, 'facts taught by observations:', taught.size, 'not established:', bad.length, bad.slice(0, 8));
}
