import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

// The authored files a campaign reads through its bundle source, for the browser. The catalogs are imported by the
// engine directly, and the Orsino sources are only for the registry tools, so neither is bundled again.
export class AssetCatalog {
  static readonly skipped = /^(catalog|sources)\//;
  static async write(root: string) {
    const paths = (await readdir(join(root, 'data'), { recursive: true }))
      .filter(p => /\.(json|kyr)$/.test(p) && !AssetCatalog.skipped.test(p)).sort();
    const files: Record<string, string> = {};
    for (const path of paths) { files[`data/${path}`] = await readFile(join(root, 'data', path), 'utf8'); }
    await writeFile(join(root, 'web/bundles.generated.json'), JSON.stringify(files));
  }
}
