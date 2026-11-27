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
export interface EmblemSet {
  about: string;
  paths: Record<string, string>;
  text?: Record<string, string>;
  kinds?: Record<string, string[]>;
}
export interface LikenessResources {
  ids: string[];
  credits: Record<string, string>;
  stations: Record<string, string>;
  faces: Record<string, number>;
  sitters: Record<string, string>;
  unfit: string[];
}
export interface CompanyPortraitResource {
  id: string; class: string; ancestry: string; presentation: 'man' | 'woman'; usable: boolean;
  file: string; medium: string; source: string; crop: number[]; at: number[];
}
export interface PresentationResources {
  readonly voice?: VoiceTable[];
  readonly paintingFit?: PaintingFitRule[];
  readonly paintingSeen?: Record<string, PaintingLooked>;
  readonly proseRules?: ProseRule[];
  readonly fightHelp?: FightHelpWords;
  readonly outmatched?: OutmatchedWords;
  readonly instruments?: Record<string, { label: string; gloss: string }>;
  readonly conditionWords?: Record<string, Record<string, string>>;
  readonly emblems?: Record<string, EmblemSet>;
  readonly likenesses?: LikenessResources;
  readonly companyPortraits?: CompanyPortraitResource[];
}
