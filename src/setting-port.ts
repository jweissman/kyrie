// What the runtime asks of its setting and is given, never reads (MT-16, S6): the reckoning of days and the sky's
// signs, the first of a setting's parts the runtime and the player had imported from data/imbar themselves. The
// setting fills it (src/canon/setting-install.ts) at each composition root: the terminal (src/cli/kyrie.ts), the
// browser's worker and pages (web/engine/engine-worker.ts, web/reader/reader-main.tsx, web/compositions), and every
// `bun` run in the repository by bunfig.toml's preload (the specs, the scripts). Nothing is read when this loads:
// a part asked for before the setting has given it says so by name, at its first use (the browser boot gate: a module
// of shared src never reads its environment as it loads).
export interface SettingMonth { name: string; season: string }
// begins: the day a new life's year begins on, where the setting keeps one (else a day of the world's own draw).
export interface SettingReckoning { months: SettingMonth[]; weekdays: string[]; era: string;
  begins?: { month: number; day: number } }
export interface SettingSign { id: string; name: string; month: string; line: string; gifts: string[];
  stars: number[][]; lines: number[][]; figure: string }
export interface SettingSky { signs: SettingSign[] }
// What a foe's declared blow looks like, by its kind and its body and what it holds (see Telegraph), and what kind of
// creature a body is (beast, undead, giant), none for a person.
export interface SettingTelegraphs {
  natural: Record<string, string>; held: Record<string, string>; together: Record<string, string>;
  abilities: Record<string, string | { creature: string; person: string }>;
  types: Record<string, Record<string, string>>; kinds: Record<string, Record<string, string>>;
  gestures: Record<string, string>; gathered: Record<string, string>;
  spells: { harm: Record<string, string>; school: Record<string, string>; tradition: Record<string, string> };
  type(raceId: string): string | undefined;
}
export interface SettingParts { reckoning: SettingReckoning; sky: SettingSky; telegraphs?: SettingTelegraphs }

export class SettingPort {
  private static given?: SettingParts;
  // The setting's parts, given by the setting at a composition root; given again, the later stands.
  static install(parts: SettingParts): void { this.given = parts; }
  static installed(): boolean { return this.given !== undefined; }
  static get reckoning(): SettingReckoning { return this.parts().reckoning; }
  static get sky(): SettingSky { return this.parts().sky; }
  // A setting may give none: every foe's intent is then said plainly.
  static get telegraphs(): SettingTelegraphs | undefined { return this.given?.telegraphs; }
  private static parts(): SettingParts {
    if (!this.given) {
      throw new Error('The setting has given the runtime nothing yet: import src/canon/setting-install at the '
        + 'composition root (bunfig.toml preloads it for every bun run here)');
    }
    return this.given;
  }
}
