import join from '../../data/voice/join.json';
import part from '../../data/voice/part.json';
import greet from '../../data/voice/greet.json';
import pet from '../../data/voice/pet.json';
import turn from '../../data/voice/turn.json';
import thank from '../../data/voice/thank.json';
import combat from '../../data/voice/combat.json';
import journey from '../../data/voice/journey.json';
import address from '../../data/voice/address.json';
import farewell from '../../data/voice/farewell.json';
import feat from '../../data/voice/feat.json';
import day from '../../data/voice/day.json';
import answer from '../../data/voice/answer.json';
import fit from '../../data/paintings/fit.json';
import seen from '../../data/paintings/seen.json';
import prose from '../../data/editorial/prose-lint.json';
import fightHelp from '../../data/voice/fight-help.json';
import outmatched from '../../data/voice/outmatched.json';
import instruments from '../../data/voice/instruments.json';
import conditions from '../../data/voice/conditions.json';
import type { PresentationResources, VoiceTable } from '../ports/presentation';

export const FantasyPresentation: PresentationResources = {
  voice: [join, part, greet, pet, turn, thank, combat, journey, address, farewell, feat, day, answer] as VoiceTable[],
  paintingFit: fit.rules,
  paintingSeen: seen.paintings,
  proseRules: prose.banned,
  fightHelp,
  outmatched,
  instruments: instruments.instruments,
  conditionWords: conditions.conditions,
};
