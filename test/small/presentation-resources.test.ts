import { describe, expect, it } from 'bun:test';
import { Installed } from '../../src/ports/installed';
import { PresentationResources, type PresentationDomain } from '../../src/ports/presentation-resources';
import { Voice, type VoiceTable } from '../../src/narrative/voice';
import { Fits } from '../../src/ui/fits';
import { Emblems } from '../../src/presentation/emblems';
import { Signs } from '../../src/presentation/signs';

class OtherPresentation {
  static voice<T>(id: string): T | undefined {
    return id === 'other' ? { about: 'Other setting', kinds: ['other'], lines: [] } as T : undefined;
  }
}

// A setting that installs no presentation still has a complete, plain resource surface.
describe('installed presentation resources', () => {
  it('uses plain defaults without a setting presentation', () => {
    Installed.within({ id: 'plain-setting' }, () => {
      expect(PresentationResources.voice('absent')).toBeUndefined();
      expect(PresentationResources.emblems().sets).toEqual({});
      expect(PresentationResources.paintingFit()).toEqual({ rules: [], paintings: {} });
      expect(PresentationResources.likeness().ids.size).toBe(0);
      expect(PresentationResources.likeness().portrait('absent')).toBeUndefined();
      expect(PresentationResources.companyPortraits().said({} as never, 'absent')).toBeUndefined();
      expect(PresentationResources.creaturePortraits().face({} as never, 'absent')).toBeUndefined();
      expect(Voice.tables).toEqual([]);
      expect(Emblems.path('absent')).toBeUndefined();
      expect(Signs.emblem('absent')).toBeUndefined();
      expect(Signs.acts.talk).toBe('·');
      expect(Fits.fits({ place: { name: 'a place' } }, 'absent')).toBe(true);
    });
  });
  it('gives Westernesse its installed table and portrait resources', () => {
    expect(PresentationResources.voice('fight-help')).toBeDefined();
    expect(Object.keys(PresentationResources.emblems().sets).length).toBeGreaterThan(0);
    expect(PresentationResources.paintingFit().rules.length).toBeGreaterThan(0);
    expect(PresentationResources.likeness().ids.size).toBeGreaterThan(0);
  });
  it('reads tables and derived signs from the installation in scope', () => {
    const presentation: PresentationDomain = { ...PresentationResources.defaults(),
      voiceIds: ['other'], voice: OtherPresentation.voice,
      emblems: { sets: { other: { paths: { other: 'M0 0' }, text: { other: '!' } } } },
      paintingFit: { rules: [{ id: 'other', forbids: 'forbidden' }],
        paintings: { other: { shows: 'forbidden' } } } };
    Installed.within({ id: 'other-setting', presentation }, () => {
      expect(Voice.table('other')).toBeDefined();
      expect(Voice.tables.map((table: VoiceTable) => table.about)).toContain('Other setting');
      expect(Emblems.path('other')).toBe('M0 0');
      expect(Signs.emblem('other')).toBe('!');
      expect(Fits.fits({ place: { name: 'a place' } }, 'other')).toBe(false);
      expect(() => PresentationResources.provide({ emblems: { sets: {} } }))
        .toThrow(/inside a scoped campaign/);
    });
    expect(Voice.table('other')).toBeUndefined();
    expect(Fits.fits({ place: { name: 'a place' } }, 'other')).toBe(true);
    expect(Emblems.path('other')).toBeUndefined();
  });
});
