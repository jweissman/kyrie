import type { Signature } from '../lang/module';
export class RuntimeCapabilities {
  static readonly signatures: Signature[] = [
    ...[
      { name: 'purchase', types: ['item', 'itemkind', 'member', 'group', 'group'] },
      { name: 'acquire', types: ['item', 'itemkind', 'member'] },
      { name: 'bless', types: ['shrine', 'deity', 'member'] },
      { name: 'equip', types: ['item', 'member'] },
      { name: 'consume', types: ['item', 'member', 'member'] },
      { name: 'expose', types: ['entity', 'member'] },
      { name: 'train', types: ['ability', 'member'] },
      { name: 'transfer_item', types: ['item', 'member', 'member'] },
      { name: 'drop', types: ['item', 'member'] },
    ].map(s => ({ ...s, exclusive: false })),
    { name: 'combat', types: ['group'], exclusive: false },
    { name: 'invoke', types: ['ability', 'member', 'member'], exclusive: false },
    { name: 'recover', types: ['group'], exclusive: false },
    { name: 'rough', types: ['group'], exclusive: false },
    { name: 'reward', types: ['ability', 'member'], exclusive: false },
  ];
}
