// The objective-target findings of CampaignLint.targets over every recommended campaign, one at a time.
const W = '/var/tmp/kyrie/wt-m21-play/src';
process.chdir('/var/tmp/kyrie/wt-m21-play');
const { PlaySession } = await import(`${W}/session/play-session.ts`);
const { NodeBundleSource } = await import(`${W}/campaign/node-bundle-source.ts`);
const { CampaignLint } = await import(`${W}/cli/campaign-lint.ts`);
const { KyrLint } = await import(`${W}/cli/kyr-lint.ts`);
let n = 0;
for (const path of KyrLint.recommended.filter((p: string) => !process.argv[2] || p.includes(process.argv[2]))) {
  const lint = new CampaignLint(path, await PlaySession.start(path, 'lint', NodeBundleSource.shared));
  lint.targets();
  for (const f of lint.findings) { n++; console.log(`${f.level} ${path.replace(/^data\/campaigns\//, '')}: ${f.message}`); }
}
console.log('target findings', n);
