// Remove-by-pattern effects inside condition hooks and reactions (a one-shot stance that should end itself once used).
// Execution: Effects.apply 'remove' (src/effects.ts:306-308) tests ^(pattern)$/i against condition NAMES on the effect's
// target; for a reaction, 'enemy' is the provoking creature (src/reactions.ts:28), 'self' is the holder.
import { Content } from '../../../../../src/content';
const S = Content.statuses as Record<string, any>;
const names = Object.entries(S).map(([id, c]) => [id, c.name as string] as const);
for (const [id, c] of Object.entries(S)) {
  const groups: [string, any[]][] = [...Object.entries(c.hooks ?? {}).filter(([k]) => k !== 'reactions') as [string, any[]][],
    ...Object.entries(c.hooks?.reactions ?? {}).map(([k, v]) => [`reactions.${k}`, v] as [string, any[]])];
  for (const [key, effects] of groups) for (const e of effects) {
    if (e.kind !== 'remove' || !e.pattern) continue;
    const re = new RegExp(`^(${e.pattern})$`, 'i');
    const hits = names.filter(([, n]) => re.test(n)).map(([i]) => i);
    const selfHit = re.test(c.name);
    console.log(`${id} ("${c.name}") ${key}: remove /${e.pattern}/ from ${e.target} -> matches [${hits.join(', ') || 'NOTHING'}]; ` +
      `ends its own holder's condition: ${selfHit && e.target === 'self' ? 'yes' : 'NO'}`);
  }
}
