#!/usr/bin/env bun
// Builds the static site. `--serve` is a local preview convenience only; playing needs no server.
import { resolve } from 'node:path';
import { SiteBuild } from '../src/cli/site-build';

const out = resolve(SiteBuild.root, process.env.KYRIE_SITE_DIR ?? 'site');
const size = await SiteBuild.site(out);
console.log(`Built ${out} (${(size / 1024).toFixed(0)} KiB of scripts and maps)`);
if (process.argv.includes('--serve')) {
  const port = Number(process.env.PORT ?? 8080);
  Bun.serve({ port, fetch: SiteBuild.serve.bind(SiteBuild, out) });
  console.log(`Previewing http://localhost:${port}/ — static files only.`);
}
