import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export class AssetCatalog {
  static async write(root: string) {
    const paths = (await readdir(join(root, 'data'), { recursive: true }))
      .filter(p => /\.(json|kyr)$/.test(p)).sort();
    const files: Record<string, string> = {};
    for (const path of paths) { files[`data/${path}`] = await readFile(join(root, 'data', path), 'utf8'); }
    await writeFile(join(root, 'web/bundles.generated.json'), JSON.stringify(files));
  }
}
