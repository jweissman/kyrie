import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { CampaignLint } from '../src/cli/campaign-lint';
import { KyrLint } from '../src/cli/kyr-lint';

// Every aim of every campaign the game offers has somewhere Follow this can lead: a place, or someone or something in
// one (the obligations audit, 15 November: about 56 aims in the authored provinces led nowhere, a gamebreaker; M21's
// PL-14). The lint's check, over the corpus, one campaign at a time; test/small/aim-target-lint holds the check itself.
describe('the aims of every recommended campaign', () => {
  it('each lead somewhere', async () => {
    const found: string[] = [];
    for (const path of KyrLint.recommended) {
      const lint = new CampaignLint(path, await PlaySession.start(path, 'lint', NodeBundleSource.shared));
      lint.targets();
      found.push(...lint.findings.map(f => `${path}: ${f.message}`));
    }
    expect(found).toEqual([]);
  }, 600000);
});
