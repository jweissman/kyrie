import { describe, expect, it } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MenuModel } from '../web/reader/menu-model';
import { WorldStage } from '../web/reader/stage/world-stage';
import type { Frame } from '../web/engine/protocol';
import type { AppState, ReaderApp } from '../web/reader/reader-app';
import { Glanced } from './support/glanced';

// The page as the map's card sees it.
class Page {
  constructor(public state: AppState) {}
  get menu() { return MenuModel.build(this.state.frame, 'here', this.state.open); }
  get app(): ReaderApp { return this as unknown as ReaderApp; }
}

// The fresh playtest of 7 November: set out from Karir for a lone tower, the journey stopped at Ramrehes, a town on
// the way, and the map's card said only "You are at Ramrehes. You stand at its gate."; a second Set out went on. A
// journey stopped at a town says why, as one stopped in open country does, and is gone on with from the card.
describe('a journey stopped at a town on the way', () => {
  it('says why on the town\'s card, and goes on from there', async () => {
    const g = await Glanced.country('kite'), screen = g.screen;
    const town = screen.region!.areas.find(a => a.kind === 'settlement' && a.here)!;
    const far = [...screen.destinations ?? [], ...screen.roads ?? []].find(d => /^region__s\d+$/.test(d.id)
      && d.id !== town.id)!;
    const frame: Frame = { ...g.frame(),
      travel: { to: far.name, arrived: false, stopped: 'Something is going on here', legs: [] },
      bound: { id: far.id, name: far.name, minutes: far.minutes, legs: far.legs } } as Frame;
    const page = new Page({ frame, view: 'here', open: [], cursor: 0, member: '' } as unknown as AppState);
    const card = renderToStaticMarkup(createElement(WorldStage.Town, { app: page.app, screen, town }));
    expect(card).toContain('You are at');
    expect(card).toContain(`On the way to ${far.name}: Something is going on here.`);
    expect(card).toContain(`Go on to ${far.name}`);
    // Come there, it says nothing of a journey.
    page.state = { ...page.state, frame: { ...frame, travel: { ...frame.travel!, arrived: true }, bound: undefined } };
    expect(renderToStaticMarkup(createElement(WorldStage.Town, { app: page.app, screen, town })))
      .not.toContain('On the way to');
  }, 120000);
});
