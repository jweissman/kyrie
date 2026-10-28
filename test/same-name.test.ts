import { describe, expect, it } from 'bun:test';
import { ModuleAssembly } from '../src/campaign/module-assembly';

// A sick child's mother and her elder sister were both Hadarai (play 9): two of one story drawn the same name are told
// apart as a family tells them.
describe('two of one story with one name', () => {
  it('calls the later the younger', () => {
    expect(ModuleAssembly.named({ mother: { name: 'Hadarai', raceId: 'elf' }, sister: { name: 'Hadarai', raceId: 'elf' } }))
      .toEqual({ mother: { name: 'Hadarai', raceId: 'elf' }, sister: { name: 'Hadarai the younger', raceId: 'elf' } });
    expect(ModuleAssembly.named({ wife: { name: 'Aldith' }, son: { name: 'Osric' } }))
      .toEqual({ wife: { name: 'Aldith' }, son: { name: 'Osric' } });
  });
});
