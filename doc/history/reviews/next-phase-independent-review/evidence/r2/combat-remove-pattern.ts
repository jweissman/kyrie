// What does each name-pattern "remove" effect actually remove? Effects.apply (src/effects.ts:306) anchors the pattern
// ^(...)$ case-insensitively against each condition's display NAME, not its id.
import { Content } from '../../../../../src/content';
import { MechanicsText } from '../../../../../src/presentation/mechanics-text';
const S = Content.statuses as Record<string, any>;
const names = Object.entries(S).map(([id, c]) => [id, c.name] as const);
for (const a of Content.abilities) for (const e of a.effects as any[]) {
  if (e.kind !== 'remove' || !e.pattern) continue;
  const re = new RegExp(`^(${e.pattern})$`, 'i');
  const hit = names.filter(([, n]) => re.test(n)).map(([id, n]) => `${id}="${n}"`);
  const words = e.pattern.split('|');
  const near = names.filter(([, n]) => !re.test(n) && words.some((w: string) => n.toLowerCase().includes(w.toLowerCase()))).map(([id, n]) => `${id}="${n}"`);
  let text = ''; try { text = (MechanicsText as any).ability ? (MechanicsText as any).ability(a) : ''; } catch (err) { text = String(err); }
  console.log(`${a.id} /${e.pattern}/\n  removes: ${hit.join(', ') || '(NOTHING)'}\n  near-misses (name contains word, not removed): ${near.join(', ') || '-'}`);
}
