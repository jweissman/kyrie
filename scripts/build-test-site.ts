import { SiteBuild } from '../src/cli/site-build';

// The page the browser specs play, built once, with every fixture, for KYRIE_SITE (see test/support/test-site.ts).
const out = process.argv[2];
if (!out) { throw new Error('Usage: bun scripts/build-test-site.ts <directory>'); }
const started = performance.now();
await SiteBuild.site(out, { fixtures: true });
console.log(`Built ${out} in ${((performance.now() - started) / 1000).toFixed(1)} s`);
