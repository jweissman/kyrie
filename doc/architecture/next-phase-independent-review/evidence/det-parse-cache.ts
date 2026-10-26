// Probe: a module text's parse depends on what kinds are in the process-global catalog when it is first parsed, and
// the parse caches (ModuleParser.parsed, ModuleBundle.parses) are keyed by text alone.
import { PlaySession } from '../../../../src/session/play-session';
import { NodeBundleSource } from '../../../../src/campaign/node-bundle-source';
import { ModuleParser } from '../../../../src/lang/module-parser';
import { LocalKinds } from '../../../../src/canon/local-catalog';

const text = 'Module later "Later" { Kind figurine "a figurine" like dreg_ox. }';
const tryParse = (label: string) => {
  try { const m = ModuleParser.parse(text); console.log(label, 'OK, figurine =', JSON.stringify(m.catalog?.items?.figurine).slice(0, 160)); }
  catch (e) { console.log(label, 'FAILED:', (e as Error).message.slice(0, 120)); }
};
if (process.argv[2] === 'warm') {
  await PlaySession.start('test/fixtures/probes/local-kind/probe.campaign.json', 'w', NodeBundleSource.shared);
  tryParse('after local-kind campaign loaded:');
  LocalKinds.reset();
  tryParse('after LocalKinds.reset() (no dreg_ox anywhere):');
} else { tryParse('cold process:'); }
