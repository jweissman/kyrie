import { describe, expect, it } from 'bun:test';
import type { MouseEvent } from 'react';
import { EncyclopediaOverlay } from '../web/reader/encyclopedia-overlay';
import type { ReaderApp } from '../web/reader/reader-app';

// An entry opened in play is opened over the game, not followed out of it (the owner's play of 10 November); off play
// (the title) a link is a link.
describe('the encyclopedia, from a game', () => {
  const click = (href: string) => {
    const a = { getAttribute: () => href };
    const target = { closest: (sel: string) => sel.includes('encyclopedia/') ? a : null };
    let stopped = false;
    const e = { target, preventDefault: () => { stopped = true; } } as unknown as MouseEvent;
    return { e, stopped: () => stopped };
  };
  const app = (phase: string) => {
    const set: Record<string, unknown>[] = [];
    const setState = (x: Record<string, unknown>) => set.push(x);
    return { app: { state: { phase }, setState } as unknown as ReaderApp, set };
  };
  it('opens an entry over the game in play', () => {
    const { app: a, set } = app('play'), c = click('encyclopedia/index.html?id=item-battleaxe');
    EncyclopediaOverlay.caught(a, c.e);
    expect([c.stopped(), set]).toEqual([true, [{ entry: 'encyclopedia/index.html?id=item-battleaxe' }]]);
  });
  it('lets a link be a link on the title', () => {
    const { app: a, set } = app('title'), c = click('encyclopedia/index.html');
    EncyclopediaOverlay.caught(a, c.e);
    expect([c.stopped(), set]).toEqual([false, []]);
  });
});
