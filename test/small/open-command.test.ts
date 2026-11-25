import { describe, expect, it } from 'bun:test';
import { OpenCommand } from '../../src/session/open-command';

// A command's phases, enforced (the external review of 25 November: OpenCommand had accepted a phase skipped, repeated
// or reached after its end): resolved → executed → (expanded) → told → settled → committed, or undone from any phase
// not yet ended; a follow committed as it is resolved; one receipt.
describe('an open command', () => {
  it('goes through its phases in order to one receipt', () => {
    const c = new OpenCommand('look');
    for (const p of ['executed', 'expanded', 'told', 'settled'] as const) { c.reach(p); }
    expect([c.ended, c.receipt(3, 'success'), c.ended, c.phase])
      .toEqual([false, { id: 'look', revision: 3, outcome: 'success' }, true, 'committed']);
    expect(() => c.receipt(4, 'success')).toThrow(/committed cannot follow committed/);
  });
  it('is committed as it is resolved where it is an aim followed, and told without anything drawn beyond', () => {
    expect(new OpenCommand('follow:x').receipt(1, 'success').outcome).toBe('success');
    const c = new OpenCommand('wait'); c.reach('executed'); c.reach('told');
    expect(c.phase).toBe('told');
  });
  it('is undone from any phase not yet ended, and nothing follows', () => {
    const c = new OpenCommand('fight'); c.reach('executed');
    expect(c.receipt(2, 'undone').outcome).toBe('undone');
    expect(() => c.reach('told')).toThrow(/told cannot follow undone/);
  });
  it('refuses a phase skipped or repeated', () => {
    const c = new OpenCommand('go');
    expect(() => c.reach('told')).toThrow(/told cannot follow resolved/);
    c.reach('executed');
    expect(() => c.reach('executed')).toThrow(/executed cannot follow executed/);
    expect(() => c.reach('settled')).toThrow(/settled cannot follow executed/);
  });
});
