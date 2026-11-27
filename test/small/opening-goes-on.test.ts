import { describe, expect, it } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Prologue, type Told } from '../../src/presentation/prologue';
import { PrologueStage } from '../../web/reader/stage/prologue-stage';

// The opening's way on is the engine's (the owner's play, 27 November, OR-1682: "There's no interaction on the
// introduction page, even an 'okay…'"): every page read of it, the last one too, has one row to go on by, in the
// engine's words (Told.on: "Go on…"), drawn by the page and named by nothing of its own. The page had drawn a Continue
// of its own, and on the last page none at all while an act was pending; now it stands there, waiting, and is pressed
// once what was answered is told.
const told: Told = { title: 'The brothers\' errand', beats: ['You have the letter inside your coat.',
  'The first person you ask points the way to the priest.'], aim: 'Give the priest the letter.', on: Prologue.onward };
const drawn = (at: number, pending?: boolean) => renderToStaticMarkup(createElement(PrologueStage.View, { app: {
  state: { told, prologue: at, seed: 'fresh1', ...pending ? { pending: { said: 'Waiting' } } : {},
    frame: { screen: { dark: true, objectives: [] }, leaf: {} } },
  props: { query: new URLSearchParams() } } as never }));
const rows = (html: string) => [...html.matchAll(/<button[^>]*data-action="([^"]+)"[^>]*>(.*?)<\/button>/g)]
  .map(m => [m[1], m[2]!.replace(/<[^>]+>/g, ''), /disabled/.test(m[0])]);
describe('the opening\'s way on', () => {
  it('is the engine\'s one row, on every page read, in its words', () => {
    expect(Prologue.onward).toEqual({ id: 'go-on', label: 'Go on…' });
    expect(rows(drawn(0))).toEqual([['beat', 'Go on…', false]]);
    expect(rows(drawn(1))).toEqual([['go-on', 'Go on…', false]]);
    expect(drawn(1)).not.toContain('Continue');
  });
  it('stands on the last page while an act is pending, waiting', () => {
    expect(rows(drawn(1, true))).toEqual([['go-on', 'Go on…', true]]);
  });
});
