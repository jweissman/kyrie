import { describe, expect, it } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Tiny } from '../support/tiny';
import { Told } from '../../web/reader/stage/told';
import type { ReaderApp } from '../../web/reader/reader-app';

// The roll of who is here is said apart by the narrator (Leaf.roll), and the page, which shows them by their
// likenesses, leaves out that line and no other: it had known the roll by its words, "… is here." or "Here are …",
// and so dropped an author's own line that ended so (AR-05: text inference in the page).
const yard = `
  Place yard "the mill yard" is room at 0, 0 outdoors.
  Company party "You" of 1 at yard.
  Person bask "Bask" at yard { Role "a corn-factor". Ancestry human. Peaceable. Pronouns he. }
  Thing cart "the miller's cart" at yard { State waiting "The miller's cart is here.". }
  Goal false.`;

describe('the roll of who is here', () => {
  it('is said apart, and the page leaves out only it', async () => {
    const t = await Tiny.start(yard), leaf = t.leaf;
    expect(leaf.roll).toBe('Bask, a corn-factor, is here.');
    expect(leaf.presence).toEqual(expect.arrayContaining([leaf.roll, 'The miller’s cart is here.']));
    const app = { state: { frame: { leaf } } } as unknown as ReaderApp;
    const page = renderToStaticMarkup(createElement(Told.Presence,
      { app, lines: leaf.presence, subjects: [], quiet: false }));
    expect(page).not.toContain('Bask, a corn-factor');
    expect(page).toContain('The miller’s cart is here.');
  });
});
