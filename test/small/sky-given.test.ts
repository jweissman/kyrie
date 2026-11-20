import { afterEach, describe, expect, it } from 'bun:test';
import { SettingPort, type SettingParts } from '../../src/setting-port';
import { Calendar } from '../../src/campaign/calendar';
import { SkyGifts } from '../../src/rules/sky-gifts';
import { SettingInstall } from '../../src/canon/setting-install';

// The months and signs are the setting's, given, never read (MT-16, S6): another setting's reckoning and sky given to
// the port, the calendar counts its months and names its days, and a sign's gifts are its sky's; Imbar's again after.
const other: SettingParts = {
  reckoning: { months: [{ name: 'Rime', season: 'winter' }, { name: 'Bloom', season: 'spring' }], weekdays: ['Oneday'],
    era: 'age of Brass' },
  sky: { signs: [{ id: 'sign_kettle', name: 'the Kettle', month: 'Rime', line: 'Always about to boil.',
    gifts: ['star_warm'], stars: [], lines: [], figure: '' }] } };
describe('the sky and the reckoning given', () => {
  afterEach(() => SettingInstall.install());
  it('are read by the calendar and the sky\'s gifts as the setting gives them', () => {
    expect(Calendar.short({ year: 1, month: 1, day: 30 }, 0)).toBe('30 Thaw');
    expect(SkyGifts.of('sign_kettle')).toEqual([]);
    SettingPort.install(other);
    expect(Calendar.date({ year: 1, month: 1, day: 1 }, 0)).toMatchObject({ name: 'Rime', season: 'winter' });
    expect(Calendar.long({ year: 1, month: 2, day: 1 }, 0)).toBe('Oneday, the 1st of Bloom, in the 1st age of Brass; spring');
    expect(SkyGifts.of('sign_kettle')).toEqual(['star_warm']);
    expect(SkyGifts.of('sign_bear')).toEqual([]);
  });
  it('are Imbar\'s again once Westernesse gives them', () => {
    SettingPort.install(other);
    SettingInstall.install();
    expect(Calendar.months.map(m => m.name)).toContain('Leaffall');
    expect(SkyGifts.of('sign_bear')).toEqual(['star_unturned', 'star_hard_to_fell']);
  });
});
