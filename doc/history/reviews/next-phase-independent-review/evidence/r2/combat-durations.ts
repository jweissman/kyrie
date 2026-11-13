import { Content } from '../../../../../src/content';
const S = Content.statuses as Record<string, any>;
const out: string[] = [];
for (const a of Content.abilities) for (const e of a.effects as any[]) {
  if (e.kind === 'apply' && !e.clock && e.duration === 1 && S[e.status]?.modifiers?.noActions && e.target !== 'self') out.push(`${a.id}->${e.status}(1)`);
}
console.log('abilities that apply a lose-your-turn condition for 1 turn to another:', out.join(', '));
