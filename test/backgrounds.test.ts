import { describe, expect, it } from 'bun:test';
import { Canon } from '../src/canon/canon';
import { BackgroundCatalog, type BackgroundTables, type OrsinoBackground } from '../src/canon/background-catalog';
import { Overlays } from '../src/overlays';
import { Content } from '../src/content';
import { buildSetting, Template } from 'deem';
import { GenerationSetting } from '../src/generation-setting';

// Orsino's 215 backgrounds, composed from its own rows and Kyr's kind tables: none written out by hand.
describe('backgrounds compiled from Orsino\'s rows and Kyr\'s kinds', () => {
  it('has every one of Orsino\'s, each with Orsino\'s scores, gold and class', () => {
    expect(Object.keys(Canon.backgrounds)).toHaveLength(215);
    expect(Canon.backgrounds.champion).toMatchObject({ name: 'Champion', kind: 'arms', gold: 50, requiredClass: 'warrior',
      attributes: { strength: 4, constitution: 3, dexterity: 2, wisdom: 1, charisma: 2 }, skills: ['brawn', 'intimidation'] });
  });
  it('gives a background what its kind means in Kyr, unless an overlay says otherwise', () => {
    // A woodcutter is of the wild kind, and nothing more is said of it.
    expect(Canon.backgrounds.woodcutter).toMatchObject({ kind: 'wild', skills: ['woodcraft'], contact: { channel: 'road' } });
    // A tracker reads country and moves quietly; an innkeeper keeps an inn and offers a bed.
    expect(Canon.backgrounds.tracker!.skills).toEqual(['woodcraft', 'stealth']);
    expect(Canon.backgrounds.innkeeper).toMatchObject({ use: 'profession', routine: 'keeping the inn',
      offers: [{ kind: 'lodging', fee: 3 }] });
    expect(Canon.backgrounds.innkeeper!.contact).toBeUndefined();
  });
  it('carries Orsino\'s starting gear where Kyr has the item, and records what it lacks', () => {
    expect(Canon.backgrounds.medic!.gear).toEqual(['bandages', 'herbs']);
    expect(Canon.backgrounds.plague_doctor!.gear).toEqual(['herbs']);
    expect(Canon.backgrounds.plague_doctor!.omits).toEqual({ 'gear:mask': 'Kyr has no such item.' });
  });
  it('refuses a background of no kind, of two kinds, or an overlay for one that does not exist', () => {
    const orsino: Record<string, OrsinoBackground> = { a: { attributes: {}, gold: 0, source: { orsino: 'background:a' } },
      b: { attributes: {}, gold: 0, source: { orsino: 'background:b' } } };
    const tables = (kinds: Record<string, string[]>, overlay = {}): BackgroundTables => ({
      backgroundKind: { discriminator: 'kind', groups: kinds },
      backgroundKindMeaning: { discriminator: 'kind', groups: { x: { name: 'X' }, y: { name: 'Y' } } },
      backgroundOverlay: { discriminator: 'background', groups: overlay } });
    const has = () => true;
    expect(() => BackgroundCatalog.compile(orsino, tables({ x: ['a'] }), has)).toThrow('of no kind: b');
    expect(() => BackgroundCatalog.compile(orsino, tables({ x: ['a', 'b'], y: ['b'] }), has)).toThrow('two kinds');
    expect(() => BackgroundCatalog.compile(orsino, tables({ x: ['a', 'b'] }, { c: {} }), has)).toThrow('unknown background c');
  });
  it('makes characters as before: a hunter brings woodcraft and a rope, and Orsino\'s scores', () => {
    const elen = new Content('bg').createCreature('elen', { raceId: 'elf', classId: 'ranger', backgroundId: 'hunter' });
    expect(Overlays.skills(elen)).toContain('woodcraft');
    expect(elen.state.inventory!.map(i => i.definition)).toContain('rope');
  });
  it('lets a Deem template draw a background of a kind from the same tables', () => {
    const deem = Template.bootstrapDeem({ seed: 7 }, buildSetting(GenerationSetting.tables as never,
      GenerationSetting.templates as never));
    const drawn = deem.evaluate('lookup(backgroundKind, "wild")') as string;
    expect(Canon.backgrounds[drawn]?.kind).toBe('wild');
    expect(deem.evaluate('findGroup(backgroundKind, "smith")')).toBe('arms');
  });
});
