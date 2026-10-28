import { describe, expect, it } from 'bun:test';
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { AdventureNames } from '../src/cli/adventure-names';
import { KyrLint } from '../src/cli/kyr-lint';

describe('the names of the adventures one world holds', () => {
  // One world holds every authored adventure, so no two of them may give one name to different people or places
  // (see AdventureNames): a surname, or a proper place-name, is one adventure's own.
  it('are each one adventure\'s own: no surname or proper place-name given in two', () => {
    expect(AdventureNames.clashes()).toEqual([]);
  });
  // A clash was found only by this test, late (the Liberty of the Ice's 26); the lint says it as an author drafts.
  it('are checked by the lint, which says whose they are', async () => {
    const root = mkdtempSync(join(tmpdir(), 'kyrie-names-'));
    try {
      for (const [a, who] of [['corrow', 'Agnes Coyle'], ['ghessil', 'Dennet Coyle']] as const) {
        mkdirSync(join(root, a));
        writeFileSync(join(root, a, 'people.kyr'), `Module ${a} "A" {\n  Person p "${who}" at here { Role "a carter". }\n}\n`);
      }
      expect(AdventureNames.clashes(root)).toEqual(['Person: Coyle: Agnes Coyle (corrow), Dennet Coyle (ghessil)']);
    } finally { rmSync(root, { recursive: true, force: true }); }
    expect((await KyrLint.run(['test/fixtures/probes/pains/probe.campaign.json'])).names).toEqual([]);
  }, 60000);
  // A kind of thing an adventure declares (Kind letter_kind "a letter" is gear) is one catalog's for the whole game:
  // What Tessary Owes and A Parliament of Books each declared a letter_kind, and a career that went from Tessary to
  // Calamy could not install Calamy (the library tour, seed kite).
  it('declare each kind of thing as one adventure\'s own', () => {
    const by = new Map<string, Set<string>>();
    for (const adventure of readdirSync('data/adventures', { withFileTypes: true }).filter(d => d.isDirectory())) {
      for (const file of readdirSync(`data/adventures/${adventure.name}`).filter(f => f.endsWith('.kyr'))) {
        const text = readFileSync(`data/adventures/${adventure.name}/${file}`, 'utf8');
        for (const m of text.matchAll(/^\s*Kind (\w+) "/gm)) {
          by.set(m[1]!, new Set([...by.get(m[1]!) ?? [], adventure.name]));
        }
      }
    }
    expect([...by].filter(([, where]) => where.size > 1).map(([k, where]) => `${k}: ${[...where].join(', ')}`)).toEqual([]);
  });
});
