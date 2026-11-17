import { describe, expect, it } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Creation } from '../../web/engine/creation';
import { EngineCreation, type CreationState } from '../../web/engine/engine-creation';
import type { Setting } from '../../web/engine/protocol';
import type { ReaderApp } from '../../web/reader/reader-app';
import { CreationPage } from '../../web/reader/creation/creation-page';

// The page of making the protagonist is the engine's making as it holds it (EngineCreation's CreationState; the owner,
// 14 November: Kyrie the source of truth for the structure and progression of player workflows): its pages are the
// state's steps in its order (how you present asked on the name's page), each with the state's question, its deck the
// state's cards with the four the engine leads with first and the rest one quiet word away, the chosen one pressed.
// Beside test/creation-conformance, which holds the terminal and the page's worker to the same life.
const names = { human: { she: ['Wenna'], he: ['Odo'], they: ['Wren'] }, elf: { she: ['Ithil'], he: ['Lorin'], they: ['Aerin'] } };
const setting: Setting = { title: 'Merscfaenn', generated: true, pitch: { heading: '', text: '' },
  origins: [{ id: 'debt', title: 'A debt', choice: 'You owe money' }], names,
  party: [Creation.protagonist('elf', 'page', names)] };
const made = () => {
  const engine = new EngineCreation();
  engine.begun(setting, { campaign: 'world', seed: 'page' });
  return engine.state();
};
const app = (creation: CreationState) => ({
  state: { setting, catalog: Creation.catalog(), party: [creation.member], origin: creation.origin, creation },
  opening: { steps: () => creation.steps, choose: () => undefined } }) as unknown as ReaderApp;
const cards = (html: string) => [...html.matchAll(/<button[^>]*class="card[^"]*"[^>]*>/g)].map(m => m[0]);

describe('the engine\'s making, begun', () => {
  // Set out at once, a life comes by one of its country's circumstances, never none (a drawn country had begun in its
  // town square, with no origin, once the engine held the making); and the reason is not asked: the world gives it
  // (the owner, 17 November: diegetic starting circumstances, not an origin quest picked from a list).
  it('has a circumstance of the country to begin in, and does not ask for one', () => {
    expect(made().origin).toBe('debt');
    expect(made().steps.some(s => s.id === 'why')).toBe(false);
  });
});

describe('the page of making the protagonist', () => {
  it('is the engine\'s steps, in its order, with its questions', () => {
    const state = made();
    expect(CreationPage.steps(app(state)).map(s => [s.id, s.ask])).toEqual(state.steps.filter(s => s.id !== 'presenting')
      .map(s => [s.id, s.ask]));
  });
  it('draws each step\'s deck as the engine gives it: its four first, the rest a word away, the chosen pressed', () => {
    const state = made(), a = app(state);
    for (const step of CreationPage.steps(a).filter(s => s.cards.length > 0 && s.id !== 'name')) {
      const html = renderToStaticMarkup(createElement(step.View, { app: a, step })), shown = cards(html);
      const folds = step.cards.length > 5;
      expect([step.id, shown.length]).toEqual([step.id, folds ? 4 : step.cards.length]);
      expect([step.id, html.includes('data-action="more-cards"')]).toEqual([step.id, folds]);
      expect(shown.filter(c => c.includes('aria-pressed="true"')).length).toBe(step.chosen ? 1 : 0);
    }
  });
});
