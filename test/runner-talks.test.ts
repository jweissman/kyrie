import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Runner, type Said } from '../src/cli/runner';

// What can be said to someone is under their talk, as the page holds it (CL-07, the cold plays: 30 asks to six people
// in the rest at the Stone Horn's taproom, 86 rows): one row a person in the rest, and talking to them answers with
// what can be said to them, what is had of them for coin after.
const said = (x: Said | { error: string }): Said => { if ('error' in x) { throw new Error(x.error); } return x; };

describe('the runner holds what is said to someone under their talk', () => {
  it('at the Stone Horn, with Kynes and five others', async () => {
    const r = new Runner(await DrawnWorld.start('iscoed', { origin: 'drove',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] }, NodeBundleSource.shared));
    said(await r.ask(JSON.stringify({ act: 'region__s1_u_notice_read(party,region__s1_green)' })));
    const turn = said(await r.ask(JSON.stringify({ act: 'go(region__s1_inn_door,region__s1_taproom)' })));
    expect(turn.offer.rest.filter(o => /^Ask Kynes/.test(o.label))).toEqual([]);
    expect(turn.offer.rest.length).toBeLessThan(60);
    expect(turn.offer.rest.find(o => o.id === 'talk:region__s1_innkeeper')?.label).toBe('Talk to Kynes');
    // Turned to (no time), what can be said to him leads the rest, talk before trade.
    const his = said(await r.ask(JSON.stringify({ act: 'talk:region__s1_innkeeper' })));
    const labels = his.offer.rest.map(o => o.label);
    expect(labels).toContain('Ask Kynes about the drover the customs-men hold');
    expect(labels.slice(0, 3).every(l => /^Ask Kynes/.test(l))).toBe(true);
    // Asked something, the talk holds; gone elsewhere, it is folded again.
    const asked = said(await r.ask(JSON.stringify({ act: 'region__s1_keeper_debts' })));
    expect(asked.offer.rest.some(o => o.label === 'Ask Kynes about the drover the customs-men hold')).toBe(true);
    const out = said(await r.ask(JSON.stringify({ act: 'go(region__s1_inn_door,region__s1_green)' })));
    expect(out.offer.rest.filter(o => /^Ask Kynes/.test(o.label))).toEqual([]);
  }, 180000);
});
