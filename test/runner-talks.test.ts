import { describe, expect, it } from 'bun:test';
import { RunnerOffer } from '../src/cli/runner-offer';
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
    // His talk is one row, the engine's own for him (MT-18), by what it does: led with the question the notice sent the
    // company to ask him, the old quarry (OR-199), else his talk (talk_to, a greeting). His own had been lost behind
    // the four (MT-15: the fifth led, Kynes's, offered nowhere).
    const talk = [...turn.offer.primary, ...turn.offer.rest].find(o => o.id === 'region__s1_innkeeper#talk');
    expect(talk && RunnerOffer.act(talk)).toBe('region__s1_u_spiders_job_ask');
    // Talked to, he is told, not the taproom again, and what can be said to him leads, talk before trade ("Talk to
    // the factor" had told the green whole: cold play 4, CL-49).
    const his = said(await r.ask(JSON.stringify({ act: talk!.id })));
    expect(his.scene.lines.join(' ')).toMatch(/Nobody goes in the old quarry now,’ says Kynes/);
    // (Kynes's word that a lone warrior should take someone, and who, names the taproom: OR-412. Not the room retold.)
    expect(his.scene.lines.join(' ').replace(/Kynes looks you over\..*?take someone with you\.’/, ''))
      .not.toContain('the taproom of the Stone Horn');
    // What can be said to him is the engine's question (OR-1451), as the page draws it: a page of it at a time, the
    // next by its own row (focus:page), what is had of him for coin under Trade (focus:trade:on), talk before trade.
    // (Asked from the place, his question leaves the company where it stands; turned to, his talk is open.)
    const opened = said(await r.ask(JSON.stringify({ act: 'talk:region__s1_innkeeper' })));
    const pages: Said[] = [opened];
    for (let n = 0; n < 8; n++) {
      const next = pages.at(-1)!.offer.primary.find(o => o.does?.startsWith('focus:page:'));
      const page = next && said(await r.ask(JSON.stringify({ act: next.does })));
      if (!page || page.offer.primary.map(o => o.id).join() === opened.offer.primary.map(o => o.id).join()) { break; }
      pages.push(page);
    }
    const all = pages.flatMap(p => [...p.offer.primary, ...p.offer.rest]), labels = all.map(o => o.label);
    expect(labels).toContain('Ask Kynes about the drover the customs-men hold');
    expect(labels.filter(l => /^Ask Kynes/.test(l)).length).toBeGreaterThan(2);
    expect(all.some(o => o.does === 'focus:trade:on')).toBe(true);
    const trading = said(await r.ask(JSON.stringify({ act: 'focus:trade:on' })));
    expect(trading.offer.primary.some(o => /^buy_item\(region__s1_innkeeper_/.test(RunnerOffer.act(o)))).toBe(true);
    said(await r.ask(JSON.stringify({ act: 'focus:trade:off' })));
    // (A question to him led among the four is titled short, "Kynes: what is out in the country round": OR-802.)
    expect(opened.offer.primary.filter(o => /^(Ask Kynes|Kynes: )/.test(o.label)).length).toBeGreaterThan(0);
    // What he has heard of far places is one question, as the page asks it (CL-67): the word of the country and the
    // lands beyond had stood as thirteen asks, each by name, in the runner's rows where the page asked him once.
    expect([...new Set(all.filter(o => /^ask\(|_beyond_told_/.test(RunnerOffer.act(o))).map(o => o.label))])
      .toEqual(['Ask Kynes for news']);
    // And what is done with the things carried is in the pack, not the rest (CL-67): set down, given across.
    expect(all.filter(o => /^(put_item|transfer_item)\(/.test(RunnerOffer.act(o)))).toEqual([]);
    const pack = said(await r.ask(JSON.stringify({ lens: 'pack' })));
    expect([...pack.offer.primary, ...pack.offer.rest].some(o => /^Set down /.test(o.label))).toBe(true);
    // Asked something, the talk holds (the session's focus); gone elsewhere, it is folded again.
    said(await r.ask(JSON.stringify({ act: 'region__s1_keeper_debts' })));
    expect(r.session.focus).toMatchObject({ kind: 'talk', with: 'region__s1_innkeeper' });
    const out = said(await r.ask(JSON.stringify({ act: 'go(region__s1_inn_door,region__s1_green)' })));
    expect(out.offer.rest.filter(o => /^Ask Kynes/.test(o.label))).toEqual([]);
  }, 180000);
});
