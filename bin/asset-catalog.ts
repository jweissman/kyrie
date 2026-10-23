import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

// The authored files a campaign reads through its bundle source, for the browser. The catalogs are imported by the
// engine directly, and the Orsino sources are only for the registry tools, so neither is bundled again.
export class AssetCatalog {
  static readonly skipped = /^(catalog|sources|paintings)\//;
  // The files under each directory, by repository path: data/, and for browser tests the fixtures too.
  static async files(root: string, dirs = ['data']): Promise<Record<string, string>> {
    const files: Record<string, string> = {};
    for (const dir of dirs) {
      const paths = (await readdir(join(root, dir), { recursive: true }))
        .filter(p => /\.(json|kyr)$/.test(p) && !(dir === 'data' && AssetCatalog.skipped.test(p))).sort();
      for (const path of paths) { files[`${dir}/${path}`] = await readFile(join(root, dir, path), 'utf8'); }
    }
    return files;
  }
  static async write(root: string) {
    await writeFile(join(root, 'web/bundles.generated.json'), JSON.stringify(await this.files(root)));
  }
}
