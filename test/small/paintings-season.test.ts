import { describe, expect, it } from 'bun:test';
import seen from '../../data/paintings/seen.json';
import { Fits, type Seen } from '../../src/ui/fits';

// CO-13: the fit rules read a painting's words, and those words were thin: 37 of 245 scene paintings said anything of
// light, season or weather, so a temple in summer sun, its urns flowering, stood for the shrine of Danu under snow
// (CO-04). Each scene painting was looked at and given its light, and its season and weather where it shows them
// (data/paintings/seen.json); the rules read those beside its words.
function at(name: string, o: { weather?: string; daylight?: string; underground?: boolean } = {}): Seen {
  return { place: { name, underground: o.underground }, weather: o.weather, expedition: { daylight: o.daylight ?? 'day' } };
}
const scenes = Object.entries((seen as { paintings: Record<string, { light?: string; season?: string;
  weather?: string }> }).paintings).filter(([id]) => id.startsWith('scene-'));
describe('a painting\'s light, season and weather', () => {
  it('keep the temple in summer sun from the shrine under snow, and not a snowbound town or a lamplit shrine', () => {
    const snowy = at('the shrine of Danu', { weather: 'snowy' });
    expect(Fits.fits(snowy, 'scene-temple')).toBe(false);
    expect(Fits.fits(snowy, 'scene-woodland-shrine')).toBe(true);
    expect(Fits.fits(at('Danu\'s town', { weather: 'snowy' }), 'scene-town-snowbound')).toBe(true);
  });
  // Each of these says nothing of its light or season in its few words: only what it was looked at for refuses it.
  it('are read beside its words: a summer garden in snow, a sunny market by night, a bright bailey in rain', () => {
    expect(Fits.fits(at('the bee-garden', { weather: 'snowy' }), 'scene-bee-garden')).toBe(false);
    expect(Fits.fits(at('the market', { daylight: 'night' }), 'scene-city-market')).toBe(false);
    expect(Fits.fits(at('the bailey', { weather: 'rain' }), 'scene-keep-bailey')).toBe(false);
    expect(Fits.fits(at('the archive', { underground: true }), 'scene-archive')).toBe(false);
    expect(Fits.fits(at('the inn', { daylight: 'night' }), 'scene-inn-town')).toBe(true);
    expect(Fits.fits(at('the cellar', { underground: true }), 'scene-cellar')).toBe(true);
  });
  it('are recorded for every scene painting: its light always, its season and weather in plain words', () => {
    expect(scenes.length).toBe(245);
    expect(scenes.filter(([, p]) => !p.light).map(([id]) => id)).toEqual([]);
    expect(scenes.filter(([, p]) => p.season && !/^(spring|summer|autumn|winter)$/.test(p.season))).toEqual([]);
    expect(scenes.filter(([, p]) => p.weather && !/^(snow|rain|storm|fog|clear)$/.test(p.weather))).toEqual([]);
  });
});
