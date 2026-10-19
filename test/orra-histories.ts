export class OrraHistories {
  static readonly investigator = [
    'examine(refuge__cup)', 'travel(refuge__porch)', 'tell(refuge__mere,refuge__runoff)',
    'travel(refuge__cell)', 'examine(refuge__letter)', 'travel(refuge__porch)', 'travel(refuge__green)',
    'travel(refuge__kiln)', 'examine(refuge__sketch)', 'passage(tower__vault)',
    'ask(tower__ys,tower__account)', 'travel(tower__spring)', 'disable(tower__siphon)',
    'travel(tower__vault)', 'travel(refuge__kiln)', 'travel(refuge__green)',
  ];
  static readonly expedition = [
    'travel(tower__moor)', 'approach_wildlife(tower__wolf,woodcraft)', 'cross(tower__wolf,tower__cairn)',
    'examine(tower__inscription)', 'tell(tower__hart,tower__burial)', 'cross(tower__hart,tower__vault)',
    'travel(tower__spring)', 'disable(tower__siphon)', 'travel(tower__vault)', 'travel(refuge__kiln)',
    'travel(refuge__green)',
  ];
  static readonly violence = [
    'travel(tower__moor)', 'give_food(tower__wolf)', 'wait', 'cross(tower__wolf,tower__cairn)',
    'attack(tower__hart)',
  ];
  static readonly unattended = Array<string>(38).fill('wait');
}
