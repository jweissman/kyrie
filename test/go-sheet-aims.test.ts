import { beforeAll, describe, expect, it } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { ModuleWriter } from '../src/lang/module-writer';
import { Undertakings } from '../src/presentation/undertakings';
import type { Change } from '../src/lang/module';
import { MenuModel } from '../web/reader/menu-model';
import { Act } from '../web/reader/stage/act';
import { Wayfinder } from '../web/reader/stage/wayfinder';
import type { AppState, ReaderApp } from '../web/reader/reader-app';
import { Glanced } from './support/glanced';

// The page as Go… sees it, where the company stands now.
class Page {
  constructor(public state: AppState) {}
  static at(g: Glanced): Page {
    return new Page({ frame: g.frame(), view: 'here', open: [], cursor: 0, member: '' } as unknown as AppState);
  }
  get menu() { return MenuModel.build(this.state.frame, 'here', this.state.open); }
  get app(): ReaderApp { return this as unknown as ReaderApp; }
  ways() { return Wayfinder.ways(this.app); }
  chosen() { return Wayfinder.chosen(this.app, this.ways()); }
  // What the sheet says of the way chosen: what it is to your aims, and its name.
  said(): string[] {
    const html = renderToStaticMarkup(createElement(Wayfinder.View, { app: this.app, draw: Act.draw(this.app) }));
    const preview = /<aside class="wf-preview"[\s\S]*?<\/aside>/.exec(html)?.[0] ?? '';
    return [/class="wf-aim">([^<]*)</.exec(preview)?.[1] ?? '', /<h3>([^<]*)<\/h3>/.exec(preview)?.[1] ?? ''];
  }
}

// The fresh playtest of 7 November, in Karir: the priest's crypt job named the crypt under the churchyard, and Go…
// never named the churchyard (it sat in the waterside quarter, folded into the quarter's one row, unmarked); from the
// shrine the aim's mark led to the landing, the first leg of the way round, and at the landing nothing was marked; and
// in the chandlery the corn-store of another aim stood alone as "your aim" under "Following: the crypt". A place an
// aim names is findable from Go…: listed by its own name where it lies in another quarter, the aim followed's way
// chosen first and called your aim, another aim's called so.
describe('Go… and the places the aims name', () => {
  let g: Glanced;
  beforeAll(async () => {
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Sable', raceId: 'catfolk', classId: 'cleric' } as never] });
    g = Glanced.of(await PlaySession.start(w.path, 'kite', w.source));
    // About the town first, as a newcomer would go, so that its ways are known: the market, the waterside, the edge.
    for (const p of ['s1_chandlery', 's1_reedbeds', 's1_fields', 's1_scriv']) { await g.to(`region__${p}`); }
    // Then the priest's job taken: the crypt key, and the aim.
    const c = g.s.campaign as unknown as { world: { apply(c: Change[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('knows', 'party', 'region__s1_u_dead_job') },
      { kind: 'assert', call: ModuleWriter.call('region__s1_u_given', 'region__s1_u_dead_job') }]));
    // Followed, as the playtester followed it in the Notes.
    Undertakings.follow(g.s.campaign, 'region__s1_u_dead_job_aim');
  }, 120000);

  it('from the shrine, lists the churchyard itself and chooses it, not a first leg toward it', async () => {
    await g.to('region__s1_shrine');
    const page = Page.at(g), yard = page.ways().find(w => w.name === 'the churchyard');
    expect(yard?.group).toMatch(/^About /);
    expect([yard?.aim, page.chosen()?.name]).toEqual(['followed', 'the churchyard']);
    // Still under its quarter too, which goes to the quarter's heart.
    expect(page.ways().find(w => w.name === 'the waterside')?.holds).toContain('region__s1_u_yard');
    // The aim followed goes by the walk to the churchyard, and by nothing else.
    expect(g.glance.following).toEqual(['travel:region__s1_u_yard']);
    expect(page.said()).toEqual(['Your aim', 'The churchyard']);
  }, 60000);

  it('from the market-place, marks the churchyard\'s own way, not only its quarter', async () => {
    await g.to('region__s1_green');
    const page = Page.at(g);
    expect(page.ways().filter(w => w.aim).map(w => [w.name, w.aim])).toEqual([['the churchyard', 'followed']]);
    expect(page.chosen()?.c.command).toMatch(/^go\(.*region__s1_u_yard\)$/);
  }, 60000);

  it('in a shop of the market, says your aim of the crypt\'s way and another aim of another\'s', async () => {
    await g.to('region__s1_chandlery');
    const page = Page.at(g), aimed = page.ways().filter(w => w.aim);
    expect(aimed.map(w => [w.name, w.aim])).toEqual([['the churchyard', 'followed'], ['the green', 'held']]);
    expect(page.said()).toEqual(['Your aim', 'The churchyard']);
    page.state = { ...page.state, hovered: aimed[1]!.c.id };
    expect(page.said()).toEqual(['Another aim', 'The green']);
  }, 60000);
});
