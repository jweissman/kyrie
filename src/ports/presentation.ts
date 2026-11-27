// A line and its conditions as authored by a setting; the player selects among the installed tables.
export interface VoiceLine {
  id: string; text: string; when?: Record<string, string | string[]>; weight?: number;
  source?: { kyr?: true; orsino?: string; notes?: string };
}
export interface VoiceTable { about: string; kinds: string[]; lines: VoiceLine[] }
export interface PaintingFitRule {
  id: string; place?: string; told?: string; weather?: string; daylight?: string; underground?: boolean;
  forbids: string; unless?: string;
}
export interface PaintingLooked { shows?: string; light?: string; season?: string; weather?: string }
export interface ProseRule { phrase?: string; pattern?: string; why: string; evidence: string }
export interface FightHelpWords { said: string; light: string; hand: string; back: string }
export interface OutmatchedWords { help: string; alone: string }
export interface PresentationResources {
  readonly voice?: VoiceTable[];
  readonly paintingFit?: PaintingFitRule[];
  readonly paintingSeen?: Record<string, PaintingLooked>;
  readonly proseRules?: ProseRule[];
  readonly fightHelp?: FightHelpWords;
  readonly outmatched?: OutmatchedWords;
  readonly instruments?: Record<string, { label: string; gloss: string }>;
  readonly conditionWords?: Record<string, Record<string, string>>;
}
