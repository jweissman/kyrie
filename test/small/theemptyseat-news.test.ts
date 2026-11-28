import { describe, expect, it } from 'bun:test';
import { Content } from '../../src/content';
import type { DeemValue } from 'deem';
import { NodeBundleSource } from '../../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../../src/campaign/overlay-bundle-source';
import { Journey } from '../../src/session/journey';
import { PlaySession } from '../../src/session/play-session';
import { Knowing } from '../../src/presentation/knowing';
import { PlayerFrame } from '../../src/presentation/player-frame';
import tables from '../../data/adventures/theemptyseat/tables.json';
import templates from '../../data/adventures/theemptyseat/templates.json';

const directory = 'single/seat-news-proof';
const body = `Module village "A village hearing the city" {
  Place green "the village green" is room at 0, 0 outdoors.
  Place court "the city courtyard" is room at 1, 0 outdoors.
  Passage road "the road" is path between green and court.
  Company party "You" of 1 at green.
  Person keeper "Nell" at green { Role "the innkeeper". Peaceable. }
  Person herald "Rhun" at court { Role "the herald". Peaceable. }
  Action dispatch(actor: group, site: place) "Dispatch the herald's bulletin" {
    Requires able(actor) and at(actor, site) and not befell(ri_succession_open).
    Time 1 minute. On success { Assert befell(ri_succession_open). }
  }
  Action letters(actor: group, site: place) "Dispatch the letters bulletin" {
    Requires able(actor) and at(actor, site) and befell(ri_succession_open) and not befell(ri_evidence_kept).
    Time 1 minute. On success { Assert befell(ri_evidence_kept). }
  }
  Topic firsthand with herald "Hear the herald announce the vacancy" when befell(ri_succession_open) once {
    Says "Rhun names the dead king and calls the seven towers.".
    On discuss { Assert knows(actor, ri_succession_open). }
  }
}`;
const start = () => {
  const source = new OverlayBundleSource(NodeBundleSource.shared, {
    [`${directory}/site.kyr`]: body,
    [`${directory}/module.json`]: JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'],
      globals: ['party'], canon: ['ri_succession_open', 'ri_evidence_kept'],
      exports: { party: 'party', green: 'green', keeper: 'keeper', court: 'court', herald: 'herald' } }),
    [`${directory}/campaign.json`]: JSON.stringify({ version: 1, name: 'News proof', modules: [
      { id: 'village', bundle: 'module.json' },
      ...[['village-news', 'green', 'keeper'], ['court-news', 'court', 'herald']].map(([id, room, carrier]) => ({
        id, bundle: NodeBundleSource.shared.resolve('data/adventures/theemptyseat/news.module.json'),
        imports: { party: 'village.party', news_place: `village.${room}`, news_carrier: `village.${carrier}` },
      })),
    ] }),
  });
  return Journey.start(source.resolve(`${directory}/campaign.json`), 'news-proof', { source, strict: true });
};
const ask = 'Ask Nell for the latest news from Dun Rì';
const ready = async (j: Journey) => {
  await j.play("Dispatch the herald's bulletin", '=+3');
};

describe('the same drama through different channels', () => {
  it("does not offer tomorrow's paper or an omniscient rumour before a bulletin arrives", async () => {
    const j = await start();
    expect(j.find(ask)).toBeUndefined();
    expect(j.at('village-news__vacancy_issue')).toBeUndefined();
    await j.play("Dispatch the herald's bulletin", '=+2');
    expect(j.holds('befell', 'ri_succession_open')).toBe(true);
    expect(j.holds('knows', 'party', 'ri_succession_open')).toBe(false);
    expect(j.find(ask)).toBeUndefined();
    await j.play('=+1');
    expect(j.find(ask)).toBeDefined();
  });

  it('lets a village teller convey actual news without starting or resolving the next event', async () => {
    const j = await start();
    await ready(j);
    const row = PlayerFrame.of(j.campaign).rows.find(r => r.action.schema === 'village-news__ask_news')!;
    expect(Knowing.of(j.campaign).teaches(row.action)).toBe(true);
    const told = await j.play(ask);
    expect(told).toContain('confirmed bulletin');
    expect(j.holds('knows', 'party', 'ri_succession_open')).toBe(true);
    expect(j.holds('befell', 'ri_evidence_kept')).toBe(false);
    expect(j.holds('befell', 'ri_siege_begun')).toBe(false);
  });

  it('makes a carried tabloid teach the same fact and keeps old editions when new news arrives', async () => {
    const j = await start();
    await ready(j);
    await j.play('^Take');
    const headline = j.campaign.module.entities.find(e => e.id === 'village-news__vacancy_headline')!.name;
    expect(j.matches('^Read').length).toBe(1);
    expect(await j.play('Read .*vacancy')).toContain(headline);
    expect(j.holds('knows', 'party', 'ri_succession_open')).toBe(true);
    await j.play('Dispatch the letters bulletin', '=+3');
    expect(j.holds('carries', 'party', 'village-news__vacancy_issue')).toBe(true);
    expect(j.holds('knows', 'party', 'ri_evidence_kept')).toBe(false);
    const resumed = Journey.of(PlaySession.resume(j.session.checkpoint()), true);
    await resumed.play(ask);
    expect(resumed.holds('knows', 'party', 'ri_evidence_kept')).toBe(true);
    expect(resumed.holds('carries', 'party', 'village-news__vacancy_issue')).toBe(true);
    expect(resumed.find(ask)).toBeUndefined();
  });

  it('lets someone in the city hear the same event firsthand before the village receives it', async () => {
    const j = await start();
    await j.play("Dispatch the herald's bulletin", '>village__court', 'Hear the herald announce the vacancy');
    expect(j.holds('knows', 'party', 'ri_succession_open')).toBe(true);
    expect(j.at('village-news__vacancy_issue')).toBeUndefined();
    expect(j.holds('befell', 'ri_evidence_kept')).toBe(false);
  });
});

describe('Deem supplies coherent dramatic variation', () => {
  it('replays a cast, its aid and the opposing force, while other seeds draw different situations', () => {
    const setting = Content.settingWith(tables, templates);
    const object = (value: DeemValue | undefined) => {
      if (!value || typeof value !== 'object' || Array.isArray(value)) { throw new Error('Expected a generated object'); }
      return value;
    };
    const rows = (value: DeemValue | undefined) => {
      if (!Array.isArray(value)) { throw new Error('Expected generated rows'); }
      return value;
    };
    const draw = (seed: string) => {
      const value = new Content(seed, setting).generate('seatDrama'), labels = object(value.labels);
      const guest = labels.kept_guest, report = labels.pressure_report, force = object(rows(value.initial)[0]).value;
      const facts = rows(value.facts).map(f => rows(object(f).args));
      const aid = facts.find(args => args[0] === 'kept_guest')?.[1];
      if (typeof guest !== 'string' || typeof report !== 'string' || typeof force !== 'number' || typeof aid !== 'string'
        || facts.some(args => args.some(arg => typeof arg !== 'string'))) {
        throw new Error('Invalid generated dramatic cast, force or fact arguments');
      }
      return { value, guest, force, aid, report };
    };
    expect(draw('same')).toEqual(draw('same'));
    const samples = Array.from({ length: 12 }, (_, i) => draw(`seat-${i}`));
    expect(new Set(samples.map(s => s.guest)).size).toBeGreaterThan(1);
    expect(new Set(samples.map(s => s.force)).size).toBeGreaterThan(1);
    for (const sample of samples) {
      expect(sample.aid).toBe(sample.guest === 'Absalom Gosse' ? 'escort' : 'food');
      expect(sample.report).toContain(String(sample.force));
    }
  });
});
