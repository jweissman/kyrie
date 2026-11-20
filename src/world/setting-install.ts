import reckoning from '../../data/imbar/calendar.json';
import sky from '../../data/imbar/sky.json';
import { SettingPort } from '../setting-port';

// Westernesse gives the runtime its parts (MT-16, S6; see SettingPort): Imbar's reckoning of days and its sky's
// signs. Imported for what loading it does, at each composition root and by bunfig.toml's preload.
export class SettingInstall {
  static install(): void { SettingPort.install({ reckoning, sky }); }
}

SettingInstall.install();
