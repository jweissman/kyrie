import reckoning from '../../data/imbar/calendar.json';
import sky from '../../data/imbar/sky.json';
import telegraphs from '../../data/catalog/telegraphs.json';
import emblems from '../../data/paintings/emblems.json';
import fit from '../../data/paintings/fit.json';
import seen from '../../data/paintings/seen.json';
import voiceJoin from '../../data/voice/join.json';
import voicePart from '../../data/voice/part.json';
import voiceGreet from '../../data/voice/greet.json';
import voicePet from '../../data/voice/pet.json';
import voiceTurn from '../../data/voice/turn.json';
import voiceThank from '../../data/voice/thank.json';
import voiceCombat from '../../data/voice/combat.json';
import voiceJourney from '../../data/voice/journey.json';
import voiceAddress from '../../data/voice/address.json';
import voiceFarewell from '../../data/voice/farewell.json';
import voiceFeat from '../../data/voice/feat.json';
import voiceDay from '../../data/voice/day.json';
import voiceAnswer from '../../data/voice/answer.json';
import voiceFightHelp from '../../data/voice/fight-help.json';
import voiceInstruments from '../../data/voice/instruments.json';
import voiceOutmatched from '../../data/voice/outmatched.json';
import voiceConditions from '../../data/voice/conditions.json';
import { SettingPort, type SettingTelegraphs } from '../setting-port';
import { PresentationResources, type EmblemTable, type PaintingFitTable } from '../ports/presentation-resources';
import { Canon } from './canon';
import { EffectsRead } from './effects-read';

// Westernesse gives the runtime its parts (MT-16, S6; see SettingPort): Imbar's reckoning of days and its sky's
// signs, and how its creatures and arms look as they come at the company (data/catalog/telegraphs.json). Imported for
// what loading it does, at each composition root and by bunfig.toml's preload.
export class SettingInstall {
  static install(): void {
    SettingPort.install({ reckoning, sky,
      telegraphs: { ...telegraphs as unknown as SettingTelegraphs, type: SettingInstall.type } });
    PresentationResources.provide({
      voiceIds: SettingInstall.tableIds,
      voice: SettingInstall.voice,
      emblems: emblems as unknown as EmblemTable,
      paintingFit: { rules: fit.rules, paintings: seen.paintings } as PaintingFitTable,
    });
  }
  private static voice<T>(this: void, id: string): T | undefined {
    return SettingInstall.voices.get(id) as T | undefined;
  }
  private static readonly tableIds = ['join', 'part', 'greet', 'pet', 'turn', 'thank', 'combat', 'journey',
    'address', 'farewell', 'feat', 'day', 'answer'] as const;
  private static readonly voices = new Map<string, unknown>([
    ['join', voiceJoin], ['part', voicePart], ['greet', voiceGreet], ['pet', voicePet], ['turn', voiceTurn],
    ['thank', voiceThank], ['combat', voiceCombat], ['journey', voiceJourney], ['address', voiceAddress],
    ['farewell', voiceFarewell], ['feat', voiceFeat], ['day', voiceDay], ['answer', voiceAnswer],
    ['fight-help', voiceFightHelp], ['instruments', voiceInstruments], ['outmatched', voiceOutmatched],
    ['conditions', voiceConditions],
  ]);
  // What kind of creature a body is; a person is none.
  private static type(this: void, raceId: string): string | undefined {
    return Canon.isSpecies(raceId) ? Canon.creature(raceId).type : undefined;
  }
}

SettingInstall.install();
Canon.reader = EffectsRead;
