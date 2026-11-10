import { rm, symlink } from 'node:fs/promises';
import { SiteBuild } from '../../src/cli/site-build';

// The page a browser spec plays, built for it, or, where the run has built one already (KYRIE_SITE: CI builds it once,
// before its browser specs, with every fixture), that one, linked where the spec would have built its own. Each of
// the twenty-six browser specs had built the whole site again for itself (the development-throughput review, 9
// November). Without KYRIE_SITE each builds its own, as before. Removing the spec's directory afterwards removes the
// link, never the page it points to.
export class TestSite {
  static async build(dir: string, options: { fixtures?: boolean } = {}): Promise<void> {
    const built = process.env.KYRIE_SITE;
    if (!built) { await SiteBuild.site(dir, options); return; }
    await rm(dir, { recursive: true, force: true });
    await symlink(built, dir, 'dir');
  }
}
