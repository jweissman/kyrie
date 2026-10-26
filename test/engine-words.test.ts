import { describe, expect, it } from 'bun:test';
import { EngineHost } from '../web/engine/engine-host';
import type { Entry } from '../web/engine/protocol';
import { ChoiceList } from '../src/ui/choice-list';
import type { Screen } from '../src/ui/screen-types';

// What was done is worded by the engine (the architecture review's H2): the page sends only what it chose, and the
// story keeps the engine's words for it, a way by the label the engine's own screen gave it.
describe('what was done', () => {
  it('is worded by the engine, not the page', async () => {
    const host = new EngineHost(() => undefined);
    const inner = host as unknown as { log: Entry[]; screen: Screen;
      said(command: string): { said: string; move: boolean; named: boolean } };
    const campaign = 'data/campaigns/the-long-man.campaign.json';
    const setting = await host.handle({ kind: 'setting', campaign }) as { party: never[] };
    await host.handle({ kind: 'begin', campaign, seed: 'merrow', party: setting.party });
    const way = ChoiceList.ways(inner.screen.exits).choices.find(c => c.command)!;
    expect(inner.said(way.command!)).toEqual({ said: way.label, move: true, named: false });
    expect(inner.said('wait')).toEqual({ said: '', move: false, named: true });
    await host.handle({ kind: 'perform', command: 'wait' });
    expect(inner.log.at(-1)!.said).toBeTruthy();
  }, 240000);
});
