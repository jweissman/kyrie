// Probe: is the committed web/bundles.generated.json the same as what the build would write from data/ now?
import { AssetCatalog } from '../../../../src/cli/asset-catalog';
const root = new URL('../../../../', import.meta.url).pathname;
const fresh = await AssetCatalog.files(root);
const kept = await Bun.file(`${root}web/bundles.generated.json`).json() as Record<string, string>;
const keys = new Set([...Object.keys(fresh), ...Object.keys(kept)]);
const diff = [...keys].filter(k => fresh[k] !== kept[k]);
console.log(`${keys.size} files; ${diff.length} differ`);
for (const k of diff.slice(0, 15)) { console.log(' ', k, k in kept ? (k in fresh ? 'changed' : 'only in snapshot') : 'missing from snapshot'); }
