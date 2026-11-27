import { describe, expect, it } from 'bun:test';
import { Installed, type InstalledDomain } from '../../src/ports/installed';
import { Voice } from '../../src/narrative/voice';
import { Fits } from '../../src/ui/fits';
import { ProseLint } from '../../src/presentation/prose-lint';
import { CombatPresenter } from '../../src/ui/combat-presenter';
import { Emblems } from '../../src/presentation/emblems';
import { Signs } from '../../src/presentation/signs';
import { Likeness } from '../../src/paintings/likeness';
import { CompanyPortraits } from '../../src/paintings/company-portraits';
import { Sittings } from '../../src/paintings/sittings';
import type { Campaign } from '../../src/campaign/campaign';
import { Tiny } from '../support/tiny';

describe('installed presentation resources', () => {
  it('uses each installation’s voice tables and none when no voice is installed', () => {
    const domain = (id: string, text: string): InstalledDomain => ({ id, presentation: {
      voice: [{ about: id, kinds: ['join'], lines: [{ id: 'join.1', text }] }],
    } });
    const a = domain('a', 'First'), b = domain('b', 'Second'), plain: InstalledDomain = { id: 'plain' };
    const lines = (d: InstalledDomain) => Installed.within(d, () => Voice.fitting('join', {}).map(l => l.text));
    expect([lines(a), lines(b), lines(plain), lines(a)]).toEqual([['First'], ['Second'], [], ['First']]);
  });
  it('uses each installation’s painting observations and rules, or no restrictions', () => {
    const a: InstalledDomain = { id: 'a', presentation: {
      paintingFit: [{ id: 'no-banner', forbids: 'banner' }], paintingSeen: { p: { shows: 'a banner' } },
    } };
    const b: InstalledDomain = { id: 'b', presentation: { paintingSeen: { p: { shows: 'a tree' } } } };
    const plain: InstalledDomain = { id: 'plain' };
    const screen = { place: { name: 'a room' } };
    const look = (d: InstalledDomain) => Installed.within(d, () => [Fits.fits(screen, 'p'), Fits.words('p')]);
    expect([look(a), look(b), look(plain), look(a)]).toEqual([
      [false, 'a banner'], [true, 'a tree'], [true, ''], [false, 'a banner'],
    ]);
  });
  it('uses only the installation’s editorial rules', () => {
    const a: InstalledDomain = { id: 'a', presentation: {
      proseRules: [{ phrase: 'very nice', why: 'test', evidence: 'very nice' }],
    } };
    const b: InstalledDomain = { id: 'b' };
    const rules = (d: InstalledDomain) => Installed.within(d, () => ProseLint.source('A very nice room.'));
    expect([rules(a).length, rules(b).length, rules(a).length]).toEqual([1, 0, 1]);
  });
  it('uses only the installation’s condition words', () => {
    const a: InstalledDomain = { id: 'a', presentation: { conditionWords: { strange: { held: 'It holds.' } } } };
    const b: InstalledDomain = { id: 'b' };
    const held = (d: InstalledDomain) => Installed.within(d, () => CombatPresenter.told('strange', 'held'));
    expect([held(a), held(b), held(a)]).toEqual(['It holds.', undefined, 'It holds.']);
  });
  it('uses each installation’s emblems for both paths and text, or plain signs', () => {
    const domain = (id: string, path: string, text: string): InstalledDomain => ({ id, presentation: {
      emblems: { acts: { about: id, paths: { companion: path, someone: path },
        text: { companion: text, someone: text }, kinds: { custom: ['inn'] } } },
    } });
    const a = domain('a', 'path-a', 'a'), b = domain('b', 'path-b', 'b'), plain: InstalledDomain = { id: 'plain' };
    const read = (d: InstalledDomain) => Installed.within(d, () =>
      [Emblems.path('companion'), Signs.emblem('companion'), Signs.aspects.companionship.sign, Signs.acts.talk]);
    expect([read(a), read(b), read(plain), read(a)]).toEqual([
      ['path-a', 'a', 'a', 'a'], ['path-b', 'b', 'b', 'b'], [undefined, undefined, '&', '·'], ['path-a', 'a', 'a', 'a'],
    ]);
    expect(Installed.within(a, () => Emblems.has('toString'))).toBe(false);
  });
  it('uses each installation’s likenesses and company portraits, or none', () => {
    const domain = (id: string, file: string): InstalledDomain => ({ id, presentation: {
      likenesses: { ids: ['portrait'], credits: { portrait: id }, stations: {}, faces: {},
        sitters: { portrait: 'woman|adult|labouring|early|42' }, unfit: [] },
      companyPortraits: [{ id, class: 'warrior', ancestry: 'human', presentation: 'woman', usable: true,
        file, medium: file, source: '', crop: [], at: [0.5, 0.4] }],
    } });
    const a = domain('a', 'a.webp'), b = domain('b', 'b.webp'), plain: InstalledDomain = { id: 'plain' };
    const read = (d: InstalledDomain) => Installed.within(d, () => [
      Likeness.of({ own: 'portrait' }), Likeness.credits.portrait, Likeness.sitter('portrait')?.face,
      CompanyPortraits.of({ classId: 'warrior', raceId: 'human', presentation: 'woman', key: 'one' })?.src,
    ]);
    expect([read(a), read(b), read(plain), read(a)]).toEqual([
      ['portrait', 'a', 42, 'a.webp'], ['portrait', 'b', 42, 'b.webp'],
      [undefined, undefined, undefined, undefined], ['portrait', 'a', 42, 'a.webp'],
    ]);
  });
  it('keeps sittings separate for installations sharing a compiled module', async () => {
    const t = await Tiny.start(`
      Place yard "the yard" is room at 0, 0 outdoors.
      Company party "You" of 1 at yard.
      Person mother "Mara, the mother" at yard { Role "your mother". Peaceable. Pronouns she. }
      Goal false.`);
    const domain = (id: string): InstalledDomain => ({ id, presentation: { likenesses: {
      ids: [id], credits: {}, stations: {}, faces: {}, sitters: { [id]: 'woman|adult|labouring|early|42' }, unfit: [],
    } } });
    const scoped = (installation: InstalledDomain): Campaign => {
      const campaign = Object.create(t.campaign) as Campaign;
      Object.defineProperty(campaign, 'installation', { value: installation });
      return campaign;
    };
    const a = scoped(domain('first')), b = scoped(domain('second'));
    expect(a.module).toBe(b.module);
    expect([Sittings.of(a, 't__mother'), Sittings.of(b, 't__mother'), Sittings.of(a, 't__mother')])
      .toEqual(['first', 'second', 'first']);
  });
});
