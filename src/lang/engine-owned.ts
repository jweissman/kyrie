// What the engine keeps, which no module may write: the clock (its reading, the dark, the hours waited for, the day and
// season, the watch's die), its records, what it projects from the creatures, who holds what and who is whose, and
// what is known. One list for every construct, so that none of them can forge what the engine keeps: three lists kept
// by hand had let a Topic make it dark at eight in the morning, and a Rule set the hours until dark (the architecture
// review's A8). A world begins with who carries what and who is whose said by its modules, which the engine keeps
// after; and a topic teaches what it says.
export class EngineOwned {
  static readonly clock = ['watch', 'dark', 'untilLight', 'untilMorning', 'untilDark', 'untilTurn', 'hour', 'day',
    'nightCount', 'season', 'dice'];
  static readonly records = ['recorded', 'deficit'];
  static readonly projected = ['able', 'dead', 'capable', 'awake', 'needsCare', 'canCast', 'treatable', 'relieves',
    'proficient', 'levelOf'];
  static readonly held = ['memberOf', 'ownedItem', 'wearing', 'canTrain'];
  static readonly knowledge = ['knows', 'established'];
  // By construct: what a Rule, an Action (or Topic) and an Initially may not write.
  static readonly rules: ReadonlySet<string> = new Set([...this.clock, ...this.records, ...this.projected, ...this.held,
    ...this.knowledge]);
  static readonly actions: ReadonlySet<string> = new Set([...this.clock, ...this.records, ...this.projected,
    ...this.held]);
  static readonly initial: ReadonlySet<string> = new Set([...this.clock, ...this.records, ...this.projected]);
}
