import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { NewTool } from '../src/cli/new-tool';
import { VerifyTool } from '../src/cli/verify-tool';

// The author's path (the owner, 20 November: an adventure-writing agent missed verify, reach, voice repeats and the
// name lint): `kyrie new` says it after scaffolding and keeps it in the adventure's notes; `kyrie verify` runs it whole
// and ends with the evidence kept apart. Here an adventure with one topic nobody can be offered and one surname another
// adventure gives already: both said, and human play said not recorded.
class Path {
  // A file of the adventure's module, named among its sources.
  static async add(root: string, adventure: string, file: string, lines: string[]) {
    await writeFile(join(root, 'data/adventures', adventure, file), `${lines.join('\n')}\n`);
    const manifest = join(root, 'data/adventures', adventure, 'module.json');
    const m = JSON.parse(await readFile(manifest, 'utf8')) as { source: string[] };
    await writeFile(manifest, JSON.stringify({ ...m, source: [...m.source, file] }, null, 2));
  }
}
describe('the author\'s path', () => {
  let root = '';
  beforeAll(async () => {
    root = await mkdtemp(join(tmpdir(), 'kyrie-path-'));
    await mkdir(join(root, 'data'));
    for (const d of ['rules', 'imbar']) { await symlink(resolve('data', d), join(root, 'data', d)); }
    await symlink(resolve('src'), join(root, 'src'));
    await symlink(resolve('bunfig.toml'), join(root, 'bunfig.toml'));
  });
  afterAll(async () => { await rm(root, { recursive: true, force: true }); });
  it('is said by kyrie new, and kept in the notes', async () => {
    const said: string[] = [];
    expect(await NewTool.main(['wellspring', 'Wellspring'], root, l => said.push(l))).toBe(0);
    const path = said.slice(said.findIndex(l => l.startsWith('The author\'s path')));
    expect(path.map(l => l.trim().split(/\s+/).slice(0, 3).join(' '))).toEqual(expect.arrayContaining([
      'bin/kyrie names <Surname>', 'bin/kyrie lint data/campaigns/wellspring.campaign.json',
      'bin/kyrie reach data/campaigns/wellspring.campaign.json', 'bin/kyrie voice repeats', 'bin/kyrie verify wellspring']));
    expect(await readFile(join(root, 'data/adventures/wellspring/NOTES.md'), 'utf8')).toContain('bin/kyrie verify wellspring');
  }, 60000);
  it('is run whole by kyrie verify: the topic never offered and the name reused said, and no human play', async () => {
    await NewTool.main(['otherfold', 'Otherfold'], root, () => undefined);
    await Path.add(root, 'otherfold', 'people.kyr', ['Module otherfold "Otherfold" {',
      '  Person agnes "Agnes Coyle" at square { Role "a woman at the gate". Pronouns she. Peaceable. }', '}']);
    // Ours: Mary Coyle (a surname Otherfold gives), with one thing to ask her and one that can never be asked.
    await Path.add(root, 'wellspring', 'well.kyr', ['Module wellspring "Wellspring" {',
      '  Person mary "Mary Coyle" at square { Role "a woman at the well". Pronouns she. Peaceable. }',
      '  Topic mary_well with mary "Ask Mary about the well" when true once { Says "\'Deep,\' says Mary.". }',
      '  Topic mary_never with mary "Ask Mary about the sealed door" when false once { Says "\'Hush,\' says Mary.". }',
      '}']);
    const said: string[] = [];
    expect(await VerifyTool.main(['wellspring', '--steps', '120'], root, l => said.push(l))).toBe(1);
    const text = said.join('\n');
    expect(text).toMatch(/name: Person: Coyle: .*\(otherfold\).*\(wellspring\)|name: Person: Coyle: .*\(wellspring\)/);
    expect(said).toContain('  human play: no human play recorded');
    expect(said.find(l => l.startsWith('    topics:'))).toContain('mary_never');
    expect(said.find(l => l.startsWith('    topics:'))).not.toContain('mary_well');
    // Each kind of evidence for itself, and the names to mend.
    for (const kind of ['compiled:', 'tests:', 'explored:', 'human play:']) {
      expect(said.some(l => l.trim().startsWith(kind))).toBe(true);
    }
    expect(said.at(-1)).toMatch(/^wellspring: .*names \(1 reused\).* to mend$/);
  }, 240000);
});
