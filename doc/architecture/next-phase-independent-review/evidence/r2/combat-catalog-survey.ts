// Survey of the condition/ability catalog for combinations that the field clock and battle treat differently.
import { Content } from '../../../../../src/content';
const S = Content.statuses as Record<string, any>;
const A = Content.abilities;
const worldApplied = new Set<string>();
const walk = (es: any[], f: (e: any) => void) => es.forEach(e => { f(e); if (e.effects) walk(e.effects, f); });
for (const a of A) walk(a.effects, e => { if (e.kind === 'apply' && e.clock === 'world-time') worldApplied.add(e.status); });
for (const [id, c] of Object.entries(S)) for (const k of Object.keys(c.hooks ?? {})) for (const e of (k === 'reactions' ? [] : c.hooks[k])) if (e.kind === 'apply' && e.clock === 'world-time') worldApplied.add(e.status);
console.log('conditions applied on world-time clock:', [...worldApplied].join(', '));
for (const id of worldApplied) {
  const c = S[id];
  const dice = (c.modifiers.onTurnEnd ?? []).filter((p: any) => !/^\d+$/.test(p.amount));
  console.log(` ${id}: onTurnEnd=${JSON.stringify(c.modifiers.onTurnEnd ?? [])} onExpire=${JSON.stringify(c.hooks?.onExpire ?? [])} tempHp=${c.modifiers.tempHp ?? ''} diceTick=${dice.length}`);
}
console.log('\nconditions with onExpire hooks:', Object.entries(S).filter(([, c]) => c.hooks?.onExpire?.length).map(([id, c]) => `${id}(${c.lifetime ?? '-'})`).join(', '));
console.log('\npersistent conditions with dice onTurnEnd:', Object.entries(S).filter(([, c]) => c.lifetime === 'persistent' && (c.modifiers.onTurnEnd ?? []).some((p: any) => !/^\d+$/.test(p.amount))).map(([id]) => id).join(', '));
console.log('\nresources:', Content.rules.resources);
const gains = A.filter(a => a.effects.some(e => e.kind === 'gain')).map(a => `${a.id}:${JSON.stringify(a.effects.filter(e => e.kind === 'gain'))}`);
console.log('gain abilities:', gains.length); gains.slice(0, 15).forEach(g => console.log(' ', g));
const deemAmounts = A.flatMap(a => a.effects.filter((e: any) => e.amount?.kind === 'deem').map((e: any) => `${a.id}/${e.kind}:${e.amount.expression}`));
console.log('\ndeem amounts:', deemAmounts.length); deemAmounts.filter(d => /-/.test(d)).forEach(d => console.log(' minus:', d));
const summons = A.filter(a => a.effects.filter(e => e.kind === 'summon').length > 1 || a.effects.some((e: any) => (e.kind === 'random' || e.kind === 'cycle') && e.effects.some((x: any) => x.kind === 'summon')));
console.log('\nabilities with >1 summon or nested summon:', summons.map(a => a.id).join(', '));
const percents = A.flatMap(a => a.effects.filter((e: any) => e.kind === 'revive').map((e: any) => `${a.id}:${e.percent ?? ''}:${JSON.stringify(e.amount)}`));
console.log('\nrevive:', percents.join(' | '));
const patterns = A.flatMap(a => a.effects.filter((e: any) => e.kind === 'remove' && e.pattern).map((e: any) => `${a.id}:/${e.pattern}/`));
console.log('\nremove-by-pattern (matched against display name):', patterns.join(' | '));
const drains = Object.entries(S).filter(([, c]) => (c.hooks?.onAttacked ?? []).some((e: any) => ['damage', 'kill', 'attack'].includes(e.kind))).map(([id]) => id);
console.log('\nconditions with damaging onAttacked hooks (thorns):', drains.join(', '));
console.log('drain abilities:', A.filter(a => a.effects.some(e => e.kind === 'drain')).map(a => a.id).join(', '));
