import type { Signature } from '../lang/module';
export class RuntimeCapabilities {
  static readonly signatures: Signature[] = [
    ...[
      { name: 'purchase', types: ['item', 'itemkind', 'member', 'group', 'group'] },
      { name: 'acquire', types: ['item', 'itemkind', 'member'] },
      { name: 'bless', types: ['shrine', 'faith', 'member'] },
      { name: 'equip', types: ['item', 'member'] },
      { name: 'consume', types: ['item', 'member', 'member'] },
      { name: 'expose', types: ['entity', 'member'] },
      { name: 'train', types: ['ability', 'member'] },
      { name: 'transfer_item', types: ['item', 'member', 'member'] },
      { name: 'drop', types: ['item', 'member'] },
      { name: 'realize', types: ['item', 'member', 'group'] },
      { name: 'check', types: ['group', 'capability', 'difficulty'] },
    ].map(s => ({ ...s, exclusive: false })),
    { name: 'combat', types: ['group'], exclusive: false },
    { name: 'enlist', types: ['group', 'group'], exclusive: false },
    { name: 'inter', types: ['member'], exclusive: false },
    { name: 'invoke', types: ['ability', 'member', 'member'], exclusive: false },
    { name: 'recover', types: ['group'], exclusive: false },
    { name: 'raise', types: ['member'], exclusive: false },
    { name: 'rough', types: ['group'], exclusive: false },
    { name: 'rummage', types: ['group'], exclusive: false },
    { name: 'reward', types: ['ability', 'member'], exclusive: false },
    { name: 'prepare', types: ['member', 'circle', 'ability', 'ability'], exclusive: false },
    { name: 'improve', types: ['member', 'quality'], exclusive: false },
    { name: 'endow', types: ['member', 'quality', 'degree'], exclusive: false },
    { name: 'learn', types: ['member', 'ability'], exclusive: false },
    { name: 'feat', types: ['member', 'feat'], exclusive: false },
    { name: 'school', types: ['member', 'capability'], exclusive: false },
  ];
}
