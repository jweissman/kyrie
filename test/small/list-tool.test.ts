import { describe, expect, it } from 'bun:test';
import { ListTool } from '../../src/cli/list-tool';
import { Canon } from '../../src/canon/canon';

// bin/kyrie list: what the game compiles, one a line (the owner, 26 November).
describe('bin/kyrie list', () => {
  const run = (...args: string[]) => {
    const lines: string[] = [], code = ListTool.main(args, l => lines.push(l));
    return { code, lines };
  };
  it('lists every background and profession the game draws on, one a line, by id', () => {
    const { code, lines } = run('professions');
    expect(code).toBe(0);
    expect(lines.length).toBe(Object.keys(Canon.backgrounds).length);
    expect(lines.every(l => !l.includes('\n') && Object.hasOwn(Canon.backgrounds, l.split('\t')[0]!))).toBe(true);
  });
  it('counts, keeps one kind, and names the kinds there are when none is of the one asked', () => {
    const spells = Object.values(Canon.abilities).filter(a => a.kind === 'spell').length;
    expect(run('spells', '--count').lines).toEqual([`${spells}`]);
    expect(run('professions', '--kind=water').lines.every(l => l.split('\t')[2] === 'water')).toBe(true);
    const none = run('items', '--kind=nothing');
    expect([none.code, none.lines[0]]).toEqual([1, expect.stringContaining('the kinds are: ')]);
  });
  it('says what lists there are, and fails on one there is not', () => {
    expect(run().lines.map(l => l.split('\t')[0])).toContain('professions');
    expect(run('nonsense').code).toBe(1);
  });
});
