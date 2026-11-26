import reckoning from '../../data/imbar/calendar.json';
import sky from '../../data/imbar/sky.json';
import telegraphs from '../../data/catalog/telegraphs.json';
import { SettingPort, type SettingTelegraphs } from '../setting-port';
import { Canon } from './canon';
import { EffectsRead } from './effects-read';

// Westernesse gives the runtime its parts (MT-16, S6; see SettingPort): Imbar's reckoning of days and its sky's
// signs, and how its creatures and arms look as they come at the company (data/catalog/telegraphs.json). Imported for
// what loading it does, at each composition root and by bunfig.toml's preload.
export class SettingInstall {
  static install(): void {
    SettingPort.install({ reckoning, sky,
      telegraphs: { ...telegraphs as unknown as SettingTelegraphs, type: SettingInstall.type } });
  }
  // What kind of creature a body is; a person is none.
  private static type(this: void, raceId: string): string | undefined {
    return Canon.isSpecies(raceId) ? Canon.creature(raceId).type : undefined;
  }
}

SettingInstall.install();
Canon.reader = EffectsRead;
