import { describe, expect, it } from 'bun:test';
import { Serve } from '../src/cli/serve';

// One game kept between requests (the forward-design record's second prototype): started once, then looked at and
// played by the page's own choice ids, its answers what the page draws from, made small; and kept, it plays on.
describe('a game served a line at a time', () => {
  it('starts once, plays by the page\'s ids, shows a card, and keeps', async () => {
    const serve = new Serve();
    const started = await serve.handle({ op: 'start', world: 'kahitude', origin: 'debt', as: 'human/warrior/Ralf' }) as
      { view: ReturnType<Serve['view']> };
    expect(started.view.at.id).toBe('region__s1_shop');
    const lead = started.view.led[0]!;
    expect(started.view.choices.some(c => c.id === (lead.for ?? lead.command))).toBe(true);
    const acted = await serve.handle({ op: 'act', id: lead.for ?? lead.command! }) as { result: string; told: string[] };
    expect([acted.result, acted.told.length > 0]).toEqual(['success', true]);
    const card = await serve.handle({ op: 'card', id: 'region__s1_merchant' }) as { card: { name: string } };
    expect(card.card.name).toBe('Tuck, woodwright');
    const kept = await serve.handle({ op: 'checkpoint' }) as { checkpoint: { version: number } };
    expect(kept.checkpoint.version).toBe(1);
    await expect(serve.handle({ op: 'nothing' })).rejects.toThrow('No such op');
  }, 120000);
});
